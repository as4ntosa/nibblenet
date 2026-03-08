'use client';

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { Listing } from '@/types';
import { formatPrice, cn } from '@/lib/utils';
import { Coords } from '@/hooks/useGeolocation';

// San Francisco fallback center
const SF_CENTER = { lat: 37.7749, lng: -122.4194 };

interface ListingsMapProps {
  listings: Listing[];
  userCoords?: Coords | null;
  className?: string;
  style?: React.CSSProperties;
}

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  styles: [
    // Subtle desaturation to let our brand pins pop
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#dbeafe' }],
    },
  ],
};

/** Green pin SVG as a data URI for listing markers */
function makeListingPin(active: boolean) {
  const fill = active ? '#d97706' : '#16a34a'; // amber when selected, green normally
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="${fill}"/>
      <circle cx="16" cy="16" r="7" fill="white"/>
    </svg>`.trim();
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: 32, height: 40 } as google.maps.Size,
    anchor: { x: 16, y: 40 } as google.maps.Point,
  };
}

/** Blue dot for the user's current position */
const USER_PIN = {
  path: 0, // google.maps.SymbolPath.CIRCLE — resolved at runtime
  fillColor: '#2563eb',
  fillOpacity: 1,
  strokeColor: '#fff',
  strokeWeight: 3,
  scale: 8,
};

export function ListingsMap({ listings, userCoords, className, style }: ListingsMapProps) {
  const [selected, setSelected] = useState<Listing | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: 'nibblenet-map-script',
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    // Fit bounds to show all listing pins
    if (listings.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      listings.forEach((l) => {
        if (l.pickupLat != null && l.pickupLng != null) {
          bounds.extend({ lat: l.pickupLat, lng: l.pickupLng });
        }
      });
      if (userCoords) {
        bounds.extend({ lat: userCoords.latitude, lng: userCoords.longitude });
      }
      map.fitBounds(bounds, 60);
    }
  }, [listings, userCoords]);

  const center = userCoords
    ? { lat: userCoords.latitude, lng: userCoords.longitude }
    : SF_CENTER;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return (
      <div className={cn('flex flex-col items-center justify-center bg-gray-100 rounded-2xl text-center p-8 gap-3', className)} style={style}>
        <MapPin size={32} className="text-gray-300" />
        <p className="text-sm font-semibold text-gray-500">Google Maps API key not configured</p>
        <p className="text-xs text-gray-400 max-w-xs">
          Add <code className="bg-gray-200 px-1 rounded text-[11px]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to{' '}
          <code className="bg-gray-200 px-1 rounded text-[11px]">.env.local</code> to enable the map view.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={cn('flex flex-col items-center justify-center bg-gray-100 rounded-2xl text-center p-8', className)} style={style}>
        <MapPin size={32} className="text-red-300" />
        <p className="text-sm text-red-500 mt-2">Failed to load Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100 rounded-2xl', className)} style={style}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400">Loading map…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-2xl overflow-hidden', className)} style={style}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={13}
        options={MAP_OPTIONS}
        onLoad={onMapLoad}
        onClick={() => setSelected(null)}
      >
        {/* User location pin */}
        {userCoords && (
          <Marker
            position={{ lat: userCoords.latitude, lng: userCoords.longitude }}
            icon={{
              ...USER_PIN,
              path: window.google.maps.SymbolPath.CIRCLE,
            }}
            title="Your location"
            zIndex={100}
          />
        )}

        {/* Listing pins */}
        {listings.map((listing) => {
          if (listing.pickupLat == null || listing.pickupLng == null) return null;
          const isSelected = selected?.id === listing.id;
          return (
            <Marker
              key={listing.id}
              position={{ lat: listing.pickupLat, lng: listing.pickupLng }}
              icon={makeListingPin(isSelected)}
              title={listing.title}
              zIndex={isSelected ? 50 : 10}
              onClick={() => setSelected(listing)}
            />
          );
        })}

        {/* Info window for selected listing */}
        {selected && selected.pickupLat != null && selected.pickupLng != null && (
          <InfoWindow
            position={{ lat: selected.pickupLat, lng: selected.pickupLng }}
            onCloseClick={() => setSelected(null)}
            options={{ pixelOffset: new window.google.maps.Size(0, -44) }}
          >
            {/* InfoWindow renders outside React's portal so we keep it minimal */}
            <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 180, maxWidth: 220 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#111', margin: '0 0 2px' }}>
                {selected.title}
              </p>
              <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 6px' }}>
                {selected.businessName}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#16a34a' }}>
                  {formatPrice(selected.price)}
                </span>
                <a
                  href={`/listing/${selected.id}`}
                  style={{
                    fontSize: 11, color: '#16a34a', fontWeight: 600,
                    textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3,
                  }}
                >
                  View →
                </a>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Listing count overlay */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm">
        <p className="text-xs font-semibold text-gray-700">
          {listings.filter((l) => l.pickupLat != null).length} listings nearby
        </p>
      </div>
    </div>
  );
}
