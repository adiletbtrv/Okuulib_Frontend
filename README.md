# Okuulib

A mobile digital library for Kyrgyz literature. Browse, search, and read books in Kyrgyz and Russian. Built with Expo and connected to a Java Spring Boot backend.

## Key Features
- **Authentication**: Secure JWT-based auth via API with persistent SecureStore handling.
- **Library**: Browse best collections, Kyrgyz classics, and browse personalized recommendations.
- **Reader Engine**: Robust interface for reading works with chapter tracking.
- **AI Integration**: Aitu—intelligent AI chatbot assistant initialized safely.
- **Offline Reliability**: React Query cache handling built with robust network listeners.

## Local Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Setup environment variables**:
   Copy `.env.example` to a new `.env` file and set your local backend API IP.
   ```bash
   cp .env.example .env
   ```
3. **Run Backend**:
   Ensure the Java Spring Boot backend is active and listening on port `8082` (by default).
4. **Start Expo App**:
   ```bash
   npx expo start -c
   ```

## Architecture Notes
State management combines Zustand for global auth contexts and UI states, paired closely with TanStack React Query for aggressive network caching and background data refetching. Global colors are driven by a single valid source of truth in `constants/theme`.
