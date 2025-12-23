from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, Request, Response, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import hashlib
import secrets

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Emergent integrations for text generation
from emergentintegrations.llm.chat import LlmChat, UserMessage

# ElevenLabs for Turkish TTS
from elevenlabs import ElevenLabs
from elevenlabs.types import VoiceSettings

# Topics database
from topics_database import (
    TOPICS_DATABASE, 
    get_all_topics, 
    get_topic_detail, 
    get_subtopics,
    get_subtopic_by_id,
    search_by_kazanim,
    get_all_subtopics_flat
)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============= MODELS =============

class Story(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    topic_id: str
    topic_name: str
    subtopic_id: Optional[str] = None
    subtopic_name: Optional[str] = None
    kazanim: Optional[str] = None
    theme: str
    age_group: str
    character: Optional[str] = None
    audio_base64: Optional[str] = None
    duration: Optional[int] = None
    play_count: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class StoryCreate(BaseModel):
    topic_id: str
    subtopic_id: Optional[str] = None
    theme: str
    age_group: str
    character: Optional[str] = None
    kazanim_based: bool = False

class StoryResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    title: str
    content: str
    topic_id: Optional[str] = None  # Made optional for legacy stories
    topic_name: Optional[str] = None  # Made optional for legacy stories
    topic: Optional[str] = None  # Legacy field
    subtopic_id: Optional[str] = None
    subtopic_name: Optional[str] = None
    kazanim: Optional[str] = None
    theme: Optional[str] = None  # Made optional for legacy stories
    age_group: Optional[str] = None  # Made optional for legacy stories
    character: Optional[str] = None
    audio_base64: Optional[str] = None
    duration: Optional[int] = None
    play_count: int = 0
    created_at: Optional[str] = None

class TopicInfo(BaseModel):
    id: str
    name: str
    icon: str
    color: str
    description: str
    image: str
    subtopic_count: int

class SubtopicInfo(BaseModel):
    id: str
    name: str
    kazanim: str

class TopicDetail(BaseModel):
    id: str
    name: str
    icon: str
    color: str
    description: str
    image: str
    subtopics: List[SubtopicInfo]

# ============= USER & AUTH MODELS =============

class UserRegister(BaseModel):
    name: str
    surname: str
    email: EmailStr
    phone: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    user_id: str
    name: str
    surname: Optional[str] = None
    email: str
    phone: Optional[str] = None
    picture: Optional[str] = None
    credits: int = 10
    role: str = "user"
    is_verified: bool = False
    created_at: Optional[str] = None

class CreditRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    user_id: str
    user_name: str
    user_email: str
    user_phone: Optional[str] = None
    requested_credits: int = 10
    message: Optional[str] = None
    status: str = "pending"  # pending, approved, rejected
    created_at: str

class CreditRequestCreate(BaseModel):
    requested_credits: int = 10
    message: Optional[str] = None

class AdminLogin(BaseModel):
    username: str
    password: str

# ============= PASSWORD HELPERS =============

def hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored hash"""
    try:
        salt, hashed = stored_hash.split(":")
        return hashlib.sha256(f"{password}{salt}".encode()).hexdigest() == hashed
    except:
        return False

# ============= AUTH HELPERS =============

async def get_current_user(request: Request) -> Optional[dict]:
    """Get current user from session token"""
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    # Find session
    session = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session:
        return None
    
    # Check expiry
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    # Get user
    user = await db.users.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0}
    )
    
    return user

async def require_auth(request: Request) -> dict:
    """Require authentication - raises 401 if not authenticated"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Giriş yapmanız gerekiyor")
    return user

async def require_admin(request: Request) -> dict:
    """Require admin role"""
    user = await get_current_user(request)
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin yetkisi gerekli")
    return user

# ============= AI HELPERS =============

