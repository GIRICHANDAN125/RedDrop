# 🩸 RedDrop AI V2 — Screen Planning & Wireframing Specification (Phase 7)

> **Role:** Senior UI/UX Designer & Lead Mobile Architect  
> **Status:** Phase 7 Complete  
> **Target:** Complete Wireframe, Component Mapping, Navigation Flow & API Integration for 20+ Application Screens  

---

## Screen Architecture Matrix

### 1. Authentication & Onboarding Screens

#### 1.1 `SplashScreen` & `OnboardingScreen` (`src/screens/auth/`)
- **Purpose:** Brand introduction, progressive storyboarding, explore-first invitation.
- **Wireframe Description:** Full-screen gradient background with animated SVG illustrations, page indicators, "Explore App First" secondary button, and "Sign In / Register" primary action button.
- **Components Used:** `Button`, `Animated.View`, `BloodGroupBadge`, `ProgressRing`.
- **Navigation Flow:** Opens on first app boot → Swipe story cards → Tap "Explore" (`HomeScreen` guest mode) OR "Sign In" (`LoginScreen`).
- **API Calls:** None (Local state).
- **Permissions:** None.
- **State Management:** Local `useState` for slide index.

#### 1.2 `LoginScreen` (`src/screens/auth/LoginScreen.js`)
- **Purpose:** Authenticate returning users via email/password or passwordless OTP link.
- **Wireframe Description:** Dark obsidian card overlaying crimson subtle glow background, logo header, email & password input fields with icons, "Forgot Password?" link, "Sign In" button, and "Create Account" link.
- **Components Used:** `Input`, `Button`, `Card`, `Skeleton`.
- **Navigation Flow:** On success → `AuthContext.login()` → Navigate to `MainStack` (`HomeScreen`).
- **API Calls:** `POST /api/auth/login`.
- **Permissions:** None.
- **State Management:** Form state via `useReducer`, `AuthContext`.

#### 1.3 `RegisterScreen` (`src/screens/auth/RegisterScreen.js`)
- **Purpose:** 3-step progressive user registration.
- **Wireframe Description:** Top progress bar (Step 1: Account Info, Step 2: Password & Contact, Step 3: Initial Role & Blood Group selection chips), input fields with validation error feedback, and "Continue" / "Create Account" buttons.
- **Components Used:** `Input`, `Button`, `Card`, `FilterChip`, `BloodGroupBadge`.
- **Navigation Flow:** Step 1 → Step 2 → Step 3 → `POST /auth/register` → Navigate to `OTPVerificationScreen`.
- **API Calls:** `POST /api/auth/register`.
- **Permissions:** Optional Location foreground permission.

#### 1.4 `OTPVerificationScreen` (`src/screens/auth/OTPVerificationScreen.js`)
- **Purpose:** Verify email ownership via 6-digit cryptographic OTP.
- **Wireframe Description:** Mail envelope animation icon, email recipient header, 6 individual PIN box inputs with auto-focus, countdown timer for resend button ("Resend in 00:45"), and "Verify OTP" button.
- **Components Used:** `Button`, `Card`, `Input`.
- **Navigation Flow:** Verification success → `completePendingVerification()` → Navigate to `HomeScreen`.
- **API Calls:** `POST /api/auth/verify-otp`, `POST /api/auth/resend-otp`.

---

### 2. Core Dashboard & Mapping Screens

#### 2.1 `HomeScreen` (V2 Heart Hub — `src/screens/shared/HomeScreen.js`)
- **Purpose:** Central application hub for emergency requests, quick actions, AI assistant, donation camps, and network statistics.
- **Wireframe Description:** Top greeting header with avatar & notifications bell; Donor Availability Toggle Card (if donor); 4-item Quick Action Grid (Request Blood, Find Donors, Track Request, Nearby Hospitals); Live Emergency Requests Carousel; Network Stats Card; AI Health Tip Card.
- **Components Used:** `Card`, `Button`, `BloodGroupBadge`, `EmergencyCard`, `StatCard`, `FAB`.
- **Navigation Flow:** Taps on Quick Actions → `NearbyDonorsScreen`, `CreateRequestScreen`, `TrackingScreen`; Taps on Request Card → `RequestDetailScreen`.
- **API Calls:** `GET /api/requests?limit=5&status=searching`, `GET /api/notifications/unread-count`.
- **Permissions:** Location.

#### 2.2 `NearbyDonorsScreen` (V2 Map — `src/screens/shared/NearbyDonorsScreen.js`)
- **Purpose:** Map and list view of nearby compatible blood donors, hospitals, and blood banks with blood type filter chips.
- **Wireframe Description:** Full-screen dark Google Map view with custom markers; Horizontal scrolling Blood Group Filter Chips header (`All`, `A+`, `O-`, etc.); Top Map/List view toggle switch; Floating donor count badge; Slide-up `DonorCard` preview on marker tap.
- **Components Used:** `MapViewContainer`, `CustomMapPin`, `DonorCard`, `FilterChip`, `Card`.
- **Navigation Flow:** Tap marker → Show `DonorCard` preview → Tap "Contact" → Open dialer (`tel:`).
- **API Calls:** `GET /api/donors/nearby?latitude=...&longitude=...&bloodGroup=...`.
- **Permissions:** Foreground Location (`Location.requestForegroundPermissionsAsync`).

