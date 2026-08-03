# 🩸 RedDrop AI V2 — Enterprise Design System (Phase 1)

> **Role:** Lead Architect & Senior UI/UX Designer  
> **Status:** ✅ Implemented — Phase 1 Complete  
> **Inspired By:** Apple Health, Uber, Airbnb, Revolut, Stripe & Google Material 3  

---

## 1. Brand Identity & Design Philosophy

### Brand Identity
RedDrop AI is a life-critical, emergency healthcare platform. The brand identity balances **Emergency Urgency** with **Calm Professional Trust**. 
- **Voice:** Calm, authoritative, compassionate, instant, and transparent.
- **Visual Tone:** Deep midnight surfaces, crimson glow accents, crisp glassmorphism cards, bold modern typography, and high-contrast accessibility.

### Design Philosophy
1. **Design for Humans, Not Forms:** Every interaction answers *"What does the user want to accomplish right now?"*
2. **Explore-First, Auth-When-Needed:** Users can browse emergency requests, check donor eligibility, search nearby camps, and view compatibility without forced up-front auth barriers.
3. **Calm in Crises:** High contrast during emergency workflows; smooth micro-animations to avoid cognitive overload during stress.
4. **Instant Visual Hierarchy:** Color-coded emergency severity (`critical` red, `high` orange, `medium` yellow, `low` green) and blood type badges.

---

## 2. Color Palette & Theme Engine

### Dark Theme (Primary Default Mode)
- **Background Deep (`bgDark`):** `#0A0A0F` (Midnight Abyss)
- **Card Surface (`bgCard`):** `#13131A` (Obsidian Card)
- **Card Secondary (`bgCardSecondary`):** `#1A1A28` (Elevated Glass Base)
- **Glass Translucent (`glass`):** `rgba(255, 255, 255, 0.04)`
- **Glass Border (`glassBorder`):** `rgba(255, 255, 255, 0.08)`
- **Glass Highlight (`glassStrong`):** `rgba(255, 255, 255, 0.12)`

### Light Theme (Secondary Adaptive Mode)
- **Background Surface (`bgLight`):** `#F8F9FF` (Ice White)
- **Card Surface (`bgCardLight`):** `#FFFFFF` (Pure White)
- **Border Surface (`borderLight`):** `rgba(0, 0, 0, 0.08)`
- **Text Primary (`textLightPrimary`):** `#0A0A0F`
- **Text Secondary (`textLightSecondary`):** `#4A4A6A`

### Brand & Emergency Accents
- **Primary Brand (`primary`):** `#E63946` (Crimson Pulse)
- **Primary Dark (`primaryDark`):** `#C1121F`
- **Primary Light (`primaryLight`):** `#FF6B7A`
- **Primary Glow (`primaryGlow`):** `rgba(230, 57, 70, 0.18)`
- **Critical Urgency:** `#FF0040` | Background: `rgba(255, 0, 64, 0.15)`
- **High Urgency:** `#FF6B35` | Background: `rgba(255, 107, 53, 0.15)`
- **Medium Urgency:** `#FFB703` | Background: `rgba(255, 183, 3, 0.15)`
- **Low Urgency:** `#2DC653` | Background: `rgba(45, 198, 83, 0.15)`

### Blood Group Palette
- **A+**: `#E63946` | **A-**: `#FF6B7A`
- **B+**: `#4361EE` | **B-**: `#4CC9F0`
- **AB+**: `#7209B7` | **AB-**: `#9D4EDD`
- **O+**: `#F77F00` | **O-**: `#E2711D` (Universal Donor Highlight)

---

## 3. Typography Scale & Font System

### Font Families
- **Display & Headings:** `Sora-Bold` / `Sora-SemiBold` (Google Font — Clean geometric structure)
- **Body & Controls:** `DMSans-Regular` / `DMSans-Medium` (Google Font — High legibility at small sizes)
- **Monospace / Codes:** `SpaceMono-Regular` (Hashes, OTPs, QR Verification IDs)

### Type Scale Matrix

| Token | Size (pt/px) | Line Height | Weight | Font | Primary Use |
|---|---|---|---|---|---|
| `display` | 38px | 44px | Bold | Sora-Bold | Hero Headers, Splash |
| `h1` | 30px | 36px | Bold | Sora-Bold | Screen Titles |
| `h2` | 24px | 30px | Bold | Sora-Bold | Section Headers |
| `h3` | 20px | 26px | SemiBold | Sora-SemiBold | Card Titles |
| `h4` | 17px | 22px | SemiBold | Sora-SemiBold | Sub-headers, Modals |
| `body` | 15px | 22px | Regular | DMSans-Regular | Paragraphs, Form Text |
| `bodyMedium` | 15px | 22px | Medium | DMSans-Medium | Button Labels, Active Tabs |
| `caption` | 13px | 18px | Regular | DMSans-Regular | Subtitles, Meta Labels |
| `small` | 11px | 15px | Medium | DMSans-Medium | Badges, Timestamp Tags |
| `code` | 13px | 18px | Regular | SpaceMono | Certificate Hashing, OTP |

---

## 4. Elevation, Shadows, Border Radius & Spacing

