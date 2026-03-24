"use client";

import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface AerialPhotoMapProps {
  latitude: number;
  longitude: number;
}

export function AerialPhotoMap({ latitude, longitude }: AerialPhotoMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={16}
      className="h-full w-full"
      zoomControl={false}
      dragging={true}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      touchZoom={true}
      minZoom={14}
      maxZoom={18}
    >
      <TileLayer
        attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">国土地理院</a>'
        url="https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"
      />
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
}
