import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserFriends, FaEnvelope } from "react-icons/fa";
import API from "../api";
import { socket } from "../socket";
import { FaMapMarkedAlt } from "react-icons/fa";
export default function Navbar() {
  const navigate = useNavigate();
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const myId = user?.id || user?._id;

  // ------------------------------
  // LOAD UNREAD COUNT FROM API
  // ------------------------------
  async function loadUnread() {
    try {
      const res = await API.get("/messages/unread-count");
      setUnreadTotal(res?.data?.unreadUsers ?? 0);
    } catch (err) {
      console.error("Unread fetch failed:", err);
    }
  }

  // ------------------------------
  // LOAD FRIEND REQUEST COUNT
  // ------------------------------
  async function loadRequests() {
    try {
      const res = await API.get("/user/me");
      setRequestsCount(res?.data?.receivedRequestsCount ?? 0);
    } catch (err) {}
  }

  // ------------------------------
  // LOGOUT
  // ------------------------------
  function logout() {

    const user = JSON.parse(localStorage.getItem("user"));

  // Tell backend user is offline
  if (socket.connected) {
    socket.emit("force-logout", user.id);
    socket.disconnect();
  }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/logout");
  }

  // ------------------------------
  // INITIAL LOAD + SOCKET SETUP
  // ------------------------------
  useEffect(() => {
    if (!token) return;

    // Load initial data
    loadUnread();
    loadRequests();

    // Connect socket
    socket.connect();
    socket.emit("user-online", myId);

    // Real-time unread message increment
    socket.on("receive-message", (msg) => {
      if (String(msg.receiver) === String(myId)) {
        setUnreadTotal((prev) => prev + 1);
      }
    });

    // If messages are seen in chat window
    socket.on("message-seen", () => loadUnread());

    // // Optional: whenever socket connects, reload unread
    socket.on("connect", loadUnread);

    // // Poll every 5 sec as backup
    const interval = setInterval(loadUnread, 5000);

    return () => {
      clearInterval(interval);
      socket.off("receive-message");
      socket.off("message-seen");
    };
  }, [token, myId]);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* LOGO */}
        <Link to="/feed" className="text-2xl font-bold text-gray-800">
          <span className="text-blue-600">B</span>logSnap
        </Link>

        <div className="flex items-center gap-6">
          {!token && (
            <>
              <Link to="/login" className="text-gray-700 hover:text-black font-medium">
                Login
              </Link>
              <Link to="/register" className="text-gray-700 hover:text-black font-medium">
                Register
              </Link>
            </>
          )}

          {token && (
            <>
              {/* CREATE POST */}
              <Link
                to="/create"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium"
              >
                + Create Post
              </Link>

              {/* FRIEND REQUESTS */}
              <div onClick={() => navigate("/friends")} className="relative cursor-pointer">
                <FaUserFriends className="text-3xl text-gray-700 hover:text-black" />
                {requestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {requestsCount}
                  </span>
                )}
              </div>

              {/* MESSAGES */}
              <Link to="/messages" className="relative text-gray-700 hover:text-black text-xl">
                <FaEnvelope />
                {unreadTotal > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white px-2 py-0.5 text-xs rounded-full">
                    {unreadTotal}
                  </span>
                )}
              </Link>

              <Link to="/map">
                <FaMapMarkedAlt className="text-2xl text-gray-700 hover:text-black" />
              </Link>
              
              {/* PROFILE */}
              <Link to="/profile">
                <img
                  src={user?.profileImage}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shadow"
                  alt="profile"
                />
              </Link>
              
              {/* LOGOUT */}
              <button onClick={logout} className="text-red-500 font-medium hover:text-red-700">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
