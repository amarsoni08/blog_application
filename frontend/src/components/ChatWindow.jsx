// src/components/ChatWindow.jsx
import React, { useEffect, useRef, useState } from "react";
import API from "../api";
import ReactionPopup from "./ReactionPopup";
import CallButton from "./CallButton"; // ⭐ ADD THIS
import VideoCallModal from "./VideoCallModal"; // ⭐ ADD THIS
import { socket } from "../socket";

export default function ChatWindow({
  friend,
  refreshFriends,
  socket,
  onlineUsers,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingFromFriend, setTypingFromFriend] = useState(false);

  const [deliveredMap, setDeliveredMap] = useState({});
  const [seenMap, setSeenMap] = useState({});
  const [showReactorFor, setShowReactorFor] = useState(null);

  const [callModalOpen, setCallModalOpen] = useState(false); // ⭐ NEW
  const [isIncomingCall, setIsIncomingCall] = useState(false); // ⭐ NEW
  const [incomingFrom, setIncomingFrom] = useState(null); // ⭐ NEW
  const [callType, setCallType] = useState("video"); // ⭐ NEW

  const bottomRef = useRef();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const myId = user.id || user._id;

  // ---------------------------------------------------------
  // LISTEN FOR INCOMING CALL EVENTS
  // ---------------------------------------------------------
  useEffect(() => {
    const handleIncoming = ({ from, callType }) => {
      setIncomingFrom(from);
      setIsIncomingCall(true);
      setCallType(callType);
      setCallModalOpen(true);
    };

    socket.on("incoming-call", handleIncoming);
    socket.on("call-rejected", () => setCallModalOpen(false));
    socket.on("call-ended", () => setCallModalOpen(false));

    return () => {
      socket.off("incoming-call", handleIncoming);
      socket.off("call-rejected");
      socket.off("call-ended");
    };
  }, []);

  // ---------------------------------------------------------
  // LOAD CHAT WHEN FRIEND SELECTED
  // ---------------------------------------------------------
  useEffect(() => {
    if (!friend) return;

    loadChat();

    socket.on("receive-message", onReceiveMessage);
    socket.on("typing", onTyping);
    socket.on("stop-typing", onStopTyping);
    socket.on("message-delivered", onDelivered);
    socket.on("message-seen", onSeenEvent);
    socket.on("message-reacted", onReacted);
    socket.on("message-deleted", onDeleted);

    return () => {
      socket.off("receive-message", onReceiveMessage);
      socket.off("typing", onTyping);
      socket.off("stop-typing", onStopTyping);
      socket.off("message-delivered", onDelivered);
      socket.off("message-seen", onSeenEvent);
      socket.off("message-reacted", onReacted);
      socket.off("message-deleted", onDeleted);
    };
  }, [friend]);

  // ---------------------------------------------------------
  // LOAD CHAT HISTORY
  // ---------------------------------------------------------
  async function loadChat() {
    const res = await API.get(`/messages/chat/${friend._id}`);
    const msgs = res.data.messages || [];

    setMessages(msgs);
    scrollBottom();

    msgs
      .filter(
        (m) =>
          String(m.sender) === String(friend._id) ||
          String(m.sender?._id) === String(friend._id)
      )
      .forEach((m) =>
        socket.emit("seen-message", {
          messageId: m._id,
          to: friend._id,
        })
      );

    refreshFriends();
  }

  // SCROLL TO BOTTOM
  function scrollBottom() {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      80
    );
  }

  // ---------------------------------------------------------
  // SOCKET HANDLERS
  // ---------------------------------------------------------
  function onReceiveMessage(msg) {
    if (
      String(msg.sender) === String(friend._id) ||
      String(msg.sender?._id) === String(friend._id)
    ) {
      setMessages((prev) => [...prev, msg]);
      scrollBottom();

      socket.emit("send-delivered-ack", {
        messageId: msg._id,
        to: msg.sender,
      });

      setTimeout(() => {
        socket.emit("seen-message", {
          messageId: msg._id,
          to: msg.sender,
        });
      }, 300);
    }

    refreshFriends();
  }

  function onTyping({ from }) {
    if (String(from) === String(friend._id)) setTypingFromFriend(true);
  }

  function onStopTyping({ from }) {
    if (String(from) === String(friend._id)) setTypingFromFriend(false);
  }

  function onDelivered({ messageId }) {
    setDeliveredMap((prev) => ({ ...prev, [messageId]: true }));
  }

  function onSeenEvent({ messageId }) {
    setSeenMap((prev) => ({ ...prev, [messageId]: true }));
    setMessages((prev) =>
      prev.map((m) => (m._id === messageId ? { ...m, isSeen: true } : m))
    );
  }

  function onReacted({ messageId, reaction }) {
    setMessages((prev) =>
      prev.map((m) => (m._id === messageId ? { ...m, reaction } : m))
    );
  }

  function onDeleted({ messageId }) {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
  }

  // ---------------------------------------------------------
  // SEND MESSAGE
  // ---------------------------------------------------------
  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const res = await API.post(`/messages/send/${friend._id}`, {
      content: input,
    });

    const saved = res.data.message;

    const outgoing = {
      _id: saved._id,
      sender: myId,
      receiver: friend._id,
      content: saved.content,
      createdAt: saved.createdAt,
      isSeen: false,
      isDelivered: false,
    };

    setMessages((prev) => [...prev, outgoing]);
    scrollBottom();

    socket.emit("send-message", outgoing);
    setInput("");

    refreshFriends();
  }

  // TYPING
  let typingTimer;
  function handleTyping(e) {
    setInput(e.target.value);

    socket.emit("typing", { from: myId, to: friend._id });

    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      socket.emit("stop-typing", { from: myId, to: friend._id });
    }, 1000);
  }

  // ---------------------------------------------------------
  // CALL BUTTON → OUTGOING CALL
  // ---------------------------------------------------------
  function makeCall(type) {
    setCallType(type);
    setIsIncomingCall(false);
    setCallModalOpen(true);

    socket.emit("call-user", {
      to: friend._id,
      from: myId,
      callType: type,
    });
  }

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  if (!friend)
    return (
      <div className="text-gray-500 text-center mt-20">
        Select a friend to start chatting
      </div>
    );

  return (
    <div className="bg-white shadow rounded h-[80vh] flex flex-col">
      {/* HEADER */}
      <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
        {/* LEFT: AVATAR + NAME */}
        <div className="flex items-center gap-3">
          <img
            src={friend.profileImage}
            className="w-12 h-12 rounded-full object-cover"
          />

          <div>
            <div className="font-semibold">
              {friend.firstName} {friend.lastName}
            </div>

            {typingFromFriend ? (
              <div className="text-sm text-gray-500">typing…</div>
            ) : onlineUsers?.includes(friend._id) ? (
              <div className="text-sm text-green-500">Active now</div>
            ) : (
              <div className="text-sm text-gray-400">
                {(() => {
                  if (!friend.lastSeen) return "Offline";

                  const last = new Date(friend.lastSeen);
                  const now = new Date();

                  const isToday =
                    last.getDate() === now.getDate() &&
                    last.getMonth() === now.getMonth() &&
                    last.getFullYear() === now.getFullYear();

                  const yesterday = new Date();
                  yesterday.setDate(now.getDate() - 1);

                  const isYesterday =
                    last.getDate() === yesterday.getDate() &&
                    last.getMonth() === yesterday.getMonth() &&
                    last.getFullYear() === yesterday.getFullYear();

                  const time = last.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  if (isToday) return `Last seen today at ${time}`;
                  if (isYesterday) return `Last seen yesterday at ${time}`;

                  return `Last seen on ${last.toLocaleDateString()} at ${time}`;
                })()}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: CALL BUTTONS ✔ */}
        <CallButton
          onCallAudio={() => makeCall("audio")}
          onCallVideo={() => makeCall("video")}
        />
      </div>

      {/* CHAT BODY */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
        {messages.map((m) => {
          const isMe =
            String(m.sender) === String(myId) ||
            String(m.sender?._id) === String(myId);

          return (
            <div
              key={m._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} px-2`}
            >
              <div className="flex items-end gap-2">
                {!isMe && (
                  <img
                    src={friend.profileImage}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}

                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-black rounded-bl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-[10px] opacity-60">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      {m.reaction && (
                        <div className="text-xs">{m.reaction}</div>
                      )}

                      {isMe && (
                        <div className="text-[12px] opacity-70">
                          {seenMap[m._id] || m.isSeen
                            ? "✓✓"
                            : deliveredMap[m._id]
                            ? "✓"
                            : "✓"}
                        </div>
                      )}

                      {isMe && (
                        <>
                          <button onClick={() => openReaction(m._id)}>
                            😊
                          </button>

                          <button
                            className="text-red-500 text-xs"
                            onClick={() => deleteForEveryone(m._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {isMe && (
                  <img
                    src={user.profileImage}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
              </div>

              {showReactorFor === m._id && (
                <ReactionPopup
                  onReact={(r) => applyReaction(m._id, r)}
                  onClose={() => setShowReactorFor(null)}
                />
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* INPUT FIELD */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t flex gap-3 bg-white items-center"
      >
        <input
          className="flex-1 border rounded-full px-4 py-2 shadow-sm"
          placeholder="Message..."
          value={input}
          onChange={handleTyping}
        />

        <button className="bg-blue-600 text-white px-5 py-2 rounded-full">
          Send
        </button>
      </form>

      {/* ⭐ VIDEO CALL MODAL ⭐ */}
      <VideoCallModal
        open={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        calleeId={friend?._id}
        callerId={myId}
        incomingFrom={incomingFrom}
        callType={callType}
        isIncoming={isIncomingCall}
        friend={friend}
      />
    </div>
  );
}