async def generate_story_with_ai(
    topic_name: str, 
    subtopic_name: Optional[str],
    theme: str, 
    age_group: str, 
    character: Optional[str] = None,
    kazanim: Optional[str] = None
) -> dict:
    """Generate a fairy tale using OpenAI via Emergent integrations"""
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="AI API key not configured")
    
    # Create prompt for Turkish fairy tale
    character_text = f"Ana karakter: {character}" if character else "Ana karakteri sen belirle (çocuk dostu bir karakter)"
    subtopic_text = f"Alt Konu: {subtopic_name}" if subtopic_name else ""
    kazanim_text = f"\n\nHEDEF KAZANIM: {kazanim}\nMasal bu kazanımı destekleyecek şekilde yazılmalıdır." if kazanim else ""
    
    system_message = """Sen deneyimli bir çocuk masalı yazarısın. Türkçe olarak 4-8 yaş arası çocuklara uygun masallar yazarsın.

MUTLAKA UYULMASI GEREKEN KURALLAR:
- Türkçe yaz
- 5-10 dakikada okunabilecek uzunlukta (800-1200 kelime)
- Korku ve şiddet içeriği ASLA olmasın
- Pedagojik ve eğitici olsun
- Seslendirmeye uygun, akıcı cümleler kur
- Kısa ve anlaşılır cümleler kullan
- Sıcak ve sevgi dolu bir anlatım tarzı kullan
- Masal klasik "Bir varmış bir yokmuş" ile başlasın
- Masalın sonunda mutlaka olumlu bir mesaj ve sonuç olsun
- Eğer kazanım belirtilmişse, masal bu kazanımı destekleyecek şekilde olsun

Çıktı formatı:
Başlık: [Masalın başlığı]

[Masal metni]

Kazanım: [Bu masaldan çocuğun öğreneceği değer]"""

    user_prompt = f"""Ana Konu: {topic_name}
{subtopic_text}
Tema: {theme}
Yaş Grubu: {age_group}
{character_text}
{kazanim_text}

Bu bilgilere göre eğitici ve eğlenceli bir masal yaz."""

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=user_prompt)
        response = await chat.send_message(user_message)
        
        # Parse response to extract title and content
        lines = response.strip().split('\n')
        title = "Sihirli Masal"
        content = response
        
        for i, line in enumerate(lines):
            if line.lower().startswith('başlık:'):
                title = line.replace('Başlık:', '').replace('başlık:', '').strip()
                content = '\n'.join(lines[i+1:]).strip()
                break
        
        return {"title": title, "content": content}
        
    except Exception as e:
        logger.error(f"AI story generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Masal üretilirken hata oluştu: {str(e)}")


