import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import PropTypes from "prop-types";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationPicker = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
};

LocationPicker.propTypes = {
  onClick: PropTypes.func.isRequired,
};

const LeafletMap = ({ center, zoom, markers, onClick, style }) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={style || { height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers &&
        markers.map((marker, idx) => (
          <Marker key={idx} position={marker.position}>
            {marker.popupContent && <Popup>{marker.popupContent}</Popup>}
          </Marker>
        ))}
      {onClick && <LocationPicker onClick={onClick} />}
    </MapContainer>
  );
};

LeafletMap.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
  zoom: PropTypes.number.isRequired,
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      position: PropTypes.arrayOf(PropTypes.number).isRequired,
      popupContent: PropTypes.node,
    }),
  ),
  onClick: PropTypes.func,
  style: PropTypes.object,
};

export default LeafletMap;
