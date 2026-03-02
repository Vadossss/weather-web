import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
  ZoomControl,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const DEFAULT_CENTER: LatLngExpression = [55.733842, 37.588144];
const DEFAULT_ZOOM = 9;

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (coords: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function SetViewOnCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}

interface MiniMapProps {
  marker: [number, number] | null;
  setMarker: (coords: [number, number] | null) => void;
  mapCenter: [number, number] | null;
  setMapCenter: (coords: [number, number] | null) => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  marker,
  setMarker,
  mapCenter,
}) => {
  const [, setSearchParams] = useSearchParams();

  function ResizeHandler() {
    const map = useMap();

    useEffect(() => {
      const handleResize = () => {
        map.invalidateSize();
      };

      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [map]);

    return null;
  }

  const handleMapClick = useCallback((coords: [number, number]) => {
    setMarker(coords);
    setSearchParams({
      lat: String(coords[0].toFixed(6)),
      lon: String(coords[1].toFixed(6)),
    });
  }, []);

  return (
    <div className="w-full max-xl:h-96 xl:flex-1 xl:h-auto overflow-hidden rounded-xl">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
      >
        <ResizeHandler />
        <SetViewOnCenter center={mapCenter ? mapCenter : [0, 0]} />
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={handleMapClick} />
        {marker && (
          <Marker position={marker}>
            <Popup>Метка</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};
