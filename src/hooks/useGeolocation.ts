'use client';

import { useState, useCallback } from 'react';

export interface Coords {
  latitude: number;
  longitude: number;
}

export type GeolocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable';

export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>('idle');

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setStatus('granted');
      },
      () => {
        setStatus('denied');
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { coords, status, request };
}
