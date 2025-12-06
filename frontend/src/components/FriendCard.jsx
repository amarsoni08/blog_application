// src/components/FriendCard.jsx
import React from "react";
import API from "../api";

export default function FriendCard({ user, me, refresh }) {
  const isFriend = me.friends?.some(f => f._id === user._id);
  const isSent = me.sentRequests?.some(f => f._id === user._id);
  const isReceived = me.receivedRequests?.some(f => f._id === user._id);

  async function sendRequest() {
    await API.post(`/friends/send/${user._id}`);
    refresh();
  }

  async function cancelRequest() {
    await API.post(`/friends/cancel/${user._id}`);
    refresh();
  }

  async function acceptRequest() {
    await API.post(`/friends/accept/${user._id}`);
    refresh();
  }

  async function rejectRequest() {
    await API.post(`/friends/reject/${user._id}`);
    refresh();
  }

  async function unfriend() {
    await API.post(`/friends/unfriend/${user._id}`);
    refresh();
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded shadow">
      <img
        src={user.profileImage}
        className="w-12 h-12 rounded-full object-cover"
      />

      <div className="flex-1">
        <div className="font-semibold">{user.firstName} {user.lastName}</div>
      </div>

      {/* BUTTON LOGIC */}
      {isFriend ? (
        <button
          onClick={unfriend}
          className="px-3 py-1 bg-green-100 text-green-700 rounded"
        >
          Friends ✓
        </button>
      ) : isSent ? (
        <button
          onClick={cancelRequest}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Cancel Request
        </button>
      ) : isReceived ? (
        <div className="flex gap-2">
          <button
            onClick={acceptRequest}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Accept
          </button>
          <button
            onClick={rejectRequest}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Reject
          </button>
        </div>
      ) : (
        <button
          onClick={sendRequest}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Add Friend
        </button>
      )}
    </div>
  );
}
