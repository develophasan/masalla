# MASAL SEPETİ - Product Requirements Document

## Original Problem Statement
Build a full-stack web application called "MASAL SEPETİ" (Tale Basket) - a platform for generating and listening to AI-created educational stories for children.

## Core Features
- Full user membership with custom Google OAuth and local registration
- Admin panel for administrative tasks
- Credit system for story generation
- **AI story generation using Gemini 2.5 Flash** (updated from OpenAI)
- Text-to-speech audio generation using Google Cloud TTS (softer Turkish female voice)
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
- **Google Gemini 2.5 Flash** (Story Generation) — User API Key (`GEMINI_API_KEY`)
- **Google Cloud TTS** (Audio) — User API Key (`GOOGLE_TTS_API_KEY`)
- **Custom Google OAuth** (Social Login) — User Keys
- **Google AdSense** (Ads) — Publisher ID: ca-pub-7470017453637950

## Completed Features (as of Jan 2025)
- [x] Custom Google OAuth implementation
- [x] Content moderation system (profanity filter)
- [x] AdSense integration
- [x] Privacy Policy page (`/privacy`)
- [x] Terms of Service page (`/terms`)
- [x] Site-wide Footer component
- [x] API Documentation page (`/dev/api?key=masal2025dev`)
- [x] Authentication documentation with session_token guide
- [x] "Back to Home" buttons on Login/Register pages
- [x] Bulk Story Generation Page (`/admin/bulk-generate`)
- [x] **Migration from OpenAI to Gemini 2.5 Flash**
- [x] **Softer TTS voice (tr-TR-Standard-A)**

## Railway Environment Variables
```
GEMINI_API_KEY=AIzaSyBly39KguEXdKPDWPjOp_pp3hS25vhYHdI
GOOGLE_TTS_API_KEY=AIzaSyC2SAYMrIvMkl1taSCgF2febXou1q30T4s
GOOGLE_CLIENT_ID=382378341254-uuk351iupk6nm7rb80pih0ii9fuup1d2.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
ADMIN_USERNAME=admin
ADMIN_PASSWORD=masallardiyariai
```

## Upcoming Tasks
- [ ] Rewarded Ad for Story Downloads (user request)

## Future/Backlog
- Backend refactoring (explicitly deferred by user)

## Key Routes
- `/dev/api?key=masal2025dev` - Private API documentation
- `/privacy` - Privacy Policy
- `/terms` - Terms of Service
- `/admin/bulk-generate` - Bulk story generation (admin only)

## Credentials
- **Admin:** username `admin`, password `masallardiyariai`
- **API Docs Key:** `masal2025dev`

## Railway Deployment Notes
- Frontend: `masal.space`
- Backend: `masalla-production.up.railway.app`
- **Important:** Add `GEMINI_API_KEY` environment variable to backend service
