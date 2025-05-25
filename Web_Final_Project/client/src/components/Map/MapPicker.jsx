// components/MapPicker.js
import React, { useCallback, useRef, useState } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 31.6013, // Default location
  lng: 73.0334
};

const MapPicker = ({ onLocationSelect, apiKey }) => {
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place?.geometry?.location) {
      const location = place.geometry.location;
      const newPosition = {
        lat: location.lat(),
        lng: location.lng()
      };
      setMarkerPosition(newPosition);
      if (mapRef.current) {
        mapRef.current.panTo(newPosition);
      }
      onLocationSelect(newPosition);
    }
  };

  const onMarkerDragEnd = useCallback((e) => {
    const position = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setMarkerPosition(position);
    onLocationSelect(position);
  }, [onLocationSelect]);

  return (
    <LoadScript
      googleMapsApiKey={apiKey} // <-- API key passed from props
      libraries={['places']}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={15}
        onLoad={(map) => (mapRef.current = map)}
      >
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={handlePlaceChanged}
        >
          <input
            type="text"
            placeholder="Search your location"
            style={{
              width: '300px',
              height: '40px',
              padding: '0 12px',
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10
            }}
          />
        </Autocomplete>
        <Marker
          position={markerPosition}
          draggable
          onDragEnd={onMarkerDragEnd}
        />
      </GoogleMap>
    </LoadScript>
  );
};

export default MapPicker;
