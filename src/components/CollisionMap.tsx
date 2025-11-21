// @ts-nocheck
import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { CollisionData } from "@/lib/dataLoader";
import "leaflet/dist/leaflet.css";

interface CollisionMapProps {
  data: CollisionData[];
}

const MapUpdater = ({ data }: { data: CollisionData[] }) => {
  const map = useMap();

  useEffect(() => {
    if (data.length > 0) {
      const validPoints = data.filter(
        (d) => d.LATITUDE && d.LONGITUDE && !isNaN(d.LATITUDE) && !isNaN(d.LONGITUDE)
      );

      if (validPoints.length > 0) {
        const lats = validPoints.map((d) => d.LATITUDE);
        const lngs = validPoints.map((d) => d.LONGITUDE);
        map.fitBounds([
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ], { padding: [50, 50] });
      }
    }
  }, [data, map]);

  return null;
};

export const CollisionMap = ({ data }: CollisionMapProps) => {
  // Sample data for performance (max 1000 points)
  const mapData = data
    .filter((d) => d.LATITUDE && d.LONGITUDE && !isNaN(d.LATITUDE) && !isNaN(d.LONGITUDE))
    .slice(0, 1000);

  const getColorBySeverity = (injured: number, killed: number) => {
    if (killed > 0) return "#ef4444"; // red for fatalities
    if (injured > 2) return "#f97316"; // orange for multiple injuries
    if (injured > 0) return "#eab308"; // yellow for injuries
    return "#3b82f6"; // blue for property damage only
  };

  return (
    <MapContainer
      center={[40.7128, -74.006]}
      zoom={11}
      className="h-full w-full rounded-lg"
      style={{ minHeight: "500px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater data={mapData} />
      {mapData.map((collision, idx) => (
        <CircleMarker
          key={`${collision.COLLISION_ID}-${idx}`}
          center={[collision.LATITUDE, collision.LONGITUDE]}
          pathOptions={{
            fillColor: getColorBySeverity(
              collision.NUMBER_OF_PERSONS_INJURED,
              collision.NUMBER_OF_PERSONS_KILLED
            ),
            color: "#fff",
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.6,
          }}
          radius={5}
        >
          <Popup>
            <div className="text-sm">
              <strong>
                {collision.BOROUGH || "Unknown"} -{" "}
                {collision.CRASH_DATE ? new Date(collision.CRASH_DATE).toLocaleDateString() : "N/A"}
              </strong>
              <br />
              <span className="text-xs">
                Injured: {collision.NUMBER_OF_PERSONS_INJURED} | Killed:{" "}
                {collision.NUMBER_OF_PERSONS_KILLED}
              </span>
              <br />
              <span className="text-xs text-muted-foreground">
                {collision.CONTRIBUTING_FACTOR_VEHICLE_1 || "Unknown cause"}
              </span>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};
