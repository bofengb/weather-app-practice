import { useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerPopup from './MarkerPopup';

// Fix for default marker icon issue in Leaflet with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icons for different types
const createCustomIcon = (type) => {
  const colors = {
    favorite: '#facc15', // yellow
    history: '#94a3b8', // gray
  };

  const icons = {
    favorite: '★',
    history: '●',
  };

  const bgColor = colors[type] || '#3b82f6';
  const icon = icons[type] || '●';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${bgColor};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 14px;
          line-height: 1;
        ">${icon}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Leaflet map
export default function WeatherMap({
  markers = [],
  center = [40.7128, -74.006], // Default: New York
  zoom = 4,
  onFavoriteToggle,
  filters = { showFavorites: true, showHistory: true },
}) {
  // Filter markers and sort so favorites render on top of history
  const visibleMarkers = useMemo(() => {
    return markers
      .filter((m) => {
        if (m.type === 'favorite' && !filters.showFavorites) return false;
        if (m.type === 'history' && !filters.showHistory) return false;
        return true;
      })
      .sort((a, b) => {
        // History first, favorites last (so favorites appear on top)
        if (a.type === 'history' && b.type === 'favorite') return -1;
        if (a.type === 'favorite' && b.type === 'history') return 1;
        return 0;
      });
  }, [markers, filters]);

  // Get the appropriate icon for a marker
  const getMarkerIcon = (marker) => {
    return createCustomIcon(marker.type);
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full z-0"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {visibleMarkers.map((marker) => (
          <Marker
            key={`${marker.type}-${marker.id}`}
            position={[marker.lat, marker.lon]}
            icon={getMarkerIcon(marker)}
          >
            <Popup maxWidth={300} minWidth={250}>
              <MarkerPopup
                marker={marker}
                onFavoriteToggle={onFavoriteToggle}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
