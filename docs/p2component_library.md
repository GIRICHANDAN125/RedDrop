# 🩸 RedDrop AI V2 — Component Library Architecture (Phase 2)

> **Role:** Lead Mobile Architect & Senior UI/UX Engineer  
> **Status:** Phase 2 Complete (Awaiting User Review & Approval)  
> **Design Target:** Reusable, accessible, 60fps animated component library for Expo/React Native  

---

## Component Architecture Overview

Every component in the V2 system follows strict architectural principles:
- **Zero Ad-Hoc Styling:** All styles pull strictly from `src/utils/theme.js`.
- **Accessibility First:** `accessible={true}`, `accessibilityLabel`, `accessibilityRole`, and minimum $44 \times 44\text{dp}$ touch targets on all interactive controls.
- **Reanimated v3 Physics:** Native-driver animations for taps, entrances, and active states.
- **Strict Data Fallbacks:** Every card component safely renders regardless of backend SQL vs GeoJSON data shapes.

---

## Component Catalog Specifications

### 1. `Button` (`src/components/common/Button.js`)
- **Purpose:** Primary interactive trigger for actions, forms, and emergency dispatches.
- **Props:** `title` (string), `onPress` (func), `variant` (`primary` | `secondary` | `outline` | `ghost` | `danger`), `size` (`sm` | `md` | `lg`), `loading` (bool), `disabled` (bool), `icon` (element), `style` (object).
- **Variants:**
  - `primary`: Crimson gradient / fill (`#E63946`).
  - `secondary`: Glass background (`rgba(255,255,255,0.08)`).
  - `danger`: Critical alert fill (`#FF0040`).
- **Behavior:** Press scale down (`transform: [{ scale: 0.97 }]`), disables press when `loading` or `disabled`.
- **Accessibility:** `accessibilityRole="button"`, `accessibilityState={{ disabled, busy: loading }}`.
- **Animation:** Spring press feedback via Reanimated `useSharedValue`.

---

### 2. `Input` (`src/components/common/Input.js`)
- **Purpose:** Text entry control with label, left icon slot, clear button, and error message label.
- **Props:** `label` (string), `value` (string), `onChangeText` (func), `placeholder` (string), `error` (string), `icon` (element), `secureTextEntry` (bool), `keyboardType` (string).
- **Variants:** Standard dark input (`bgCard`), Error focused state (red border glow).
- **Behavior:** Focus border turns `Colors.primary`; toggle password visibility icon when `secureTextEntry` is true.
- **Accessibility:** `accessibilityLabel={label}`, `accessibilityHint={error || placeholder}`.

---

### 3. `Card` (`src/components/common/Card.js`)
- **Purpose:** Glassmorphism surface container for cards, lists, and form sections.
- **Props:** `children` (node), `variant` (`default` | `primary` | `success` | `warning` | `danger`), `glow` (bool), `onPress` (func), `style` (object).
- **Variants:** Glass translucent background (`rgba(255,255,255,0.04)`), primary glow border.
- **Animation:** `FadeInDown.duration(300)` on mount.

---

### 4. `SearchBar` (`src/components/common/SearchBar.js`)
- **Purpose:** Search input with instant filter feedback and clear button.
- **Props:** `value` (string), `onChangeText` (func), `onClear` (func), `placeholder` (string).
- **Behavior:** Renders search glass icon, instant text input, clear `✕` button appears when text length $> 0$.
- **Folder Location:** `src/components/common/SearchBar.js`.

---

### 5. `BottomSheet` (`src/components/common/BottomSheet.js`)
- **Purpose:** Modal tray sliding from screen bottom for contextual filters, actions, or details.
- **Props:** `visible` (bool), `onClose` (func), `title` (string), `children` (node), `snapPoints` (array).
- **Behavior:** Backdrop tap closes sheet; spring drag-down gesture dismisses.
- **Animation:** `withSpring` enter from bottom `translateY`.
- **Folder Location:** `src/components/common/BottomSheet.js`.

---

### 6. `ModalDialog` (`src/components/common/ModalDialog.js`)
- **Purpose:** Centered confirmation dialog for critical user prompts (e.g., Accept Donation, Cancel Request).
- **Props:** `visible` (bool), `title` (string), `message` (string), `confirmText` (string), `cancelText` (string), `onConfirm` (func), `onCancel` (func), `type` (`info` | `danger` | `success`).
- **Folder Location:** `src/components/common/ModalDialog.js`.

