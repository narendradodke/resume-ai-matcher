# TASKS.md — Atomic Build Plan with Commit Checkpoints

> Ye file batati hai ki project ko kis chhote-chhote part me tod ke banaya jaye, aur **har part complete hone ke baad EXACTLY konsa commit karna hai**. Agent ko instruction: ek task complete karo → wahi task ka commit karo → tabhi next task pe jao. Ek commit me multiple unrelated tasks mix nahi karne.

**Commit message format:** `type(scope): short description`
Types: `feat` (naya feature), `fix` (bug fix), `chore` (setup/config), `docs` (documentation), `test` (tests), `style` (UI only)

---

## Part 0 — Project Setup

| # | Task | Commit Message |
|---|---|---|
| 0.1 | Repo init, `.gitignore`, folder skeleton (empty backend/frontend dirs) | `chore: initialize project structure` |
| 0.2 | Docker Compose file with postgres + redis services | `chore: add docker-compose for postgres and redis` |
| 0.3 | `.env.example` with all required variables | `chore: add environment variable template` |
| 0.4 | README.md + TASKS.md added to repo | `docs: add project spec and task plan` |

---

## Part 1 — Backend Foundation

| # | Task | Commit Message |
|---|---|---|
| 1.1 | FastAPI app boots with `/health` endpoint | `feat(backend): bootstrap FastAPI app with health check` |
| 1.2 | `config.py` — env settings loader (pydantic) | `chore(backend): add settings and config loader` |
| 1.3 | `database.py` — SQLAlchemy engine + session setup | `feat(backend): configure database connection` |
| 1.4 | Alembic initialized + first empty migration runs | `chore(backend): setup alembic migrations` |
| 1.5 | `User` model + migration | `feat(backend): add user model and migration` |
| 1.6 | `Resume` model + migration | `feat(backend): add resume model and migration` |
| 1.7 | `Analysis` model + migration | `feat(backend): add analysis model and migration` |

---

## Part 2 — Authentication

| # | Task | Commit Message |
|---|---|---|
| 2.1 | Password hashing + JWT utils (`security.py`) | `feat(auth): add password hashing and JWT utilities` |
| 2.2 | Signup endpoint + schema + tests | `feat(auth): implement signup endpoint` |
| 2.3 | Login endpoint (returns access + refresh token) | `feat(auth): implement login endpoint` |
| 2.4 | Refresh token endpoint | `feat(auth): implement token refresh endpoint` |
| 2.5 | `GET /me` endpoint + auth dependency (`deps.py`) | `feat(auth): add current-user endpoint and auth guard` |
| 2.6 | Auth tests (pytest) | `test(auth): add signup and login tests` |

---

## Part 3 — Resume Upload

| # | Task | Commit Message |
|---|---|---|
| 3.1 | PDF parser util (`pdf_parser.py`) | `feat(resume): add pdf text extraction utility` |
| 3.2 | `POST /resume/upload` endpoint | `feat(resume): implement resume upload endpoint` |
| 3.3 | `GET /resume/list` + `GET /resume/{id}` | `feat(resume): add list and get resume endpoints` |
| 3.4 | `DELETE /resume/{id}` | `feat(resume): add delete resume endpoint` |
| 3.5 | Resume endpoint tests | `test(resume): add resume upload and fetch tests` |

---

## Part 4 — AI Analysis Engine

| # | Task | Commit Message |
|---|---|---|
| 4.1 | Redis + Celery worker setup | `chore(backend): configure celery with redis broker` |
| 4.2 | `ai_engine.py` — prompt design + LLM API call | `feat(ai): add resume-to-job-description analysis engine` |
| 4.3 | `POST /analysis/run` endpoint (triggers Celery task) | `feat(analysis): implement run-analysis endpoint` |
| 4.4 | `GET /analysis/{id}` + `GET /analysis/history` | `feat(analysis): add analysis fetch and history endpoints` |
| 4.5 | Rate limiting on `/analysis/run` | `feat(analysis): add rate limiting to analysis endpoint` |
| 4.6 | Analysis endpoint tests | `test(analysis): add analysis endpoint tests` |

---

## Part 5 — User Profile

| # | Task | Commit Message |
|---|---|---|
| 5.1 | `GET /user/profile` + `PUT /user/profile` | `feat(user): implement profile view and update endpoints` |
| 5.2 | `DELETE /user/account` (cascade delete) | `feat(user): implement account deletion with cascade` |

---

## Part 6 — Frontend Foundation

| # | Task | Commit Message |
|---|---|---|
| 6.1 | Next.js app boots, Tailwind + shadcn configured | `chore(frontend): bootstrap next.js with tailwind and shadcn` |
| 6.2 | Global layout + fonts + dark theme base | `style(frontend): setup base layout and dark theme` |
| 6.3 | `lib/api.ts` — API client wrapper | `feat(frontend): add api client wrapper` |
| 6.4 | `lib/auth.ts` + `useAuth` hook | `feat(frontend): add auth token handling and hook` |

---

## Part 7 — Landing Page

| # | Task | Commit Message |
|---|---|---|
| 7.1 | Navbar component | `feat(landing): add navbar component` |
| 7.2 | Hero section with animation | `feat(landing): add animated hero section` |
| 7.3 | Features section | `feat(landing): add features section` |
| 7.4 | Pricing section | `feat(landing): add pricing section` |

---

## Part 8 — Auth Pages

| # | Task | Commit Message |
|---|---|---|
| 8.1 | Login page + form validation | `feat(auth-ui): add login page` |
| 8.2 | Signup page + form validation | `feat(auth-ui): add signup page` |

---

## Part 9 — Dashboard

| # | Task | Commit Message |
|---|---|---|
| 9.1 | Dashboard shell/layout | `feat(dashboard): add dashboard layout` |
| 9.2 | Resume upload page (dropzone + JD textarea) | `feat(dashboard): add resume upload page` |
| 9.3 | Result page — animated score ring | `feat(dashboard): add analysis result page with score ring` |
| 9.4 | History page — list past analyses | `feat(dashboard): add analysis history page` |

---

## Part 10 — Integration & Polish

| # | Task | Commit Message |
|---|---|---|
| 10.1 | Connect all frontend pages to real backend APIs | `feat: wire frontend to backend endpoints` |
| 10.2 | Loading states (skeletons/spinners) everywhere | `style: add loading states across app` |
| 10.3 | Error toasts + empty states | `feat: add error handling and empty states` |
| 10.4 | Responsive/mobile pass | `style: make dashboard and landing page responsive` |

---

## Part 11 — Deployment

| # | Task | Commit Message |
|---|---|---|
| 11.1 | Backend Dockerfile finalized | `chore(backend): finalize production dockerfile` |
| 11.2 | Frontend Dockerfile finalized | `chore(frontend): finalize production dockerfile` |
| 11.3 | Deploy backend live (Railway/Render) | `chore: deploy backend to production` |
| 11.4 | Deploy frontend live (Vercel) | `chore: deploy frontend to production` |
| 11.5 | Final README update with live demo link | `docs: add live demo link to readme` |

---

## Rules for the Agent

1. Complete **one task row at a time**, in table order (Part 0 → Part 11).
2. After finishing a task, run `git add .` then `git commit -m "<exact commit message from table>"`.
3. Never combine two rows into one commit, and never commit half-finished code.
4. If a task naturally needs splitting into smaller commits, keep the same `type(scope):` prefix style and keep each commit meaningfully small.
5. Before moving to the next Part (e.g. Part 1 → Part 2), confirm all rows in the current Part are committed.
6. Push after every commit: `git push origin main` (or the working branch).
