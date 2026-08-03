import {
  withSpring,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideInLeft,
  ZoomIn,
} from 'react-native-reanimated';
import { Animation } from './theme';

// ─────────────────────────────────────────────────────────────
// animations.js — RedDrop AI V2
// Reanimated v3 motion preset factories
// All values derive strictly from Animation tokens in theme.js
// ─────────────────────────────────────────────────────────────

// ── 1. Press Feedback ────────────────────────────────────────
// Scale-down spring for button/card taps.
// Usage: scale.value = pressFeedback() on PressIn
//        scale.value = pressRelease() on PressOut
export const pressFeedback = () =>
  withSpring(Animation.pressScale, Animation.spring.stiff);

export const pressRelease = () =>
  withSpring(1, Animation.spring.gentle);

// ── 2. Opacity Feedback ──────────────────────────────────────
export const opacityFeedback = () =>
  withTiming(0.82, {
    duration: Animation.duration.micro,
    easing: Easing.bezier(...Animation.easing.standard),
  });

export const opacityRelease = () =>
  withTiming(1, {
    duration: Animation.duration.micro,
    easing: Easing.bezier(...Animation.easing.standard),
  });

// ── 3. Card Entrance (Staggered List) ────────────────────────
// Returns a FadeInDown entering animation for list cards.
// Usage: <Animated.View entering={cardEntrance(index)}>
export const cardEntrance = (index = 0) =>
  FadeInDown
    .duration(Animation.duration.card)
    .delay(index * Animation.staggerDelay)
    .easing(Easing.bezier(...Animation.easing.decelerate));

// Slide-in variant for horizontal lists
export const cardEntranceRight = (index = 0) =>
  SlideInRight
    .duration(Animation.duration.card)
    .delay(index * Animation.staggerDelay)
    .easing(Easing.bezier(...Animation.easing.decelerate));

export const cardEntranceLeft = (index = 0) =>
  SlideInLeft
    .duration(Animation.duration.card)
    .delay(index * Animation.staggerDelay)
    .easing(Easing.bezier(...Animation.easing.decelerate));

// ── 4. Modal / Bottom Sheet Entrance ─────────────────────────
// Spring translateY for sliding modals up from bottom.
// Usage: translateY.value = modalEntranceY(screenHeight)
export const modalEntranceY = (targetY = 0) =>
  withSpring(targetY, Animation.spring.snappy);

// Fade for modal backdrop
export const backdropFadeIn = () =>
  withTiming(1, {
    duration: Animation.duration.modal,
    easing: Easing.bezier(...Animation.easing.decelerate),
  });

export const backdropFadeOut = () =>
  withTiming(0, {
    duration: Animation.duration.modal,
    easing: Easing.bezier(...Animation.easing.accelerate),
  });

// ── 5. Emergency Pulse ───────────────────────────────────────
// Continuous scale loop for critical alert badges.
// Usage: scale.value = pulseEmergency()
export const pulseEmergency = () =>
  withRepeat(
    withTiming(Animation.pulseScale, {
      duration: Animation.duration.pulse,
      easing: Easing.bezier(...Animation.easing.standard),
    }),
    -1,   // infinite
    true  // reverse (ping-pong)
  );

// Pulse for opacity (glow breathing effect)
export const pulseGlow = (minOpacity = 0.4, maxOpacity = 1.0) =>
  withRepeat(
    withTiming(maxOpacity, {
      duration: Animation.duration.pulse,
      easing: Easing.bezier(...Animation.easing.standard),
    }),
    -1,
    true
  );

// ── 6. FAB Entrance ──────────────────────────────────────────
export const fabEntrance = () =>
  ZoomIn
    .duration(Animation.duration.card)
    .springify()
    .damping(Animation.spring.bouncy.damping)
    .stiffness(Animation.spring.bouncy.stiffness);

// ── 7. Screen Transition Presets ─────────────────────────────
export const screenEnterRight = () =>
  SlideInRight.duration(Animation.duration.modal);

export const screenEnterUp = () =>
  FadeInUp.duration(Animation.duration.card);

// ── 8. Focus Border Glow ─────────────────────────────────────
// For Input components — animates borderColor on focus.
export const focusIn = () =>
  withTiming(1, {
    duration: 200,
    easing: Easing.bezier(...Animation.easing.decelerate),
  });

export const focusOut = () =>
  withTiming(0, {
    duration: 200,
    easing: Easing.bezier(...Animation.easing.accelerate),
  });
