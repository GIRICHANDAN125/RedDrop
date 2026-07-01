import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';

// Main Screens
import HomeScreen from '../screens/shared/HomeScreen';
import NearbyDonorsScreen from '../screens/shared/NearbyDonorsScreen';
import CreateRequestScreen from '../screens/patient/CreateRequestScreen';
import TrackingScreen from '../screens/shared/TrackingScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import DonorProfileScreen from '../screens/donor/DonorProfileScreen';

import { Colors, Typography, Radius } from '../utils/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: { active: '🏠', inactive: '🏠' },
  NearbyDonors: { active: '🔍', inactive: '🔍' },
  CreateRequest: { active: '🩸', inactive: '🩸' },
  TrackRequest: { active: '📍', inactive: '📍' },
  Profile: { active: '👤', inactive: '👤' }
};

function TabNavigator() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
              <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}>
                {focused ? icons?.active : icons?.inactive}
              </Text>
            </View>
          );
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="NearbyDonors" component={NearbyDonorsScreen} options={{ tabBarLabel: 'Find' }} />
      <Tab.Screen
        name="CreateRequest"
        component={CreateRequestScreen}
        options={{
          tabBarLabel: 'Request',
          tabBarIcon: ({ focused }) => (
            <View style={styles.centerTab}>
              <Text style={styles.centerTabIcon}>🩸</Text>
            </View>
          ),
          tabBarLabel: () => null
        }}
      />
      <Tab.Screen name="TrackRequest" component={TrackingScreen} options={{ tabBarLabel: 'Track' }} />
      <Tab.Screen
        name="Profile"
        component={user?.role === 'donor' ? DonorProfileScreen : HomeScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="DonorProfile" component={DonorProfileScreen} />
      <Stack.Screen name="NearbyDonors" component={NearbyDonorsScreen} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
      <Stack.Screen name="TrackRequest" component={TrackingScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashIcon}>🩸</Text>
        <Text style={styles.splashTitle}>Red Drop AI</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    height: 80,
    paddingBottom: 12,
    paddingTop: 8
  },
  tabLabel: { fontFamily: Typography.body, fontSize: 11 },
  tabIconWrap: { alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10 },
  tabIconWrapActive: { backgroundColor: Colors.primaryGlow },
  tabIcon: { fontSize: 20 },
  centerTab: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10
  },
  centerTabIcon: { fontSize: 22 },
  splash: { flex: 1, backgroundColor: Colors.bgDark, alignItems: 'center', justifyContent: 'center' },
  splashIcon: { fontSize: 56, marginBottom: 16 },
  splashTitle: { fontFamily: 'Sora-Bold', fontSize: 28, color: Colors.textPrimary }
});
