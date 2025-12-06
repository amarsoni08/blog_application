// src/pages/FriendsPage.jsx
import React, { useEffect, useState } from "react";
import API from "../api";
import AllUsers from "../components/AllUsers";
import Requests from "../components/Requests";
import FriendsList from "../components/FriendsList";

export default function FriendsPage() {
  const [tab, setTab] = useState("all");
  const [data, setData] = useState({ me: null, allUsers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);

      const res = await API.get("/friends/data");

      const me = res.data.result.me;
      const allUsers = res.data.result.allUsers;

      // backend should return count:
      const receivedCount = me?.receivedRequests?.length || 0;

      setData({
        me,
        allUsers,
        receivedRequestsCount: receivedCount,
      });

      // Update user in localStorage → used in Navbar notification
      const stored = JSON.parse(localStorage.getItem("user") || "{}");

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...stored,
          receivedRequestsCount: receivedCount,
        })
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <h2 className="text-3xl font-bold mb-5">Friends</h2>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded-full border ${
            tab === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => setTab("all")}
        >
          All Users
        </button>

        <button
          className={`px-4 py-2 rounded-full border relative ${
            tab === "requests"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => setTab("requests")}
        >
          Requests
          {data.receivedRequestsCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {data.receivedRequestsCount}
            </span>
          )}
        </button>

        <button
          className={`px-4 py-2 rounded-full border ${
            tab === "friends"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => setTab("friends")}
        >
          Friends
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <>
          {tab === "all" && <AllUsers data={data} refresh={load} />}
          {tab === "requests" && <Requests data={data} refresh={load} />}
          {tab === "friends" && <FriendsList data={data} refresh={load} />}
        </>
      )}
    </div>
  );
}
