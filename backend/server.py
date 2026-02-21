from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, Request, Response, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
import unicodedata
import base64
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

# Gemini for text generation
import google.generativeai as genai

# Google Cloud TTS for Turkish voice
from google.cloud import texttospeech

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

# ============= CONTENT MODERATION (SIMPLE) =============

# Turkish bad words list - ONLY serious profanity
TURKISH_BAD_WORDS = [
    "amk", "aq", "amına", "amını", "orospu", "oç", "piç", "sikik", "siktir", 
    "yarrak", "yarak", "taşak", "taşşak", "kaltak", "fahişe", "pezevenk", 
    "ibne", "götveren", "puşt", "dalyarak", "porno",
]

def contains_bad_content(text: str) -> tuple[bool, str]:
    """Check if text contains serious profanity only"""
    if not text:
        return False, ""
    
    text_lower = text.lower()
    
    for bad_word in TURKISH_BAD_WORDS:
        if bad_word in text_lower:
            return True, "Uygunsuz kelime tespit edildi"
    
    return False, ""

async def validate_story_request(
    topic_name: str,
    subtopic_name: Optional[str],
    theme: str,
    character: Optional[str],
    kazanim: Optional[str]
) -> tuple[bool, str]:
    """Validate all story request fields - only check for serious profanity"""
    
    # Check all text fields for serious profanity only
    fields_to_check = [
        (topic_name, "Konu"),
        (subtopic_name, "Alt konu"),
        (theme, "Tema"),
        (character, "Karakter"),
        (kazanim, "Kazanım"),
    ]
    
    for field_value, field_name in fields_to_check:
        if field_value:
            is_bad, reason = contains_bad_content(field_value)
            if is_bad:
                logger.warning(f"Bad content detected in {field_name}: {field_value[:50]}...")
                return False, f"{field_name} alanında uygunsuz içerik tespit edildi."
    
    return True, ""

# ============= MODELS =============

class Story(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: Optional[str] = None  # SEO-friendly URL slug
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
    slug: Optional[str] = None  # SEO-friendly URL slug
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
    user_id: Optional[str] = None
    creator_name: Optional[str] = None
    creator_id: Optional[str] = None
    creator_picture: Optional[str] = None

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
    favorites: List[str] = []

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

# ============= STORE MANAGEMENT MODELS =============

class StoreProduct(BaseModel):
    name: str
    query: str
    highlight: bool = False

class StoreCategory(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    icon: str  # lucide icon name
    gradient: str  # tailwind gradient classes
    bgColor: str  # tailwind bg color class
    products: List[StoreProduct] = []
    order: int = 0
    isActive: bool = True

class StoreCategoryCreate(BaseModel):
    title: str
    description: str
    icon: str = "BookOpen"
    gradient: str = "from-violet-500 to-purple-600"
    bgColor: str = "bg-violet-50"
    products: List[StoreProduct] = []
    order: int = 0
    isActive: bool = True

class StoreFeaturedItem(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    query: str
    badge: str  # "En Çok Satan", "Popüler", etc.
    gradient: str
    order: int = 0
    isActive: bool = True

class StoreFeaturedCreate(BaseModel):
    title: str
    description: str
    query: str
    badge: str = "Önerilen"
    gradient: str = "from-violet-500 to-purple-600"
    order: int = 0
    isActive: bool = True

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

# ============= SLUG HELPERS =============

# Turkish character mapping
TURKISH_CHARS = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
}

def generate_slug(title: str, age_group: str = None) -> str:
    """
    Generate SEO-friendly slug from title
    Example: "Cesur Tavşan'ın Maceraları" -> "cesur-tavsanin-maceralari"
    With age: "3 Yaş İçin Cesur Tavşan" -> "3-yas-cesur-tavsan"
    """
    # Combine age group with title if provided
    if age_group and age_group not in title.lower():
        text = f"{age_group} {title}"
    else:
        text = title
    
    # Convert Turkish characters
    for turkish, latin in TURKISH_CHARS.items():
        text = text.replace(turkish, latin)
    
    # Normalize unicode characters
    text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('ASCII')
    
    # Convert to lowercase
    text = text.lower()
    
    # Replace spaces and special chars with hyphens
    text = re.sub(r'[^a-z0-9]+', '-', text)
    
    # Remove leading/trailing hyphens
    text = text.strip('-')
    
    # Limit to first 6 words (for cleaner URLs)
    words = text.split('-')
    if len(words) > 6:
        text = '-'.join(words[:6])
    
    return text

async def ensure_unique_slug(base_slug: str, story_id: str = None) -> str:
    """Ensure slug is unique in database, append number if needed"""
    slug = base_slug
    counter = 1
    
    while True:
        # Check if slug exists (excluding current story if updating)
        query = {"slug": slug}
        if story_id:
            query["id"] = {"$ne": story_id}
        
        existing = await db.stories.find_one(query, {"_id": 0, "id": 1})
        if not existing:
            return slug
        
        # Append counter
        slug = f"{base_slug}-{counter}"
        counter += 1
        
        if counter > 100:  # Safety limit
            slug = f"{base_slug}-{secrets.token_hex(4)}"
            return slug

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
    
    if user:
        # Check for monthly credit reset
        user = await check_monthly_credit_reset(user)
    
    return user


async def check_monthly_credit_reset(user: dict) -> dict:
    """Check if user's credits should be reset for new month"""
    now = datetime.now(timezone.utc)
    current_month = now.strftime("%Y-%m")
    
    last_credit_reset = user.get("last_credit_reset")
    
    # If no reset recorded or reset was in a previous month
    if not last_credit_reset or not last_credit_reset.startswith(current_month):
        # Reset credits to 10
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {
                "$set": {
                    "credits": 10,
                    "last_credit_reset": current_month
                }
            }
        )
        user["credits"] = 10
        user["last_credit_reset"] = current_month
    
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


# ============= HEALTH CHECK =============

@api_router.get("/health")
async def health_check():
    """Health check endpoint for Railway"""
    try:
        # Check MongoDB connection
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}


# ============= AI HELPERS =============

