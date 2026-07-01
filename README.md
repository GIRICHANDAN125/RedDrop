# Red Drop AI

Emergency blood donor and tracking system built with React Native (Expo), Node.js, Express, MongoDB, Socket.io, Cloudinary, and JWT authentication.

This repository is under active development. The goal of this cleanup is to make the project presentable, secure, and easy to navigate without inventing features that are not yet implemented.

## Project Overview

Red Drop AI is a mobile-first application for coordinating blood requests, donor discovery, request tracking, and authenticated user workflows in real time.

## Features

Implemented in the current codebase:

- Email/password authentication with OTP verification
- Password reset flow through OTP
- Donor discovery by nearby search and text search
- Donor profile management and availability toggling
- Blood request creation, listing, detail views, and status updates
- Request tracking timeline access
- User notifications with read and mark-all-read actions
- Profile updates, avatar uploads, and device token storage
- Socket.io-based realtime client integration
- MongoDB-backed backend with security middleware and health checks

## Tech Stack

| Layer | Technology |
| --- | --- |
| Mobile App | React Native + Expo |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcrypt |
| Realtime | Socket.io |
| Storage | Multer + Cloudinary |
| Email | Nodemailer |
| Maps | Google Maps API |

## Folder Structure

```text
RedDropAI/
├── backend/
├── frontend/
├── docs/
├── assets/
├── .github/
├── .env.example
├── .gitignore
└── LICENSE
```

## Architecture

The frontend and backend are decoupled. The Expo app handles user interaction and calls the Express API over REST. Socket.io is used for realtime updates, while MongoDB persists users, donors, requests, and notifications.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a deeper breakdown.

## Installation

```bash
cd RedDropAI/backend
npm install

cd ../frontend
npm install
```

## Environment Setup

Create local environment files from the committed example:

- `backend/.env`
- `frontend/.env`

The root [`.env.example`](.env.example) contains every variable currently referenced by the codebase.

## Run the Backend

```bash
cd backend
npm run dev
```

The backend defaults to `http://localhost:5000`.

## Run the Frontend

```bash
cd frontend
npx expo start
```

Use Expo Go, an Android emulator, or another supported Expo target.

## API Overview

The active API surface currently includes:

- Authentication and OTP flows
- Donor search and donor profile management
- Blood request management
- Tracking and notification endpoints
- Authenticated user profile and stats endpoints

The current endpoint reference is documented in [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).

## Screenshots

Screenshots have not been added yet. When the UI is ready, place them in a dedicated documentation folder such as `docs/screenshots/` and reference them from this section.

## Current Development Status

This is an active work-in-progress repository.

- Core authentication and request flows are present.
- The mobile app navigation and shared UI are in place.
- `backend/routes/hospital.routes.js` and `backend/routes/report.routes.js` are still placeholders.
- Deployment automation and repository documentation have been added in this pass.

## Roadmap

- Complete hospital and report workflows
- Add automated tests for backend and frontend flows
- Expand API documentation with request/response examples
- Add release assets and screenshots
- Harden production deployment settings

## Contributing

Please read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) before opening a pull request.

## License

Released under the MIT License. See [LICENSE](LICENSE).

## Author

Maintained by the RedDropAI project contributors.

