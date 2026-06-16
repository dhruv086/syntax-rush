# Syntax Rush

> **Work in Progress:** This project is not finished and is actively under development.

## Project Overview

Syntax Rush is a gamified DSA learning platform where users fight coding problems in a battle arena and climb through leagues. The goal is to make algorithm practice feel like a competitive strategy game — similar in spirit to a coding version of *Clash of Clans*.

## Main Functionality

- Battle-style DSA problem solving.
- Real-time competitive mechanics via a frontend arena and socket-powered interactions.
- League progression and ranking based on performance.
- A social layer with chat, squads, and leaderboards.
- Problem pages that combine coding, chat, and analytics in one interface.

## What This Project Does Now

- Backend API with authentication, problem management, submissions, battles, contests, groups, messages, and social endpoints.
- Next.js frontend with pages for home, login, signup, problem battles, leaderboards, contests, profile, and more.
- Real-time communication via Socket.IO for chat and battle events.
- A modern UI built with Tailwind CSS and Monaco editor integration for code practice.

## Why This Project Exists

Syntax Rush aims to turn DSA practice into a more engaging, competitive experience:

- Instead of standalone problem solving, users compete in battles.
- Instead of static scoring, users earn league promotions, points, and status.
- Instead of isolated practice, users can form groups and communicate.

## Current Status

- ✅ Basic backend and frontend structure exists.
- ⚠️ Many core features are still in progress or incomplete.
- ⚠️ The product is not production ready.
- ⚠️ There are missing UX flows, polish, and gameplay mechanics.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Socket.IO, Redis
- Frontend: Next.js, React, TypeScript, Tailwind CSS, Monaco Editor
- Authentication: JWT, Google OAuth support is included in the frontend.

## Folder Structure

- `/backend` — Express server, routes, controllers, models, socket logic, middleware.
- `/frontend` — Next.js app, pages, components, styles, API client.
- `/ML` — machine learning assets and notebook work (not part of core DSA game yet).

## How to Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Development Notes

- The app uses `dotenv` for configuration. Create `.env` files in `backend` and `frontend` if needed.
- The backend listens on port `8000` by default and exposes `/api/v1/...` routes.
- The frontend is configured for Next.js and uses an API client in `frontend/src/lib/api.ts`.

## Next Steps

- Build a complete battle matchmaking flow.
- Add league promotion/demotion logic.
- Improve submission evaluation and scoring.
- Complete UI/UX for squad formation, contest management, and messaging.
- Add tests, documentation, and deployment setup.

## Disclaimer

This repository is a work in progress. The current implementation shows an early-stage MVP and is not yet a finished game. Please treat it as an evolving project rather than a complete product.