async def generate_story_with_ai(
    topic_name: str, 
    subtopic_name: Optional[str],
    theme: str, 
    age_group: str, 
    character: Optional[str] = None,
    kazanim: Optional[str] = None
) -> dict:
    """Generate a fairy tale using Gemini API"""
    
    # Check for Gemini API key
    gemini_key = os.environ.get('GEMINI_API_KEY')
    
    if not gemini_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY yapılandırılmamış")
    
    # Configure Gemini
    genai.configure(api_key=gemini_key)
    
    # Create prompt for Turkish fairy tale
    character_text = f"Ana karakter: {character}" if character else "Ana karakteri sen belirle (çocuk dostu bir karakter)"
    subtopic_text = f"Alt Konu: {subtopic_name}" if subtopic_name else ""
    kazanim_text = f"\n\nHEDEF KAZANIM: {kazanim}\nMasal bu kazanımı destekleyecek şekilde yazılmalıdır." if kazanim else ""
    
    system_instruction = """Sen deneyimli bir çocuk masalı yazarısın. Türkçe olarak 4-8 yaş arası çocuklara uygun masallar yazarsın.

MUTLAKA UYULMASI GEREKEN KURALLAR:
- Türkçe yaz
- **ÖNEMLİ: Masal 400-500 kelime arasında olmalı (yaklaşık 3-4 dakika okunma süresi)**
- **Masal metni 3500 karakteri ASLA geçmemeli**
- Korku ve şiddet içeriği ASLA olmasın
- Pedagojik ve eğitici olsun
- Seslendirmeye uygun, akıcı ve kısa cümleler kur
- Sıcak ve sevgi dolu bir anlatım tarzı kullan
- Masal klasik "Bir varmış bir yokmuş" ile başlasın
- Masalın sonunda mutlaka olumlu bir mesaj ve sonuç olsun
- Eğer kazanım belirtilmişse, masal bu kazanımı destekleyecek şekilde olsun
- Gereksiz detaylardan kaçın, özlü ve etkili anlat

Çıktı formatı:
Başlık: [Masalın başlığı]

[Masal metni]

Kazanım: [Bu masaldan çocuğun öğreneceği değer - tek cümle]"""

    user_prompt = f"""Ana Konu: {topic_name}
{subtopic_text}
Tema: {theme}
Yaş Grubu: {age_group}
{character_text}
{kazanim_text}

Bu bilgilere göre eğitici ve eğlenceli bir masal yaz."""

    try:
        # Use Gemini API directly
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_instruction
        )
        
        response = await model.generate_content_async(user_prompt)
        result = response.text
        
        # Parse response to extract title and content
        lines = result.strip().split('\n')
        title = "Sihirli Masal"
        content = result
        
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
    """Generate TTS audio using Google Cloud TTS for natural Turkish speech"""
    
    # Check for Google Cloud credentials
    google_creds = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    google_api_key = os.environ.get('GOOGLE_TTS_API_KEY')
    
    if not google_creds and not google_api_key:
        raise HTTPException(status_code=500, detail="Google Cloud TTS credentials not configured")
    
    try:
        # Initialize the Google Cloud TTS client
        if google_api_key:
            # Use API key authentication
            from google.cloud import texttospeech_v1
            from google.api_core import client_options
            
            client = texttospeech.TextToSpeechClient(
                client_options=client_options.ClientOptions(
                    api_key=google_api_key
                )
            )
        else:
            # Use service account credentials
            client = texttospeech.TextToSpeechClient()
        
        # Limit text for API (Google Cloud has 5000 byte limit)
        text_chunk = text[:4500] if len(text) > 4500 else text
        
        # Set the text input
        synthesis_input = texttospeech.SynthesisInput(text=text_chunk)
        
        # Build the voice request - Turkish female Studio voice for soft children's narration
        voice = texttospeech.VoiceSelectionParams(
            language_code="tr-TR",
            name="tr-TR-Standard-A",  # Turkish female Standard voice (softer, warmer tone)
            ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
        )
        
        # Select the audio file type and speaking rate
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=0.85,  # Slower for children's stories
            pitch=0.5  # Slightly higher pitch for warmer tone
        )
        
        # Perform the text-to-speech request
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        # Convert to base64
        audio_base64 = base64.b64encode(response.audio_content).decode()
        
        # Estimate duration (roughly 150 words per minute at 0.9x speed)
        word_count = len(text.split())
        duration = int((word_count / 135) * 60)  # in seconds, adjusted for slower rate
        
        logger.info(f"Successfully generated audio: {len(response.audio_content)} bytes")
        return audio_base64, duration
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Google Cloud TTS error: {error_msg}")
        
        # Check for quota exceeded error
        if "quota" in error_msg.lower() or "limit" in error_msg.lower() or "exceeded" in error_msg.lower():
            raise HTTPException(
                status_code=503, 
                detail="Ses üretim kotası doldu. Masal metin olarak kaydedildi ancak ses eklenemedi. Lütfen daha sonra tekrar deneyin."
            )
        
        raise HTTPException(status_code=500, detail=f"Ses üretilirken hata oluştu: {error_msg}")


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
    sort_by: Optional[str] = None,  # "newest", "oldest", "popular"
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
    
    # Determine sort order
    if sort_by == "newest":
        sort_field, sort_order = "created_at", -1
    elif sort_by == "oldest":
        sort_field, sort_order = "created_at", 1
    else:  # default: popular
        sort_field, sort_order = "play_count", -1
    
    stories = await db.stories.find(query, {"_id": 0}).sort(sort_field, sort_order).limit(limit).to_list(limit)
    
    # Batch fetch creator info for better performance
    user_ids = list(set(s.get("user_id") for s in stories if s.get("user_id")))
    if user_ids:
        users = await db.users.find(
            {"user_id": {"$in": user_ids}}, 
            {"_id": 0, "user_id": 1, "name": 1, "surname": 1, "picture": 1}
        ).to_list(len(user_ids))
        user_map = {u["user_id"]: u for u in users}
        
        for story in stories:
            if story.get("user_id") and story["user_id"] in user_map:
                user = user_map[story["user_id"]]
                story["creator_name"] = f"{user.get('name', '')} {user.get('surname', '')}".strip()
                story["creator_id"] = story["user_id"]
                story["creator_picture"] = user.get("picture")
    
    return stories


@api_router.get("/stories/popular", response_model=List[StoryResponse])
async def get_popular_stories(limit: int = 6):
    """Get most popular stories by play count"""
    stories = await db.stories.find({}, {"_id": 0}).sort("play_count", -1).limit(limit).to_list(limit)
    
    # Batch fetch creator info for better performance
    user_ids = list(set(s.get("user_id") for s in stories if s.get("user_id")))
    if user_ids:
        users = await db.users.find(
            {"user_id": {"$in": user_ids}}, 
            {"_id": 0, "user_id": 1, "name": 1, "surname": 1, "picture": 1}
        ).to_list(len(user_ids))
        user_map = {u["user_id"]: u for u in users}
        
        for story in stories:
            if story.get("user_id") and story["user_id"] in user_map:
                user = user_map[story["user_id"]]
                story["creator_name"] = f"{user.get('name', '')} {user.get('surname', '')}".strip()
                story["creator_id"] = story["user_id"]
                story["creator_picture"] = user.get("picture")
    
    return stories


@api_router.get("/masal/{slug}", response_model=StoryResponse)
async def get_story_by_slug(slug: str):
    """Get a single story by SEO-friendly slug"""
    story = await db.stories.find_one({"slug": slug}, {"_id": 0})
    
    if not story:
        raise HTTPException(status_code=404, detail="Masal bulunamadı")
    
    # Enrich with creator info
    if story.get("user_id"):
        user = await db.users.find_one({"user_id": story["user_id"]}, {"_id": 0, "name": 1, "surname": 1, "picture": 1})
        if user:
            story["creator_name"] = f"{user.get('name', '')} {user.get('surname', '')}".strip()
            story["creator_id"] = story["user_id"]
            story["creator_picture"] = user.get("picture")
    
    return story


