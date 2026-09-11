# AI Resume Matcher — Production SaaS Build Spec

> Ye document ek **complete build specification** hai. Ise kisi bhi AI coding agent (Claude Code, Cursor, Devin, etc.) ko diya ja sakta hai taaki wo is project ko **end-to-end, production-grade** bana sake — bina kisi confusion ke.

---

## 1. Product Overview

**Naam:** AI Resume Matcher (SaaS)

**One-liner:** User apna resume upload karta hai + job description paste karta hai → AI unko compare karke match score, missing skills, aur improvement suggestions deta hai.

**Target Users:**
- Job seekers / students
- Career coaches
- Small HR teams (bulk screening — future feature)

**Business Model (future-ready):** Freemium — 3 free analyses/month, paid plan unlimited (Stripe/Razorpay integration point already planned in schema).

---

## 2. Core Features (MVP)

| Feature | Description |
|---|---|
| Auth | Email/password signup-login + Google OAuth, JWT-based sessions |
| Resume Upload | PDF upload, text extraction, stored per user |
| Job Description Input | Paste raw JD text |
| AI Analysis | Match score (0-100%), missing keywords, improvement suggestions, structured JSON response |
| Analysis History | User's past analyses saved & viewable |
| Dashboard | Visual score display (animated circular progress), history list, quick re-analyze |
| Profile | Edit name, email, password, delete account |
| Landing Page | Marketing page explaining product, premium animated feel |

### Phase 2 Features (nice-to-have, don't block MVP)
- Bulk resume screening for recruiters
- Stripe subscription billing
- PDF export of analysis report
- Resume builder (AI-generated resume from scratch)

---

## 3. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend | **FastAPI** (Python 3.11+) | Async, fast, auto docs (Swagger) |
| Frontend | **Next.js 14 (App Router) + TypeScript** | SSR + SEO for landing page, modern DX |
| Styling | **Tailwind CSS + shadcn/ui** | Premium components fast |
| Animations | **Framer Motion** | Smooth, premium micro-interactions |
| Database | **PostgreSQL** | Relational, reliable |
| ORM | **SQLAlchemy 2.0 + Alembic** | Migrations |
| Cache/Queue | **Redis + Celery** | Background AI processing (avoid blocking requests) |
| AI Provider | **Anthropic Claude API / OpenAI API** | Resume-JD analysis |
| PDF Parsing | **pdfplumber / PyPDF2** | Extract resume text |
| Auth | **JWT (python-jose) + passlib (bcrypt)** | Secure sessions |
| Deployment | **Docker + Docker Compose** → Railway/Render (backend), Vercel (frontend) | Easy CI/CD |
| Testing | **pytest (backend), Playwright (e2e)** | Reliability |

---

## 4. Complete Folder & File Structure

```
ai-resume-matcher/
│
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI app entrypoint
│   │   ├── config.py                   # env settings (pydantic BaseSettings)
│   │   ├── database.py                 # DB session/engine setup
│   │   │
│   │   ├── models/                     # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── resume.py
│   │   │   └── analysis.py
│   │   │
│   │   ├── schemas/                    # Pydantic request/response models
│   │   │   ├── user_schema.py
│   │   │   ├── resume_schema.py
│   │   │   └── analysis_schema.py
│   │   │
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── router.py           # combines all routers
│   │   │       └── endpoints/
│   │   │           ├── auth.py
│   │   │           ├── resume.py
│   │   │           ├── analysis.py
│   │   │           └── user.py
│   │   │
│   │   ├── core/
│   │   │   ├── security.py             # JWT, password hashing
│   │   │   ├── ai_engine.py            # LLM prompt + API call logic
│   │   │   ├── pdf_parser.py           # extract text from PDF
│   │   │   └── celery_worker.py        # background task setup
│   │   │
│   │   └── utils/
│   │       ├── logger.py
│   │       └── helpers.py
│   │
│   ├── alembic/                        # DB migrations
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_resume.py
│   │   └── test_analysis.py
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   └── alembic.ini
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # main dashboard
│   │   │   ├── upload/page.tsx         # upload + JD input
│   │   │   ├── history/page.tsx        # past analyses
│   │   │   └── result/[id]/page.tsx    # analysis result view
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # landing page
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn base components (button, card, modal, input)
│   │   ├── charts/
│   │   │   └── ScoreRing.tsx           # animated circular score
│   │   ├── upload/
│   │   │   └── ResumeDropzone.tsx
│   │   ├── navbar/
│   │   │   └── Navbar.tsx
│   │   ├── animations/
│   │   │   └── FadeInSection.tsx
│   │   └── landing/
│   │       ├── Hero.tsx
│   │       ├── Features.tsx
│   │       └── Pricing.tsx
│   │
│   ├── lib/
│   │   ├── api.ts                      # axios/fetch wrapper
│   │   └── auth.ts                     # token storage/refresh
│   │
│   ├── hooks/
│   │   └── useAuth.ts
│   │
│   ├── public/
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml                  # spins up backend + frontend + postgres + redis
├── .gitignore
├── AGENT_PROMPT.md
└── README.md                           # (this file)
```

