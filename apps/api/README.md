# API Architecture: Game-Agnostic Room Engine

This document outlines the backend architecture, which is designed as a generic, reusable engine for stateful, real-time games.

## Deployment Architecture

The API and frontend are deployed together as a unified Cloudflare Workers deployment:

- **API Route Handling**: The Cloudflare Worker handles all API routes via Hono
- **Frontend Serving**: The Worker serves the React frontend build from `../frontend/dist` as static assets using the `assets` binding
- **Single Domain**: Both frontend and API are served from the same domain, enabling relative URLs and eliminating CORS issues

**Environment URLs:**
- **Development**: `http://localhost:8787` (API and frontend together)
- **Staging**: `https://staging.playgrid.mohadalaa.com`
- **Production**: `https://playgrid.mohadalaa.com`

**Frontend-Backend Communication:**
- In development, the frontend uses `http://localhost:8787` for API calls
- In production, the frontend uses relative URLs (`''`) since both are served from the same domain

