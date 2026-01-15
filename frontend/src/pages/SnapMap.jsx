import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import API from "../api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { socket } from "../socket";

// Avatar icon
const createAvatarIcon = (image, isOnline) =>
  L.divIcon({
    html: `
      <div class="map-pin ${isOnline ? "live" : ""}">
        <img src="${image}" />
      </div>
    `,
    className: "",
    iconSize: [44, 44],
  });


// Time formatter
function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 60000;
  if (diff < 1) return "just now";
  if (diff < 60) return Math.floor(diff) + "m ago";
  if (diff < 1440) return Math.floor(diff / 60) + "h ago";
  return Math.floor(diff / 1440) + "d ago";
}

// Fake spread for same GPS users
function offsetLatLng(lat, lng, index) {
  const angle = index * 1.7;
  const distance = 0.00015; // ~15 meters
  return [lat + Math.sin(angle) * distance, lng + Math.cos(angle) * distance];
}

export default function SnapMap() {
  const [friends, setFriends] = useState([]);
  const [me, setMe] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socket.on("online-users", (users) => {
      setOnlineUsers(users.map(String));
    });

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMe([lat, lng]);
        API.post("/user/location", { lat, lng });
      });
    }

    API.get("/user/friends/map").then((res) => {
      setFriends(res.data);
    });

    return () => socket.off("online-users");
  }, []);

  const isOnline = (id) => onlineUsers.includes(String(id));

  if (!me) return <div className="p-5 text-center">Loading map...</div>;

  return (
    <MapContainer
      center={me}
      zoom={15}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* You */}
      <Marker position={me}>
        <Popup>You</Popup>
      </Marker>

      {friends.map((f, index) => {
        const [lat, lng] = offsetLatLng(
          f.location.coordinates[1],
          f.location.coordinates[0],
          index
        );

        return (
          <Marker
            key={f._id}
            position={[lat, lng]}
            icon={createAvatarIcon(f.profileImage, isOnline(f._id))}
          >
            <Popup>
              <b>
                {f.firstName} {f.lastName}
              </b>
              <br />
              {f.area}, {f.city}
              <br />
              {isOnline(f._id) ? (
                <span className="live-text">● Live</span>
              ) : (
                <span>⏱ {timeAgo(f.lastSeen)}</span>
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