---

## 5. Database Schema (PostgreSQL)

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | default gen_random_uuid() |
| name | VARCHAR(100) | |
| email | VARCHAR(150) UNIQUE | |
| password_hash | VARCHAR(255) | bcrypt |
| plan | VARCHAR(20) | default 'free' |
| is_verified | BOOLEAN | default false |
| created_at | TIMESTAMP | default now() |

### `resumes`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users.id) | |
| file_url | VARCHAR(255) | storage path (S3/local) |
| extracted_text | TEXT | parsed content |
| uploaded_at | TIMESTAMP | default now() |

### `analyses`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users.id) | |
| resume_id | UUID (FK → resumes.id) | |
| job_description | TEXT | |
| match_score | INTEGER | 0–100 |
| missing_keywords | JSONB | list of strings |
| suggestions | TEXT | AI-generated advice |
| created_at | TIMESTAMP | default now() |

### `subscriptions` (Phase 2 — schema ready, logic later)
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| stripe_customer_id | VARCHAR(100) | |
| status | VARCHAR(20) | active/canceled |
| current_period_end | TIMESTAMP | |

---

## 6. API Endpoints

### Auth (`/api/v1/auth`)
| Method | Path | Description |
|---|---|---|
| POST | `/signup` | Create account |
| POST | `/login` | Returns access + refresh JWT |
| POST | `/refresh` | New access token |
| GET | `/me` | Current user info |

### Resume (`/api/v1/resume`)
| Method | Path | Description |
|---|---|---|
| POST | `/upload` | Upload PDF, extract text, save |
| GET | `/list` | List user's resumes |
| GET | `/{id}` | Get single resume |
| DELETE | `/{id}` | Delete resume |

### Analysis (`/api/v1/analysis`)
| Method | Path | Description |
|---|---|---|
| POST | `/run` | Body: `resume_id`, `job_description` → triggers AI, returns score+details |
| GET | `/{id}` | Get single analysis |
| GET | `/history` | List all past analyses (paginated) |

### User (`/api/v1/user`)
| Method | Path | Description |
|---|---|---|
| GET | `/profile` | Get profile |
| PUT | `/profile` | Update name/email |
| DELETE | `/account` | Delete account + cascade data |

---

## 7. UI/UX Guidelines (Premium Feel)

- **Design language:** Minimal, dark-mode-first with soft gradients (glassmorphism cards), generous white space.
- **Color palette:** Deep navy/black base + one accent color (electric violet or emerald) for CTAs and score indicators.
- **Typography:** Inter or Geist font, clear hierarchy (large bold headline, medium subtext).
- **Animations (Framer Motion):**
  - Landing page sections fade/slide in on scroll.
  - Score result: animated circular progress ring counting up from 0 to final %.
  - Buttons: subtle scale + glow on hover.
  - Page transitions: smooth fade between routes.
  - Upload dropzone: drag-active state with pulse animation.
- **Responsiveness:** Mobile-first, dashboard must collapse to single column on small screens.
- **Feedback states:** Every async action needs a loading skeleton/spinner, success toast, and error toast (use `sonner` or `react-hot-toast`).
- **Empty states:** Friendly illustrations/text when no resumes/history exist yet — not just blank screens.

---

## 8. Non-Functional Requirements

