# Gemini Code Assistant Context

This document provides context for the Gemini code assistant to understand the "Guess Logo" project.

## Project Overview

This is a monorepo for a "Guess the Logo" game. The project is split into two main parts: a frontend application and a backend API. It uses `pnpm` for workspace management.

### Frontend (`apps/frontend`)

The frontend is a single-page application built with **React** and **Vite**. It uses **TypeScript** for type safety and **Tailwind CSS** for styling. Key libraries include:

*   **React Router:** For client-side routing.
*   **Zustand:** For state management.
*   **TanStack Query:** For data fetching and caching.
*   **Radix UI:** For accessible UI components.
*   **i18next:** For internationalization.

### Backend (`apps/api`)

The backend is a **Cloudflare Worker** application built with **Hono**, a lightweight web framework. It uses **Durable Objects** for stateful logic, likely for managing game rooms or sessions.

## Building and Running

### Frontend

*   **Install dependencies:** `pnpm install`
*   **Run development server:** `pnpm --filter @guess-logo/frontend dev`
*   **Build for production:** `pnpm --filter @guess-logo/frontend build`
*   **Lint:** `pnpm --filter @guess-logo/frontend lint`

### Backend

*   **Install dependencies:** `pnpm install`
*   **Run development server:** `pnpm --filter api dev`
*   **Deploy:** `pnpm --filter api deploy`
*   **Lint:** `pnpm --filter api lint`

## Development Conventions

*   The project uses **ESLint** for code linting.
*   **TypeScript** is used in both the frontend and backend.
*   The frontend uses a path alias `@` for the `src` directory.
*   Commits are linted using `lint-staged` and `simple-git-hooks`.
