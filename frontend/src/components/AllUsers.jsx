// src/components/AllUsers.jsx
import React from "react";
import FriendCard from "./FriendCard";

export default function AllUsers({ data, refresh }) {
  const me = data.me || {};
  const allUsers = data.allUsers || [];

  return (
    <div className="space-y-3">
      {allUsers.map(u => (
        <FriendCard
          key={u._id}
          user={u}
          me={me}
          refresh={refresh}
        />
      ))}
    </div>
  );
}