- All API responses follow a consistent JSON envelope: `{ "success": bool, "data": {...}, "error": null }`
- Passwords never stored/logged in plaintext.
- Rate limit `/analysis/run` (e.g. 10 req/min per user) to control AI API cost.
- AI calls run via **Celery background task**, frontend polls or uses WebSocket for result (don't block HTTP request on slow LLM call).
- `.env.example` must list every required environment variable, with no real secrets committed.
- Dockerized: `docker-compose up` should bring up postgres + redis + backend + frontend with one command.
- Basic test coverage for auth and analysis endpoints before calling MVP "done".

---

## 9. Step-by-Step Build Roadmap

### Phase 1 — Setup & Planning (Day 1–5)
- Day 1: Repo init, folder structure, Docker Compose skeleton (postgres + redis containers)
- Day 2: Backend skeleton — FastAPI app boots, `/health` endpoint works
- Day 3: Frontend skeleton — Next.js app boots, Tailwind + shadcn configured
- Day 4: DB models + Alembic migration for `users`, `resumes`, `analyses`
- Day 5: `.env.example`, config loading, CI lint setup (optional GitHub Actions)

### Phase 2 — Backend Core (Day 6–12)
- Day 6–7: Auth endpoints (signup/login/refresh/me) + JWT + password hashing
- Day 8–9: Resume upload endpoint + PDF text extraction (`pdf_parser.py`)
- Day 10–11: `ai_engine.py` — prompt design + Claude/OpenAI API call, structured JSON output
- Day 12: Analysis endpoint wired to Celery background task + Redis result storage

### Phase 3 — Frontend Core (Day 13–19)
- Day 13: Landing page (Hero, Features, Pricing sections) with Framer Motion
- Day 14–15: Auth pages (login/signup) + token handling (`useAuth` hook)
- Day 16–17: Dashboard + Upload page (dropzone + JD textarea)
- Day 18: Result page — animated score ring, missing keywords list, suggestions
- Day 19: History page — list past analyses, click to view result again

### Phase 4 — Integration & Polish (Day 20–24)
- Day 20–21: Connect frontend ↔ backend fully, handle loading/error states everywhere
- Day 22: Responsive design pass (mobile breakpoints)
- Day 23: Empty states, toasts, edge-case handling (invalid PDF, huge file, etc.)
- Day 24: Basic pytest coverage for auth + analysis endpoints

### Phase 5 — Deployment (Day 25–28)
- Day 25: Dockerfiles finalized for backend + frontend
- Day 26: Deploy backend + Postgres + Redis on Railway/Render
- Day 27: Deploy frontend on Vercel, connect env vars to live backend URL
- Day 28: Final QA pass, fix bugs, record demo video for portfolio

### Phase 6 — Optional Phase 2 Features (Day 29+)
- Stripe billing integration
- Bulk resume screening for recruiters
- PDF export of report

---

## 10. Environment Variables (`.env.example`)

```env
# Backend Configuration
PROJECT_NAME="AI Resume Matcher"
ENVIRONMENT=development
API_V1_STR=/api/v1

# Database & Cache
DATABASE_URL=postgresql://user:password@localhost:5432/resume_matcher
REDIS_URL=redis://localhost:6379/0

# Authentication & Security
JWT_SECRET_KEY=change_this_secret_key_to_a_secure_random_string_at_least_32_chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# CORS Configuration (Comma-separated or JSON list of allowed origins)
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://resume-ai-matcher.vercel.app,https://ai-resume-matcher-app.vercel.app

# AI Engine
AI_PROVIDER=anthropic   # "anthropic" or "openai"
AI_PROVIDER_API_KEY=your_anthropic_or_openai_key
AI_MODEL=claude-3-5-sonnet-20241022

# Rate Limiting & Uploads
RATE_LIMIT_ANALYSIS_PER_MINUTE=10
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=10

# Frontend Configuration
# NOTE: In Next.js, `NEXT_PUBLIC_*` variables are statically inlined at BUILD TIME.
# For local dev: http://localhost:8000/api/v1
# For Vercel production: Set in Vercel project environment variables (e.g. https://resume-matcher-backend.onrender.com/api/v1)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 11. Security Architecture & Protections

- **Production JWT Secret Enforcement**: Evaluated upon startup via Pydantic model validators; production mode strictly requires a unique secret of at least 32 characters and forbids placeholder secrets.
- **Cryptographic Google OAuth Token Verification**: Backend validates signature, issuer, audience, and verified email claims using `google-auth` before authenticating or linking accounts.
- **Strict Production CORS & Origin Normalization**: Pydantic validator parses comma-separated or JSON origin lists, strips trailing slashes to ensure exact origin matching, and rejects wildcard `*` in production when credentials are enabled.
- **Production API URL Guard**: Frontend `validateApiBaseUrl` prevents production builds from silently falling back to `localhost`, failing fast if the backend URL is omitted during deployment.
- **Sanitized Client Error Handling**: Client-side `formatApiError` cleanly differentiates network/unreachable server issues, 401 unauthenticated, 409 conflict, 422 validation, and 429 rate limit without exposing server stack traces or database errors.
- **PDF Upload Fortification**: Upfront `%PDF-` magic byte inspection, filename sanitization preventing directory traversal, and 20-page limits preventing PDF bomb attacks.
- **AI Prompt Injection Safeguards**: Document inputs enclosed in `<resume_text>` and `<job_description>` XML fences; strict system instructions prevent prompt override; output validated against Pydantic schema `AnalysisAIOutput`.
- **Background Asynchrony & Queue Fault-Tolerance**: Zero synchronous AI processing on the HTTP thread; Celery tasks retry with exponential backoff and jitter (`autoretry_for=(Exception,)`, `max_retries=3`).

---

## 12. Verified Test Status & Quality Metrics

All test suites and static analysis tools have been executed and verified locally:

### Backend Testing (pytest)
- **Status:** **36 passed, 0 failed, 0 skipped** (100% pass rate)
```bash
cd backend
pytest -v
```
Test breakdown:
- Authentication & Sessions: 9 tests (signup, login, token refresh, `GET /me`, validation errors)
- Google OAuth Token Verification: 4 tests (verified flow, invalid tokens, safe linking, subject mismatch)
- CORS & Origin Normalization: 6 tests (preflight OPTIONS, disallowed origins, health check origins, comma-separated parsing, JSON list parsing, production wildcard rejection)
- Resume Upload & Security: 7 tests (valid PDF, non-PDF rejection, list, get, delete, user isolation, magic bytes, path traversal sanitization)
- AI Analysis & Queue: 5 tests (successful run, 404 validation, history pagination, user isolation, prompt injection & schema safety)
- User Profile & Security Settings: 5 tests (profile update, cascade delete, password change verification, invalid current password, production JWT secret enforcement)

### Frontend Verification
- **ESLint:** Passed (`npm run lint` — 0 warnings, 0 errors)
- **TypeScript:** Passed (`npx tsc --noEmit` — 0 errors)
- **Production Build:** Passed (`npm run build` — all 9 static & dynamic pages compiled)

### Playwright End-to-End (E2E) Testing
- **Status:** **26 passed, 0 failed** across Chromium & Mobile Chrome viewports
```bash
cd frontend
npm run test:e2e
```
Coverage includes:
- API base URL configuration validator (production requirement enforcement & trailing slash normalization)
- Landing page hero rendering, navigation, and CTA
- Login and registration form validation
- Signup network flow assertion (verifying POST to `/api/v1/auth/signup`, payload schema, and session redirect)
- Signup network error handling (verifying graceful diagnostic message without navigating away)
- Signup 409 duplicate email handling
- Login error handling (401 invalid credentials and network error states)
- Protected dashboard layout, cards, and navigation
- Resume dropzone, JD input textarea, and submission buttons
- Analysis history table and score badge display
- Mobile viewport responsive layout and horizontal overflow prevention

### Continuous Integration (CI)
- **GitHub Actions Workflow:** `.github/workflows/ci.yml` configured to automatically run on `push` and `pull_request` to `main`, provisioning PostgreSQL and Redis services, executing the full pytest suite, ESLint, TypeScript check, Next.js production build, and Playwright E2E tests.

---

## 13. Docker & Deployment Status

### Docker Stack Verification
- `docker-compose.yml` validated via `docker compose config -q` without warnings or obsolete syntax.
- All services (`postgres`, `redis`, `backend`, `celery_worker`, `frontend`) configured with environment variable interpolation to prevent hardcoded committed secrets.

### Live Deployment Verification
- **Deployment Status:** Deployment configurations (Render `render.yaml`, Dockerfiles, Next.js production build) are verified and prepared for production. Live deployment verification requires deployment-provider credentials (Vercel/Render/Railway) to be configured in production environments.

### Known Limitations & Remaining Risks
- **External AI Provider Availability:** In production, match evaluation requires an active Anthropic or OpenAI API key; if missing, the fallback heuristic engine guarantees continuous operation.
- **Live Deployment Access:** Live cloud hosting depends on external deployment provider tokens.
- **Docker Desktop Local Environment:** On Windows environments without active Docker Desktop WSL2 daemon instances, running `docker compose up` requires starting the Docker engine first.

---

## 14. Definition of Done (MVP) — Final Verification

- [x] User can sign up, log in, log out
- [x] Secure Google OAuth cryptographic ID token verification
- [x] Strict CORS configuration with dynamic origin parsing and trailing slash normalization
- [x] Production API URL enforcement preventing silent localhost fallback
- [x] User can upload a PDF resume (validated with magic bytes and page limits)
- [x] User can paste a job description and get an AI-generated match score + suggestions
- [x] Background Celery queue processing with retry backoff and failure recovery
- [x] User can view analysis history and drill down into reports
- [x] All pages responsive, animated, dark-themed, and validated for mobile
- [x] Production Dockerfiles & Compose configurations prepared with safe secret interpolation
- [x] Backend test suite verified: **36/36 pytest tests passing**
- [x] Frontend test suite verified: **26/26 Playwright E2E tests passing**
- [x] GitHub Actions CI pipeline configured for automated testing
- [x] Clean dead-code audit with pyflakes and ESLint passing with zero warnings

