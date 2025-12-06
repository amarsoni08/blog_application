import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import CommentBox from "../components/CommentBox";

// ⭐ Swiper Imports
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadPost();
    loadComments();
  }, []);

  async function loadPost() {
    const res = await API.get(`/posts/${id}`);
    setPost(res.data.result);
  }

  async function loadComments() {
    const res = await API.get(`/comments/${id}`);
    setComments(res.data.result);
  }

  async function sendComment(e) {
    e.preventDefault();
    await API.post(`/comments/${id}`, { content });
    setContent("");
    loadComments();
  }

  async function deletePost() {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await API.delete(`/posts/${post._id}`);
      alert("Post deleted!");
      navigate("/");
    } catch (err) {
      console.log(err);
      alert("Failed to delete post");
    }
  }

  if (!post) return <p className="text-center mt-6">Loading...</p>;

  return (
    <div className="mt-6 space-y-6">

      {/* Post Container */}
      <div className="bg-white p-4 rounded shadow">

        {/* Author */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={post.author.profileImage}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h2 className="font-bold text-lg">
              {post.author.firstName} {post.author.lastName}
            </h2>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Edit/Delete only for owner */}
          {user?.id === post.author._id && (
            <div className="ml-auto flex gap-4">
              <button
                className="text-blue-600 text-sm hover:underline"
                onClick={() => navigate(`/posts/${post._id}/edit`)}
              >
                Edit
              </button>

              <button
                className="text-red-600 text-sm hover:underline"
                onClick={deletePost}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* ⭐ IMAGE SLIDER FIXED (Portrait FULL VIEW) */}
        {post.images.length === 1 ? (
          <div className="w-full flex justify-center bg-black rounded">
            <img
              src={post.images[0]}
              className="max-h-[500px] w-auto object-contain"
            />
          </div>
        ) : (
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            className="w-full rounded bg-black"
          >
            {post.images.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="w-full flex justify-center bg-black">
                  <img
                    src={img}
                    className="max-h-[500px] w-auto object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Caption */}
        <p className="mt-4 text-gray-800 whitespace-pre-line">
          {post.caption}
        </p>
      </div>

      {/* Add Comment */}
      <form onSubmit={sendComment} className="flex gap-3">
        <input
          type="text"
          className="w-full border p-3 rounded"
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 rounded">
          Send
        </button>
      </form>

      {/* All Comments */}
      <div className="space-y-3">
        {comments.map((c) => (
          <CommentBox key={c._id} comment={c} refresh={loadComments} />
        ))}
      </div>
    </div>
  );
}
