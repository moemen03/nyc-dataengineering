import { useEffect, useRef } from "react";
import L, { LatLngExpression, Map as LeafletMap } from "leaflet";
import { CollisionData } from "@/lib/dataLoader";
import "leaflet/dist/leaflet.css";

interface CollisionMapProps {
  data: CollisionData[];
}

export const CollisionMap = ({ data }: CollisionMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const centerPosition: LatLngExpression = [40.7128, -74.006];

    mapRef.current = L.map(mapContainerRef.current, {
      center: centerPosition,
      zoom: 11,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    markersLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const mapData = data
      .filter((d) => d.LATITUDE && d.LONGITUDE && !isNaN(d.LATITUDE) && !isNaN(d.LONGITUDE))
      .slice(0, 1000);

    markersLayerRef.current.clearLayers();

    if (mapData.length === 0) return;

    const getColorBySeverity = (injured: number, killed: number) => {
      if (killed > 0) return "#ef4444"; // red for fatalities
      if (injured > 2) return "#f97316"; // orange for multiple injuries
      if (injured > 0) return "#eab308"; // yellow for injuries
      return "#3b82f6"; // blue for property damage only
    };

    const bounds: LatLngExpression[] = [];

    mapData.forEach((collision) => {
      const position: LatLngExpression = [collision.LATITUDE, collision.LONGITUDE];
      bounds.push(position);

      const circle = L.circleMarker(position, {
        radius: 5,
        color: "#ffffff",
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.6,
        fillColor: getColorBySeverity(
          collision.NUMBER_OF_PERSONS_INJURED,
          collision.NUMBER_OF_PERSONS_KILLED,
        ),
      });

      circle.bindPopup(
        `<div style="font-size: 12px;">
          <strong>${collision.BOROUGH || "Unknown"} - ${
          collision.CRASH_DATE ? new Date(collision.CRASH_DATE).toLocaleDateString() : "N/A"
        }</strong><br/>
          <span>Injured: ${collision.NUMBER_OF_PERSONS_INJURED} | Killed: ${
          collision.NUMBER_OF_PERSONS_KILLED
        }</span><br/>
          <span style="color: gray;">${
            collision.CONTRIBUTING_FACTOR_VEHICLE_1 || "Unknown cause"
          }</span>
        </div>`,
      );

      circle.addTo(markersLayerRef.current!);
    });

    if (bounds.length > 0) {
      const leafletBounds = L.latLngBounds(bounds as [number, number][]);
      mapRef.current.fitBounds(leafletBounds, { padding: [50, 50] });
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div
        className="h-full w-full flex items-center justify-center bg-muted/20 rounded-lg"
        style={{ minHeight: "500px" }}
      >
        <p className="text-muted-foreground">No collision data to display on map</p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full rounded-lg"
      style={{ minHeight: "500px" }}
    />
  );
};
