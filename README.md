# Esangam Frontend

Esangam Frontend is a React + TypeScript SPA for managing multi-society cooperative “sangams”.

It talks to the Esangam backend (Quarkus + PostgreSQL) over REST, using JWT-based authentication and role-based access control.

---

## 🧱 Tech Stack

- **React** (with hooks)
- **TypeScript**
- **Vite** (dev server & build)
- **Material UI (MUI)** – layout & components
- **Axios** – HTTP client (`src/api/client.ts`)
- **React Router v6** – routing (`src/App.tsx`)
- **Custom Auth Context** – JWT auth (`src/state/AuthContext.tsx`)
- **Custom Notifications Hook** – snackbars (`src/hooks/useNotifications.ts`)

---

## 📂 Project Structure (Frontend)

Key folders/files:
src/
  main.tsx               # React root, wraps App with AuthProvider & Notifications
  App.tsx                # Top-level routes & layout (AppBar, ProtectedRoute, etc.)

  api/
    client.ts            # Axios instance & base URL configuration

  state/
    AuthContext.tsx      # Auth provider, JWT token handling, /auth/me bootstrap

  hooks/
    useNotifications.ts  # Global snackbar/notification system

  pages/
    LoginPage.tsx            # Login form (mobile + password)
    EsAdminPage.tsx          # ES_ADMIN dashboard (sangam management)
    AdminDashboardPage.tsx   # Society admin dashboard
    MemberDashboardPage.tsx  # Member dashboard (loans, announcements, etc.)
    BootstrapAdminPage.tsx   # One-time ES_ADMIN creation page (UI for POST bootstrap)

  styles/
    app.css              # Global app styling
🔧 Prerequisites
Node.js: v18+ recommended

npm or yarn installed

Esangam backend running on http://localhost:8080
(or adjust API_BASE_URL in src/api/client.ts)

🚀 Getting Started
From the frontend project root (esangam-frontend):

1. Install Dependencies
bash
Copy code
npm install
# or
yarn
2. Configure Backend URL (If Needed)
By default, the client points to:

ts
Copy code
// src/api/client.ts
export const API_BASE_URL = 'http://localhost:8080'
If your backend runs elsewhere, update API_BASE_URL accordingly.

3. Run in Development Mode
bash
Copy code
npm run dev

# or
yarn dev
Vite will start the dev server.
Open the app at: http://localhost:5173

