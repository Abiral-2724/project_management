# ⚡ Planzo — AI-Powered Project Management Platform

> A full-stack, real-time project management application built with Next.js 14, Node.js/Express, PostgreSQL, Socket.IO, and Google Gemini AI. Planzo brings together task management, team collaboration, AI assistance, and a complete public-facing website under one cohesive codebase.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
  - [Authentication & Onboarding](#authentication--onboarding)
  - [Project Management](#project-management)
  - [Task & Subtask System](#task--subtask-system)
  - [Views](#views)
  - [Team Collaboration](#team-collaboration)
  - [AI Features (Gemini)](#ai-features-gemini)
  - [Notifications & Activity](#notifications--activity)
  - [File Management](#file-management)
  - [Search](#search)
  - [Smart Digest Email](#smart-digest-email)
  - [Overdue & Due-Soon Alerts](#overdue--due-soon-alerts)
  - [Public Website Pages](#public-website-pages)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [AI Model](#ai-model)

---

## Overview

Planzo is a project management platform inspired by tools like Asana, Linear, and Notion — but with a deeply integrated AI layer powered by Google Gemini. Every part of the platform is designed for real teams: real-time task updates via WebSockets, role-based access control, a full notification system, file uploads, team chat with @mentions, and eight distinct AI-powered features that help teams stay on top of their work without the usual busywork.

The codebase is split into two applications that share a database:

- **Backend** — Node.js / Express / Prisma / PostgreSQL / Socket.IO
- **Frontend** — Next.js 14 (App Router) / Tailwind CSS / Socket.IO Client / React Context

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Prisma ORM | Type-safe database access |
| PostgreSQL | Primary relational database |
| Socket.IO | Real-time WebSocket communication |
| Nodemailer + Gmail SMTP | Transactional email (invites, alerts, digests) |
| Cloudinary | Profile photo and file storage |
| Multer | File upload middleware |
| bcrypt | Password hashing (cost factor 12) |
| JSON Web Tokens | Session authentication |
| node-cron | Scheduled daily task alert job |
| Zod | Request body validation |

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework with SSR/RSC support |
| Tailwind CSS | Utility-first styling |
| Socket.IO Client | Real-time connection to backend |
| React Context API | Global state (Auth, Projects, Socket) |
| Google Gemini API | All AI features (client-side via `NEXT_PUBLIC_*` key) |
| DM Sans (Google Fonts) | Primary typeface |

---

## Features

### Authentication & Onboarding

- **Register** with email and password → OTP verification email sent immediately
- **OTP verification** page — 6-digit code with resend capability
- **Account setup** — choose display name, profile photo (uploaded to Cloudinary), and professional role (Team Member, Manager, Director, Executive, Business Owner, Freelancer, Student, Other)
- **Login** with JWT session — stored in HttpOnly cookie, verified on every protected route via `auth.middleware.js`
- **Logout** clears session; full redirect to login
- All auth routes (`/register`, `/login`, `/verify`, `/setup`) are public; all other API routes require a valid JWT

---

### Project Management

- **Create projects** with name and description
- **Invite members** by email with a role assignment (OWNER / ADMIN / EDITOR / COMMENTER / VIEWER) — a styled invitation email is sent automatically
- **Role management** — update a member's role at any time from the Members view
- **Project context** — `ProjectContext` keeps owned and member projects in global state so the sidebar never flashes on navigation
- **Project detail endpoint** returns the project, all enriched members (with name + avatar), views config, and the current user's role in one request
- **Timeline endpoint** returns a chronological audit of project creation and member joins

---

### Task & Subtask System

Every task has: title, description, status (`Todo` / `In Progress` / `In Review` / `Done`), priority (`Low` / `Medium` / `High`), assignee (by email), start date, due date, and a `mark_complete` flag.

**Tasks**
- Create, edit, complete/reopen tasks
- Batch create multiple tasks in one request
- All changes emit activity log entries automatically

**Subtasks**
- Full CRUD: create, edit, complete/reopen, delete
- Subtasks are displayed with a progress bar in `TaskDetailModal`
- Inline add-subtask form within the detail panel
- Keyboard-driven creation in `TaskModal`: `Enter` adds next row, `Backspace` on an empty row deletes it
- AI-suggested subtasks from the Task Description Generator can be edited before saving
- Activity logs created for `SUBTASK_CREATED`, `SUBTASK_COMPLETED`, `SUBTASK_REOPENED`, `SUBTASK_UPDATED`

**TaskModal** (create / edit)
- Pre-fills all fields in edit mode
- Loads existing subtasks; separates new subtasks (batch create) from edits (batch update) on save
- AI Fill button generates description + subtask list from the task title

**TaskDetailModal** (read / interact)
- Click any task card on the board or list to open
- Inline subtask checkbox (marks complete instantly)
- Inline subtask editor (title + priority)
- Complete / Reopen the parent task
- Edit button → opens `TaskModal`

---

### Views

The project page has **8 tabs**, each a self-contained view component:

| Tab | Description |
|---|---|
| **Board** | Kanban drag-and-drop across four columns (Todo / In Progress / In Review / Done). Cards show assignee avatar, priority badge, due date with overdue/due-soon colour coding, subtask progress, and a direct edit button |
| **List** | Table layout with sortable columns. Row click → `TaskDetailModal`. Overdue rows get a faint red tint |
| **Timeline (Gantt)** | Visual Gantt chart built from task `startDate` + `dueDate`. Two zoom levels (Week / Month). Colour-coded bars by status. Today line. Hover tooltip. Click bar → `TaskDetailModal` |
| **Dashboard** | Project stats (total, completed, overdue, in-progress tasks), completion percentage ring, member list with roles, and an AI Productivity Insight button |
| **Members** | Full member roster with roles, invite-by-email form, role update, and remove member |
| **Chat** | Real-time team messaging with typing indicators, optimistic rendering, @mention autocomplete, message history pagination, edit and delete |
| **Files** | Upload files (via Multer → Cloudinary), browse by task, download links |
| **Activity** | Chronological activity feed for all project actions, with an AI Standup Report generator |
| **Meeting Notes** | Paste raw meeting notes → AI extracts a task list with priorities and assignee hints → editable cards → batch create tasks |

---

### Team Collaboration

**Real-time (Socket.IO)**
- All users in a project share a Socket.IO room (`project:{id}`)
- Task create / update / delete broadcasts keep everyone's board in sync without page refresh
- Typing indicators in chat ("Alice is typing…")
- Online presence — who is currently in the project room
- Personal notification room (`user:{id}`) for instant in-app notification delivery

**@Mentions in Chat**
- Type `@` to open an autocomplete dropdown filtered from project members
- Navigate with ↑↓, select with `Enter` or `Tab`, dismiss with `Escape`
- On send, the backend (`socket.js`) scans the message for `@handle` patterns, fuzzy-matches against member email prefixes, creates a `MENTION` notification, and pushes it to the mentioned user's personal room in real time
- Mention tokens render highlighted in message bubbles (indigo tint for own messages, violet for others)

---

### AI Features (Gemini)

All AI features call Google Gemini through a single `callGemini()` function in `src/lib/gemini.js`. The active model is `gemini-2.5-flash-lite` (highest free-tier quota available in India as of March 2026).

| # | Feature | Where | What it does |
|---|---|---|---|
| 1 | **Task Description Generator** | TaskModal → ✦ AI Fill | Takes the task title, returns a structured description + a list of suggested subtask titles. Subtasks are pre-loaded into the editable rows. |
| 2 | **Chat Summarizer** | Chat → ✦ Summarize | Condenses the visible message history into Key Points, Decisions, Action Items, and Blockers sections. |
| 3 | **Task Extractor from Text** | Chat → ✦ Tasks from text | Paste any free-form text (notes, emails, Slack dumps) → AI extracts discrete tasks with priorities → one-click batch create. |
| 4 | **Productivity Insights** | Dashboard → ✦ AI Insight | Analyses project stats (total, completed, overdue, velocity) and returns a coaching paragraph with specific recommendations. |
| 5 | **Standup Report** | Activity → ✦ Generate Standup | Formats the project's recent activity log into a classic daily standup (What was done / What's next / Any blockers). |
| 6 | **Meeting Notes → Tasks** | Meeting Notes tab | Paste raw meeting transcript → AI extracts tasks with priorities and assignee hints → editable cards → bulk create into the project. |
| 7 | **Smart Digest** | Floating pill (bottom-right) | Cross-project personalised daily briefing with four sections: 🌅 Good morning, 📌 Needs Attention, ✅ Recent Progress, 🎯 Suggested Focus. Fetches live data from all user projects + activity logs. |
| 8 | **AI Project Assistant** | Sidebar → ✦ AI Assistant | Conversational chatbot. User selects a project → full context (all tasks, members, activity) is loaded → multi-turn Q&A. Built-in quick prompts: "What tasks are overdue?", "Give me a progress summary", "Who is working on what?", "What should I focus on today?" |

---

### Notifications & Activity

**In-app notifications** (bell icon in Topbar)
- Delivered in real time via Socket.IO `user:{id}` room
- Types: `COMMENT`, `TASK_ASSIGNED`, `TASK_COMPLETED`, `TASK_DUE`, `MEMBER_JOINED`, `MEMBER_REMOVED`, `ROLE_CHANGED`, `PROJECT_UPDATE`, `MENTION`, `FILE_UPLOADED`
- Mark single / mark all as read, delete single / clear all
- Unread count badge on bell icon

**Activity logs**
- Every significant action writes an `ActivityLog` row with: `userId`, `projectId`, optional `taskId`, `action` string (e.g. `TASK_CREATED`, `STATUS_CHANGED`, `SUBTASK_COMPLETED`), and a JSON `meta` field for before/after values
- Displayed in the Activity tab; also consumed by the Standup AI and Smart Digest

---

### File Management

- Upload files through the Files tab (Multer processes the multipart form; file is stored in Cloudinary)
- Files are linked to a specific task and project
- Metadata stored: `fileName`, `fileSize`, `fileType`, `uploadedAt`, `uploader`
- Download via direct Cloudinary URL
- File upload creates a `FILE_UPLOADED` notification

---

### Search

- **Global search** (`⌘K` / `Ctrl+K`) — `SearchOverlay` component, full-text search across all of the user's projects and tasks
- **Project task search** — scoped to a single project

---

### Smart Digest Email

From the Smart Digest modal, a **Send to all members** button emails the current digest to every project member.

- Backend: `sendDigestToMembers` controller in `project.controller.js`
- Route: `POST /api/v1/project/:userId/:projectId/send-digest`
- Converts the plain-text digest (with emoji section headers and bullet points) into a fully styled dark-theme HTML email matching the Planzo design language
- Sends individually to each member via the existing Nodemailer transporter
- Uses `Promise`-based per-recipient error handling — one bad email address does not abort the batch
- Returns `{ sentCount, failedEmails[] }` so the frontend toast shows the exact result
- Button transitions: idle → spinning "Sending…" → green "✓ Sent!" (locks after send)

---

### Overdue & Due-Soon Alerts

A `node-cron` job runs **every day at 08:00 server time** (`scheduler.js`).

**Logic:**
1. Queries all incomplete `Project_Tasks` and `Project_SubTasks`
2. Splits into: **overdue** (dueDate before today) and **due-soon** (dueDate is today or tomorrow)
3. Groups by assignee email
4. For each assignee:
   - Creates one in-app `TASK_DUE` notification per task (pushed live via Socket.IO)
   - Sends one consolidated overdue email and one due-soon email (styled dark-theme HTML)

**Frontend visual indicators** (no API call — purely computed from existing task data):
- Kanban cards: red border for overdue, amber border for due-soon
- Due date text: `⚠ Mar 3` in red for overdue, `🕐 Mar 7` in amber for due-soon
- List rows: faint red background tint for overdue tasks

In `development` mode the scheduler fires immediately on server start for easy testing.

---

### Public Website Pages

A complete marketing website built with a shared `MarketingLayout.jsx` (sticky glassmorphism nav + footer) and consistent dark zinc + indigo design system:

| Route | File | Content |
|---|---|---|
| `/about` | `page_about.jsx` | Stats bar, mission statement, 4-value grid, animated journey timeline (2022–2025), team member grid, "join us" CTA |
| `/blog` | `page_blog.jsx` | Featured post hero, tag filter pills (All / Product / Engineering / AI / Design / Company / Guides), 3-column post grid |
| `/contact` | `page_contact.jsx` | 3 contact channels (email / live chat / help center), office address, fully functional contact form with topic dropdown and success state |
| `/privacy` | `page_privacy.jsx` | Full Privacy Policy — 10 sections with linked table of contents |
| `/terms` | `page_legal.jsx` (`TermsPage`) | Terms of Service — 9 sections |
| `/cookies` | `page_legal.jsx` (`CookiesPage`) | Cookie types with styled cards (Essential / Preference / Analytics) and example cookie names |
| `/security` | `page_legal.jsx` (`SecurityPage`) | 6 security feature cards, vulnerability disclosure process, technical spec table (bcrypt, JWT, TLS, Prisma parameterised queries) |

---

## Project Structure

```
Planzo/
├── backend/
│   ├── index.js                        # Express app entry, Socket.IO init, scheduler start
│   ├── scheduler.js                    # node-cron daily due-date alert job
│   ├── socket/
│   │   └── socket.js                   # Socket.IO server — chat, mentions, notifications, presence
│   ├── middlewares/
│   │   └── auth.middleware.js          # JWT verification on all protected routes
│   ├── controllers/
│   │   ├── user.auth.controller.js     # register, login, logout, OTP verify, account setup
│   │   ├── user.controller.js          # get/update user profile
│   │   ├── project.controller.js       # CRUD projects, invite, roles, send-digest
│   │   ├── project.tasks.controller.js # tasks, subtasks, dashboard, activity logging
│   │   ├── notifications.controller.js # get, read, delete notifications
│   │   ├── activity.controller.js      # activity log queries
│   │   ├── chat.controller.js          # chat history, edit, delete messages
│   │   ├── comments.controller.js      # task comments and replies
│   │   ├── files.controller.js         # file upload (Multer → Cloudinary)
│   │   └── search.controller.js        # global and project-scoped search
│   ├── routes/
│   │   ├── user.auth.routes.js
│   │   ├── user.routes.js
│   │   ├── project.routes.js
│   │   ├── project.tasks.route.js
│   │   ├── project.files.routes.js
│   │   ├── notifications.routes.js
│   │   ├── activity.routes.js
│   │   ├── chat.routes.js
│   │   ├── comments.routes.js
│   │   └── search.routes.js
│   └── prisma/
│       └── schema.prisma               # Full DB schema (11 models)
│
└── frontend/  (Next.js 14 App Router)
    ├── src/
    │   ├── app/
    │   │   ├── layout.jsx              # Root layout with AuthProvider + ProjectProvider
    │   │   ├── (auth)/
    │   │   │   ├── login/page.jsx
    │   │   │   ├── register/page.jsx
    │   │   │   ├── verify/[id]/page.jsx
    │   │   │   └── setup/[id]/page.jsx
    │   │   ├── dashboard/page.jsx      # Stats overview + AI Insight + new project modal
    │   │   ├── my-tasks/page.jsx       # Cross-project task list for current user
    │   │   ├── settings/page.jsx       # Profile edit, password change
    │   │   ├── project/[projectId]/
    │   │   │   └── page.jsx            # Full project workspace (8 views)
    │   │   └── (marketing)/
    │   │       ├── about/page.jsx
    │   │       ├── blog/page.jsx
    │   │       ├── contact/page.jsx
    │   │       ├── privacy/page.jsx
    │   │       ├── terms/page.jsx
    │   │       ├── cookies/page.jsx
    │   │       └── security/page.jsx
    │   ├── components/
    │   │   ├── ui.jsx                  # Avatar, Badge, Spinner, Icon, Empty, Toast, etc.
    │   │   ├── Sidebar.jsx             # Collapsible sidebar + AI Assistant chatbot panel
    │   │   ├── Topbar.jsx              # Search trigger, notifications dropdown
    │   │   ├── AppLayout.jsx           # Shell: Sidebar + Topbar + main content
    │   │   ├── SearchOverlay.jsx       # ⌘K global search
    │   │   ├── NewProjectModal.jsx     # Create project modal
    │   │   ├── TaskModal.jsx           # Create / edit task + AI fill + subtask management
    │   │   ├── TaskDetailModal.jsx     # Task detail panel — subtasks, complete, edit
    │   │   └── MarketingLayout.jsx     # Shared nav + footer for public pages
    │   ├── context/
    │   │   ├── AuthContext.jsx         # user state, login, logout
    │   │   ├── ProjectContext.jsx      # ownedProjects, memberProjects, allProjects
    │   │   └── SocketContext.jsx       # Socket.IO client wrapper + helpers
    │   └── lib/
    │       ├── api.js                  # Typed API client (all fetch calls)
    │       └── gemini.js               # All 8 Gemini AI functions
```

---

## Database Schema

11 Prisma models on PostgreSQL:

| Model | Purpose | Key fields |
|---|---|---|
| `User` | Accounts | id, email, password (hashed), fullname, profile (Cloudinary URL), isVerified, OTP, myRole |
| `Projects` | Project records | id, projectName, description, ownerId |
| `Project_Members` | Project membership | projectId, emailuser, role (OWNER/ADMIN/EDITOR/COMMENTER/VIEWER), joinedAt |
| `Project_Tasks` | Tasks | id, title, description, status, priority, assignee_email, startDate, dueDate, mark_complete |
| `Project_SubTasks` | Subtasks | id, title, status, priority, project_Tasks_id (FK), assignee_email, startDate, dueDate, mark_complete |
| `ProjectViews` | View toggle config per project | Boolean flags: Board, List, Gantt, Dashboard, Calendar, Files, Messages, etc. |
| `ProjectFiles` | Uploaded files | file (URL), fileName, fileSize, fileType, project_id, task_id, uploader_id |
| `TaskComment` | Task comments + threaded replies | content, task_id, author_id, parent_comment_id (self-referential) |
| `Notification` | In-app notifications | user_id, type (enum), message, project_id, task_id, isRead |
| `ActivityLog` | Audit trail | user_id, project_id, task_id, action (string), meta (JSON string) |
| `ChatMessage` | Project chat | project_id, sender_id, content, reply_to_id (self-referential), isEdited |

**Enums:** `Role` (5 levels), `Priority` (Low/Medium/High), `userRole` (9 options), `NotificationType` (10 types)

---

## API Reference

All routes are prefixed with `/api/v1`. All routes except `/auth/user/*` require a valid JWT in the `Authorization` header or cookie.

### Auth — `/auth/user`
```
POST   /register                    → register new user (sends OTP email)
POST   /login                       → returns JWT
POST   /logout                      → clears session
POST   /verify/:id                  → verify OTP
POST   /resend-otp/:id              → resend OTP
POST   /setup/:id                   → complete profile setup (multipart: file + fields)
```

### Projects — `/`
```
POST   /project/:userId                              → create project
GET    /projects/:userId                             → all projects for user
GET    /project/:projectId                           → project by ID
GET    /project/:projectId/members                   → project members
GET    /project/:userId/:projectId/detail            → full detail (members + views + role)
GET    /project/:userId/:projectId/timeline          → chronological project events
POST   /project/:userId/:projectId/invite            → invite member by email
PATCH  /project/:projectId/role                      → update member role
POST   /project/:userId/:projectId/send-digest       → email Smart Digest to all members
```

### Tasks — `/task`
```
POST   /:userId/:projectId                           → batch create tasks
POST   /subtask/:userId/:projectId                   → batch create subtasks
GET    /my-created/:userId                           → tasks created by user
GET    /assigned/:userId                             → tasks assigned to user
GET    /:userId/:projectId/all                       → all tasks with subtasks for project
PATCH  /complete/:userId/:projectId                  → toggle task complete
PATCH  /subtask/complete/:userId/:projectId          → toggle subtask complete
PUT    /edit/:userId/:projectId                      → batch edit tasks
PUT    /subtask/edit/:userId/:projectId              → batch edit subtasks
GET    /:userId/:projectId/dashboard                 → dashboard analytics
```

### Notifications — `/notifications`
```
GET    /:userId                                      → paginated notifications + unread count
PATCH  /:notificationId/user/:userId/read            → mark one read
PATCH  /:userId/read-all                             → mark all read
DELETE /:notificationId/user/:userId                 → delete one
DELETE /:userId/clear-all                            → clear all
```

### Activity — `/activity`
```
GET    /project/:projectId                           → project activity logs
GET    /task/:taskId                                 → task activity logs
GET    /user/:userId                                 → user activity logs (for Smart Digest)
```

### Chat — `/chat`
```
GET    /:projectId/history                           → paginated message history
DELETE /:messageId/user/:userId                      → delete a message
PATCH  /:messageId/user/:userId                      → edit a message
```

### Files — `/files`
```
POST   /upload/:userId/:projectId/:taskId            → upload file (multipart/form-data)
GET    /project/:projectId                           → all files for project
DELETE /:fileId/user/:userId                         → delete file
```

### Search — `/search`
```
GET    /global/:userId                               → search across all user projects
GET    /project/:projectId/tasks                     → search within a project
```

---

## Environment Variables

### Backend (`.env`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/Planzo
SECERET_KEY=your_jwt_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:3000
PORT=4000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

> **Get a free Gemini API key** at [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
>
> **Gmail App Password** — use a Google App Password (not your account password). Enable 2FA on your Google account, then go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- A Google Gemini API key (free tier)
- A Gmail account with App Password enabled
- A Cloudinary account (free tier)

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Set up the database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Configure environment variables

Copy the variables from the [Environment Variables](#environment-variables) section into `backend/.env` and `frontend/.env.local`.

### 4. Start the servers

```bash
# Backend (runs on port 4000)
cd backend
npm run dev

# Frontend (runs on port 3000)
cd frontend
npm run dev
```

### 5. Open the app

Navigate to [http://localhost:3000](http://localhost:3000) and register a new account.

---

## AI Model

All AI features use **`gemini-2.5-flash-lite`** via the REST `generateContent` endpoint on `v1beta`.

This model was chosen because:
- It is the **highest free-tier quota** model available as of March 2026 (15 RPM, 1,000 RPD)
- It works in **India and all regions** where the Gemini API is supported
- Previous models (`gemini-1.5-flash`, `gemini-2.0-flash-lite`) were deprecated and removed by Google in February–March 2026
- It is capable enough for all tasks in the app: summarisation, extraction, Q&A, and report generation

To change the model, edit the single `MODEL` constant at the top of `src/lib/gemini.js`.

---

