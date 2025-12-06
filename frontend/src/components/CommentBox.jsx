import React, { useState } from "react";
import API from "../api";

export default function CommentBox({ comment, refresh, level = 0 }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(true);

  async function sendReply() {
    if (!replyText.trim()) return;
    try {
      await API.post(`/comments/${comment.post}`, {
        content: replyText,
        parent: comment._id
      });

      setReplyText("");
      setReplyOpen(false);
      refresh();
      setShowReplies(true);
    } catch (err) {
      console.error(err);
      alert("Failed to send reply");
    }
  }

  async function deleteComment() {
    if (!confirm("Delete this comment?")) return;
    try {
      await API.delete(`/comments/${comment._id}`);
      refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  }

  return (
    <div className={`mt-4 ml-${level * 6}`}>
      {/* COMMENT */}
      <div className="flex gap-3">
        <img
          src={comment.author.profileImage}
          alt="author"
          className="w-9 h-9 rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="bg-gray-100 px-3 py-2 rounded-xl inline-block">
            <p className="font-semibold text-sm">
              {comment.author.firstName} {comment.author.lastName}
            </p>
            <p className="text-gray-800">{comment.content}</p>
          </div>

          <div className="flex gap-4 text-xs text-gray-500 mt-1">
            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>

            {/* Reply btn */}
            <button
              className="text-blue-600"
              onClick={() => setReplyOpen(!replyOpen)}
            >
              Reply
            </button>

            {/* Delete (only own comment) */}
            {String(user?.id) === String(comment.author._id) && (
              <button onClick={deleteComment} className="text-red-600">
                Delete
              </button>
            )}
          </div>

          {/* Reply Input */}
          {replyOpen && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                className="border p-2 flex-1 rounded"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button
                onClick={sendReply}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Reply
              </button>
            </div>
          )}

          {/* Nested Replies (recursive) */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-gray-500 mb-1"
              >
                {showReplies
                  ? "Hide replies"
                  : `View replies (${comment.replies.length})`}
              </button>

              {showReplies &&
                comment.replies.map((reply) => (
                  <CommentBox
                    key={reply._id}
                    comment={reply}
                    refresh={refresh}
                    level={level + 1}  // increase indent
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
