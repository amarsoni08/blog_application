// src/components/Requests.jsx
import React from "react";
import API from "../api";

export default function Requests({ data, refresh }) {
  const me = data.me || {};
  const received = me.receivedRequests || [];

  async function accept(id) {
    try {
      await API.post(`/friends/accept/${id}`);
      refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function reject(id) {
    try {
      await API.post(`/friends/reject/${id}`);
      refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      {received.length === 0 && <p>No requests</p>}
      {received.map(u => (
        <div key={u._id} className="flex items-center gap-3 p-3 bg-white rounded shadow">
          <img src={u.profileImage} className="w-12 h-12 rounded-full object-cover"/>
          <div className="flex-1">
            <div className="font-semibold">{u.firstName} {u.lastName}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => accept(u._id)} className="px-3 py-1 bg-blue-600 text-white rounded">Accept</button>
            <button onClick={() => reject(u._id)} className="px-3 py-1 bg-gray-200 rounded">Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
