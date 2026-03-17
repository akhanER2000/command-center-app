# Command Center - Full Stack Next.js + Supabase App

This plan details the architecture and implementation steps for building the Command Center system, featuring authentication, project management, pomodoro timer, notes, and a dynamic dashboard, backed by Supabase.

## User Review Required

> [!IMPORTANT]
> The database schema requires setting up a Supabase project. We need you to create a Supabase project at supabase.com and provide the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to connect our Next.js application. We will also need to execute SQL statements to set up our tables and RLS policies. It is often easiest to apply the SQL queries through the Supabase Dashboard.

> [!NOTE]
> We will use Next.js 14+ App Router, Tailwind CSS, and `lucide-react` for icons. For state management, we will use Zustand. Let me know if you prefer a different stack.

## Proposed Changes

### 1. Project Initialization
- Create a new Next.js project with App Router.
- Configure Tailwind CSS.
- Install Supabase SSR client for Next.js (`@supabase/ssr`).
- Install Zustand for global state.
- Install Recharts for the activity chart.

### 2. Database Schema (Supabase)
We will define the following tables in Supabase with strict Row Level Security (RLS):
- `profiles`: id (references auth.users), display_name, updated_at
- `projects`: id, user_id, name, description, deadline, status (planificado, en_progreso, completado, pausado), color, created_at
- `tasks`: id, project_id, user_id, name, is_completed, completed_at, position, created_at
- `pomodoros`: id, user_id, project_id (nullable), start_time, end_time, duration, type (work, short_break, long_break)
- `notes`: id, user_id, project_id (nullable), title, content, color, created_at, updated_at
- `tags`: id, user_id, name, color
- `note_tags`: note_id, tag_id
- `activity_log`: id, user_id, action_type, entity_type, entity_id, description, created_at

*Key relationships*:
- Tasks `project_id` references `projects.id` with `ON DELETE CASCADE`.
- Notes `project_id` references `projects.id` with `ON DELETE SET NULL`.
- Note tags link `notes` and `tags` (many-to-many).

### 3. Application Structure

#### Auth & Middleware
- Implement App Router middleware for route protection.
- Create `/login` and `/register` routes using custom forms to call Supabase Auth.
- Configure GitHub OAuth as an alternative login option.

#### Global State (Zustand)
- We need a global store to share state between the Dashbaord compact pomodoro and the main `/pomodoro` route.

#### Dashboard (`/dashboard`)
- Dynamic KPIs fetching from DB.
- Recharts graph for tasks completed (last 7 days).
- Feed of `activity_log`.
- Shared Zustand pomodoro timer.

#### Projects (`/projects`)
- Grid/List of projects with custom progress bars.
- Dynamic route `/projects/[id]` for task management.
- Drag and drop functionality to reorder tasks updating `position` in DB.

#### Pomodoro (`/pomodoro`)
- Shared timer state.
- Saves to `pomodoros` table upon completion.
- Pulls eligible projects (`planificado`, `en_progreso`).

#### Notes (`/notes`)
- Filter and search using Supabase composed queries: `.ilike('title', ...)` and filtering `note_tags`.

### 4. Verification Plan

#### Manual Verification
1. **Auth**: Register a user, log in, sign out. Access protected routes while logged out to verify redirect.
2. **Projects**: Create a project, add tasks, complete tasks. Delete project and verify tasks disappear. Check that bar charts load properly.
3. **Timer**: Start timer on Dashboard, switch to Pomodoro page (ensure timer persists), let timer finish, verify DB entry and Dashboard Hours.
4. **Notes**: Create a note, attach tag, verify multi-filter (tag + color) works correctly without crashing.
5. **Dashboard**: Complete tasks/pomodoros and verify KPI cards update correctly with percentage arrows.
