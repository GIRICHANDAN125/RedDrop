import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ROUTES } from './routes';

// TODO: import tab screens and icons when implemented
// import HomeScreen from '../screens/shared/HomeScreen';
// import NearbyDonorsScreen from '../screens/shared/NearbyDonorsScreen';

const Tab = createBottomTabNavigator();

/**
 * TabNavigator — Main 5-tab bottom navigation bar.
 * Tabs: Home | Nearby | Request | Notifications | Profile
 */
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#E53935',
      tabBarInactiveTintColor: '#9E9E9E',
      tabBarStyle: { backgroundColor: '#1A1A2E', borderTopColor: '#2D2D44' }
    }}
  >
    {/* Tab screens will be wired here in Phase 6 */}
    {/* <Tab.Screen name={ROUTES.HOME} component={HomeScreen} /> */}
  </Tab.Navigator>
);

export default TabNavigator;
