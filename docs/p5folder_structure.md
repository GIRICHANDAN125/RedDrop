# 🩸 RedDrop AI V2 — Folder Structure Architecture Specification (Phase 5)

> **Role:** Lead Architect & Principal Software Engineer  
> **Status:** Phase 5 Complete (Awaiting User Review & Approval)  
> **Structure Target:** Enterprise Scalable Directory Layout for Mobile Frontend & Node Backend  

---

## 1. Directory Structure Overview

The RedDrop AI V2 codebase organizes concerns into distinct architectural boundaries:
- **Frontend (`frontend/`):** Feature-first modular organization combined with a shared `components/` design system library.
- **Backend (`backend/`):** Layered architecture separating HTTP routing (`routes/`), input validation (`validators/`), DTO input mapping (`dtos/`), request controllers (`controllers/`), business logic services (`services/`), response formatting (`mappers/`), and SQL data access (`repositories/`).

---

## 2. Mobile Frontend Directory Architecture (`frontend/`)

```
frontend/
├── App.js                         # Application Root Entry Point
├── app.json                       # Expo Project Configuration
├── babel.config.js                # Babel Configuration (Reanimated plugin)
├── package.json                   # Frontend Dependencies & Scripts
├── .env                           # Environment Variables (API URL, Socket URL, Maps Key)
├── scripts/                       # Native build & fix scripts
│   └── fix-expo-externals.js
└── src/
    ├── api/                       # API Services & Axios Interceptors
    │   ├── client.js              # Base Axios Instance & Global Interceptors
    │   ├── auth.api.js            # Auth Endpoints API
    │   ├── camp.api.js            # Camps & Drives API
    │   ├── certificate.api.js     # Certificates API
    │   ├── donor.api.js           # Donor Management API
    │   ├── notification.api.js    # Notification API
    │   └── request.api.js         # Blood Requests API
    ├── assets/                    # Static Assets & Typography
    │   ├── fonts/                 # Google Fonts (Sora, DM Sans, Space Mono)
    │   ├── icons/                 # SVG & Custom Icon Assets
    │   └── images/                # Logos & Splash Assets
    ├── components/                # Phase 2 UI Component Library
    │   ├── cards/                 # EmergencyCard, DonorCard, HospitalCard, CertificateCard
    │   ├── common/                # Button, Input, Card, BloodGroupBadge, Avatar, FAB
    │   ├── forms/                 # Form Fields & Step Components
    │   ├── map/                   # MapViewContainer, CustomMapPin
    │   ├── modals/                # BottomSheet, ModalDialog
    │   └── tracking/              # StatusTimeline
    ├── config/                    # Frontend Constants & Setup
    │   └── constants.js
    ├── context/                   # React Context Providers
    │   ├── AuthContext.js         # Authentication State & SecureStore Sync
    │   └── ThemeContext.js        # Theme Token Provider
    ├── features/                  # Domain Feature Modules
    │   ├── ai/                    # AI Health Assistant Feature
    │   ├── auth/                  # Authentication & Onboarding
    │   ├── camps/                 # Blood Donation Camps
    │   ├── certificates/          # Digital Certificates & QR Scanner
    │   ├── community/             # Stories & Leaderboards
    │   ├── donors/                # Donor Search & Map
    │   ├── hospital/              # Hospital Dashboard & Inventory
    │   └── requests/              # Blood Requests & Tracking
    ├── hooks/                     # Custom React Hooks
    │   ├── useAuth.js
    │   ├── useLocation.js         # GPS Location & Haversine Distance
    │   ├── useNotifications.js    # Socket.IO Listener Hook
    │   └── useSocket.js           # Raw Socket Event Hook
    ├── navigation/                # React Navigation Architecture
    │   ├── AppNavigator.js        # Root Stack & Authentication Gate
    │   ├── AuthNavigator.js       # Login, Register, OTP Stack
    │   ├── TabNavigator.js        # Main 5-Tab Navigation Bar
    │   └── routes.js              # Route Name Constants
    ├── screens/                   # View Screen Files
    │   ├── auth/                  # LoginScreen, RegisterScreen, OTPVerificationScreen
    │   ├── donor/                 # DonorProfileScreen
    │   ├── hospital/              # HospitalDashboardScreen
    │   ├── patient/               # CreateRequestScreen
    │   └── shared/                # HomeScreen, NearbyDonorsScreen, TrackingScreen, ProfileScreen
    ├── services/                  # Client-side Service Handlers
    │   ├── location.service.js
    │   ├── notification.service.js
    │   └── socket.service.js      # Singleton Socket.IO Client
    └── utils/                     # Utility Functions & Design Tokens
        ├── formatters.js          # Date, Phone, Distance Formatters
        ├── theme.js               # Enterprise Design System Tokens
        └── validators.js          # Regex & Form Validation Utilities
```

---

## 3. Server Backend Directory Architecture (`backend/`)

