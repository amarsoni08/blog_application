import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate, useParams } from "react-router-dom";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caption, setCaption] = useState("");
  const [oldImages, setOldImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    loadPost();
  }, []);

  async function loadPost() {
    try {
      const res = await API.get(`/posts/${id}`);
      setCaption(res.data.result.caption);
      setOldImages(res.data.result.images);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const data = new FormData();
    data.append("caption", caption);
    data.append("removeImages", JSON.stringify(removedList));
    newImages.forEach((img) => data.append("images", img));

    try {
      await API.patch(`/posts/${id}`, data);
      navigate("/feed");
    } catch (err) {
      console.error(err);
    }
  }

  const [removedList, setRemovedList] = useState([]);

  function removeOldImage(img) {
    setRemovedList((prev) => [...prev, img]);
    setOldImages(oldImages.filter((i) => i !== img));
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Edit Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full border p-3 rounded"
          rows="3"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <p className="font-semibold mt-3">Old Images</p>
        <div className="grid grid-cols-2 gap-2">
          {oldImages.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} className="rounded" />
              <button
                type="button"
                onClick={() => removeOldImage(img)}
                className="absolute top-1 right-1 bg-red-500 text-white px-2 rounded"
              >
                X
              </button>
            </div>
          ))}
        </div>

        <input
          type="file"
          multiple
          onChange={(e) => setNewImages([...e.target.files])}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Update Post
        </button>
      </form>
    </div>
  );
}