@api_router.get("/stories/{story_id}", response_model=StoryResponse)
async def get_story(story_id: str):
    """Get a single story by ID (legacy support)"""
    # First try to find by ID
    story = await db.stories.find_one({"id": story_id}, {"_id": 0})
    
    # If not found by ID, try by slug (backward compatibility)
    if not story:
        story = await db.stories.find_one({"slug": story_id}, {"_id": 0})
    
    if not story:
        raise HTTPException(status_code=404, detail="Masal bulunamadı")
    
    # Enrich with creator info
    if story.get("user_id"):
        user = await db.users.find_one({"user_id": story["user_id"]}, {"_id": 0, "name": 1, "surname": 1, "picture": 1})
        if user:
            story["creator_name"] = f"{user.get('name', '')} {user.get('surname', '')}".strip()
            story["creator_id"] = story["user_id"]
            story["creator_picture"] = user.get("picture")
    
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
    
    # ============= CONTENT MODERATION CHECK =============
    # Validate all input fields for inappropriate content before generation
    is_valid, validation_error = await validate_story_request(
        topic_name=topic_name,
        subtopic_name=subtopic_name,
        theme=story_input.theme,
        character=story_input.character,
        kazanim=kazanim
    )
    
    if not is_valid:
        logger.warning(f"Content moderation blocked story creation: {validation_error}")
        raise HTTPException(
            status_code=400, 
            detail=validation_error
        )
    # ===================================================
    
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
    
    # Generate audio (with fallback if quota exceeded)
    audio_base64 = None
    duration = None
    audio_error = None
    
    try:
        audio_base64, duration = await generate_audio_for_story(story_data["content"])
    except HTTPException as e:
        if e.status_code == 503:  # Quota exceeded
            audio_error = "Ses kotası doldu. Masal sessiz kaydedildi."
            logger.warning(f"Audio quota exceeded, saving story without audio")
        else:
            raise e
    
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
    
    # Generate SEO-friendly slug
    base_slug = generate_slug(story_data["title"], story_input.age_group)
    story.slug = await ensure_unique_slug(base_slug, story.id)
    
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
    
    # Add warning if audio failed
    if audio_error:
        story_dict["warning"] = audio_error
    
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
    """Process Google OAuth authorization code"""
    
    try:
        body = await request.json()
    except Exception as e:
        logger.error(f"Failed to parse request body: {e}")
        raise HTTPException(status_code=400, detail="Geçersiz istek")
    
    code = body.get("code")
    redirect_uri = body.get("redirect_uri")
    
    logger.info(f"Google auth attempt - redirect_uri: {redirect_uri}")
    
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code gerekli")
    
    # Get Google OAuth credentials from environment
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        logger.error(f"Google OAuth not configured - client_id: {bool(client_id)}, client_secret: {bool(client_secret)}")
        raise HTTPException(status_code=500, detail="Google OAuth yapılandırılmamış. GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET environment variable'larını kontrol edin.")
    
    # Exchange authorization code for tokens
    async with httpx.AsyncClient() as client:
        try:
            # Get tokens from Google
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code"
                },
                timeout=10.0
            )
            
            if token_response.status_code != 200:
                error_detail = token_response.text
                logger.error(f"Google token error ({token_response.status_code}): {error_detail}")
                raise HTTPException(status_code=401, detail=f"Google doğrulama hatası: {error_detail[:200]}")
            
            tokens = token_response.json()
            access_token = tokens.get("access_token")
            
            if not access_token:
                logger.error(f"No access token in response: {tokens}")
                raise HTTPException(status_code=401, detail="Access token alınamadı")
            
            # Get user info from Google
            user_info_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10.0
            )
            
            if user_info_response.status_code != 200:
                logger.error(f"Failed to get user info: {user_info_response.text}")
                raise HTTPException(status_code=401, detail="Kullanıcı bilgileri alınamadı")
            
            google_data = user_info_response.json()
            logger.info(f"Google user authenticated: {google_data.get('email')}")
            
        except httpx.RequestError as e:
            logger.error(f"Google auth network error: {e}")
            raise HTTPException(status_code=500, detail="Google giriş hatası")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": google_data["email"]}, {"_id": 0})
    
    if existing_user:
        # Update existing user - preserve user-edited fields
        update_data = {
            "last_login": datetime.now(timezone.utc).isoformat()
        }
        # Only update picture from Google (usually user wants latest profile pic)
        if google_data.get("picture"):
            update_data["picture"] = google_data.get("picture")
        # Only update name if user hasn't edited it (still matches Google name or is empty)
        if not existing_user.get("name") or existing_user.get("name") == google_data.get("name"):
            update_data["name"] = google_data.get("name", existing_user.get("name"))
        
        await db.users.update_one(
            {"email": google_data["email"]},
            {"$set": update_data}
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
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    
    return {"success": True, "message": "Çıkış yapıldı"}


# ============= ADMIN AUTH =============

@api_router.post("/admin/login")
async def admin_login(login_data: AdminLogin, response: Response):
    """Admin login with credentials from environment"""
    
    admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'masallardiyariai')
    
    if login_data.username != admin_username or login_data.password != admin_password:
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

