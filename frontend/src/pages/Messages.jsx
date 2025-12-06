// src/pages/Messages.jsx
import React, { useEffect, useState } from "react";
import API from "../api";
import ChatWindow from "../components/ChatWindow";
import { socket } from "../socket";

export default function Messages() {
  const [friends, setFriends] = useState([]);
  const [selected, setSelected] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = user.id || user._id;

  // ---------------------------------------------
  // SOCKET CONNECT + ONLINE USERS HANDLING
  // ---------------------------------------------
  useEffect(() => {
    if (!myId) return;

    socket.auth = { token: localStorage.getItem("token") || "" };
    socket.connect();

    socket.emit("user-online", myId);

    socket.on("online-users", (list) => {
      setOnlineUsers(list);
      loadFriends(); // refresh unread + last message + last seen
    });

    return () => {
      socket.off("online-users");
      // DO NOT disconnect here
    };
  }, []);

  // ---------------------------------------------
  // LOAD FRIEND LIST
  // ---------------------------------------------
  async function loadFriends() {
    try {
      const res = await API.get("/messages/friends");
      setFriends(res.data.friends || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadFriends();
  }, []);

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <div className="flex max-w-6xl mx-auto mt-6 gap-4 px-4">

      {/* LEFT SIDEBAR */}
      <div className="w-1/3 bg-white shadow rounded p-3 h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-3">Chats</h2>

        {friends.length === 0 && <div className="text-gray-500">No chats yet</div>}

        {friends.map((f) => {
          const isOnline = onlineUsers.includes(f._id);

          return (
            <div
              key={f._id}
              onClick={() => setSelected(f)}
              className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                selected?._id === f._id ? "bg-gray-100" : ""
              }`}
            >
              <div className="relative">
                <img
                  src={f.profileImage}
                  className="w-12 h-12 rounded-full object-cover"
                />

                {/* ONLINE DOT */}
                {isOnline && (
                  <span className="absolute bottom-1 right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div className="font-medium">
                    {f.firstName} {f.lastName}
                  </div>

                  {f.unreadCount > 0 && (
                    <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {f.unreadCount}
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-500 truncate mt-1">
                  {f.lastMessage || "Say hi 👋"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT SIDE - CHAT BOX */}
      <div className="w-2/3">
        <ChatWindow
          friend={selected}
          refreshFriends={loadFriends}
          socket={socket}
          onlineUsers={onlineUsers}
        />
      </div>
    </div>
  );
}
