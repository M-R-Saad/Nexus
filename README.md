# Nexus — Developer Collaboration Platform

> GitHub meets Trello — built for developers who want to find a team and ship together.

## Tech Stack

**Backend:** Django, Django REST Framework, Django Channels, Celery, PostgreSQL, Redis  
**Frontend:** React, Vite, Tailwind CSS, TanStack Query, @hello-pangea/dnd  
**Infra:** Docker, Docker Compose, Cloudinary

## Getting Started

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd nexus
cp .env .env.local  # edit with your values
```

Fill in `.env` with:
- `SECRET_KEY` — any long random string
- `CLOUDINARY_*` — from cloudinary.com (free account)
- `EMAIL_*` — Gmail address + App Password

### 2. Start everything

```bash
docker compose up --build
```

This starts: Django (8000), React (5173), PostgreSQL, Redis, Celery, Celery Beat

### 3. Run migrations and create superuser

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

### 4. Seed skills (optional)

```bash
docker compose exec backend python manage.py shell -c "
from apps.users.models import Skill
skills = [
  ('React', 'Frontend'), ('Vue', 'Frontend'), ('TypeScript', 'Frontend'),
  ('Django', 'Backend'), ('FastAPI', 'Backend'), ('Node.js', 'Backend'),
  ('PostgreSQL', 'Backend'), ('Docker', 'DevOps'), ('AWS', 'DevOps'),
  ('Figma', 'Design'), ('Python', 'Backend'), ('Go', 'Backend'),
]
for name, cat in skills:
    Skill.objects.get_or_create(name=name, defaults={'category': cat})
print('Skills seeded.')
"
```

### 5. Open in browser

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Django API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

## Project Structure

```
nexus/
├── backend/          # Django project
│   ├── apps/         # users, projects, applications, workspace, chat, notifications
│   ├── config/       # settings, urls, asgi, wsgi
│   └── core/         # celery, tasks, pagination, cloudinary utils
└── frontend/         # React + Vite
    └── src/
        ├── api/       # axios + per-resource API functions
        ├── context/   # AuthContext, NotificationContext
        ├── hooks/     # useAuth, useWebSocket, useNotifications
        ├── pages/     # all page components
        └── components/ # reusable UI components
```

## Development Phases

Follow `nexus_workflow.md` for the full phase-by-phase build plan.

| Phase | Focus |
|---|---|
| 1 | Docker + project setup ✅ (this boilerplate) |
| 2 | Auth + profiles |
| 3 | Project listings + discovery |
| 4 | Application system |
| 5 | Bookmarks + dashboard |
| 6 | Workspace — Kanban + tasks |
| 7 | Real-time chat |
| 8 | Notifications |
| 9 | Celery background jobs |
| 10 | Polish + deploy |
