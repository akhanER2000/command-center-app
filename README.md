<h1 align="center">Command Center</h1>

<p align="center"><i>A personal productivity hub — projects, tasks, pomodoro and notes — built full-stack on Next.js and Supabase.</i></p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-C8A24A?style=flat-square" alt="MIT">
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/status-flagship-2ea44f?style=flat-square" alt="flagship">
</p>

<p align="center">
  🚀 <a href="https://command-center-app-sigma.vercel.app"><b>Live demo</b></a>
</p>

## The problem

I wanted one place to run my day — projects, tasks, focus timer and notes — without stitching together five SaaS tools. Command Center is that hub, and it doubles as a real full-stack build: authentication, a relational schema, and **row-level security done properly** so each user only ever sees their own data.

## Features

- **Projects, tasks, pomodoro timer and notes** in a single dashboard.
- **Auth + multi-user** — every record is scoped to its owner.
- **8 Postgres tables with 9 row-level-security policies** — data isolation enforced at the database, not just the UI.
- **Deployed on Vercel**, backed by Supabase.

## Architecture

```mermaid
flowchart LR
    A[Next.js UI] --> B[Supabase Auth]
    A --> C[Supabase client]
    C --> D[(PostgreSQL<br/>8 tables)]
    D --> E[Row-Level Security<br/>9 policies]
    E --> C
```

## Quickstart

```bash
git clone https://github.com/akhanER2000/command-center-app.git
cd command-center-app
npm install
cp .env.example .env.local   # add your Supabase URL + anon key
npm run dev
```

## Stack

TypeScript · Next.js · React · Supabase · PostgreSQL · Tailwind CSS

## Results

- **8 relational tables**, **9 RLS policies** — tenant isolation guaranteed server-side.

## Status & roadmap

`status: flagship` · active, deployed. Next: recurring tasks and calendar view.

## License & contact

MIT © 2026 Akhan Lorenzo Espinoza Rojas
[Portfolio](https://cs-portfolio-psi-topaz.vercel.app) · [LinkedIn](https://www.linkedin.com/in/akhan-espinoza)
