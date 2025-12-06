// src/components/ReactionPopup.jsx
import React from "react";

const REACTIONS = ["❤️","😂","🔥","😮","👍"];

export default function ReactionPopup({ onReact, onClose }) {
  return (
    <div className="absolute bottom-20 right-10 bg-white p-2 rounded-full shadow flex gap-2 z-50">
      {REACTIONS.map((r) => (
        <button key={r} onClick={() => { onReact(r); onClose(); }} className="text-2xl">
          {r}
        </button>
      ))}
    </div>
  );
}
