import { FaPhone, FaVideo } from "react-icons/fa";

export default function CallButton({ onCallAudio, onCallVideo }) {
  return (
    <div className="flex gap-3 ml-4">
      <button
        onClick={onCallAudio}
        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
      >
        <FaPhone />
      </button>

      <button
        onClick={onCallVideo}
        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
      >
        <FaVideo />
      </button>
    </div>
  );
}
