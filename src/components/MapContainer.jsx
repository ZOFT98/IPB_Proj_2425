import { useState } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

const MapContainer = () => {
  const [loadError, setLoadError] = useState(false);
  
  const mapStyles = {
    height: "100%",
    width: "100%"
  };
  
  const defaultCenter = {
    lat: 41.79883665014049,  
    lng: -6.76445240349594
  };

  if (loadError) return <div className="text-red-500">Error loading map.</div>;

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      onError={() => setLoadError(true)}
    >
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={13}
        center={defaultCenter}
      >
        {/* Future markers go here */}
        {/* <Marker position={defaultCenter} /> */}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapContainer;