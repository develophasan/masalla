# MASAL SEPETİ - Product Requirements Document

## Original Problem Statement
Build a full-stack web application called "MASAL SEPETİ" (Tale Basket) - a platform for generating and listening to AI-created educational stories for children.

## Core Features
- Full user membership with custom Google OAuth and local registration
- Admin panel for administrative tasks
- Credit system for story generation
- AI story generation using Gemini 2.5 Flash
- Text-to-speech audio generation using Google Cloud TTS (Turkish female voice)
- SEO-friendly story URLs (`/masal/{slug}`) with dynamic metadata
- Profanity filter for content moderation
- Favorites system for users to save stories
- Responsive, mobile-friendly design
- Amazon Affiliate integration for monetization
- Bulk Story Generation admin page
- **React Query caching** for optimized data loading

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS + Shadcn/UI + **React Query (TanStack)**
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **AI Model:** Google Gemini 2.5 Flash
- **TTS:** Google Cloud Text-to-Speech (tr-TR-Standard-A)

## 3rd Party Integrations
- **Google Gemini 2.5 Flash** (Story Generation) — Requires `GEMINI_API_KEY`
- **Google Cloud TTS** (Audio) — Requires `GOOGLE_TTS_API_KEY`
- **Custom Google OAuth** (Social Login) — Requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Amazon Associates** (Affiliate Ads)

## Completed Features (as of Jan 2025)
- [x] Custom Google OAuth implementation
- [x] Content moderation system (profanity filter)
- [x] Amazon Affiliate integration (replaced AdSense)
- [x] Privacy Policy page (`/privacy`)
- [x] Terms of Service page (`/terms`)
- [x] Site-wide Footer component
- [x] API Documentation page (`/dev/api`)
- [x] Authentication documentation with session_token guide
- [x] "Back to Home" buttons on Login/Register pages
- [x] Bulk Story Generation Page (`/admin/bulk-generate`)
- [x] Migration from OpenAI to Gemini 2.5 Flash
- [x] Softer TTS voice (tr-TR-Standard-A - Turkish female)
- [x] Story length optimization for TTS (400-500 words)
- [x] PWA Support (manifest, service worker, icons, offline page)
- [x] iOS safe-area/status bar support
- [x] Flutter API documentation (`/app/FLUTTER_API_REHBER.md`)
- [x] Security cleanup (API keys removed from codebase)
- [x] Gemini API Key - Active ✓
- [x] Download/Share with 10-second Amazon ad display
- [x] **React Query caching** - Automatic data caching for topics, stories, and pages
- [x] **Öneri Mağazası** (`/magaza`) - Amazon affiliate ürün kategorileri sayfası
- [x] **Faz 1: Cloud Dancer Design System** - Yeni renk sistemi, glassmorphism, kategori bazlı dinamik temalar
- [x] **Bento Grid Layout** - Ana sayfada featured + regular story kartları
- [x] **Modern StoryCard** - Glassmorphism, hover efektleri, kategori bazlı renk aksanları
- [x] **Faz 2: Tüm Komponentler Cloud Dancer'a Uyumlandı**
  - TopicCard - Dinamik tema, hover efektleri
  - StoryListPage - Glassmorphism filtreler
  - StoryCreatePage - Cloud Dancer arka plan
  - HowToCreateStory - Glass card, floating decorations
- [x] **Faz 3: Hikaye Okuma Sayfası - Scrollytelling & Paralaks**
  - Reading progress bar (sayfa başında)
  - Parallax floating decorations (mouse takipli)
  - Immersive audio player (wave animasyonu, pulse efekti)
  - Scrollytelling paragraflar (scroll ile ortaya çıkma)
  - Kategori bazlı dinamik renkler
  - Glass morphism tüm kartlarda

## Required Environment Variables (Backend)
```
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_TTS_API_KEY=your_google_tts_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
MONGO_URL=your_mongodb_connection_string
DB_NAME=your_database_name
```

## Upcoming Tasks
- [ ] Rewarded Ad for Story Downloads
- [ ] Update old stories with new female TTS voice
- [ ] Push notifications for new stories

## Future/Backlog
- [ ] Backend refactoring (deferred by user)
- [ ] Multi-language support
- [ ] AI-generated story illustrations
- [ ] Parental control panel
- [ ] Offline story playback
- [ ] Voice selection for TTS
- [ ] Story series/continuation feature
- [ ] Social sharing (WhatsApp, Instagram)

## Key Routes
- `/dev/api` - Private API documentation (requires key)
- `/privacy` - Privacy Policy
- `/terms` - Terms of Service
- `/admin/bulk-generate` - Bulk story generation (admin only)

## Deployment
- Frontend: Custom domain
- Backend: Railway or similar PaaS
- Database: MongoDB Atlas or Railway MongoDB

**Latest Update (Feb 21, 2025)**
- **Amazon Affiliate Link Hatası Düzeltildi (P0):**
  - Hatalı link formatı `?k=...?tag=...` → Doğru format `?k=...&tag=...`
  - Düzeltilen dosyalar:
    - `AdBanner.jsx` - Ana sayfa ve sidebar reklamları
    - `AdInterstitial.jsx` - Modal reklam bileşeni
    - `StorePage.jsx` - Öneri Mağazası sayfası
    - `AmazonAffiliate.jsx` - Zaten doğruydu (onaylandı)
  - Tüm Amazon linkleri artık geçerli ve izlenebilir

**Previous Update (Session Continued)**
- **Reklam Süresi Güncellemesi:** İndirme, paylaşma ve masal oluşturma için Amazon reklam gösterim süresi 5 saniyeden **10 saniyeye** çıkarıldı
- Güncellenen dosyalar:
  - `StoryDetailPage.jsx` - İndirme ve paylaşma reklamları
  - `StoryCreatePage.jsx` - Masal oluşturma reklamı  
  - `AdInterstitial.jsx` - Varsayılan süre ve dinamik geri sayım

**Completed work in this session**