import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("caption", caption);

      images.forEach((file) => {
      data.append("images", file);
    });

      await API.post("/posts/create", data);

      navigate("/feed");
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Create Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          placeholder="Write a caption..."
          className="w-full border p-3 rounded"
          rows="3"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <input
          type="file"
          multiple
          onChange={(e) => {
        const newFiles = Array.from(e.target.files);
        console.log(newFiles);
        setImages((prev) => [...prev, ...newFiles]);  // ADD to old array
}}
        />

        <button
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Posting..." : "Create Post"}
        </button>
      </form>
    </div>
  );
}
