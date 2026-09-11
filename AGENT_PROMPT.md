# AI Agent Build Prompt — AI Resume Matcher SaaS

Copy the block below and paste it into your AI coding agent (Claude Code, Cursor, Devin, etc.) **in the root of the project folder**, after making sure `README.md` is present in the same folder.

---

```
You are acting as a senior full-stack engineer. There is a file called README.md
in this repository root — read it fully before writing any code. It contains the
complete product spec: features, tech stack, folder structure, database schema,
API endpoints, UI/UX guidelines, and a day-by-day build roadmap.

Your task: build this project end-to-end, following the README exactly, in the
order given by the "Step-by-Step Build Roadmap" section. Do not skip phases or
jump ahead to later features before earlier ones are working.

Rules to follow:

1. FOLLOW THE FOLDER STRUCTURE exactly as specified in section 4 of the README.
   Do not invent your own structure or rename top-level folders.

2. FOLLOW THE DATABASE SCHEMA exactly as specified in section 5. Create
   SQLAlchemy models + Alembic migrations that match these tables and columns.

3. IMPLEMENT EVERY API ENDPOINT listed in section 6, with the exact HTTP method
   and path given. Use the JSON response envelope described in section 8:
   { "success": bool, "data": {...}, "error": null }

4. BACKEND: Use FastAPI + SQLAlchemy 2.0 + Alembic + PostgreSQL + Redis + Celery
   exactly as specified in section 3. AI analysis calls must run as a background
   Celery task, never blocking the HTTP request thread.

5. FRONTEND: Use Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
   + Framer Motion. Follow the UI/UX guidelines in section 7 precisely — this is
   a premium product, not a generic CRUD app. Every page needs proper loading
   states, error states, and empty states. Do not ship plain unstyled HTML.

6. SECURITY: Hash passwords with bcrypt, use JWT for auth exactly as described,
   never log or store plaintext secrets. Rate-limit the /analysis/run endpoint.

7. Work phase by phase (see roadmap in section 9). After finishing each phase,
   summarize what was built and what file changed before moving to the next
   phase. If a decision in the README is ambiguous, make the most sensible
   production-grade choice and state your assumption — do not stop and ask
   unless something is truly blocking (e.g. missing API key).

8. Write basic tests (pytest) for the auth and analysis endpoints before
   declaring the MVP "done" — see the Definition of Done checklist in section 11.

9. At the end, make sure the entire stack runs with a single `docker-compose up`
   command, exactly as required in the Non-Functional Requirements section.

10. Do not add scope-creep features from "Phase 2 Features" (Stripe billing,
    bulk screening, PDF export) until every MVP item in the Definition of Done
    checklist is checked off.

Start now: read README.md, then begin with Phase 1, Day 1 of the roadmap.
```

---

### Tips for using this prompt

- Agar tumhara agent (jaise Claude Code) file system access kar sakta hai, to bas ye prompt de do — wo README.md khud padh lega aur build shuru kar dega.
- Agar agent ke paas file access nahi hai (jaise plain chatbot), to README.md ka content bhi isi message ke saath paste kar do.
- Har phase complete hone ke baad agent se bolo: **"Phase X complete confirm karo aur README ke Definition of Done ke against check karo, phir Phase X+1 shuru karo."** — isse agent bina permission ke aage nahi bhagega aur galat direction me nahi jayega.