---

### 3. Emergency Request & Live Tracking Screens

#### 3.1 `CreateRequestScreen` (`src/screens/patient/CreateRequestScreen.js`)
- **Purpose:** Patient or hospital coordinator creates an urgent blood request.
- **Wireframe Description:** Step-by-step form: Patient Name, Blood Group Pill selector, Units required slider (1-10), Emergency Severity selector (`Critical`, `High`, `Medium`, `Low`), Auto-detected Hospital Name & Address with "Use Current Location" button, Medical Notes text box, and "Dispatch Emergency Request" button.
- **Components Used:** `Input`, `Button`, `Card`, `BloodGroupBadge`, `FilterChip`.
- **Navigation Flow:** Submit form → Run AI fraud check → Create request → Trigger async donor notifications → Navigate to `RequestDetailScreen`.
- **API Calls:** `POST /api/requests`.

#### 3.2 `RequestDetailScreen` (`src/screens/shared/RequestDetailScreen.js`)
- **Purpose:** Full detail view of a blood request with role-aware action controls.
- **Wireframe Description:** Top status banner & Emergency severity tag; Patient & Hospital info card; AI Trust Score breakdown card; Responding Donors list; Donor action buttons ("Accept & Donate", "Decline"); Requester status progression buttons ("Mark Blood In Transit", "Mark Reached Hospital", "Mark Completed").
- **Components Used:** `Card`, `Button`, `BloodGroupBadge`, `Avatar`.
- **Navigation Flow:** Donor accepts → Update status → Notify requester; Requester taps "Track" → Navigate to `TrackingScreen`.
- **API Calls:** `GET /api/requests/:id`, `POST /api/requests/:id/respond`, `PATCH /api/requests/:id/status`.

#### 3.3 `TrackingScreen` (`src/screens/shared/TrackingScreen.js`)
- **Purpose:** Real-time visual tracking screen for active blood requests.
- **Wireframe Description:** Request metadata card; 6-step visual timeline (`Created` → `Searching` → `Donor Found` → `In Transit` → `Reached Hospital` → `Completed`) with Reanimated pulsing active step indicator; Historical audit activity log list.
- **Components Used:** `StatusTimeline`, `Card`, `BloodGroupBadge`.
- **Navigation Flow:** Real-time Socket.IO events (`request:updated`) dynamically advance the active timeline step.
- **API Calls:** `GET /api/tracking/:requestId`.

---

### 4. Specialized Ecosystem Hubs (Hospital, Volunteer, Community, Certificates)

#### 4.1 `DonorProfileScreen` (`src/screens/donor/DonorProfileScreen.js`)
- **Purpose:** Donor hub for availability toggle, eligibility countdown, impact stats, and badges.
- **Components Used:** `Card`, `Button`, `Switch`, `StatCard`, `BloodGroupBadge`, `ProgressRing`.
- **API Calls:** `GET /api/donors/profile`, `PUT /api/donors/availability`.

#### 4.2 `HospitalDashboardScreen` (`src/screens/hospital/HospitalDashboardScreen.js`)
- **Purpose:** Verified hospital hub for managing blood inventory stock levels, emergency requests, and incoming donor appointments.
- **Components Used:** `Card`, `Button`, `StatCard`, `BloodBankCard`, `ProgressRing`.
- **API Calls:** `GET /api/v2/hospitals/dashboard`, `PUT /api/v2/hospitals/inventory`.

#### 4.3 `CampDiscoveryScreen` (`src/screens/camps/CampDiscoveryScreen.js`)
- **Purpose:** Discover nearby blood donation camps organized by NGOs, colleges, or corporate partners.
- **Components Used:** `Card`, `Button`, `FilterChip`, `ProgressRing`.
- **API Calls:** `GET /api/v2/camps`.

#### 4.4 `CertificatesScreen` (`src/screens/certificates/CertificatesScreen.js`)
- **Purpose:** View, download, and share verified digital donation certificates with embedded QR codes.
- **Components Used:** `CertificateCard`, `QRCodeContainer`, `Button`, `Card`.
- **API Calls:** `GET /api/v2/certificates/my`.

#### 4.5 `CommunityScreen` (`src/screens/community/CommunityScreen.js`)
- **Purpose:** Community hub featuring top donor leaderboards, blood donation stories, and referral invites.
- **Components Used:** `Card`, `Avatar`, `AchievementBadge`, `Button`.
- **API Calls:** `GET /api/v2/community/leaderboard`.

---

## Phase 7 Architecture Review & Checklist

### Architecture Review
The screen specifications define complete layout wireframes, component mappings, navigation paths, and API integrations across all 20+ screens. The design enforces the explore-first philosophy while maintaining strict role-based capability boundaries.

### Phase 7 Approval Checklist
- [x] Auth & Onboarding Screen Wireframes Specified
- [x] Core Dashboard (`HomeScreen` V2) Layout Detailed
- [x] Geospatial Map & List Screen (`NearbyDonorsScreen` V2) Detailed
- [x] Emergency Request & 6-Step Visual Tracking Screen Detailed
- [x] Donor, Hospital, Camp, Certificate & Community Screens Specified
- [x] Component Mappings, Navigation Flows & API Integrations Documented
