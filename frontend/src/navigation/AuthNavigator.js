import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from './routes';

// TODO: import screens when implemented
// import LoginScreen from '../screens/auth/LoginScreen';
// import RegisterScreen from '../screens/auth/RegisterScreen';
// import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';

const Stack = createStackNavigator();

/**
 * AuthNavigator — Stack navigator for authentication & onboarding flow.
 * Screens: Login → Register → OTP Verification
 */
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Screens will be wired here in Phase 6 */}
    {/* <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} /> */}
    {/* <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} /> */}
    {/* <Stack.Screen name={ROUTES.OTP_VERIFICATION} component={OTPVerificationScreen} /> */}
  </Stack.Navigator>
);

export default AuthNavigator;
