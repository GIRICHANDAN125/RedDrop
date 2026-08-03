/**
 * Location Service — GPS position & Haversine distance utilities for RedDrop AI V2
 */
import * as Location from 'expo-location';

const locationService = {
  /**
   * Request location permissions and get current GPS position.
   * @returns {Promise<{latitude: number, longitude: number}>}
   */
  getCurrentLocation: async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied.');
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  },

  /**
   * Haversine formula — calculate distance between two GPS coordinates.
   * @param {number} lat1 - Latitude of point A
   * @param {number} lon1 - Longitude of point A
   * @param {number} lat2 - Latitude of point B
   * @param {number} lon2 - Longitude of point B
   * @returns {number} Distance in kilometers
   */
  haversineDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
};

export default locationService;
