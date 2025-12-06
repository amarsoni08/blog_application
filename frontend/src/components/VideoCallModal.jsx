// src/components/VideoCallModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { socket } from "../socket";

export default function VideoCallModal({
  open,
  onClose,
  callerId,
  calleeId,
  incomingFrom,
  callType = "video",
  isIncoming = false,
  friend,
}) {
  // ------------------------------------
  // REFS
  // ------------------------------------
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const remoteAudio = useRef(null);   // 🔥 NEW (for remote sound)
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  const [incomingOffer, setIncomingOffer] = useState(null);
  const [status, setStatus] = useState(isIncoming ? "ringing" : "calling");

  // ------------------------------------
  // CREATE PEER CONNECTION
  // ------------------------------------
  function createPC() {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.ontrack = (event) => {
      // Remote VIDEO stream
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
      }

      // Remote AUDIO stream 🔥 (required for voice)
      if (remoteAudio.current) {
        remoteAudio.current.srcObject = event.streams[0];
      }

      setStatus("in-call");
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc-ice-candidate", {
          to: incomingFrom || calleeId,
          candidate: event.candidate,
        });
      }
    };

    pcRef.current = pc;
    return pc;
  }

  // ------------------------------------
  // START CAMERA + MIC
  // ------------------------------------
  async function startMedia() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,                    // 🔥 Always true
      video: callType === "video",    // 🔥 video only when video call
    });

    localStreamRef.current = stream;

    if (localVideo.current) {
      localVideo.current.srcObject = stream;
    }

    const pc = createPC();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  }

  // ------------------------------------
  // ACCEPT CALL
  // ------------------------------------
  async function acceptCall() {
    setStatus("connecting");

    const pc = createPC();
    await startMedia();

    await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("webrtc-answer", {
      to: incomingFrom,
      answer,
    });

    setStatus("in-call");
  }

  // ------------------------------------
  // END CALL
  // ------------------------------------
  function endCall() {
    try {
      localStreamRef.current?.getTracks()?.forEach((t) => t.stop());
      remoteVideo.current?.srcObject?.getTracks()?.forEach((t) => t.stop());
    } catch {}

    try {
      pcRef.current?.close();
    } catch {}

    pcRef.current = null;
    localStreamRef.current = null;

    socket.emit("end-call", {
      to: incomingFrom || calleeId,
    });

    onClose();
  }

  // ------------------------------------
  // SOCKET EVENTS
  // ------------------------------------
  useEffect(() => {
    if (!open) return;

    // Caller
    if (!isIncoming) {
      (async () => {
        const pc = createPC();
        await startMedia();

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("webrtc-offer", {
          to: calleeId,
          offer,
        });
      })();
    }

    const onOffer = ({ offer }) => {
      setIncomingOffer(offer);
      if (isIncoming) setStatus("ringing");
    };

    const onAnswer = async ({ answer }) => {
      const pc = createPC();
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      setStatus("in-call");
    };

    const onIce = async ({ candidate }) => {
      try {
        await pcRef.current?.addIceCandidate(candidate);
      } catch {}
    };

    const onEnd = () => endCall();

    socket.on("webrtc-offer", onOffer);
    socket.on("webrtc-answer", onAnswer);
    socket.on("webrtc-ice-candidate", onIce);
    socket.on("call-ended", onEnd);
    socket.on("call-rejected", onEnd);

    return () => {
      socket.off("webrtc-offer", onOffer);
      socket.off("webrtc-answer", onAnswer);
      socket.off("webrtc-ice-candidate", onIce);
      socket.off("call-ended", onEnd);
      socket.off("call-rejected", onEnd);
    };
  }, [open]);

  if (!open) return null;

  // ------------------------------------
  // UI
  // ------------------------------------
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[750px] p-4">

        {/* Caller Info */}
        <div className="flex items-center gap-3 mb-3">
          <img src={friend?.profileImage} className="w-14 h-14 rounded-full" />

          <div>
            <h2 className="text-xl font-bold">
              {isIncoming
                ? `${friend?.firstName} is calling you…`
                : `Calling ${friend?.firstName}…`}
            </h2>

            <p className="text-gray-500">{status}</p>
          </div>
        </div>

        {/* Videos */}
        <div className="flex gap-4">
          <video ref={localVideo} muted autoPlay playsInline className="w-1/3 bg-black" />
          <video ref={remoteVideo} autoPlay playsInline className="flex-1 bg-black" />
        </div>

        {/* Remote AUDIO element (for sound) */}
        <audio ref={remoteAudio} autoPlay playsInline />

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          {isIncoming && status === "ringing" && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={acceptCall}
            >
              Accept
            </button>
          )}

          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={endCall}
          >
            End Call
          </button>
        </div>
      </div>
    </div>
  );
}
