import { useState, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1A2744' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2D3F6B' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0A0F1E' }] },
];

export default function MapPicker({ value, onChange }) {
  const [marker, setMarker] = useState(value || null);
  const [manualAddress, setManualAddress] = useState('');

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const onMapClick = useCallback((e) => {
    const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarker(coords);
    onChange?.(coords);
  }, [onChange]);

  if (loadError || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="form-group">
        <label className="form-label">Store Location (Manual)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin size={16} color="var(--blue)" />
          <input
            className="form-input"
            placeholder="Enter full store address..."
            value={manualAddress}
            onChange={(e) => { setManualAddress(e.target.value); onChange?.({ address: e.target.value }); }}
          />
        </div>
        <p className="form-hint">Google Maps API key not configured — using manual address entry</p>
      </div>
    );
  }

  if (!isLoaded) return <div style={{ height: 300, background: 'var(--bg-secondary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;

  return (
    <div className="form-group">
      <label className="form-label">Store Location — Click map to pin</label>
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: 300 }}
          center={marker || { lat: 25.2048, lng: 55.2708 }}
          zoom={12}
          options={{ styles: MAP_STYLE, disableDefaultUI: true, zoomControl: true }}
          onClick={onMapClick}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>
      </div>
      {marker && (
        <p className="form-hint">
          📍 Lat: {marker.lat?.toFixed(6)}, Lng: {marker.lng?.toFixed(6)}
        </p>
      )}
    </div>
  );
}