---

### 7. `MapViewContainer` (`src/components/map/MapViewContainer.js`)
- **Purpose:** Dark-themed Google Maps container wrapper with user position circle and error fallback.
- **Props:** `location` (object), `children` (node), `mapRef` (ref), `radius` (number).
- **Behavior:** Automatically animates to user position when location updates.
- **Folder Location:** `src/components/map/MapViewContainer.js`.

---

### 8. `CustomMapPin` (`src/components/map/CustomMapPin.js`)
- **Purpose:** Custom interactive map marker for Donors, Hospitals, Blood Banks, and Camps.
- **Props:** `type` (`donor` | `hospital` | `blood_bank` | `camp`), `bloodGroup` (string), `title` (string), `onPress` (func).
- **Variants:** Color-coded pin border matching donor blood group or emergency type.
- **Folder Location:** `src/components/map/CustomMapPin.js`.

---

### 9. `EmergencyCard` (`src/components/cards/EmergencyCard.js`)
- **Purpose:** High-priority card rendering emergency blood requests on Home and Request feeds.
- **Props:** `request` (object), `onPress` (func), `onRespond` (func).
- **Features:** Emergency badge (`CRITICAL`, `HIGH`), patient name, hospital, units needed, time ago tag, and blood group badge.
- **Folder Location:** `src/components/cards/EmergencyCard.js`.

---

### 10. `DonorCard` (`src/components/cards/DonorCard.js`)
- **Purpose:** Card component rendering donor search results in map and list views.
- **Props:** `donor` (object), `onContact` (func), `onDismiss` (func).
- **Features:** Normalizes both flat SQL (`donor.name`) and nested (`donor.user.name`) data models. Direct call action button (`tel:`).
- **Folder Location:** `src/components/cards/DonorCard.js`.

---

### 11. `HospitalCard` (`src/components/cards/HospitalCard.js`)
- **Purpose:** Displays hospital details, verified status badge, distance, and direct call/maps buttons.
- **Props:** `hospital` (object), `onPress` (func), `onCall` (func).
- **Folder Location:** `src/components/cards/HospitalCard.js`.

---

### 12. `BloodBankCard` (`src/components/cards/BloodBankCard.js`)
- **Purpose:** Renders blood bank details alongside real-time available blood unit stock indicators.
- **Props:** `bloodBank` (object), `onPress` (func).
- **Folder Location:** `src/components/cards/BloodBankCard.js`.

---

### 13. `VolunteerCard` (`src/components/cards/VolunteerCard.js`)
- **Purpose:** Displays volunteer credentials, camp contribution stats, and verified status.
- **Props:** `volunteer` (object).
- **Folder Location:** `src/components/cards/VolunteerCard.js`.

---

### 14. `StatusTimeline` (`src/components/tracking/StatusTimeline.js`)
- **Purpose:** 6-Step visual progress tracker for blood request fulfillment journey.
- **Props:** `currentStep` (string), `steps` (array), `activityLog` (array).
- **Features:** Pulsing active step dot (`useSharedValue` scale animation), completed checkmark icons, connecting timeline lines.
- **Folder Location:** `src/components/tracking/StatusTimeline.js`.

---

### 15. `CertificateCard` (`src/components/cards/CertificateCard.js`)
- **Purpose:** Displays digital donation certificate with QR code preview, donor details, and download button.
- **Props:** `certificate` (object), `onShare` (func), `onDownload` (func).
- **Folder Location:** `src/components/cards/CertificateCard.js`.

---

### 16. `NotificationCard` (`src/components/cards/NotificationCard.js`)
- **Purpose:** In-app notification list item with priority icon, title, timestamp, and unread dot.
- **Props:** `notification` (object), `onPress` (func).
- **Folder Location:** `src/components/cards/NotificationCard.js`.

---

### 17. `StatCard` (`src/components/cards/StatCard.js`)
- **Purpose:** Dashboard metric card showing single metric value, icon, and label.
- **Props:** `icon` (string), `value` (string | number), `label` (string), `color` (string).
- **Folder Location:** `src/components/cards/StatCard.js`.

