# Setup Guide

This project is under active development. The steps below reflect the current repository state and the scripts that already exist in the codebase.

## Prerequisites

- Node.js 18 or later
- npm 9 or later
- MongoDB running locally or a MongoDB Atlas cluster
- Expo CLI support through `npx`
- Android Studio or Expo Go for mobile testing

## Installation

```bash
cd RedDropAI/backend
npm install

cd ../frontend
npm install
```

## Environment Setup

Create these files from `.env.example` and fill in the required values locally:

- `backend/.env`
- `frontend/.env`

### Backend variables

```env
PORT=
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
CLIENT_URL=
NODE_ENV=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### Frontend variables

```env
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_SOCKET_URL=
EXPO_PUBLIC_GOOGLE_MAPS_KEY=
```

## Run the Backend

```bash
cd backend
npm run dev
```

The API listens on `http://localhost:5000` by default.

## Run the Frontend

```bash
cd frontend
npx expo start
```

Use Expo Go, an Android emulator, or the web target depending on your setup.

## Local MongoDB Option

If you are developing locally, point `MONGODB_URI` to your local MongoDB instance and confirm the service is running before starting the backend.

## Common Checks

- Verify the backend health endpoint after startup.
- Confirm the frontend can reach the API using the value in `EXPO_PUBLIC_API_URL`.
- Keep all credentials out of version control.
# 🛠️ Red Drop AI — Complete Setup Guide

## ⚡ Quick Setup (5 minutes)

### Prerequisites
Install these before starting:
```bash
node --version     # Need Node.js 18+
npm --version      # Need npm 9+
npx expo --version # Install if missing: npm install -g expo-cli
```

---

## 📦 Step 1: Install Dependencies

```bash
# Backend
cd RedDropAI/backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## 🔐 Step 2: Configure Environment Variables

### Backend — create `backend/.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/reddropai
JWT_SECRET=your_super_secret_at_least_64_chars_random_string
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password

CLIENT_URL=http://localhost:19006
NODE_ENV=development
```

### Frontend — create `frontend/.env`
```env
EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:5000/api
EXPO_PUBLIC_SOCKET_URL=http://YOUR_PC_IP:5000
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

> **IMPORTANT:** Use your PC's local IP (e.g., `192.168.1.5`), not `localhost`, when testing on a physical device.
> Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

---

## 🔗 Step 3: Connect Local MongoDB

1. Install MongoDB Community Server if it is not already installed.
2. Start the MongoDB service and confirm it is running.
3. Set `MONGODB_URI=mongodb://localhost:27017/reddropai` in `backend/.env`.
4. Restart the backend after editing `.env`.

If you prefer MongoDB Atlas later, you can replace the local URI with your Atlas connection string, but the backend code will still read only `process.env.MONGODB_URI`.

### Windows service check

If MongoDB is not installed yet:
1. Download MongoDB Community Server from the official MongoDB download page.
2. During setup, choose the option to install MongoDB as a Windows service.
3. Open PowerShell and run `Get-Service MongoDB`.
4. If the service is stopped, run `Start-Service MongoDB`.
5. Confirm the backend can reach `mongodb://localhost:27017/reddropai` after the service starts.

---

## 🌤️ Step 4: Set Up Cloudinary (File Uploads)

1. Create free account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → copy Cloud Name, API Key, API Secret
3. Add to `backend/.env`

---

## 📧 Step 5: Set Up Email (Gmail SMTP)

1. Go to your Google Account → Security
2. Enable 2-Factor Authentication
3. Go to **App Passwords** → Generate a password for "Mail"
4. Use this 16-character password as `SMTP_PASS` in `.env`

---

## 🚀 Step 6: Run the Application

### Start Backend
```bash
cd backend
npm run dev
# ✅ Server at http://localhost:5000
# ✅ MongoDB connected
# ✅ Socket.io initialized
```

### Start Frontend
```bash
cd frontend
npx expo start
```

Then:
- Press `a` → Android emulator
- Press `i` → iOS simulator (Mac only)
- Scan QR code → Expo Go app on your phone

---

## 📱 Step 7: Run on Android Emulator

