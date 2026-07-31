# 🩸 RedDrop AI V2 — Modular Frontend & Backend Development Roadmap (Phases 8 & 9)

> **Role:** Principal Software Engineer & Lead Full-Stack Architect  
> **Status:** Phases 8 & 9 Complete  
> **Execution Strategy:** Feature-by-Feature Concurrent Module Implementation  

---

## Modular Implementation Sequence

Execution proceeds feature-by-feature across both frontend and backend layers:

```
[ Module 1: Auth & User Security ] ──> [ Module 2: Donor & Geospatial Search ] ──> [ Module 3: Request & Live Tracking ]
                                                                                               │
┌──────────────────────────────────────────────────────────────────────────────────────────────┘
▼
[ Module 4: Hospital & Blood Bank ] ──> [ Module 5: Camps & Volunteers ] ──> [ Module 6: Certificates & AI Engine ]
```

---

## Feature Modules Breakdown

### Module 1: Authentication & User Security
- **Frontend Tasks:** `LoginScreen`, `RegisterScreen` (3-step wizard), `OTPVerificationScreen`, `PasswordScreens`, `AuthContext` token persistence.
- **Backend Tasks:** `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-otp`, `/api/auth/resend-otp`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/me`.
- **Database Tables:** `users`, `user_profiles`, `user_roles`, `roles`, `otp_logs`.
- **Validation:** SHA-256 hashed OTPs, bcrypt password hashing, 7-day JWT generation.

### Module 2: Donor & Geospatial Matching Engine
- **Frontend Tasks:** `NearbyDonorsScreen` (Google Maps + dark styling + Haversine calculations + blood group chips + direct dial action).
- **Backend Tasks:** `GET /api/donors/nearby`, `GET /api/donors/search`, `PUT /api/donors/availability`, `PUT /api/donors/profile`.
- **Algorithms:** MySQL Haversine geospatial query + Multi-factor donor ranking ($Distance \times 0.5 + ResponseRate \times 0.3 + Recency \times 0.2$).
- **Database Tables:** `donor_profiles`, `user_profiles`.

### Module 3: Request Lifecycle & Live Tracking Engine
- **Frontend Tasks:** `CreateRequestScreen`, `RequestsScreen`, `RequestDetailScreen`, `TrackingScreen` (6-step visual timeline with pulsing active step).
- **Backend Tasks:** `POST /api/requests`, `GET /api/requests`, `GET /api/requests/:id`, `POST /api/requests/:id/respond`, `PATCH /api/requests/:id/status`, `GET /api/tracking/:requestId`.
- **Database Tables:** `blood_requests`, `request_responses`, `request_timelines`.

### Module 4: Hospital & Blood Bank Management
- **Frontend Tasks:** `HospitalDashboardScreen`, `BloodBankCard`, hospital verification badge indicators.
- **Backend Tasks:** `GET /api/v2/hospitals/dashboard`, `PUT /api/v2/hospitals/inventory`, `GET /api/v2/blood-banks`.
- **Database Tables:** `hospital_profiles`, `blood_banks`.

### Module 5: Donation Camps & Volunteer Drives
- **Frontend Tasks:** `CampDiscoveryScreen`, `VolunteerCard`, camp registration modal, QR check-in display.
- **Backend Tasks:** `GET /api/v2/camps`, `POST /api/v2/camps`, `POST /api/v2/camps/:id/register`.
- **Database Tables:** `donation_camps`, `organizations`.

### Module 6: Digital Verified Certificates & AI Health Suite
- **Frontend Tasks:** `CertificatesScreen`, `CertificateCard`, `QRCodeContainer`, AI Health Assistant sheet.
- **Backend Tasks:** `GET /api/v2/certificates/my`, `GET /api/v2/certificates/verify/:certId`, `POST /api/v2/ai/chat`.
- **Services:** `certificate.service.js` (SHA-256 QR generation), `aiAssistant.service.js` (eligibility & blood compatibility matching).
- **Database Tables:** `certificates`, `donation_history`.

---

## Phases 8 & 9 Approval Checklist

- [x] Feature Module Execution Sequence Outlined
- [x] Auth, Donor, Request, Hospital, Camp, Certificate & AI Modules Mapped
- [x] Frontend Screen & Component Assignments Verified
- [x] Backend Controller, Route & Service Mappings Verified
- [x] Database Schema Integration Confirmed
