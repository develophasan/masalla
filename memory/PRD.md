# MASAL SEPETİ - Product Requirements Document

## Original Problem Statement
Build a full-stack web application called "MASAL SEPETİ" (Tale Basket) - a platform for generating and listening to AI-created educational stories for children.

## Core Features
- Full user membership with custom Google OAuth and local registration
- Admin panel for administrative tasks
- Credit system for story generation
- AI story generation using OpenAI API (user's own key)
- Text-to-speech audio generation using Google Cloud TTS
- SEO-friendly story URLs (`/masal/{slug}`) with dynamic metadata
- Profanity filter for content moderation
- Favorites system for users to save stories
- Responsive, mobile-friendly design
- AdSense integration for monetization

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS + Shadcn/UI
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **External APIs:** OpenAI, Google Cloud TTS, Google OAuth

## 3rd Party Integrations
- **OpenAI GPT-4o** (Story Generation) — User API Key
- **Google Cloud TTS** (Audio) — User API Key
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
- [x] Fixed `requests-oauthlib` dependency

## Upcoming Tasks
- [ ] Rewarded Ad for Story Downloads (user request)

## Future/Backlog
- Backend refactoring (explicitly deferred by user)

## Key Routes
- `/dev/api?key=masal2025dev` - Private API documentation
- `/privacy` - Privacy Policy
- `/terms` - Terms of Service

## Credentials
- **Admin:** username `admin`, password `masallardiyariai`
- **API Docs Key:** `masal2025dev`
