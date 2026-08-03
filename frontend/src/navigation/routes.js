/**
 * Route name constants for RedDrop AI V2
 * Prevents magic string bugs across all navigators and screens.
 */
export const ROUTES = {
  // Auth Stack
  LOGIN: 'Login',
  REGISTER: 'Register',
  OTP_VERIFICATION: 'OTPVerification',
  FORGOT_PASSWORD: 'ForgotPassword',

  // Main Tab Screens
  HOME: 'Home',
  NEARBY_DONORS: 'NearbyDonors',
  CREATE_REQUEST: 'CreateRequest',
  NOTIFICATIONS: 'Notifications',
  PROFILE: 'Profile',

  // Feature Screens
  DONOR_PROFILE: 'DonorProfile',
  HOSPITAL_DASHBOARD: 'HospitalDashboard',
  TRACKING: 'Tracking',
  CAMP_DETAIL: 'CampDetail',
  CERTIFICATE_DETAIL: 'CertificateDetail',
  AI_ASSISTANT: 'AIAssistant'
};

export default ROUTES;