```
backend/
├── server.js                      # Express HTTP & Socket.IO Server Entry Point
├── package.json                   # Server Dependencies & Scripts
├── .env.example                   # Template Environment File
├── config/                        # Service Initializers
│   ├── aws.js                     # AWS S3 Client & Signed URLs
│   ├── database.js                # MySQL `mysql2/promise` Connection Pool
│   ├── redis.js                   # Redis Client Configuration
│   └── socket.js                  # Socket.IO Handshake & Room Manager
├── controllers/                   # Express HTTP Request Handlers
│   ├── auth.controller.js         # Auth Handlers
│   ├── camp.controller.js         # Donation Camp Handlers
│   ├── certificate.controller.js  # Certificate Handlers
│   ├── donor.controller.js        # Donor Search & Profile Handlers
│   ├── hospital.controller.js     # Hospital Management Handlers
│   ├── notification.controller.js # Notification Handlers
│   ├── request.controller.js      # Blood Request Lifecycle Handlers
│   └── user.controller.js         # User Account & Role Handlers
├── database/                      # SQL Schemas & Seeders
│   ├── schema_v1.sql              # Legacy V1 Schema
│   ├── schema_v2.sql              # Frozen V2 Normalized Schema
│   └── seeders/                   # Initial Database Seeders
├── dtos/                          # Data Transfer Objects (Input Contracts)
│   ├── auth.dto.js
│   ├── camp.dto.js
│   ├── donor.dto.js
│   └── request.dto.js
├── mappers/                       # Response Serialization Mappers
│   ├── donor.mapper.js
│   ├── request.mapper.js
│   └── user.mapper.js
├── middleware/                    # Express Middleware Functions
│   ├── auth.middleware.js         # `authenticate`, `authorize`, `optionalAuth`
│   ├── error.middleware.js        # Global RFC 7807 Error Handler
│   ├── logger.middleware.js       # HTTP Logging Middleware
│   ├── rateLimit.middleware.js    # Express Rate Limiter
│   ├── upload.js                  # Multer-S3 Upload Middleware
│   └── validate.middleware.js     # express-validator Execution Guard
├── repositories/                  # Data Access Layer (Repository Pattern)
│   ├── base.repository.js         # Base Repository Abstraction
│   ├── bloodBank.repository.js
│   ├── camp.repository.js
│   ├── certificate.repository.js
│   ├── donor.repository.js
│   ├── hospital.repository.js
│   ├── notification.repository.js
│   ├── otp.repository.js
│   ├── patient.repository.js
│   ├── request.repository.js
│   ├── response.repository.js
│   ├── role.repository.js
│   ├── timeline.repository.js
│   └── user.repository.js
├── routes/                        # API Route Registers
│   ├── v1/                        # Backward Compatible V1 Routes
│   └── v2/                        # V2 Namespace Routes
│       ├── auth.routes.js
│       ├── camp.routes.js
│       ├── certificate.routes.js
│       ├── donor.routes.js
│       ├── hospital.routes.js
│       ├── notification.routes.js
│       ├── request.routes.js
│       └── user.routes.js
├── services/                      # Domain Business Logic Services
│   ├── aiAssistant.service.js     # AI Health Advisory Engine
│   ├── aiVerification.service.js  # Request Fraud Detection Engine
│   ├── camp.service.js            # Blood Drive Management Service
│   ├── certificate.service.js     # QR & PDF Certificate Service
│   ├── email.service.js           # Nodemailer SMTP Service
│   ├── notification.service.js    # Dispatch & Room Emit Service
│   └── queue.service.js           # Background Worker Queue Service
├── utils/                         # Utilities & DSA Algorithms
│   ├── dsa.utils.js               # MinHeap, Dijkstra, Trie, Priority Queue
│   ├── logger.js                  # Structured Console & File Logger
│   └── response.js                # Response Envelope Formatter
├── validators/                    # Input Validation Schemas
│   ├── auth.validator.js
│   ├── camp.validator.js
│   ├── donor.validator.js
│   └── request.validator.js
└── queue/                         # Background Workers
    ├── email.worker.js
    └── notification.worker.js
```

---

## Phase 5 Architecture Review, Risks & Approval

### Architecture Review
The proposed folder architecture separates concerns strictly. On the mobile client, shared design system components (`components/`) coexist with domain feature modules (`features/`). On the server, requests flow in an explicit sequence: Route → Middleware → Validator → Controller → Service → Repository → Database → Mapper → Response.

### Identified Risks & Mitigation

| Risk | Mitigation |
|---|---|
| Deep nested import paths (`../../../../components`) | TypeScript / Babel module path aliases (`@components/*`, `@services/*`, `@theme/*`) |
| Uncontrolled repository calls directly from routes | Strict enforcement requiring all database reads/writes to pass through Services & Repositories |

---

## Phase 5 Approval Checklist

- [x] Mobile Frontend Folder Hierarchy (`frontend/src/`) Mapped
- [x] Enterprise Server Directory Structure (`backend/`) Mapped
- [x] Feature Module Isolation Strategy Established
- [x] Layer Boundaries (DTOs, Mappers, Services, Repositories) Defined
- [x] Babel Module Path Aliases Specified
- [x] Architecture Review & Risk Audit Completed

*Phase 5 is complete and ready for review. Pending approval to proceed to Phase 6 (Backend Cleanup & Infrastructure Services).*
