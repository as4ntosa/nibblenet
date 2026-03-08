'use client';

import { useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, ExternalLink } from 'lucide-react';

interface PickupMapProps {
  lat: number;
  lng: number;
  address: string;
}

const STATIC_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  scrollwheel: false,
  draggable: false,
  clickableIcons: false,
  gestureHandling: 'none',
  styles: [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#dbeafe' }],
    },
  ],
};

/** Green pin matching the brand palette */
function makePin() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="#16a34a"/>
      <circle cx="16" cy="16" r="7" fill="white"/>
    </svg>`.trim();
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: 32, height: 40 } as google.maps.Size,
    anchor: { x: 16, y: 40 } as google.maps.Point,
  };
}

export function PickupMap({ lat, lng, address }: PickupMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: 'nibblenet-map-script', // shared loader ID — reuses same script load
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    map.setCenter({ lat, lng });
  }, [lat, lng]);

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    // Graceful fallback: show address with a directions link
    return (
      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 mt-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MapPin size={13} className="text-brand-500 shrink-0" />
          <span className="truncate">{address}</span>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-brand-600 font-semibold shrink-0 ml-2 hover:underline"
        >
          Directions <ExternalLink size={11} />
        </a>
      </div>
    );
  }

  if (loadError || !isLoaded) {
    return (
      <div className="h-[160px] bg-gray-100 rounded-2xl flex items-center justify-center mt-3">
        {loadError
          ? <p className="text-xs text-red-400">Map unavailable</p>
          : <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        }
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl overflow-hidden relative" style={{ height: 180 }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={{ lat, lng }}
        zoom={15}
        options={STATIC_OPTIONS}
        onLoad={onLoad}
      >
        <Marker position={{ lat, lng }} icon={makePin()} />
      </GoogleMap>

      {/* "Get Directions" overlay button */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-white shadow-md rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <ExternalLink size={11} className="text-brand-600" />
        Get Directions
      </a>
    </div>
  );
}
