import React, { useEffect, useState } from "react";
import API from "../api";
import PostCard from "../components/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const res = await API.get("/posts/");
      setPosts(res.data.result);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="mt-6 space-y-5">
      <h1 className="text-2xl font-bold">All Posts</h1>

      {posts.length === 0 && (
        <p className="text-gray-500">No posts yet.</p>
      )}

      {posts.map((post) => (
        <PostCard key={post._id} post={post} refresh={loadPosts} />
      ))}
    </div>
  );
}