async def generate_audio_for_story(text: str) -> tuple[str, int]:
    """Generate TTS audio using ElevenLabs for natural Turkish speech"""
    import base64
    
    api_key = os.environ.get('ELEVENLABS_API_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="ElevenLabs API key not configured")
    
    try:
        client = ElevenLabs(api_key=api_key)
        
        # Limit text for API (ElevenLabs has limits)
        text_chunk = text[:5000] if len(text) > 5000 else text
        
        # Use eleven_multilingual_v2 model for Turkish
        # Voice: İlknur Önal - Clear, Warm and Young (Turkish female voice)
        audio_generator = client.text_to_speech.convert(
            text=text_chunk,
            voice_id="xFsOR54lR471QiCvQ5re",  # İlknur Önal - Turkish female voice
            model_id="eleven_multilingual_v2",  # Best for Turkish
            voice_settings=VoiceSettings(
                stability=0.5,
                similarity_boost=0.75,
                style=0.3,  # Some expressiveness for storytelling
                use_speaker_boost=True
            )
        )
        
        # Collect audio data
        audio_data = b""
        for chunk in audio_generator:
            audio_data += chunk
        
        # Convert to base64
        audio_base64 = base64.b64encode(audio_data).decode()
        
        # Estimate duration (roughly 150 words per minute)
        word_count = len(text.split())
        duration = int((word_count / 150) * 60)  # in seconds
        
        return audio_base64, duration
        
    except Exception as e:
        logger.error(f"ElevenLabs TTS error: {e}")
        raise HTTPException(status_code=500, detail=f"Ses üretilirken hata oluştu: {str(e)}")


# ============= API ENDPOINTS =============

@api_router.get("/")
async def root():
    return {"message": "Masal Sepeti API'sine Hoş Geldiniz!"}


@api_router.get("/topics", response_model=List[TopicInfo])
async def get_topics_list():
    """Get all available main topic categories"""
    return get_all_topics()


@api_router.get("/topics/{topic_id}", response_model=TopicDetail)
async def get_topic_details(topic_id: str):
    """Get details of a specific topic including subtopics"""
    topic = get_topic_detail(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Konu bulunamadı")
    return topic


@api_router.get("/topics/{topic_id}/subtopics", response_model=List[SubtopicInfo])
async def get_topic_subtopics(topic_id: str):
    """Get subtopics for a specific topic"""
    subtopics = get_subtopics(topic_id)
    if not subtopics:
        raise HTTPException(status_code=404, detail="Konu bulunamadı")
    return subtopics


@api_router.get("/subtopics/all")
async def get_all_subtopics():
    """Get all subtopics in a flat list"""
    return get_all_subtopics_flat()


@api_router.get("/kazanim/search")
async def search_kazanim(q: str):
    """Search topics by kazanım keyword"""
    results = search_by_kazanim(q)
    return results


@api_router.get("/stories", response_model=List[StoryResponse])
async def get_stories(
    topic_id: Optional[str] = None, 
    subtopic_id: Optional[str] = None,
    search: Optional[str] = None, 
    limit: int = 20
):
    """Get all stories, optionally filtered by topic, subtopic or search query"""
    
    query = {}
    
    if topic_id:
        query["topic_id"] = topic_id
    
    if subtopic_id:
        query["subtopic_id"] = subtopic_id
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
            {"theme": {"$regex": search, "$options": "i"}},
            {"kazanim": {"$regex": search, "$options": "i"}}
        ]
    
    stories = await db.stories.find(query, {"_id": 0}).sort("play_count", -1).limit(limit).to_list(limit)
    return stories


@api_router.get("/stories/popular", response_model=List[StoryResponse])
async def get_popular_stories(limit: int = 6):
    """Get most popular stories by play count"""
    stories = await db.stories.find({}, {"_id": 0}).sort("play_count", -1).limit(limit).to_list(limit)
    return stories


@api_router.get("/stories/{story_id}", response_model=StoryResponse)
async def get_story(story_id: str):
    """Get a single story by ID"""
    story = await db.stories.find_one({"id": story_id}, {"_id": 0})
    
    if not story:
        raise HTTPException(status_code=404, detail="Masal bulunamadı")
    
    return story


@api_router.post("/stories/generate", response_model=StoryResponse)
async def generate_story(story_input: StoryCreate, request: Request):
    """Generate a new story using AI and TTS"""
    
    # Check if user is logged in and has credits
    user = await get_current_user(request)
    user_id = None
    
    if user:
        # Check credits
        if user.get("credits", 0) <= 0:
            raise HTTPException(
                status_code=402, 
                detail="Krediniz bitti! Yeni masal oluşturmak için kredi talebi oluşturun."
            )
        user_id = user["user_id"]
    
    # Get topic info
    topic = get_topic_detail(story_input.topic_id)
    if not topic:
        raise HTTPException(status_code=400, detail="Geçersiz konu")
    
    topic_name = topic["name"]
    subtopic_name = None
    kazanim = None
    
    # Get subtopic info if provided
    if story_input.subtopic_id:
        subtopic = get_subtopic_by_id(story_input.topic_id, story_input.subtopic_id)
        if subtopic:
            subtopic_name = subtopic["name"]
            if story_input.kazanim_based:
                kazanim = subtopic["kazanim"]
    
    logger.info(f"Generating story: topic={topic_name}, subtopic={subtopic_name}, theme={story_input.theme}")
    
    # Generate story with AI
    story_data = await generate_story_with_ai(
        topic_name=topic_name,
        subtopic_name=subtopic_name,
        theme=story_input.theme,
        age_group=story_input.age_group,
        character=story_input.character,
        kazanim=kazanim
    )
    
    # Generate audio
    audio_base64, duration = await generate_audio_for_story(story_data["content"])
    
    # Create story object
    story = Story(
        title=story_data["title"],
        content=story_data["content"],
        topic_id=story_input.topic_id,
        topic_name=topic_name,
        subtopic_id=story_input.subtopic_id,
        subtopic_name=subtopic_name,
        kazanim=kazanim,
        theme=story_input.theme,
        age_group=story_input.age_group,
        character=story_input.character,
        audio_base64=audio_base64,
        duration=duration
    )
    
    # Save to database
    story_dict = story.model_dump()
    
    # Add user_id if logged in
    if user_id:
        story_dict["user_id"] = user_id
        # Deduct credit
        await db.users.update_one(
            {"user_id": user_id},
            {"$inc": {"credits": -1}}
        )
    
    await db.stories.insert_one(story_dict)
    
    # Remove _id for response
    story_dict.pop('_id', None)
    
    logger.info(f"Story created: {story.id}")
    return story_dict


@api_router.post("/stories/{story_id}/play")
async def increment_play_count(story_id: str):
    """Increment the play count for a story"""
    
    result = await db.stories.update_one(
        {"id": story_id},
        {"$inc": {"play_count": 1}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Masal bulunamadı")
    
    return {"success": True, "message": "Dinleme sayısı güncellendi"}


@api_router.delete("/stories/{story_id}")
async def delete_story(story_id: str, request: Request):
    """Delete a story - requires owner or admin"""
    
    user = await get_current_user(request)
    
    # Get the story first to check ownership
    story = await db.stories.find_one({"id": story_id}, {"_id": 0})
    if not story:
        raise HTTPException(status_code=404, detail="Masal bulunamadı")
    
    # Check if user is owner or admin
    if user:
        if user.get("role") != "admin" and story.get("user_id") != user.get("user_id"):
            raise HTTPException(status_code=403, detail="Bu masalı silme yetkiniz yok")
    
    result = await db.stories.delete_one({"id": story_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Masal bulunamadı")
    
    return {"success": True, "message": "Masal silindi"}


# ============= AUTH ENDPOINTS =============

@api_router.post("/auth/register")
async def register_user(user_data: UserRegister):
    """Register a new user"""
    
    # Check if email already exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Bu email adresi zaten kayıtlı")
    
    # Create user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user = {
        "user_id": user_id,
        "name": user_data.name,
        "surname": user_data.surname,
        "email": user_data.email,
        "phone": user_data.phone,
        "password_hash": hash_password(user_data.password),
        "picture": None,
        "credits": 10,  # Initial credits
        "role": "user",
        "is_verified": False,
        "auth_provider": "local",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    
    # Remove sensitive data
    user.pop("password_hash", None)
    user.pop("_id", None)
    
    return {"success": True, "message": "Kayıt başarılı! Email adresinizi doğrulayın.", "user": user}


@api_router.post("/auth/login")
async def login_user(login_data: UserLogin, response: Response):
    """Login with email and password"""
    
    # Find user
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı")
    
    # Check if user uses local auth
    if user.get("auth_provider") == "google":
        raise HTTPException(status_code=400, detail="Bu hesap Google ile giriş yapmaktadır")
    
    # Verify password
    if not verify_password(login_data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı")
    
    # Create session
    session_token = secrets.token_urlsafe(32)
    session = {
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_sessions.insert_one(session)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    # Remove sensitive data
    user.pop("password_hash", None)
    
    return {"success": True, "user": user, "session_token": session_token}


@api_router.post("/auth/google/session")
async def google_session(request: Request, response: Response):
    """Process Google OAuth session_id"""
    
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id gerekli")
    
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    # Get user data from Emergent Auth
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id},
                timeout=10.0
            )
            
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Geçersiz oturum")
            
            google_data = auth_response.json()
        except Exception as e:
            logger.error(f"Google auth error: {e}")
            raise HTTPException(status_code=500, detail="Google giriş hatası")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": google_data["email"]}, {"_id": 0})
    
    if existing_user:
        # Update existing user
        await db.users.update_one(
            {"email": google_data["email"]},
            {"$set": {
                "name": google_data.get("name", existing_user.get("name")),
                "picture": google_data.get("picture"),
                "last_login": datetime.now(timezone.utc).isoformat()
            }}
        )
        user_id = existing_user["user_id"]
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = {
            "user_id": user_id,
            "name": google_data.get("name", ""),
            "surname": "",
            "email": google_data["email"],
            "phone": "",
            "picture": google_data.get("picture"),
            "credits": 10,
            "role": "user",
            "is_verified": True,  # Google users are verified
            "auth_provider": "google",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(new_user)
    
    # Create our own session
    session_token = secrets.token_urlsafe(32)
    session = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_sessions.insert_one(session)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    # Get updated user
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    
    return {"success": True, "user": user, "session_token": session_token}


@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current authenticated user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Giriş yapmanız gerekiyor")
    
    user.pop("password_hash", None)
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout current user"""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    
    return {"success": True, "message": "Çıkış yapıldı"}


# ============= ADMIN AUTH =============

@api_router.post("/admin/login")
async def admin_login(login_data: AdminLogin, response: Response):
    """Admin login with hardcoded credentials"""
    
    if login_data.username != "admin" or login_data.password != "masallardiyariai":
        raise HTTPException(status_code=401, detail="Geçersiz kullanıcı adı veya şifre")
    
    # Check if admin user exists, if not create
    admin_user = await db.users.find_one({"role": "admin", "email": "admin@masalsepeti.com"}, {"_id": 0})
    
    if not admin_user:
        admin_user_data = {
            "user_id": "admin_master",
            "name": "Admin",
            "surname": "Master",
            "email": "admin@masalsepeti.com",
            "phone": "",
            "credits": 999999,
            "role": "admin",
            "is_verified": True,
            "auth_provider": "local",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user_data)
        admin_user = admin_user_data
    
    # Create session
    session_token = secrets.token_urlsafe(32)
    session = {
        "user_id": admin_user["user_id"],
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=1),  # Shorter for admin
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_sessions.insert_one(session)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=24 * 60 * 60,
        path="/"
    )
    
    # Return admin user without _id
    return_user = {k: v for k, v in admin_user.items() if k != "_id"}
    
    return {"success": True, "user": return_user, "session_token": session_token}


# ============= USER ENDPOINTS =============

@api_router.get("/users/profile", response_model=UserResponse)
async def get_profile(request: Request):
    """Get current user profile"""
    user = await require_auth(request)
    user.pop("password_hash", None)
    return user


@api_router.put("/users/profile")
async def update_profile(request: Request):
    """Update user profile"""
    user = await require_auth(request)
    body = await request.json()
    
    update_data = {}
    if "name" in body:
        update_data["name"] = body["name"]
    if "surname" in body:
        update_data["surname"] = body["surname"]
    if "phone" in body:
        update_data["phone"] = body["phone"]
    
    if update_data:
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": update_data}
        )
    
    updated_user = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "password_hash": 0})
    return {"success": True, "user": updated_user}


@api_router.get("/users/stories")
async def get_user_stories(request: Request, skip: int = 0, limit: int = 20):
    """Get stories created by current user"""
    user = await require_auth(request)
    
    stories = await db.stories.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return stories


@api_router.delete("/users/stories/{story_id}")
async def delete_user_story(story_id: str, request: Request):
    """Delete a story owned by current user"""
    user = await require_auth(request)
    
    # Check ownership
    story = await db.stories.find_one({"id": story_id}, {"_id": 0})
    if not story:
        raise HTTPException(status_code=404, detail="Masal bulunamadı")
    
    if story.get("user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Bu masalı silme yetkiniz yok")
    
    await db.stories.delete_one({"id": story_id})
    
    return {"success": True, "message": "Masal silindi"}


# ============= CREDIT ENDPOINTS =============

@api_router.get("/credits/balance")
async def get_credit_balance(request: Request):
    """Get current user's credit balance"""
    user = await require_auth(request)
    return {"credits": user.get("credits", 0)}


@api_router.post("/credits/request")
async def create_credit_request(request_data: CreditRequestCreate, request: Request):
    """Create a credit request"""
    user = await require_auth(request)
    
    credit_request = {
        "id": f"req_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "user_name": f"{user.get('name', '')} {user.get('surname', '')}".strip(),
        "user_email": user["email"],
        "user_phone": user.get("phone", ""),
        "requested_credits": request_data.requested_credits,
        "message": request_data.message,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.credit_requests.insert_one(credit_request)
    credit_request.pop("_id", None)
    
    return {"success": True, "message": "Kredi talebiniz oluşturuldu", "request": credit_request}


@api_router.get("/credits/requests")
async def get_my_credit_requests(request: Request):
    """Get current user's credit requests"""
    user = await require_auth(request)
    
    requests = await db.credit_requests.find(
        {"user_id": user["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return requests


# ============= ADMIN ENDPOINTS =============

@api_router.get("/admin/users")
async def admin_get_users(request: Request, skip: int = 0, limit: int = 50):
    """Get all users (admin only)"""
    await require_admin(request)
    
    users = await db.users.find(
        {},
        {"_id": 0, "password_hash": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    total = await db.users.count_documents({})
    
    return {"users": users, "total": total}


@api_router.put("/admin/users/{user_id}")
async def admin_update_user(user_id: str, request: Request):
    """Update a user (admin only)"""
    await require_admin(request)
    body = await request.json()
    
    update_data = {}
    if "credits" in body:
        update_data["credits"] = body["credits"]
    if "role" in body:
        update_data["role"] = body["role"]
    if "is_verified" in body:
        update_data["is_verified"] = body["is_verified"]
    
    if update_data:
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
    
    return {"success": True, "message": "Kullanıcı güncellendi"}


@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, request: Request):
    """Delete a user (admin only)"""
    await require_admin(request)
    
    if user_id == "admin_master":
        raise HTTPException(status_code=400, detail="Admin kullanıcısı silinemez")
    
    await db.users.delete_one({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    
    return {"success": True, "message": "Kullanıcı silindi"}


@api_router.get("/admin/stories")
async def admin_get_stories(request: Request, skip: int = 0, limit: int = 50):
    """Get all stories (admin only)"""
    await require_admin(request)
    
    stories = await db.stories.find(
        {},
        {"_id": 0, "audio_base64": 0}  # Exclude large audio data
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    total = await db.stories.count_documents({})
    
    return {"stories": stories, "total": total}


@api_router.delete("/admin/stories/{story_id}")
async def admin_delete_story(story_id: str, request: Request):
    """Delete any story (admin only)"""
    await require_admin(request)
    
    result = await db.stories.delete_one({"id": story_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Masal bulunamadı")
    
    return {"success": True, "message": "Masal silindi"}


@api_router.get("/admin/credit-requests")
async def admin_get_credit_requests(request: Request, status: Optional[str] = None):
    """Get all credit requests (admin only)"""
    await require_admin(request)
    
    query = {}
    if status:
        query["status"] = status
    
    requests = await db.credit_requests.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    
    return requests


@api_router.put("/admin/credit-requests/{request_id}")
async def admin_update_credit_request(request_id: str, request: Request):
    """Update credit request status and optionally add credits"""
    await require_admin(request)
    body = await request.json()
    
    credit_req = await db.credit_requests.find_one({"id": request_id}, {"_id": 0})
    if not credit_req:
        raise HTTPException(status_code=404, detail="Talep bulunamadı")
    
    new_status = body.get("status", credit_req["status"])
    
    # Update request status
    await db.credit_requests.update_one(
        {"id": request_id},
        {"$set": {"status": new_status}}
    )
    
    # If approved, add credits to user
    if new_status == "approved":
        credits_to_add = body.get("credits", credit_req["requested_credits"])
        await db.users.update_one(
            {"user_id": credit_req["user_id"]},
            {"$inc": {"credits": credits_to_add}}
        )
    
    return {"success": True, "message": "Talep güncellendi"}


@api_router.get("/admin/stats")
async def admin_get_stats(request: Request):
    """Get admin dashboard stats"""
    await require_admin(request)
    
    total_users = await db.users.count_documents({"role": "user"})
    total_stories = await db.stories.count_documents({})
    pending_requests = await db.credit_requests.count_documents({"status": "pending"})
    
    # Recent users
    recent_users = await db.users.find(
        {"role": "user"},
        {"_id": 0, "password_hash": 0}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "total_users": total_users,
        "total_stories": total_stories,
        "pending_requests": pending_requests,
        "recent_users": recent_users
    }


# Include router
app.include_router(api_router)

# CORS middleware - need specific origins when credentials=True
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "https://storytimeai.preview.emergentagent.com",
    "https://masal.space",
    "http://masal.space",
    "https://www.masal.space",
    "http://www.masal.space"
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