---

### 18. `Avatar` (`src/components/common/Avatar.js`)
- **Purpose:** Circular user photo or initial fallback container with verification badge overlay option.
- **Props:** `url` (string), `name` (string), `size` (`sm` | `md` | `lg` | `xl`), `isVerified` (bool).
- **Folder Location:** `src/components/common/Avatar.js`.

---

### 19. `BloodGroupBadge` (`src/components/common/BloodGroupBadge.js`)
- **Purpose:** Color-coded blood type indicator badge.
- **Props:** `group` (string), `size` (`sm` | `md` | `lg` | `xl`).
- **Folder Location:** `src/components/common/BloodGroupBadge.js`.

---

### 20. `AchievementBadge` (`src/components/common/AchievementBadge.js`)
- **Purpose:** Gamification badge awarded to donors (e.g., "Life Saver I", "10 Donations").
- **Props:** `badge` (object), `unlocked` (bool).
- **Folder Location:** `src/components/common/AchievementBadge.js`.

---

### 21. `ProgressRing` (`src/components/common/ProgressRing.js`)
- **Purpose:** Circular SVG/Reanimated progress indicator for camp blood collection targets or donor goals.
- **Props:** `progress` (number 0-1), `size` (number), `strokeWidth` (number), `color` (string).
- **Folder Location:** `src/components/common/ProgressRing.js`.

---

### 22. `FilterChip` (`src/components/common/FilterChip.js`)
- **Purpose:** Selectable horizontal filter tag (e.g., Blood Groups `A+`, `O-`, Distance `5km`).
- **Props:** `label` (string), `selected` (bool), `onPress` (func).
- **Folder Location:** `src/components/common/FilterChip.js`.

---

### 23. `FAB` (`src/components/common/FAB.js`)
- **Purpose:** Floating Action Button for central emergency blood request creation.
- **Props:** `icon` (string), `onPress` (func), `label` (string).
- **Behavior:** Floating shadow, pulse animation on critical alert.
- **Folder Location:** `src/components/common/FAB.js`.

---

### 24. `QRCodeContainer` (`src/components/common/QRCodeContainer.js`)
- **Purpose:** Renders QR code representation of cryptographic verification hashes for certificates and volunteer camp check-ins.
- **Props:** `value` (string), `size` (number).
- **Folder Location:** `src/components/common/QRCodeContainer.js`.

---

## Phase 2 Architecture Review, Risks & Approval

### Architecture Review
The Component Library establishes 24 modular, reusable UI building blocks. Each component enforces WCAG 2.1 accessibility, Reanimated v3 motion standards, and safe data normalization fallbacks.

### Identified Risks & Mitigation

| Risk | Mitigation |
|---|---|
| Large list re-render bottlenecks | Pure memoized functional components (`React.memo`) |
| Data shape inconsistencies across backend versions | Integrated fallback prop getters (`donor.name \|\| donor.user?.name`) |
| Android shadow rendering inconsistencies | Dual shadow definition using `shadow*` props for iOS and `elevation` for Android |

### Improvements Added in Phase 2
- Added `BloodBankCard` and `VolunteerCard` specifications for multi-stakeholder ecosystem.
- Created `StatusTimeline` with live Reanimated pulsing active indicator physics.

---

## Phase 2 Approval Checklist

- [x] Core Action Controls (`Button`, `Input`, `Card`, `SearchBar`) Defined
- [x] Overlays & Trays (`BottomSheet`, `ModalDialog`) Standardized
- [x] Map Components (`MapViewContainer`, `CustomMapPin`) Specified
- [x] Card Ecosystem (`EmergencyCard`, `DonorCard`, `HospitalCard`, `BloodBankCard`, `VolunteerCard`, `CertificateCard`, `NotificationCard`, `StatCard`) Specified
- [x] Display Badges & Avatar (`Avatar`, `BloodGroupBadge`, `AchievementBadge`, `ProgressRing`, `FilterChip`, `FAB`, `QRCodeContainer`) Specified
- [x] Component Accessibility & Props Documented
- [x] Architecture Review & Risk Audit Completed

*Phase 2 is complete and ready for review. Pending approval to proceed to Phase 3 (Database Freeze & Schema Review).*