@api_router.get("/users/public/{user_id}")
async def get_public_profile(user_id: str):
    """Get public profile of a user"""
    user = await db.users.find_one(
        {"user_id": user_id}, 
        {"_id": 0, "name": 1, "surname": 1, "picture": 1, "created_at": 1}
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Get user's stories (public info only)
    stories = await db.stories.find(
        {"user_id": user_id},
        {"_id": 0, "id": 1, "title": 1, "topic_name": 1, "play_count": 1, "duration": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(50)
    
    return {
        "user_id": user_id,
        "name": user.get("name", ""),
        "surname": user.get("surname", ""),
        "picture": user.get("picture"),
        "member_since": user.get("created_at"),
        "story_count": len(stories),
        "stories": stories
    }


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


# ============= FAVORITES ENDPOINTS =============

@api_router.get("/favorites")
async def get_favorites(request: Request):
    """Get current user's favorite stories"""
    user = await require_auth(request)
    
    favorites = user.get("favorites", [])
    if not favorites:
        return []
    
    # Get story details for favorites
    stories = await db.stories.find(
        {"id": {"$in": favorites}},
        {"_id": 0}
    ).to_list(100)
    
    # Enrich with creator info
    user_ids = list(set(s.get("user_id") for s in stories if s.get("user_id")))
    if user_ids:
        users = await db.users.find(
            {"user_id": {"$in": user_ids}}, 
            {"_id": 0, "user_id": 1, "name": 1, "surname": 1, "picture": 1}
        ).to_list(len(user_ids))
        user_map = {u["user_id"]: u for u in users}
        
        for story in stories:
            if story.get("user_id") and story["user_id"] in user_map:
                u = user_map[story["user_id"]]
                story["creator_name"] = f"{u.get('name', '')} {u.get('surname', '')}".strip()
                story["creator_id"] = story["user_id"]
                story["creator_picture"] = u.get("picture")
    
    return stories


@api_router.post("/favorites/{story_id}")
async def add_favorite(story_id: str, request: Request):
    """Add a story to favorites"""
    user = await require_auth(request)
    
    # Check if story exists
    story = await db.stories.find_one({"id": story_id}, {"_id": 0, "id": 1})
    if not story:
        raise HTTPException(status_code=404, detail="Masal bulunamadı")
    
    # Add to favorites (avoid duplicates)
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$addToSet": {"favorites": story_id}}
    )
    
    return {"success": True, "message": "Favorilere eklendi"}


@api_router.delete("/favorites/{story_id}")
async def remove_favorite(story_id: str, request: Request):
    """Remove a story from favorites"""
    user = await require_auth(request)
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$pull": {"favorites": story_id}}
    )
    
    return {"success": True, "message": "Favorilerden çıkarıldı"}


@api_router.get("/favorites/check/{story_id}")
async def check_favorite(story_id: str, request: Request):
    """Check if a story is in user's favorites"""
    user = await get_current_user(request)
    if not user:
        return {"is_favorite": False}
    
    favorites = user.get("favorites", [])
    return {"is_favorite": story_id in favorites}




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


@api_router.post("/admin/migrate-slugs")
async def admin_migrate_slugs(request: Request):
    """Generate slugs for all stories that don't have one (admin only)"""
    await require_admin(request)
    
    # Find stories without slugs
    stories = await db.stories.find(
        {"$or": [{"slug": None}, {"slug": {"$exists": False}}, {"slug": ""}]},
        {"_id": 0, "id": 1, "title": 1, "age_group": 1}
    ).to_list(1000)
    
    updated_count = 0
    for story in stories:
        base_slug = generate_slug(story["title"], story.get("age_group"))
        unique_slug = await ensure_unique_slug(base_slug, story["id"])
        
        await db.stories.update_one(
            {"id": story["id"]},
            {"$set": {"slug": unique_slug}}
        )
        updated_count += 1
    
    return {
        "success": True, 
        "message": f"{updated_count} masal için slug oluşturuldu",
        "updated_count": updated_count
    }


# ============= BULK STORY GENERATION =============

class BulkStoryTask(BaseModel):
    topic_id: str
    subtopic_id: Optional[str] = None
    theme: str
    age_group: str
    character: Optional[str] = None

class BulkGenerationRequest(BaseModel):
    tasks: List[BulkStoryTask]

# Global state for bulk generation
bulk_generation_state = {
    "is_running": False,
    "should_stop": False,
    "current_index": 0,
    "total_tasks": 0,
    "completed": 0,
    "failed": 0,
    "logs": [],
    "current_task": None
}

def add_bulk_log(message: str, log_type: str = "info"):
    """Add a log entry to bulk generation state"""
    timestamp = datetime.now(timezone.utc).strftime("%H:%M:%S")
    log_entry = {
        "timestamp": timestamp,
        "message": message,
        "type": log_type  # info, success, error, warning
    }
    bulk_generation_state["logs"].append(log_entry)
    # Keep only last 500 logs
    if len(bulk_generation_state["logs"]) > 500:
        bulk_generation_state["logs"] = bulk_generation_state["logs"][-500:]

@api_router.get("/admin/bulk-generate/status")
async def get_bulk_status(request: Request):
    """Get current status of bulk generation"""
    await require_admin(request)
    return {
        "is_running": bulk_generation_state["is_running"],
        "should_stop": bulk_generation_state["should_stop"],
        "current_index": bulk_generation_state["current_index"],
        "total_tasks": bulk_generation_state["total_tasks"],
        "completed": bulk_generation_state["completed"],
        "failed": bulk_generation_state["failed"],
        "logs": bulk_generation_state["logs"][-100:],  # Last 100 logs
        "current_task": bulk_generation_state["current_task"]
    }

@api_router.post("/admin/bulk-generate/start")
async def start_bulk_generation(bulk_request: BulkGenerationRequest, background_tasks: BackgroundTasks, request: Request):
    """Start bulk story generation"""
    await require_admin(request)
    
    if bulk_generation_state["is_running"]:
        raise HTTPException(status_code=400, detail="Üretim zaten devam ediyor")
    
    # Reset state
    bulk_generation_state["is_running"] = True
    bulk_generation_state["should_stop"] = False
    bulk_generation_state["current_index"] = 0
    bulk_generation_state["total_tasks"] = len(bulk_request.tasks)
    bulk_generation_state["completed"] = 0
    bulk_generation_state["failed"] = 0
    bulk_generation_state["logs"] = []
    bulk_generation_state["current_task"] = None
    
    add_bulk_log(f"🚀 Toplu üretim başlatıldı. Toplam {len(bulk_request.tasks)} masal üretilecek.", "info")
    
    # Start background task
    background_tasks.add_task(run_bulk_generation, bulk_request.tasks)
    
    return {"success": True, "message": "Toplu üretim başlatıldı"}

async def run_bulk_generation(tasks: List[BulkStoryTask]):
    """Background task for bulk story generation"""
    try:
        for i, task in enumerate(tasks):
            # Check if should stop
            if bulk_generation_state["should_stop"]:
                add_bulk_log("⏹️ Üretim durduruldu.", "warning")
                break
            
            bulk_generation_state["current_index"] = i + 1
            
            # Get topic info
            topic = get_topic_detail(task.topic_id)
            if not topic:
                add_bulk_log(f"❌ [{i+1}/{len(tasks)}] Konu bulunamadı: {task.topic_id}", "error")
                bulk_generation_state["failed"] += 1
                continue
            
            topic_name = topic["name"]
            subtopic_name = None
            kazanim = None
            
            if task.subtopic_id:
                subtopic = get_subtopic_by_id(task.topic_id, task.subtopic_id)
                if subtopic:
                    subtopic_name = subtopic["name"]
                    kazanim = subtopic["kazanim"]
            
            bulk_generation_state["current_task"] = {
                "topic": topic_name,
                "subtopic": subtopic_name,
                "theme": task.theme,
                "age_group": task.age_group
            }
            
            add_bulk_log(f"📝 [{i+1}/{len(tasks)}] Üretiliyor: {topic_name} - {task.theme} ({task.age_group})", "info")
            
            try:
                # Generate story
                story_data = await generate_story_with_ai(
                    topic_name=topic_name,
                    subtopic_name=subtopic_name,
                    theme=task.theme,
                    age_group=task.age_group,
                    character=task.character,
                    kazanim=kazanim
                )
                
                add_bulk_log(f"✍️ [{i+1}/{len(tasks)}] Masal metni oluşturuldu: {story_data['title'][:50]}...", "info")
                
                # Generate audio
                audio_base64 = None
                duration = None
                try:
                    audio_base64, duration = await generate_audio_for_story(story_data["content"])
                    add_bulk_log(f"🔊 [{i+1}/{len(tasks)}] Ses üretildi ({duration}sn)", "info")
                except Exception as audio_err:
                    add_bulk_log(f"⚠️ [{i+1}/{len(tasks)}] Ses üretilemedi: {str(audio_err)[:50]}", "warning")
                
                # Create story object
                story = Story(
                    title=story_data["title"],
                    content=story_data["content"],
                    topic_id=task.topic_id,
                    topic_name=topic_name,
                    subtopic_id=task.subtopic_id,
                    subtopic_name=subtopic_name,
                    kazanim=kazanim,
                    theme=task.theme,
                    age_group=task.age_group,
                    character=task.character,
                    audio_base64=audio_base64,
                    duration=duration
                )
                
                # Generate slug
                base_slug = generate_slug(story_data["title"], task.age_group)
                story.slug = await ensure_unique_slug(base_slug, story.id)
                
                # Save to database
                story_dict = story.model_dump()
                story_dict["user_id"] = "admin_master"  # Mark as admin generated
                await db.stories.insert_one(story_dict)
                
                bulk_generation_state["completed"] += 1
                add_bulk_log(f"✅ [{i+1}/{len(tasks)}] Kaydedildi: {story_data['title'][:40]}...", "success")
                
            except Exception as e:
                bulk_generation_state["failed"] += 1
                add_bulk_log(f"❌ [{i+1}/{len(tasks)}] Hata: {str(e)[:100]}", "error")
            
            # Small delay between generations to avoid rate limits
            import asyncio
            await asyncio.sleep(2)
        
        # Final summary
        add_bulk_log(f"🏁 Tamamlandı! Başarılı: {bulk_generation_state['completed']}, Başarısız: {bulk_generation_state['failed']}", "info")
        
    except Exception as e:
        add_bulk_log(f"💥 Kritik hata: {str(e)}", "error")
    finally:
        bulk_generation_state["is_running"] = False
        bulk_generation_state["current_task"] = None

@api_router.post("/admin/bulk-generate/stop")
async def stop_bulk_generation(request: Request):
    """Stop bulk story generation"""
    await require_admin(request)
    
    if not bulk_generation_state["is_running"]:
        raise HTTPException(status_code=400, detail="Çalışan bir üretim yok")
    
    bulk_generation_state["should_stop"] = True
    add_bulk_log("⏸️ Durdurma isteği alındı...", "warning")
    
    return {"success": True, "message": "Durdurma isteği gönderildi"}

@api_router.post("/admin/bulk-generate/clear-logs")
async def clear_bulk_logs(request: Request):
    """Clear bulk generation logs"""
    await require_admin(request)
    
    bulk_generation_state["logs"] = []
    
    return {"success": True, "message": "Loglar temizlendi"}

@api_router.get("/admin/generation-presets")
async def get_generation_presets(request: Request):
    """Get all topics and subtopics for bulk generation presets"""
    await require_admin(request)
    
    all_topics = get_all_topics()
    presets = []
    
    for topic in all_topics:
        topic_detail = get_topic_detail(topic["id"])
        if topic_detail:
            presets.append({
                "topic_id": topic["id"],
                "topic_name": topic["name"],
                "subtopics": topic_detail.get("subtopics", [])
            })
    
    return presets


# ============= STORE MANAGEMENT APIs =============

@api_router.get("/admin/store/categories")
async def get_store_categories(request: Request):
    """Get all store categories"""
    await require_admin(request)
    
    categories = await db.store_categories.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return categories

@api_router.post("/admin/store/categories")
async def create_store_category(category: StoreCategoryCreate, request: Request):
    """Create a new store category"""
    await require_admin(request)
    
    # Generate ID
    category_id = str(uuid.uuid4())[:8]
    
    # Get max order
    max_order_cat = await db.store_categories.find_one(sort=[("order", -1)])
    new_order = (max_order_cat.get("order", 0) + 1) if max_order_cat else 0
    
    category_data = {
        "id": category_id,
        "title": category.title,
        "description": category.description,
        "icon": category.icon,
        "gradient": category.gradient,
        "bgColor": category.bgColor,
        "products": [p.model_dump() for p in category.products],
        "order": new_order,
        "isActive": category.isActive,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.store_categories.insert_one(category_data)
    
    # Return without _id
    return {k: v for k, v in category_data.items() if k != "_id"}

@api_router.put("/admin/store/categories/{category_id}")
async def update_store_category(category_id: str, request: Request):
    """Update a store category"""
    await require_admin(request)
    
    body = await request.json()
    
    # Remove _id if present
    if "_id" in body:
        del body["_id"]
    
    body["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.store_categories.update_one(
        {"id": category_id},
        {"$set": body}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")
    
    updated = await db.store_categories.find_one({"id": category_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/store/categories/{category_id}")
async def delete_store_category(category_id: str, request: Request):
    """Delete a store category"""
    await require_admin(request)
    
    result = await db.store_categories.delete_one({"id": category_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")
    
    return {"success": True, "message": "Kategori silindi"}

@api_router.get("/admin/store/featured")
async def get_store_featured(request: Request):
    """Get featured items"""
    await require_admin(request)
    
    featured = await db.store_featured.find({}, {"_id": 0}).sort("order", 1).to_list(20)
    return featured

@api_router.post("/admin/store/featured")
async def create_store_featured(item: StoreFeaturedCreate, request: Request):
    """Create a new featured item"""
    await require_admin(request)
    
    # Generate ID
    item_id = str(uuid.uuid4())[:8]
    
    # Get max order
    max_order_item = await db.store_featured.find_one(sort=[("order", -1)])
    new_order = (max_order_item.get("order", 0) + 1) if max_order_item else 0
    
    item_data = {
        "id": item_id,
        "title": item.title,
        "description": item.description,
        "query": item.query,
        "badge": item.badge,
        "gradient": item.gradient,
        "order": new_order,
        "isActive": item.isActive,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.store_featured.insert_one(item_data)
    
    return {k: v for k, v in item_data.items() if k != "_id"}

@api_router.put("/admin/store/featured/{item_id}")
async def update_store_featured(item_id: str, request: Request):
    """Update a featured item"""
    await require_admin(request)
    
    body = await request.json()
    
    if "_id" in body:
        del body["_id"]
    
    body["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.store_featured.update_one(
        {"id": item_id},
        {"$set": body}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Öğe bulunamadı")
    
    updated = await db.store_featured.find_one({"id": item_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/store/featured/{item_id}")
async def delete_store_featured(item_id: str, request: Request):
    """Delete a featured item"""
    await require_admin(request)
    
    result = await db.store_featured.delete_one({"id": item_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Öğe bulunamadı")
    
    return {"success": True, "message": "Öğe silindi"}

@api_router.post("/admin/store/categories/reorder")
async def reorder_store_categories(request: Request):
    """Reorder store categories"""
    await require_admin(request)
    
    body = await request.json()
    order_list = body.get("order", [])  # List of category IDs in new order
    
    for i, cat_id in enumerate(order_list):
        await db.store_categories.update_one(
            {"id": cat_id},
            {"$set": {"order": i}}
        )
    
    return {"success": True, "message": "Sıralama güncellendi"}

@api_router.post("/admin/store/featured/reorder")
async def reorder_store_featured(request: Request):
    """Reorder featured items"""
    await require_admin(request)
    
    body = await request.json()
    order_list = body.get("order", [])
    
    for i, item_id in enumerate(order_list):
        await db.store_featured.update_one(
            {"id": item_id},
            {"$set": {"order": i}}
        )
    
    return {"success": True, "message": "Sıralama güncellendi"}

# Default store data - will be loaded on reset
DEFAULT_FEATURED_PICKS = [
    {
        "title": "Tübitak Popüler Bilim Kitapları",
        "description": "Bilimi sevdiren en çok satan seriler",
        "query": "tübitak popüler bilim çocuk kitap",
        "badge": "En Çok Satan",
        "gradient": "from-blue-500 to-cyan-500",
        "order": 0,
        "isActive": True
    },
    {
        "title": "Tonguç Akademi Okul Öncesi",
        "description": "Eğlenceli okula hazırlık setleri",
        "query": "tonguç akademi okul öncesi",
        "badge": "Popüler",
        "gradient": "from-orange-500 to-red-500",
        "order": 1,
        "isActive": True
    },
    {
        "title": "Montessori Aktivite Setleri",
        "description": "Öğrenirken eğlenen çocuklar için",
        "query": "montessori aktivite seti çocuk",
        "badge": "Tavsiye",
        "gradient": "from-emerald-500 to-teal-500",
        "order": 2,
        "isActive": True
    },
    {
        "title": "Sesli Masal Projektörü",
        "description": "Uyku öncesi sihirli anlar",
        "query": "çocuk hikaye projektör gece lambası",
        "badge": "Yeni",
        "gradient": "from-purple-500 to-pink-500",
        "order": 3,
        "isActive": True
    }
]

DEFAULT_CATEGORIES = [
    {
        "title": "Masal & Hikaye Kitapları",
        "description": "Klasik masallar, modern hikayeler ve resimli çocuk kitapları",
        "icon": "BookOpen",
        "gradient": "from-violet-500 to-purple-600",
        "bgColor": "bg-violet-50",
        "products": [
            {"name": "En Çok Satan Masal Kitapları", "query": "en çok satan çocuk masal kitabı", "highlight": True},
            {"name": "Resimli Hikaye Kitapları", "query": "resimli hikaye kitabı çocuk", "highlight": False},
            {"name": "Klasik Masallar Seti", "query": "klasik masallar çocuk kitap seti", "highlight": False},
            {"name": "Uyku Öncesi Masalları", "query": "uyku öncesi masal kitabı", "highlight": False},
            {"name": "Değerler Eğitimi Kitapları", "query": "çocuk değerler eğitimi kitap", "highlight": False},
            {"name": "İlk Okuma Kitapları", "query": "ilk okuma kitapları çocuk", "highlight": False}
        ],
        "order": 0,
        "isActive": True
    },
    {
        "title": "Sesli Kitaplar & Hikaye Kutuları",
        "description": "Butonlu sesli kitaplar ve interaktif hikaye cihazları",
        "icon": "Headphones",
        "gradient": "from-pink-500 to-rose-600",
        "bgColor": "bg-pink-50",
        "products": [
            {"name": "Sesli Masal Kitapları", "query": "sesli masal kitabı çocuk", "highlight": True},
            {"name": "Hikaye Anlatma Makinesi", "query": "hikaye anlatma makinesi çocuk", "highlight": False},
            {"name": "Butonlu Sesli Kitaplar", "query": "butonlu sesli kitap çocuk", "highlight": False},
            {"name": "Müzikli Kitaplar", "query": "müzikli çocuk kitabı", "highlight": False},
            {"name": "Projeksiyon Hikaye Cihazı", "query": "projeksiyon hikaye çocuk", "highlight": False}
        ],
        "order": 1,
        "isActive": True
    },
    {
        "title": "Eğitici Oyuncaklar",
        "description": "STEM, Montessori ve gelişim destekleyici oyuncaklar",
        "icon": "Puzzle",
        "gradient": "from-emerald-500 to-green-600",
        "bgColor": "bg-emerald-50",
        "products": [
            {"name": "Montessori Oyuncak Seti", "query": "montessori oyuncak seti", "highlight": True},
            {"name": "STEM Eğitim Setleri", "query": "stem eğitim seti çocuk", "highlight": False},
            {"name": "Ahşap Eğitici Oyuncaklar", "query": "ahşap eğitici oyuncak", "highlight": False},
            {"name": "Puzzle & Yapboz", "query": "çocuk puzzle yapboz", "highlight": False},
            {"name": "Blok & Lego Setleri", "query": "çocuk blok lego seti", "highlight": False},
            {"name": "Zeka Oyunları", "query": "çocuk zeka oyunu", "highlight": False}
        ],
        "order": 2,
        "isActive": True
    },
    {
        "title": "Bebek Ürünleri (0-2 Yaş)",
        "description": "Bebekler için güvenli kitaplar ve ilk oyuncaklar",
        "icon": "Baby",
        "gradient": "from-sky-500 to-blue-600",
        "bgColor": "bg-sky-50",
        "products": [
            {"name": "Kumaş Bebek Kitapları", "query": "kumaş bebek kitabı", "highlight": True},
            {"name": "Banyo Kitapları", "query": "bebek banyo kitabı", "highlight": False},
            {"name": "Sensorik Oyuncaklar", "query": "bebek sensorik oyuncak", "highlight": False},
            {"name": "İlk Yapbozlar", "query": "bebek ilk yapboz", "highlight": False},
            {"name": "Müzikli Bebek Oyuncakları", "query": "müzikli bebek oyuncak", "highlight": False},
            {"name": "Diş Kaşıyıcı Oyuncaklar", "query": "bebek diş kaşıyıcı oyuncak", "highlight": False}
        ],
        "order": 3,
        "isActive": True
    },
    {
        "title": "Yaratıcılık & El İşi",
        "description": "Boyama, çizim ve el becerisi geliştiren aktiviteler",
        "icon": "Palette",
        "gradient": "from-amber-500 to-orange-600",
        "bgColor": "bg-amber-50",
        "products": [
            {"name": "Boyama Kitapları", "query": "çocuk boyama kitabı", "highlight": True},
            {"name": "Oyun Hamuru Setleri", "query": "oyun hamuru seti çocuk", "highlight": False},
            {"name": "El İşi & Craft Setleri", "query": "çocuk el işi craft seti", "highlight": False},
            {"name": "Parmak Boyası", "query": "çocuk parmak boyası seti", "highlight": False},
            {"name": "Çizim & Resim Setleri", "query": "çocuk çizim resim seti", "highlight": False},
            {"name": "Boncuk & Takı Setleri", "query": "çocuk boncuk takı seti", "highlight": False}
        ],
        "order": 4,
        "isActive": True
    },
    {
        "title": "Müzik & Hareket",
        "description": "Müzik aletleri ve aktif oyun ürünleri",
        "icon": "Music",
        "gradient": "from-fuchsia-500 to-pink-600",
        "bgColor": "bg-fuchsia-50",
        "products": [
            {"name": "Çocuk Müzik Aletleri Seti", "query": "çocuk müzik aleti seti", "highlight": True},
            {"name": "Çocuk Gitarı", "query": "çocuk gitarı oyuncak", "highlight": False},
            {"name": "Çocuk Piyanosu", "query": "çocuk piyano oyuncak", "highlight": False},
            {"name": "Ritim Aletleri", "query": "çocuk ritim aleti seti", "highlight": False},
            {"name": "Dans & Hareket Oyunları", "query": "çocuk dans hareket oyunu", "highlight": False}
        ],
        "order": 5,
        "isActive": True
    },
    {
        "title": "Çocuk Teknolojisi",
        "description": "Güvenli tabletler ve eğitici elektronik cihazlar",
        "icon": "Laptop",
        "gradient": "from-indigo-500 to-blue-600",
        "bgColor": "bg-indigo-50",
        "products": [
            {"name": "Çocuk Tabletleri", "query": "çocuk tablet eğitici", "highlight": True},
            {"name": "Eğitici Elektronik Oyuncaklar", "query": "eğitici elektronik oyuncak çocuk", "highlight": False},
            {"name": "Çocuk Akıllı Saati", "query": "çocuk akıllı saat", "highlight": False},
            {"name": "Çocuk Kulaklığı", "query": "çocuk kulaklık güvenli", "highlight": False},
            {"name": "Çocuk Kamerası", "query": "çocuk fotoğraf makinesi", "highlight": False}
        ],
        "order": 6,
        "isActive": True
    },
    {
        "title": "Çocuk Odası & Dekorasyon",
        "description": "Çocuk odası mobilyaları ve dekorasyon ürünleri",
        "icon": "Lamp",
        "gradient": "from-teal-500 to-cyan-600",
        "bgColor": "bg-teal-50",
        "products": [
            {"name": "Çocuk Kitaplığı", "query": "çocuk kitaplık raf", "highlight": True},
            {"name": "Gece Lambası Projektör", "query": "çocuk gece lambası projektör", "highlight": False},
            {"name": "Çocuk Masa Sandalye", "query": "çocuk çalışma masa sandalye", "highlight": False},
            {"name": "Oyuncak Saklama Kutuları", "query": "çocuk oyuncak saklama kutusu", "highlight": False},
            {"name": "Duvar Sticker & Dekor", "query": "çocuk odası duvar sticker", "highlight": False},
            {"name": "Çocuk Halısı", "query": "çocuk odası halı oyun", "highlight": False}
        ],
        "order": 7,
        "isActive": True
    },
    {
        "title": "Anne & Baba Köşesi",
        "description": "Ebeveynlik rehberleri ve aile için kaynaklar",
        "icon": "Heart",
        "gradient": "from-rose-500 to-red-600",
        "bgColor": "bg-rose-50",
        "products": [
            {"name": "Ebeveynlik Kitapları", "query": "ebeveynlik rehber kitap", "highlight": True},
            {"name": "Çocuk Gelişimi Kitapları", "query": "çocuk gelişimi kitap", "highlight": False},
            {"name": "Pozitif Disiplin", "query": "pozitif disiplin çocuk yetiştirme", "highlight": False},
            {"name": "Çocuk Psikolojisi", "query": "çocuk psikolojisi kitap", "highlight": False},
            {"name": "Aile Aktivite Kitapları", "query": "aile aktivite oyun kitabı", "highlight": False}
        ],
        "order": 8,
        "isActive": True
    },
    {
        "title": "Hediye & Özel Günler",
        "description": "Doğum günü ve özel günler için hediye fikirleri",
        "icon": "Gift",
        "gradient": "from-yellow-500 to-amber-600",
        "bgColor": "bg-yellow-50",
        "products": [
            {"name": "Doğum Günü Hediyeleri", "query": "çocuk doğum günü hediye", "highlight": True},
            {"name": "Hediye Setleri", "query": "çocuk hediye seti kutu", "highlight": False},
            {"name": "Kişiselleştirilebilir Ürünler", "query": "kişiye özel çocuk hediye", "highlight": False},
            {"name": "Parti Malzemeleri", "query": "çocuk doğum günü parti malzeme", "highlight": False},
            {"name": "Hatıra & Anı Ürünleri", "query": "bebek çocuk hatıra anı", "highlight": False}
        ],
        "order": 9,
        "isActive": True
    },
    {
        "title": "Okul Öncesi Hazırlık",
        "description": "Alfabe, sayılar, yazı çalışmaları ve okula hazırlık materyalleri",
        "icon": "GraduationCap",
        "gradient": "from-blue-500 to-indigo-600",
        "bgColor": "bg-blue-50",
        "products": [
            {"name": "Okula Hazırlık Setleri", "query": "okul öncesi hazırlık seti", "highlight": True},
            {"name": "Alfabe Öğrenme Kitapları", "query": "alfabe öğrenme kitabı çocuk", "highlight": False},
            {"name": "Sayı ve Matematik", "query": "okul öncesi sayı matematik çocuk", "highlight": False},
            {"name": "Yazı Çalışma Kitapları", "query": "okul öncesi yazı çalışma defteri", "highlight": False},
            {"name": "Dikkat ve Konsantrasyon", "query": "çocuk dikkat konsantrasyon kitabı", "highlight": False},
            {"name": "İngilizce Başlangıç", "query": "çocuk ingilizce başlangıç kitap", "highlight": False}
        ],
        "order": 10,
        "isActive": True
    },
    {
        "title": "Dış Mekan & Bahçe Oyunları",
        "description": "Açık hava aktiviteleri, bisikletler ve bahçe oyuncakları",
        "icon": "TreePine",
        "gradient": "from-green-500 to-lime-600",
        "bgColor": "bg-green-50",
        "products": [
            {"name": "Çocuk Bisikletleri", "query": "çocuk bisiklet 3-6 yaş", "highlight": True},
            {"name": "Scooter & Kaykay", "query": "çocuk scooter kaykay", "highlight": False},
            {"name": "Bahçe Oyun Setleri", "query": "çocuk bahçe oyun seti salıncak", "highlight": False},
            {"name": "Kum Havuzu & Oyuncakları", "query": "çocuk kum havuzu oyuncak seti", "highlight": False},
            {"name": "Top & Spor Oyunları", "query": "çocuk futbol basketbol top seti", "highlight": False},
            {"name": "Su Oyuncakları", "query": "çocuk su oyuncağı havuz", "highlight": False}
        ],
        "order": 11,
        "isActive": True
    },
    {
        "title": "Karakter & Lisanslı Ürünler",
        "description": "Disney, Peppa Pig, PJ Masks ve sevilen karakterler",
        "icon": "Crown",
        "gradient": "from-pink-500 to-purple-600",
        "bgColor": "bg-pink-50",
        "products": [
            {"name": "Disney Prenses Ürünleri", "query": "disney prenses çocuk", "highlight": True},
            {"name": "Peppa Pig Koleksiyonu", "query": "peppa pig çocuk oyuncak kitap", "highlight": False},
            {"name": "PJ Masks Pijamaskeliler", "query": "pj masks pijamaskeliler çocuk", "highlight": False},
            {"name": "Paw Patrol", "query": "paw patrol çocuk oyuncak", "highlight": False},
            {"name": "Frozen Karlar Ülkesi", "query": "frozen karlar ülkesi çocuk", "highlight": False},
            {"name": "Spiderman & Süper Kahramanlar", "query": "spiderman süper kahraman çocuk", "highlight": False}
        ],
        "order": 12,
        "isActive": True
    }
]

@api_router.post("/admin/store/reset-defaults")
async def reset_store_to_defaults(request: Request):
    """Reset store data to defaults - clears existing and adds default data"""
    await require_admin(request)
    
    try:
        # Clear existing data
        await db.store_categories.delete_many({})
        await db.store_featured.delete_many({})
        
        # Add default categories
        for cat in DEFAULT_CATEGORIES:
            cat_data = {
                **cat,
                "id": str(uuid.uuid4())[:8],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.store_categories.insert_one(cat_data)
        
        # Add default featured items
        for item in DEFAULT_FEATURED_PICKS:
            item_data = {
                **item,
                "id": str(uuid.uuid4())[:8],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.store_featured.insert_one(item_data)
        
        return {
            "success": True, 
            "message": "Mağaza verileri varsayılana döndürüldü",
            "categories_count": len(DEFAULT_CATEGORIES),
            "featured_count": len(DEFAULT_FEATURED_PICKS)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hata: {str(e)}")

@api_router.get("/admin/store/status")
async def get_store_status(request: Request):
    """Check if store has data"""
    await require_admin(request)
    
    categories_count = await db.store_categories.count_documents({})
    featured_count = await db.store_featured.count_documents({})
    
    return {
        "has_data": categories_count > 0 or featured_count > 0,
        "categories_count": categories_count,
        "featured_count": featured_count
    }

# Public endpoint for frontend to fetch store data
@api_router.get("/store/data")
async def get_public_store_data():
    """Get store data for public frontend"""
    categories = await db.store_categories.find(
        {"isActive": True}, 
        {"_id": 0}
    ).sort("order", 1).to_list(100)
    
    featured = await db.store_featured.find(
        {"isActive": True}, 
        {"_id": 0}
    ).sort("order", 1).to_list(20)
    
    return {
        "categories": categories,
        "featured": featured
    }


# ============= SEO - SITEMAP =============

from fastapi.responses import PlainTextResponse

@api_router.get("/sitemap.xml", response_class=PlainTextResponse)
async def generate_sitemap():
    """Generate dynamic sitemap.xml for SEO"""
    base_url = "https://masal.space"
    
    # Start XML
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # Static pages
    static_pages = [
        {"loc": "/", "priority": "1.0", "changefreq": "daily"},
        {"loc": "/stories", "priority": "0.9", "changefreq": "daily"},
        {"loc": "/about", "priority": "0.5", "changefreq": "monthly"},
        {"loc": "/privacy", "priority": "0.3", "changefreq": "yearly"},
        {"loc": "/terms", "priority": "0.3", "changefreq": "yearly"},
    ]
    
    for page in static_pages:
        xml_content += f'''  <url>
    <loc>{base_url}{page["loc"]}</loc>
    <changefreq>{page["changefreq"]}</changefreq>
    <priority>{page["priority"]}</priority>
  </url>\n'''
    
    # Topic pages
    all_topics = get_all_topics()
    for topic in all_topics:
        xml_content += f'''  <url>
    <loc>{base_url}/topics/{topic["id"]}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n'''
    
    # Story pages (get all stories with slugs)
    try:
        stories = await db.stories.find(
            {"slug": {"$exists": True, "$ne": None}},
            {"slug": 1, "created_at": 1}
        ).sort("created_at", -1).limit(1000).to_list(1000)
        
        for story in stories:
            lastmod = ""
            if story.get("created_at"):
                if isinstance(story["created_at"], str):
                    lastmod = f"\n    <lastmod>{story['created_at'][:10]}</lastmod>"
                else:
                    lastmod = f"\n    <lastmod>{story['created_at'].strftime('%Y-%m-%d')}</lastmod>"
            
            xml_content += f'''  <url>
    <loc>{base_url}/masal/{story["slug"]}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>{lastmod}
  </url>\n'''
    except Exception as e:
        logging.error(f"Sitemap story fetch error: {e}")
    
    xml_content += '</urlset>'
    
    return PlainTextResponse(content=xml_content, media_type="application/xml")


@api_router.get("/seo/stats")
async def get_seo_stats():
    """Get SEO statistics for the site"""
    try:
        total_stories = await db.stories.count_documents({})
        stories_with_slug = await db.stories.count_documents({"slug": {"$exists": True, "$ne": None}})
        total_topics = len(get_all_topics())
        
        return {
            "total_stories": total_stories,
            "indexed_stories": stories_with_slug,
            "total_topics": total_topics,
            "sitemap_url": "https://masal.space/api/sitemap.xml",
            "robots_url": "https://masal.space/robots.txt"
        }
    except Exception as e:
        return {"error": str(e)}


# Include router
app.include_router(api_router)

# CORS middleware - specific origins required when credentials=True
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "https://cloud-dancer.preview.emergentagent.com",
    "https://masalsepeti.emergent.host",
    "https://storytimeai.emergent.host",
    "https://masal.space",
    "http://masal.space",
    "https://www.masal.space",
    "http://www.masal.space",
    # Railway domains
    "https://masalla-production.up.railway.app",
    "https://capable-solace-production.up.railway.app",
    "https://boevh8zj.up.railway.app",
    "https://capable-solace.up.railway.app",
]

# Also allow origins from environment variable
import os
extra_origins = os.environ.get("CORS_ORIGINS", "").split(",")
ALLOWED_ORIGINS.extend([o.strip() for o in extra_origins if o.strip()])

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