### Install Android Studio
1. Download from [developer.android.com/studio](https://developer.android.com/studio)
2. Install with default settings
3. Open AVD Manager → Create Virtual Device
4. Select Pixel 7 Pro → API 34 (Android 14)
5. Start the emulator

### Then in terminal:
```bash
cd frontend
npx expo start --android
```

---

## 🔑 Step 8: Google Maps API Key

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API
   - Places API
3. Create credentials → API Key
4. Add to `frontend/.env` as `EXPO_PUBLIC_GOOGLE_MAPS_KEY`
5. Also add to `frontend/app.json` under `android.config.googleMaps.apiKey`

---

## 🧪 Step 9: Test APIs with Postman

1. Install [Postman](https://www.postman.com/downloads/)
2. Create a new collection: "Red Drop AI"
3. Set base URL variable: `http://localhost:5000/api`

### Test endpoints:
```
POST /api/auth/register
Body: {
  "name": "Test User",
  "email": "test@gmail.com",
  "phone": "9876543210",
  "password": "Test@1234",
  "role": "donor",
  "bloodGroup": "O+"
}

POST /api/auth/login
Body: { "email": "test@gmail.com", "password": "Test@1234" }

GET /api/donors/nearby?latitude=28.6139&longitude=77.2090&bloodGroup=O+
Authorization: Bearer YOUR_TOKEN

POST /api/requests
Authorization: Bearer YOUR_TOKEN
Body: {
  "patientName": "John Doe",
  "bloodGroup": "O+",
  "unitsRequired": 2,
  "emergencyLevel": "critical",
  "hospital": { "name": "AIIMS", "city": "New Delhi" }
}
```

---

## 📦 Step 10: Generate APK

### Option A: Expo Classic Build
```bash
cd frontend
npx expo build:android
# Follow prompts, wait ~10 minutes
# Download APK from Expo dashboard
```

### Option B: EAS Build (Recommended)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
# APK download link provided when done
```

### Option C: Local Build (Needs Android Studio)
```bash
npx expo run:android
# This creates a local debug APK in android/app/build/outputs/apk/
```

---

## 📤 Step 11: Share APK Without Play Store

```bash
# After build, download the APK file
# Share it via:
```

1. **WhatsApp / Telegram** — Send the .apk file directly
2. **Google Drive** — Upload and share link
3. **Firebase App Distribution** — Professional beta testing
4. **Direct install** — Receiver needs "Install from unknown sources" enabled:
   - Settings → Security → Unknown Sources → Enable

---

## 🌐 Step 12: Deploy Backend Online

### Railway (Recommended — Free tier)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
# Set environment variables in Railway dashboard
```

### Render (Free tier)
1. Push backend to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo → Set build command: `npm install`
4. Set start command: `node server.js`
5. Add all `.env` variables in the dashboard

### Heroku
```bash
heroku create reddropai-backend
heroku config:set MONGODB_URI=... JWT_SECRET=... (all env vars)
git push heroku main
```

### Update Frontend API URL
After deploying, update `frontend/.env`:
```env
EXPO_PUBLIC_API_URL=https://your-app.railway.app/api
EXPO_PUBLIC_SOCKET_URL=https://your-app.railway.app
```

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `Cannot connect to MongoDB` | Check MONGODB_URI, whitelist your IP in Atlas |
| `Network request failed` | Use PC IP not `localhost` in frontend .env |
| `Maps not loading` | Add Google Maps API key in app.json + .env |
| `OTP not received` | Check Gmail app password, check spam folder |
| `Expo can't find module` | Run `npm install` again in frontend/ |
| `Socket not connecting` | Ensure backend is running, check SOCKET_URL |
| `bcrypt error on Windows` | Run `npm install bcryptjs` (pure JS version) |

---

## 🎯 Project Structure Summary

```
RedDropAI/
├── backend/
│   ├── server.js              ← Entry point
│   ├── config/
│   │   ├── database.js        ← MongoDB connection
│   │   └── socket.js          ← Socket.io setup
│   ├── controllers/
│   │   ├── auth.controller.js ← Register, Login, OTP
│   │   ├── donor.controller.js← Nearby search, DSA
│   │   └── request.controller.js ← Blood requests + AI
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Donor.model.js
│   │   ├── BloodRequest.model.js
│   │   └── Notification.model.js
│   ├── services/
│   │   ├── aiVerification.service.js ← Fake detection
│   │   ├── email.service.js
│   │   └── notification.service.js
│   └── utils/
│       └── dsa.utils.js       ← Heap, Graph, Trie, etc.
│
├── frontend/
│   ├── App.js                 ← Root entry
│   ├── src/
│   │   ├── api/client.js      ← Axios + all API calls
│   │   ├── context/AuthContext.js ← Auth state
│   │   ├── navigation/AppNavigator.js
│   │   ├── screens/
│   │   │   ├── auth/          ← Login, Register, OTP
│   │   │   ├── donor/         ← DonorProfile
│   │   │   ├── patient/       ← CreateRequest
│   │   │   └── shared/        ← Home, Track, Map, etc.
│   │   ├── components/common/ ← Button, Card, Input...
│   │   ├── hooks/             ← useLocation, useNotifications
│   │   ├── services/          ← socket.service.js
│   │   └── utils/theme.js     ← Design tokens
│
└── docs/
    └── DSA_EXPLAINED.md       ← Interview prep guide
```

---

## 💡 Interview Talking Points

1. **MERN + React Native** — Full-stack mobile development
2. **JWT Auth** — Secure stateless authentication with bcrypt
3. **Real-time** — Socket.io for live donor tracking
4. **Geospatial** — MongoDB 2dsphere index for donor search
5. **DSA** — MinHeap, Dijkstra, Trie, Priority Queue (see docs/DSA_EXPLAINED.md)
6. **AI/ML** — Heuristic fake detection with confidence scoring
7. **Scalability** — Rate limiting, compression, modular architecture
8. **UX** — Reanimated 2 animations, skeleton loading, offline-aware
