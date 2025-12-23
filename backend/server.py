from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Emergent integrations
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai import OpenAITextToSpeech

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
    """Generate TTS audio using OpenAI via Emergent integrations"""
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="TTS API key not configured")
    
    try:
        tts = OpenAITextToSpeech(api_key=api_key)
        
        # Use shimmer voice - soft feminine voice for children's stories
        # Limit text to 4096 chars for TTS API
        text_chunk = text[:4000] if len(text) > 4000 else text
        
        audio_base64 = await tts.generate_speech_base64(
            text=text_chunk,
            model="tts-1",
            voice="shimmer",  # Soft, feminine voiceytelling voice
            speed=0.9  # Slightly slower for children
        )
        
        # Estimate duration (roughly 150 words per minute for slow speech)
        word_count = len(text.split())
        duration = int((word_count / 150) * 60)  # in seconds
        
        return audio_base64, duration
        
    except Exception as e:
        logger.error(f"TTS generation error: {e}")
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
async def generate_story(story_input: StoryCreate):
    """Generate a new story using AI and TTS"""
    
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
async def delete_story(story_id: str):
    """Delete a story"""
    
    result = await db.stories.delete_one({"id": story_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Masal bulunamadı")
    
    return {"success": True, "message": "Masal silindi"}


# Include router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
