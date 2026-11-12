import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * Hook to get device GPS location with permission handling
 */
export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setIsLoading(false);
        return null;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const data: LocationData = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      // Try reverse geocoding
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (address) {
          data.address = [address.city, address.region].filter(Boolean).join(', ');
        }
      } catch {
        // Geocoding optional
      }

      setLocation(data);
      setIsLoading(false);
      return data;
    } catch (e: any) {
      setError(e.message || 'Failed to get location');
      setIsLoading(false);
      return null;
    }
  };

  return { location, isLoading, error, requestLocation };
};
