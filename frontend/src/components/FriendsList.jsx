// src/components/FriendsList.jsx
import React from "react";
import API from "../api";

export default function FriendsList({ data, refresh }) {
  const { me } = data;
  const friends = me?.friends || [];

  async function unfriend(id) {
    if (!confirm("Remove friend?")) return;

    try {
      await API.post(`/friends/unfriend/${id}`);
      refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to remove friend");
    }
  }

  if (!friends.length)
    return <p className="text-gray-500 mt-4">No friends yet.</p>;

  return (
    <div className="space-y-3">
      {friends.map((u) => (
        <div
          key={u._id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border hover:shadow transition"
        >
          {/* USER INFO */}
          <div className="flex items-center gap-3">
            <img
              src={u.profileImage}
              className="w-12 h-12 rounded-full object-cover"
              alt=""
            />
            <div className="font-semibold text-gray-800">
              {u.firstName} {u.lastName}
            </div>
          </div>

          {/* REMOVE FRIEND BUTTON */}
          <button
            onClick={() => unfriend(u._id)}
            className="px-4 py-2 text-red-600 border border-red-500 rounded-lg hover:bg-red-50 transition"
          >
            Remove Friend
          </button>
        </div>
      ))}
    </div>
  );
}
