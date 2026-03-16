# SocialSphere - Frontend 🚀

SocialSphere is a modern social media platform built for high performance and visual excellence. This repository contains the React-based frontend application.

## ✨ Features

- **Interactive Feed**: Real-time likes and comment synchronization.
- **Advanced Stories**: 
  - Smart sorting (Own stories first, then Unseen, then Seen).
  - Visual status indicators (Gradient ring for new, Gray for seen).
- **Social Management**: Follow/Unfollow users, discover new people, and manage profile settings.
- **Premium UI/UX**: 
  - **Custom Modals**: Replaced native alerts with a sleek `ConfirmationModal` system.
  - **Dynamic Toasts**: Premium feedback for actions like link copying and permission alerts.
  - **Grouped Actions**: Combined "Like" and "Delete" actions in comments for a cleaner interface.
  - **Polished Shimmers**: Enhanced loading states for a premium app feel.
- **Responsive Design**: Polished UI with smooth animations and auto-expanding text areas.

## 🛠 Tech Stack

- **Core**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + SCSS (Premium visual baseline)
- **Icons**: Lucide React
- **State Management**: Zustand + TanStack Query (React Query)
- **Networking**: Axios (with centralized interceptors for Auth)
- **Notifications**: Sonner

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🏗 Build & Deploy

To create a production build:
```bash
npm run build
```

The output will be in the `dist/` directory.

## 📝 Characteristics
- **StrictMode Enabled**: Note that API calls may double-trigger in development mode due to `React.StrictMode` (a safety feature to detect side effects). This is disabled in production.
