import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

import { FaHeart, FaRegHeart, FaCommentDots } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

export default function PostCard({ post, refresh }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [liked, setLiked] = useState(post.likes.includes(user?.id));
  const [likesCount, setLikesCount] = useState(post.likes.length);

  const [menuOpen, setMenuOpen] = useState(false);
  const [likesPreview, setLikesPreview] = useState(post.lastFiveLikes || []);
  const [showLikesPopup, setShowLikesPopup] = useState(false);

  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likesList, setLikesList] = useState([]);

  // DELETE POST
  async function deletePost() {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await API.delete(`/posts/${post._id}`);
      refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  }

  // LIKE / UNLIKE
  async function toggleLike(e) {
    e.stopPropagation();

    try {
      const res = await API.post(`/posts/${post._id}/like`);
      setLiked(res.data.result.liked);
      setLikesCount(res.data.result.likesCount);
      setLikesPreview(res.data.result.lastFiveLikes || []);
    } catch (err) {
      console.log(err);
    }
  }

  async function openLikesPopup() {
    try {
      const res = await API.get(`/posts/${post._id}/likes`);
      setLikesList(res.data.result);
      setShowLikesModal(true);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 relative">
        <img
          src={post.author.profileImage}
          className="w-11 h-11 rounded-full object-cover border"
        />

        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            {post.author.firstName} {post.author.lastName}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* ⋮ MENU FOR OWNER */}
        {user?.id === post.author._id && (
          <div className="relative">
            <HiDotsVertical
              className="text-2xl cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
            />

            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white shadow-lg border rounded w-28 z-20">
                <button
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/posts/${post._id}/edit`);
                    setMenuOpen(false);
                  }}
                >
                  Edit
                </button>

                <button
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePost();
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* IMAGES */}
      {post.images.length === 1 ? (
        <div className="flex justify-center bg-black">
          <img
            src={post.images[0]}
            className="max-h-[500px] object-contain w-auto"
            onClick={() => navigate(`/posts/${post._id}`)}
          />
        </div>
      ) : (
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          className="bg-black"
        >
          {post.images.map((img, i) => (
            <SwiperSlide key={i}>
              <div className="flex justify-center bg-black">
                <img
                  src={img}
                  className="max-h-[500px] object-contain w-auto"
                  onClick={() => navigate(`/posts/${post._id}`)}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-5 px-4 py-3">
        {/* LIKE BUTTON WITH PREVIEW */}
        <div
          className="relative"
          onMouseEnter={() => setShowLikesPopup(true)}
          onMouseLeave={() => setShowLikesPopup(false)}
        >
          <button onClick={toggleLike}>
            {liked ? (
              <FaHeart className="text-2xl text-red-600" />
            ) : (
              <FaRegHeart className="text-2xl text-gray-700" />
            )}
          </button>

          {/* LIKE POPUP */}
          {showLikesPopup && likesPreview.length > 0 && (
            <div className="absolute left-0 bottom-10 bg-white px-4 py-2 shadow-lg border rounded text-sm z-20">
              {likesPreview.map((u, i) => (
                <p key={i}>
                  {u.firstName} {u.lastName}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* COMMENT BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/posts/${post._id}`);
          }}
        >
          <FaCommentDots className="text-2xl text-gray-700" />
        </button>
      </div>

      {/* LIKE COUNT */}
      <p
        onClick={(e) => {
          e.stopPropagation();
          openLikesPopup();
        }}
        className="px-4 -mt-2 font-semibold text-gray-800 cursor-pointer"
      >
        {likesCount} likes
      </p>

      {showLikesModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white w-80 rounded-lg shadow-lg p-4 max-h-[400px] overflow-y-auto">
      
      <h3 className="text-lg font-semibold mb-3">Liked by</h3>
      
      {likesList.length === 0 && (
        <p className="text-gray-500 text-sm">No likes yet</p>
      )}

      {likesList.map((u) => (
        <div key={u._id} className="flex items-center gap-3 py-2 border-b">
          <img
            src={u.profileImage}
            className="w-10 h-10 rounded-full object-cover"
          />
          <p className="font-medium">
            {u.firstName} {u.lastName}
          </p>
        </div>
      ))}

      <button
        className="w-full mt-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        onClick={() => setShowLikesModal(false)}
      >
        Close
      </button>

    </div>
  </div>
)}


      {/* CAPTION */}
      <div className="px-4 pb-4">
        <p
          className="text-gray-800"
          onClick={() => navigate(`/posts/${post._id}`)}
        >
          <span className="font-semibold mr-2">{post.author.firstName}</span>

          {post.caption.length > 200
            ? post.caption.slice(0, 200) + "..."
            : post.caption}
        </p>

        <p
          className="text-sm text-gray-500 mt-1 cursor-pointer"
          onClick={() => navigate(`/posts/${post._id}`)}
        >
          {post.commentsCount > 0
            ? `View all ${post.commentsCount} comments`
            : "No comments yet"}
        </p>
      </div>
    </div>
  );
}
