"use client";

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
import { useCallback, useEffect, useState } from "react";
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

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

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

export const MiniMap = ({ marker, setMarker, mapCenter, setMapCenter }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "Accept-Language": "ru" } },
      );
      const data: NominatimResult[] = await res.json();
      if (data.length > 0) {
        const [lat, lon] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setMapCenter([lat, lon]);
        setMarker([lat, lon]);
      } else {
        setSearchError("Ничего не найдено");
      }
    } catch {
      setSearchError("Ошибка поиска");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleMapClick = useCallback((coords: [number, number]) => {
    setMarker(coords);
    setSearchParams({
      lat: String(coords[0].toFixed(6)),
      lon: String(coords[1].toFixed(6)),
    });
  }, []);

  return (
    <div className="flex-1 min-h-0 overflow-hidden rounded-xl">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
      >
        <SetViewOnCenter center={mapCenter} />
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
