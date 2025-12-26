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
from better_profanity import profanity

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# OpenAI for text generation
from openai import AsyncOpenAI

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

# ============= CONTENT MODERATION =============

# Turkish bad words list (common profanity and inappropriate terms)
TURKISH_BAD_WORDS = [
    # Küfürler
    "amk", "aq", "amına", "amını", "orospu", "oç", "piç", "sikik", "siktir", 
    "yarrak", "yarak", "göt", "götün", "taşak", "taşşak", "meme", "kaltak",
    "fahişe", "pezevenk", "ibne", "götveren", "puşt", "kahpe", "şerefsiz",
    "dangalak", "gerizekalı", "salak", "aptal", "mal", "hıyar", "dalyarak",
    # Şiddet içeren
    "öldür", "gebertir", "boğazını", "kafasını kes", "parçala",
    # Cinsel içerik
    "seks", "porno", "erotik", "çıplak",
    # Irkçılık / nefret
    "gavur", "zenci", "çingene",
    # Diğer uygunsuz
    "bok", "boktan", "pislik", "lanet", "cehennem",
]

# Initialize profanity filter with English + custom Turkish words
profanity.load_censor_words()
profanity.add_censor_words(TURKISH_BAD_WORDS)

def normalize_text(text: str) -> str:
    """Normalize text for better matching (handle Turkish chars, numbers as letters)"""
    if not text:
        return ""
    
    text = text.lower()
    
    # Common letter substitutions used to bypass filters
    substitutions = {
        '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', 
        '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i',
        'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c'
    }
    
    for old, new in substitutions.items():
        text = text.replace(old, new)
    
    # Remove special characters but keep spaces
    text = re.sub(r'[^a-z0-9\s]', '', text)
    
    return text

def contains_bad_content(text: str) -> tuple[bool, str]:
    """Check if text contains inappropriate content. Returns (is_bad, reason)"""
    if not text:
        return False, ""
    
    # Normalize text
    normalized = normalize_text(text)
    original_lower = text.lower()
    
    # Check with profanity library
    if profanity.contains_profanity(text) or profanity.contains_profanity(normalized):
        return True, "Uygunsuz kelime tespit edildi"
    
    # Check Turkish bad words directly (handles spacing tricks like "a m k")
    for bad_word in TURKISH_BAD_WORDS:
        # Check normal
        if bad_word in original_lower or bad_word in normalized:
            return True, f"Uygunsuz içerik tespit edildi"
        
        # Check with spaces removed
        if bad_word in original_lower.replace(" ", "") or bad_word in normalized.replace(" ", ""):
            return True, f"Uygunsuz içerik tespit edildi"
    
    return False, ""

async def check_content_with_openai(text: str) -> tuple[bool, str]:
    """Use OpenAI Moderation API to check content (free API)"""
    openai_key = os.environ.get('OPENAI_API_KEY')
    if not openai_key:
        return False, ""  # Skip if no API key
    
    try:
        client = AsyncOpenAI(api_key=openai_key)
        response = await client.moderations.create(input=text)
        
        result = response.results[0]
        
        if result.flagged:
            # Get the categories that were flagged
            categories = result.categories
            reasons = []
            
            if categories.sexual:
                reasons.append("cinsel içerik")
            if categories.hate:
                reasons.append("nefret söylemi")
            if categories.violence:
                reasons.append("şiddet içeriği")
            if categories.self_harm:
                reasons.append("zararlı içerik")
            if categories.harassment:
                reasons.append("taciz içeriği")
            
            return True, f"Uygunsuz içerik: {', '.join(reasons)}" if reasons else "Uygunsuz içerik tespit edildi"
        
        return False, ""
    
    except Exception as e:
        logger.error(f"OpenAI moderation error: {e}")
        return False, ""  # Don't block on API errors

async def validate_story_request(
    topic_name: str,
    subtopic_name: Optional[str],
    theme: str,
    character: Optional[str],
    kazanim: Optional[str]
) -> tuple[bool, str]:
    """Validate all story request fields for inappropriate content"""
    
    # Check all text fields
    fields_to_check = [
        (topic_name, "Konu"),
        (subtopic_name, "Alt konu"),
        (theme, "Tema"),
        (character, "Karakter"),
        (kazanim, "Kazanım"),
    ]
    
    # First pass: Local Turkish filter (fast)
    for field_value, field_name in fields_to_check:
        if field_value:
            is_bad, reason = contains_bad_content(field_value)
            if is_bad:
                logger.warning(f"Bad content detected in {field_name}: {field_value[:50]}...")
                return False, f"{field_name} alanında uygunsuz içerik tespit edildi. Lütfen uygun bir içerik girin."
    
    # Second pass: OpenAI Moderation API (comprehensive)
    all_text = " ".join(filter(None, [topic_name, subtopic_name, theme, character, kazanim]))
    is_flagged, openai_reason = await check_content_with_openai(all_text)
    
    if is_flagged:
        logger.warning(f"OpenAI flagged content: {all_text[:100]}...")
        return False, f"İçerik uygunluk kontrolünden geçemedi: {openai_reason}. Lütfen çocuklara uygun içerik girin."
    
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
    """Generate a fairy tale using OpenAI API"""
    
    # Check for OpenAI API key
    openai_key = os.environ.get('OPENAI_API_KEY')
    
    if not openai_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY yapılandırılmamış")
    
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
        # Use direct OpenAI API
        client = AsyncOpenAI(api_key=openai_key)
        
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.8,
            max_tokens=2000
        )
        result = response.choices[0].message.content
        
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
        
        # Build the voice request - Turkish female Neural2 voice for children's stories
        voice = texttospeech.VoiceSelectionParams(
            language_code="tr-TR",
            name="tr-TR-Wavenet-E",  # Turkish female WaveNet voice (high quality)
            ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
        )
        
        # Select the audio file type and speaking rate
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=0.9,  # Slightly slower for children
            pitch=1.0  # Normal pitch
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
    
    # ============= CHECK GENERATED CONTENT =============
    # Also validate the AI-generated content
    generated_text = f"{story_data['title']} {story_data['content']}"
    is_output_valid, output_error = contains_bad_content(generated_text)
    
    if is_output_valid:  # Note: is_output_valid=True means BAD content
        logger.error(f"AI generated inappropriate content, blocking")
        raise HTTPException(
            status_code=500,
            detail="Üretilen içerik uygunluk kontrolünden geçemedi. Lütfen farklı bir tema veya karakter deneyin."
        )
    # ===================================================
    
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


# Include router
app.include_router(api_router)

# CORS middleware - specific origins required when credentials=True
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "https://edutales-1.preview.emergentagent.com",
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
