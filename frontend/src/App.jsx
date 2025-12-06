// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { socket } from "./socket";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import EditPost from "./pages/EditPost";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import LogoutPage from "./pages/LogoutPage";
import FriendsPage from "./pages/FriendsPage";
import Messages from "./pages/Messages";

import VideoCallModal from "./components/VideoCallModal";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  // ⭐ GLOBAL CALL STATE
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingFrom, setIncomingFrom] = useState(null);
  const [callType, setCallType] = useState("video");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = user.id || user._id;

  // ⭐ GLOBAL SOCKET LISTENER (CALL RECEIVING)
  useEffect(() => {
    socket.on("incoming-call", ({ from, callType }) => {
      setIncomingFrom(from);
      setCallType(callType);
      setIsIncomingCall(true);
      setCallModalOpen(true);
    });

    socket.on("call-rejected", () => {
      setCallModalOpen(false);
    });

    socket.on("call-ended", () => {
      setCallModalOpen(false);
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-rejected");
      socket.off("call-ended");
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* ⭐ GLOBAL CALL MODAL (Always Mounted) */}
      <VideoCallModal
        open={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        calleeId={incomingFrom}
        callerId={myId}
        incomingFrom={incomingFrom}
        callType={callType}
        isIncoming={isIncomingCall}
      />

      <div className="max-w-3xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/posts/:id" element={<PostDetail />} />

          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            }
          />

          <Route
            path="/create"
            element={
              <PrivateRoute>
                <CreatePost />
              </PrivateRoute>
            }
          />

          <Route
            path="/feed"
            element={
              <PrivateRoute>
                <Feed />
              </PrivateRoute>
            }
          />

          <Route
            path="/friends"
            element={
              <PrivateRoute>
                <FriendsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/posts/:id/edit"
            element={
              <PrivateRoute>
                <EditPost />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