### Spacing System (Base-4 Grid)
- `xs`: 4px | `sm`: 8px | `md`: 16px | `lg`: 24px | `xl`: 32px | `2xl`: 48px | `screen`: 20px (Padding)

### Border Radius System
- `sm`: 8px (Chips, Small Badges)
- `md`: 12px (Inputs, Small Cards, Buttons)
- `lg`: 16px (Standard Cards, Modals)
- `xl`: 20px (Action Sheets, Floating Cards)
- `2xl`: 28px (Hero Cards, Onboarding Sheets)
- `full`: 9999px (Pills, FAB, Avatar Containers)

### Elevation & Shadow Layers
```js
export const Shadows = {
  sm: { shadowColor: '#E63946', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  md: { shadowColor: '#E63946', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 },
  lg: { shadowColor: '#E63946', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 16 },
  card: { shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  glow: { shadowColor: '#E63946', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }
};
```

---

## 5. Motion Design & Animation Rules

### Reanimated v3 Physics Guidelines
- **Micro-interactions (Buttons, Taps):** 150ms duration, `Easing.bezier(0.25, 0.1, 0.25, 1)`.
- **Card Entrance (List Stagger):** 300ms duration, `.delay(index * 60)` using `FadeInDown` or `SlideInRight`.
- **Modals & Bottom Sheets:** 400ms spring physics `withSpring({ damping: 15, stiffness: 120 })`.
- **Pulsing Emergency Alerts:** Continuous loop using `withRepeat(withTiming(1.15, { duration: 900 }), -1, true)`.

---

## 6. Component Feedback & State Design Rules

### 1. Loading States
- Skeleton loaders (`Skeleton.js`) matching exact layout width/height during async fetches.
- Non-blocking inline spinners inside primary action buttons.

### 2. Empty States
- Always feature a contextual emoji icon (36-48px), clear bold title, helpful explanation message, and an action button to resolve the state.

### 3. Error Recovery
- Non-modal inline warning banners with clear retry action button.

### 4. Overlays & Bottom Sheets
- Semi-transparent backdrop (`rgba(10, 10, 15, 0.85)`).
- Drag-handle indicator (`width: 36, height: 4, borderRadius: 2`).

---

## 7. Phase 1 Architecture Review, Risks & Approval

### Architecture Review
The Design System bridges the visual elegance of Apple Health & Stripe with the real-time requirements of emergency blood logistics. Tokenization via `utils/theme.js` guarantees zero hardcoded values across frontend components.

### Identified Risks & Mitigation

| Risk | Mitigation |
|---|---|
| Reanimated heavy list performance | FlashList (`@shopify/flash-list`) integration with fixed item size estimates |
| High contrast readability outdoors | Double WCAG 2.1 contrast ratio audit (minimum 4.5:1 text ratio) |
| Device screen variance | Strict use of safe area paddings (`SafeAreaProvider`) and base-4 relative spacing |

### Improvements Added in Phase 1
- Dual Theme support (Dark Midnight & Light Ice) pre-configured in theme tokens.
- Specific blood compatibility color matrix to prevent medical selection errors.
- Monospace font assignment (`SpaceMono`) for cryptographic QR certificate hashes.

---

## Phase 1 Approval Checklist

- [x] Brand Identity & Tone Defined
- [x] Dark & Light Theme Color Palette Complete
- [x] Typography Scale & Custom Fonts Mapped
- [x] Spacing, Elevation & Radius Tokens Standardized
- [x] Motion & Animation Rules Specified
- [x] UI State Standards (Loading, Empty, Error) Established
- [x] Architecture Review & Risk Audit Completed

*Phase 1 is complete and implemented. Proceeding to Phase 2 (Component Library).*

---

## Implementation Audit Trail

> Implemented on 2026-08-03 by Antigravity (Lead Architect)

### Files Created / Modified

| Action | File | Description |
|---|---|---|
| MODIFIED | `frontend/src/utils/theme.js` | Closed 6 token gaps; added `Animation`, `BloodGroupColorsBg`, `Overlay`, `TouchTarget` exports |
| NEW | `frontend/src/context/ThemeContext.js` | Persistent Dark/Light theme runtime via `expo-secure-store` (`@reddrop_theme`) |
| NEW | `frontend/src/hooks/useTheme.js` | Single-import convenience hook for all design system tokens |
| NEW | `frontend/src/utils/animations.js` | Reanimated v3 motion preset factories (zero hardcoded values) |
| MODIFIED | `frontend/App.js` | Added `<ThemeProvider>` wrapper inside `SafeAreaProvider` |

### Token Gaps Resolved

| Token | Was | Now (Spec) |
|---|---|---|
| `Colors.glassStrong` | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.12)` ✅ |
| `Colors.primaryGlow` | `rgba(230,57,70,0.15)` | `rgba(230,57,70,0.18)` ✅ |
| `Shadows.card.shadowOpacity` | `0.30` | `0.35` ✅ |
| `Shadows.glow` | Missing | Added ✅ |
| `Animation` export | Missing | Added (10 token groups) ✅ |
| `BloodGroupColorsBg` | Missing | Added (8 blood groups) ✅ |
