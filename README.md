# Hacama Investments

Company website + admin dashboard.

| Layer            | Tech                                   | Folder      |
| ---------------- | -------------------------------------- | ----------- |
| Frontend         | Next.js 15 (App Router) + React 19     | `frontend/` |
| Styling          | Tailwind CSS v4                        | `frontend/` |
| Backend API      | NestJS 10                              | `backend/`  |
| Database         | MongoDB + Mongoose                     | `backend/`  |
| Auth             | Passport (local + JWT)                 | `backend/`  |
| File storage     | Google Cloud Storage (URLs in MongoDB) | `backend/`  |

## Structure

```
hacama/
├── backend/                     NestJS API  (http://localhost:4000/api)
│   └── src/
│       ├── auth/                login, JWT strategy, guards, roles
│       ├── users/               admin users (seeded super admin)
│       ├── jobs/                job posts CRUD
│       ├── applications/        job applications + CV upload
│       ├── photos/              gallery photos (GCS upload)
│       └── storage/             Google Cloud Storage service
├── frontend/                    Next.js app (http://localhost:3000)
│   └── src/
│       ├── app/
│       │   ├── (site)/          public pages: /, /jobs, /jobs/[slug], /gallery
│       │   └── admin/
│       │       ├── login/       /admin/login
│       │       └── (dashboard)/ /admin, /admin/jobs, /admin/applications,
│       │                        /admin/photos, /admin/users
│       ├── components/          site/, jobs/, gallery/, admin/
│       ├── lib/                 api client, auth token helpers, types
│       └── middleware.ts        redirects /admin/* to login when signed out
└── legacy/                      original static HTML site (reference only)
```

## Getting started

Requirements: Node.js 20+, a MongoDB instance, and (for uploads) a GCS bucket + service account key.

```powershell
# 1. Backend
cd backend
copy .env.example .env      # then edit MONGODB_URI, JWT_SECRET, GCS_* values
npm install
npm run start:dev           # http://localhost:4000/api

# 2. Frontend (new terminal)
cd frontend
copy .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

Sign in at `http://localhost:3000/admin/login` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `backend/.env`
(the super admin is created automatically on first start when no users exist).

## API overview

| Method | Path                        | Auth        | Purpose                        |
| ------ | --------------------------- | ----------- | ------------------------------ |
| POST   | `/api/auth/login`           | —           | Get JWT                        |
| GET    | `/api/auth/me`              | JWT         | Current admin                  |
| GET    | `/api/jobs`                 | —           | Open jobs (search, type)       |
| GET    | `/api/jobs/slug/:slug`      | —           | Job details                    |
| GET    | `/api/jobs/admin`           | JWT         | All jobs incl. drafts          |
| POST/PATCH/DELETE | `/api/jobs[/:id]` | JWT         | Manage jobs                    |
| POST   | `/api/applications`         | —           | Apply (multipart, optional CV) |
| GET/PATCH/DELETE | `/api/applications[/:id]` | JWT  | Review applications            |
| GET    | `/api/photos`               | —           | Gallery photos                 |
| POST   | `/api/photos`               | JWT         | Upload photo (multipart)       |
| PATCH/DELETE | `/api/photos/:id`     | JWT         | Manage photos                  |
| CRUD   | `/api/users`                | Super admin | Manage admin users             |

## Troubleshooting

If `npm install` fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` (antivirus/proxy HTTPS inspection), run:

```powershell
$env:NODE_OPTIONS="--use-system-ca"; npm install
```
