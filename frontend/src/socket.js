import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SOCKET_URL;
export const socket = io(URL, {
  transports: ["websocket"],   
  withCredentials: true,
  autoConnect: false,
});
if ("geolocation" in navigator) {
  navigator.geolocation.watchPosition(
    (pos) => {
      if (socket.connected) {
        socket.emit("location-update", {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      }
    },
    (err) => console.log("Location error:", err),
    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000
    }
  );
}
