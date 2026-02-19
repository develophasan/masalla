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
- AdSense integration for monetization
- Bulk Story Generation admin page

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS + Shadcn/UI
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **AI Model:** Google Gemini 2.5 Flash
- **TTS:** Google Cloud Text-to-Speech (tr-TR-Standard-A)

## 3rd Party Integrations
- **Google Gemini 2.5 Flash** (Story Generation) — Requires `GEMINI_API_KEY`
- **Google Cloud TTS** (Audio) — Requires `GOOGLE_TTS_API_KEY`
- **Custom Google OAuth** (Social Login) — Requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Google AdSense** (Ads)

## Completed Features (as of Jan 2025)
- [x] Custom Google OAuth implementation
- [x] Content moderation system (profanity filter)
- [x] AdSense integration
- [x] Privacy Policy page (`/privacy`)
- [x] Terms of Service page (`/terms`)
- [x] Site-wide Footer component
- [x] API Documentation page (`/dev/api`)
- [x] Authentication documentation with session_token guide
- [x] "Back to Home" buttons on Login/Register pages
- [x] Bulk Story Generation Page (`/admin/bulk-generate`)
- [x] Migration from OpenAI to Gemini 2.5 Flash
- [x] Softer TTS voice (tr-TR-Standard-A)

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

## Future/Backlog
- Backend refactoring (deferred)

## Key Routes
- `/dev/api` - Private API documentation (requires key)
- `/privacy` - Privacy Policy
- `/terms` - Terms of Service
- `/admin/bulk-generate` - Bulk story generation (admin only)

## Deployment
- Frontend: Custom domain
- Backend: Railway or similar PaaS
- Database: MongoDB Atlas or Railway MongoDB
