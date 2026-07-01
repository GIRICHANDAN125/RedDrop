import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export const useLocation = (autoFetch = true) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState(null);

  useEffect(() => {
    if (autoFetch) fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermission(status);

      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      setLocation(loc.coords);

      // Reverse geocode
      const [place] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });

      if (place) {
        setAddress({
          city: place.city || place.subregion || '',
          state: place.region || '',
          pincode: place.postalCode || '',
          address: `${place.street || ''} ${place.district || ''}`.trim(),
          full: [place.street, place.district, place.city, place.region].filter(Boolean).join(', ')
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const getDistanceFromMe = (targetLat, targetLng) => {
    if (!location) return null;
    const R = 6371;
    const dLat = (targetLat - location.latitude) * Math.PI / 180;
    const dLng = (targetLng - location.longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(location.latitude * Math.PI / 180) *
      Math.cos(targetLat * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  return { location, address, loading, error, permission, fetchLocation, getDistanceFromMe };
};
