<div align="center">
  <img src="Frontend/assets/images/icon.png" width="112" alt="NutriLife app icon" />
  <h1>NutriLife</h1>
  <p>A full-stack nutrition companion for logging meals, understanding daily intake, and turning food photos into useful nutrition estimates.</p>

  [![Expo](https://img.shields.io/badge/Expo-55-000020?logo=expo&logoColor=white)](https://expo.dev/)
  [![React Native](https://img.shields.io/badge/React_Native-0.83-20232A?logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

  [Download Android APK](https://github.com/Vinayak1337/Nurtrilife/releases/tag/v1.0.0) · [Portfolio](https://vinayak1337.me/)
</div>

![NutriLife product overview showing calorie tracking, AI food analysis, and weekly insights](docs/nutrilife-overview.webp)

## What it does

NutriLife combines a React Native mobile experience with a NestJS API. Users can photograph a meal, review the AI-estimated nutrition, save it to a daily log, and see how meals and water intake affect their goals over time.

- Camera and photo-library food capture with Gemini-powered analysis
- Daily calorie and macronutrient tracking
- Meal history and calendar-based browsing
- Water logging, reminders, streaks, and achievement badges
- Weekly charts, a daily health score, and nutrient-deficiency signals
- Meal suggestions based on remaining daily nutrition targets
- Clerk authentication and per-user cloud sync
- Offline-friendly local persistence with background server synchronization
- Light and dark themes

> NutriLife is a portfolio project, not a medical device. AI-generated nutrition values and recommendations are estimates and should not replace professional medical or dietary advice.

## Architecture

```mermaid
flowchart LR
  A[Expo / React Native app] --> B[Redux Toolkit + Saga]
  B --> C[Local persisted state]
  B -->|Clerk JWT| D[NestJS REST API]
  D --> E[(MongoDB)]
  D --> F[Gemini food analysis]
  D --> G[Gemini meal recommendations]
```

The mobile app treats local state as the fast interaction layer and synchronizes authenticated user, meal, water, streak, and badge data with the API. Analysis and insights remain transient or derived instead of being persisted as duplicated state.

## Stack

| Area | Technology |
| --- | --- |
| Mobile | Expo Router, React Native, TypeScript |
| State | Redux Toolkit, Redux Saga, Redux Persist |
| Authentication | Clerk |
| API | NestJS, Swagger |
| Database | MongoDB, Mongoose |
| AI | Google Gemini |
| Device features | Camera, image picker, notifications, haptics, secure storage |
| Delivery | EAS Build, Expo Updates, Render |

## Run locally

### Prerequisites

- Node.js 20 or newer
- npm
- Android Studio, Xcode, or a physical device supported by Expo
- A MongoDB database
- Clerk frontend and backend keys
- A Google Gemini API key

### 1. Install dependencies

```bash
git clone https://github.com/Vinayak1337/Nurtrilife.git
cd Nurtrilife
npm install --prefix Frontend
npm install --prefix Backend
```

### 2. Configure the backend

```bash
cp Backend/.env.example Backend/.env
```

Fill in `Backend/.env`:

```dotenv
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/nutrilife
GEMINI_API_KEY=your_gemini_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
PORT=3000
```

### 3. Configure the mobile app

```bash
cp Frontend/.env.example Frontend/.env
```

Fill in `Frontend/.env`:

```dotenv
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:3000
```

Use your computer's LAN IP when running on a physical phone. Android emulators can typically reach the host through `http://10.0.2.2:3000`.

### 4. Start both apps

In separate terminals:

```bash
npm run bd
```

```bash
npm run fd
```

The backend exposes Swagger documentation at `http://localhost:3000/docs` and a public health check at `http://localhost:3000/api/health`.

## Repository layout

```text
Nurtrilife/
├── Frontend/          Expo Router mobile application
│   ├── app/           Screens and file-based navigation
│   ├── components/    UI, charts, and feature components
│   ├── services/      API, sync, notifications, and AI requests
│   └── store/         Redux slices, sagas, and persistence
├── Backend/           NestJS API
│   └── src/           Auth, users, meals, water, badges, and AI modules
└── package.json       Convenience scripts for local development
```

## Current status

Version 1.0 is available as an [Android APK](https://github.com/Vinayak1337/Nurtrilife/releases/tag/v1.0.0). The app is an actively developed portfolio project; AI responses depend on third-party model availability and configured quota.

## Author

Built by [Vinayak Kumar](https://github.com/Vinayak1337) — [portfolio](https://vinayak1337.me/) · [LinkedIn](https://www.linkedin.com/in/vinayak1337/)
