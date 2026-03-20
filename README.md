# Okuulib

A mobile digital library for Kyrgyz literature. Browse, search, and read books in Kyrgyz and Russian. Built with Expo and connected to a Java Spring Boot backend.
<div align="center">
  <h3>App Screenshots</h3>
  <table border="0">
    <tr>
      <td><img src="https://github.com/user-attachments/assets/8109f3c0-8c41-43b0-b33f-ddd0a21acb38" width="250"></td>
      <td><img src="https://github.com/user-attachments/assets/e962cfa1-fd4f-4dd0-a4b1-24ef61be16ae" width="250"></td>
      <td><img src="https://github.com/user-attachments/assets/a8731879-6d04-4e0e-b22b-dd961c379ccb" width="250"></td>
    </tr>
    <tr>
      <td><img src="https://github.com/user-attachments/assets/d8ff7c6b-cfc7-4d19-b6ee-555fd170c732" width="250"></td>
      <td><img src="https://github.com/user-attachments/assets/35970c90-cfce-4d47-829a-5c0ae413a33f" width="250"></td>
      <td><img src="https://github.com/user-attachments/assets/7b2eb30f-853c-44dc-8525-f2fe14d2a9ba" width="250"></td>
    </tr>
    <tr>
      <td><img src="https://github.com/user-attachments/assets/449edcd2-ab8b-4365-80dd-d48499f4e2f9" width="250"></td>
      <td><img src="https://github.com/user-attachments/assets/debe84eb-46a9-4354-a983-2a520f965b9e" width="250"></td>
      <td><img src="https://github.com/user-attachments/assets/144a1278-8853-40df-85c3-71ba93ef8211" width="250"></td>
    </tr>
  </table>
</div>

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
