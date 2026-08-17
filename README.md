<div align="center">

# 📚 Okuulib Mobile

**Next-generation cross-platform digital library & AI reading assistant for Kyrgyz and Central Asian literature, built on React Native 0.81 (Expo 54 New Architecture) with Zustand, TanStack Query, and full-duplex WebSocket streaming.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.1.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.29_(New_Arch)-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-4.5.0-433e38?style=flat-square&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
[![TailwindCSS](https://img.shields.io/badge/NativeWind-4.2.1-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://www.nativewind.dev/)
[![Jest](https://img.shields.io/badge/Jest-30.3.0-C21325?style=flat-square&logo=jest&logoColor=white)](https://jestjs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

**[App Showcase](#-app-showcase)** • **[Engineering Highlights](#-key-architectural--engineering-highlights)** • **[System Architecture](#-system-architecture)** • **[Tech Stack](#-tech-stack)** • **[Project Structure](#-project-structure)** • **[API & Data Contracts](#-api--data-contracts)** • **[Getting Started](#-getting-started)** • **[Testing & QA](#-testing--quality-assurance)** • **[License & Author](#-license--author)**

</div>

---

## 📱 App Showcase

<div align="center">
  <table border="0">
    <tr>
      <td align="center"><img src="https://github.com/user-attachments/assets/8109f3c0-8c41-43b0-b33f-ddd0a21acb38" width="240" alt="Home Feed & Collections" /><br /><sub><b>Home Feed & Curated Collections</b></sub></td>
      <td align="center"><img src="https://github.com/user-attachments/assets/e962cfa1-fd4f-4dd0-a4b1-24ef61be16ae" width="240" alt="Genre Browser & Filter" /><br /><sub><b>Genre Exploration & Filters</b></sub></td>
      <td align="center"><img src="https://github.com/user-attachments/assets/a8731879-6d04-4e0e-b22b-dd961c379ccb" width="240" alt="Book Overview & Metadata" /><br /><sub><b>Work Details & Chapter Index</b></sub></td>
    </tr>
    <tr>
      <td align="center"><img src="https://github.com/user-attachments/assets/d8ff7c6b-cfc7-4d19-b6ee-555fd170c732" width="240" alt="Reader Engine Light Mode" /><br /><sub><b>Reader Engine (Distraction-Free)</b></sub></td>
      <td align="center"><img src="https://github.com/user-attachments/assets/35970c90-cfce-4d47-829a-5c0ae413a33f" width="240" alt="Aitu AI Assistant Chat" /><br /><sub><b>Aitu AI Real-Time Assistant</b></sub></td>
      <td align="center"><img src="https://github.com/user-attachments/assets/7b2eb30f-853c-44dc-8525-f2fe14d2a9ba" width="240" alt="Aitu Chat Sessions Drawer" /><br /><sub><b>Chat Sessions Drawer</b></sub></td>
    </tr>
    <tr>
      <td align="center"><img src="https://github.com/user-attachments/assets/449edcd2-ab8b-4365-80dd-d48499f4e2f9" width="240" alt="User Profile & Banner Customization" /><br /><sub><b>User Profile & Custom Header</b></sub></td>
      <td align="center"><img src="https://github.com/user-attachments/assets/debe84eb-46a9-4354-a983-2a520f965b9e" width="240" alt="Profile Settings & Reader Dark Mode" /><br /><sub><b>Settings & Dark Mode Toggle</b></sub></td>
      <td align="center"><img src="https://github.com/user-attachments/assets/144a1278-8853-40df-85c3-71ba93ef8211" width="240" alt="Saved Bookmarks Collection" /><br /><sub><b>Bookmarks & Reading Queue</b></sub></td>
    </tr>
  </table>
</div>

---

## ⚡ Key Architectural & Engineering Highlights

### 1. Atomic Token Refresh & FIFO Interceptor Queue (`lib/api.ts`)
To eliminate race conditions and avoid thundering-herd issues during access token expiration, the Axios transport layer implements a stateful refresh mutex flag (`isRefreshing`) and a FIFO request resolution queue (`failedQueue`):
* When an endpoint returns `401 Unauthorized`, further concurrent downstream requests are deferred and pushed into `failedQueue`.
* A single refresh invocation hits `/api/auth/refresh-token`.
* Upon resolution, the new JWT is committed to hardware storage and Zustand, while all pending calls in `failedQueue` are dequeued, their `Authorization: Bearer <token>` headers re-injected, and dispatched simultaneously.
* If token refresh fails, the queue is rejected, tokens purged, and the user gracefully logged out.

### 2. Full-Duplex AI Assistant Socket with Jittered Exponential Backoff (`lib/websocket.ts`)
The `ChatWebSocket` client powers **Aitu**, the real-time AI literary assistant, communicating over `/ws/chat`:
* **Exponential Backoff Reconnect:** Connection dropouts automatically invoke an exponential backoff schedule:
  $$\Delta t = \min\left(1000 \cdot 2^{n - 1},\, 30000\right)\text{ ms}$$
  where $n \le 5$ denotes the reconnect attempt counter.
* **Permanent Failure Classification:** Differentiates between transient socket drops and unrecoverable 404 route errors (or code `4004`), disabling redundant connection loops on unavailable endpoints.
* **Auth-Recovery Loop:** 403 Forbidden events trigger a delayed 2-second buffer window allowing background token refresh prior to re-handshaking.
* **Lifecycle Isolation:** Distinguishes intentional UI unmount closures from unexpected network terminations.

### 3. Polymorphic Secure Storage & State Hydration (`lib/secureStorage.ts`, `store/useAuthStore.ts`)
Storage abstraction provides cross-platform compatibility without compromising cryptographic security:
* **Native Targets (iOS/Android):** Utilizes `expo-secure-store` utilizing iOS Keychain Services and Android Keystore AES-256 GCM hardware-backed storage.
* **Web/SSR Fallback:** Transparently falls back to `localStorage` with SSR guards.
* **Zustand Hydration Protocol:** Persistent auth state implements `onRehydrateStorage` hooks with `markHydrated()` signals, unlocking TanStack Query executions (`enabled: isHydrated`) only after secure storage reads complete.

### 4. High-Performance Reader Engine & Scroll Physics (`app/reader/[id].tsx`)
The mobile book reader is optimized for reading Kyrgyz epic works and large structured texts:
* **Hybrid Chunked Parsing:** Renders both typography nodes (`react-native-render-html` with memoized tag sheets) and embedded graphics (`expo-image` with memory-disk caching).
* **Scroll-Driven Auto-Hiding Top Bar:** Frame-rate independent delta evaluation ($\Delta y < -4\text{ px}$ or $y < 40\text{ px}$) orchestrates native driver spring dynamics (`Animated.spring` with damping 20, stiffness 180) to maximize reading surface area without UI clutter.
* **Dual Theme Architecture:** Instantaneous theme switching (`dark` vs. `light`) with distinct contrast ratios, line-height geometries, and blur navigation bars (`expo-blur`).

---

## 🏛 System Architecture

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                              OKUULIB MOBILE CLIENT                                │
│                         (React Native 0.81 / Expo SDK 54)                         │
└────────────────────────────────────────┬──────────────────────────────────────────┘
                                         │
 ┌───────────────────────────────────────┴────────────────────────────────────────┐
 │                              PRESENTATION LAYER                                │
 │  ┌──────────────────────────────────────────────────────────────────────────┐  │
 │  │ Expo Router v6 (Typed Routes, Tabs Layout, Dynamic Route Stack)         │  │
 │  ├──────────────────────────────────────────────────────────────────────────┤  │
 │  │ UI Components: ReaderEngine, BookCard, SearchBar, PosterBanner, Skeleton│  │
 │  ├──────────────────────────────────────────────────────────────────────────┤  │
 │  │ Styling: NativeWind v4 + TailwindCSS + Strict Design System Tokens       │  │
 │  └──────────────────────────────────────────────────────────────────────────┘  │
 └───────────────────────────────────────┬────────────────────────────────────────┘
                                         │
 ┌───────────────────────────────────────┴────────────────────────────────────────┐
 │                           STATE & DATA SYNC LAYER                              │
 │  ┌─────────────────────────────────────┐  ┌─────────────────────────────────┐  │
 │  │       TanStack Query v5 (Server)    │  │       Zustand Stores (Client)   │  │
 │  │  • Stale-While-Revalidate caching   │  │  • useAuthStore (Tokens & User) │  │
 │  │  • Focus & Mount query invalidation │  │  • useReaderThemeStore (Theme)  │  │
 │  │  • Network awareness (@netinfo)     │  │  • Hydration Lifecycle State    │  │
 │  └──────────────────┬──────────────────┘  └────────────────┬────────────────┘  │
 │                     │                                      │                   │
 │                     └───────────────────┬──────────────────┘                   │
 │                                         │                                      │
 │                       ┌─────────────────┴─────────────────┐                    │
 │                       │    Polymorphic Storage Engine     │                    │
 │                       │  (Expo SecureStore / AsyncStorage)│                    │
 │                       └─────────────────┬─────────────────┘                    │
 └─────────────────────────────────────────┼──────────────────────────────────────┘
                                           │
 ┌─────────────────────────────────────────┴──────────────────────────────────────┐
 │                              TRANSPORT LAYER                                   │
 │  ┌────────────────────────────────────────┐ ┌───────────────────────────────┐ │
 │  │        Axios HTTP REST Client          │ │    ChatWebSocket Client       │ │
 │  │  • Request/Response Interceptors       │ │  • Full-Duplex AI Streaming    │ │
 │  │  • Atomic Token Refresh & FIFO Queue   │ │  • Exponential Backoff Retries │ │
 │  │  • Unified Kyrgyz Error Mapping        │ │  • Auth-Recovery Handshake     │ │
 │  └───────────────────┬────────────────────┘ └───────────────┬───────────────┘ │
 └──────────────────────┼──────────────────────────────────────┼──────────────────┘
                        │ HTTP / HTTPS (Port 8082)             │ WS / WSS
                        ▼                                      ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           JAVA SPRING BOOT BACKEND                                │
│           (Authentication, Catalog Services, AI Gateway & Bookmarks)              │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer / Domain | Technologies & Libraries | Version | Description & Purpose |
| :--- | :--- | :--- | :--- |
| **Core Runtime** | **React** | `19.1.0` | Declarative component foundation |
| **Mobile Framework** | **React Native** | `0.81.5` | Native mobile rendering engine (New Architecture enabled) |
| **Application Platform** | **Expo SDK** | `^54.0.29` | Managed native runtime, native toolchain, asset management |
| **File-Based Routing** | **Expo Router** | `~6.0.19` | Typed route definitions, stack & tab transitions |
| **Language & Typings** | **TypeScript** | `^5.1.3` | End-to-end static type safety & DTO definitions |
| **Server State** | **TanStack Query** | `^5.0.0` | Asynchronous query caching, mutation lifecycle, invalidation |
| **Client State** | **Zustand** | `^4.5.0` | Lightweight store with persistence & storage adapters |
| **HTTP Transport** | **Axios** | `^1.6.0` | REST client with interceptor queue & token refresh |
| **Real-Time Streaming** | **WebSocket** | *Native* | Bidirectional AI chat streaming with reconnect engine |
| **Schema Validation** | **Zod** | `^3.25.76` | Runtime form & payload validation (login, registration) |
| **Styling & Design** | **NativeWind / TailwindCSS** | `^4.2.1` / `^3.3.2` | Utility-first styling compiled to React Native StyleSheet |
| **Rich Text Rendering** | **React Native Render HTML** | `^6.3.4` | HTML rendering engine for structured book chapters |
| **Hardware Storage** | **Expo SecureStore** | `~15.0.8` | Keystore (Android) / Keychain (iOS) cryptographic storage |
| **Offline Awareness** | **NetInfo** | `^11.4.1` | Network state tracking & real-time offline banners |
| **Animations & Visuals** | **Expo Blur / Reanimated** | `~15.0.8` / `~4.1.1` | Native blur effects, spring animations, transitions |
| **Testing Suite** | **Jest / Testing Library** | `^30.3.0` / `^13.3.3` | Unit tests, hook testing, schema assertions |

---

## 📁 Project Structure

```
Okuulib_Frontend/
├── __tests__/                      # Automated test suite
│   ├── api.test.ts                 # Axios interceptor, safeApi & error mapper tests
│   ├── theme.test.ts               # Theme tokens & design system invariant checks
│   ├── useBooks.test.tsx           # Hook query lifecycle & hydration mock tests
│   └── validation.test.ts          # Zod schema validation & password complexity tests
├── app/                            # Expo Router file-based route tree
│   ├── (tabs)/                     # Main bottom tab navigator
│   │   ├── _layout.tsx             # Custom bottom tab bar with SVG icons
│   │   ├── aitu.tsx                # Aitu AI assistant real-time chat interface
│   │   ├── index.tsx               # Home screen: carousels, hero banners, recommendations
│   │   ├── library.tsx             # Genre browser, category filters, library index
│   │   ├── notifications.tsx       # System updates & user notification center
│   │   └── saved.tsx               # Bookmarked works & reading queue
│   ├── auth/                       # Authentication flow
│   │   ├── login.tsx               # User authentication screen with Zod validation
│   │   └── register.tsx            # Account registration screen with field validation
│   ├── books/                      # Work detail routes
│   │   └── [id].tsx                # Dynamic book overview, chapter index, bookmark action
│   ├── profile/                    # User account management
│   │   ├── index.tsx               # Profile overview, avatar/banner image picker
│   │   └── settings.tsx            # Account settings, password change, dark mode toggle
│   ├── reader/                     # Distraction-free reading environment
│   │   └── [id].tsx                # Chapter chunk renderer, auto-hiding header, pagination
│   ├── _layout.tsx                 # Root layout: ErrorBoundary, QueryClient, SafeAreaProvider
│   └── globals.css                 # Global CSS rules for NativeWind integration
├── assets/                         # Static image assets & custom icons
│   ├── fonts/                      # Custom typography files
│   ├── icons/                      # App icon assets & tab bar graphics
│   └── images/                     # Posters, logos, and fallback banners
├── components/                     # Reusable UI component library
│   ├── ui/                         # Atomic interface elements
│   │   └── Skeleton.tsx            # Shimmer/skeleton placeholder loaders
│   ├── BookCard.tsx                # Standard book card with thumbnail & meta
│   ├── ErrorBoundary.tsx           # React error boundary component with fallback UI
│   ├── NetworkStatusBanner.tsx     # Animated network connectivity warning banner
│   ├── PosterBanner.tsx            # Featured book hero carousel banner
│   ├── SearchBar.tsx               # Live search input with instant dropdown overlay
│   └── SearchResultCard.tsx        # Horizontal search result item card
├── constants/                      # Global static configurations
│   ├── icons.ts                    # Icon asset references
│   ├── images.ts                   # Image asset references
│   └── theme.ts                    # Single source of truth for colors, shadows, typography
├── hooks/                          # Custom React & React Native hooks
│   ├── useAppQuery.ts              # TanStack Query & Mutation abstraction wrappers
│   ├── useBookDetails.ts           # Work detail data query hook
│   ├── useBooks.ts                 # Full book catalog query hook
│   ├── useNetworkStatus.ts         # Real-time NetInfo subscriber hook
│   └── useSearchBooks.ts           # Debounced server-side book search hook
├── interfaces/                     # TypeScript declarations & helpers
│   ├── helpers.ts                  # URL resolvers & data formatters
│   └── interfaces.d.ts             # Comprehensive DTO definitions & data contracts
├── lib/                            # Infrastructure & utility services
│   ├── api.ts                      # Axios instance, interceptors, API service modules
│   ├── config.ts                   # Environment variable loader & IP resolution
│   ├── queryClient.ts              # TanStack QueryClient instance setup
│   ├── secureStorage.ts            # Polymorphic storage adapter (SecureStore / Web)
│   ├── tokenStorage.ts             # Low-level JWT read/write/clear methods
│   ├── validation.ts               # Zod validation schemas (login, registration)
│   └── websocket.ts                # Custom ChatWebSocket manager with exponential backoff
├── mock/                           # Local development mock datasets
│   └── books.ts                    # Fallback book objects
├── store/                          # Zustand state stores
│   ├── useAuthStore.ts             # Persistent authentication state & user context
│   └── useReaderThemeStore.ts      # Persistent reader theme preference (light/dark)
├── swagger/                        # Backend API specifications
│   └── okuulib_api.json            # OpenAPI / Swagger contract definition
├── types/                          # Global ambient type extensions
│   └── images.d.ts                 # Static image module declarations
├── app.json                        # Expo app manifest & configuration
├── babel.config.js                 # Babel preset configuration
├── jest.config.js                  # Jest test runner configuration & module aliases
├── jest.setup.js                   # Jest test environment setup
├── metro.config.js                 # Metro bundler config with NativeWind wrapper
├── nativewind-env.d.ts             # NativeWind TypeScript declaration
├── package.json                    # Dependencies, scripts, and package metadata
├── tailwind.config.js              # TailwindCSS styling configuration
└── tsconfig.json                   # TypeScript compiler configuration & path aliases
```

---

## 🌐 API & Data Contracts

The mobile client interfaces with a Java Spring Boot backend. Below is the primary API contract matrix:

| HTTP / WS | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | No | Creates a new user account and returns JWT credentials |
| `POST` | `/api/auth/login` | No | Authenticates user with username/password, returns access token |
| `POST` | `/api/auth/refresh-token` | Yes (Refresh) | Exchanges refresh token for an active access token |
| `GET` | `/api/auth/me` | Yes | Retrieves the profile data of the currently logged-in user |
| `POST` | `/api/auth/profile-photo` | Yes | Uploads a multipart/form-data profile avatar |
| `DELETE`| `/api/auth/profile-photo` | Yes | Deletes the user's profile avatar |
| `POST` | `/api/auth/change-password` | Yes | Validates old password and sets new credentials |
| `GET` | `/api/works` | No | Retrieves paginated book list with genres and author info |
| `GET` | `/api/works/{id}` | No | Fetches complete work details, chapters, and chunks |
| `GET` | `/api/works/search` | No | Performs full-text search across book titles and authors |
| `GET` | `/api/genres` | No | Retrieves all literary categories and genres |
| `GET` | `/api/bookmarks` | Yes | Lists user's saved reading bookmarks with progress offsets |
| `POST` | `/api/bookmarks` | Yes | Creates a bookmark at a specific chapter chunk offset |
| `DELETE`| `/api/bookmarks/{id}` | Yes | Removes a bookmark by ID |
| `GET` | `/api/chat-sessions` | Yes | Lists historical conversation sessions with Aitu AI |
| `POST` | `/api/chat-sessions` | Yes | Initializes a new named chat conversation thread |
| `WS` | `/ws/chat` | Optional | Full-duplex real-time streaming channel for Aitu AI assistant |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.x` or `v20.x` LTS
* **Package Manager**: `npm` (v9+) or `yarn` (v1.22+)
* **Expo Go / Development Build**: Installed on physical device (iOS/Android) or configured simulator
* **Backend Service**: Java Spring Boot backend running on local network (e.g., port `8082`)

### Step 1: Clone Repository
```bash
git clone https://github.com/adiletbtrv/Okuulib_Frontend.git
cd Okuulib_Frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a local `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Update `EXPO_PUBLIC_API_URL` to match your backend host IP:
```env
EXPO_PUBLIC_API_URL=http://192.168.0.106:8082
```
*(Note: Use your workstation's LAN IP when testing on physical mobile devices, or `http://10.0.2.2:8082` for Android Emulator).*

### Step 4: Launch Development Server
```bash
# Start Expo development server with cache reset
npx expo start -c

# Target specific platforms directly:
npm run android    # Android emulator / connected device
npm run ios        # iOS simulator
npm run web        # Web development server
```

---

## 🧪 Testing & Quality Assurance

Okuulib includes automated unit testing configured with Jest and React Native Testing Library.

### Test Suites Overview:
* **API & Interceptors (`__tests__/api.test.ts`):** Validates error code translation into Kyrgyz language, Axios interceptor response formatting, and `safeApi` utility handling.
* **Schema Validation (`__tests__/validation.test.ts`):** Tests Zod schemas for empty inputs, email formatting, password complexity rules, and password mismatch checks.
* **Query Hooks (`__tests__/useBooks.test.tsx`):** Verifies TanStack Query hook execution gated behind auth hydration (`isHydrated`).
* **Design Invariants (`__tests__/theme.test.ts`):** Asserts color keys, semantic tokens, and spacing scale integrity.

### Running Tests:
```bash
# Run full Jest test suite
npm test

# Run tests with coverage report
npx jest --coverage

# Static Type Verification
npx tsc --noEmit
```

---

## 📜 License & Author

Distributed under the **MIT License**. See `LICENSE` for more information.

**Author:** [Adilet Batyrov](https://github.com/adiletbtrv) • Connect on [LinkedIn](https://www.linkedin.com/in/adilet-batyrov/)
