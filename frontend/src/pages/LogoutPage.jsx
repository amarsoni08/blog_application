import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutPage() {
  const navigate = useNavigate();

  // Disable browser back button
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", () => {
      window.history.pushState(null, "", window.location.href);
    });
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          You have been logged out
        </h1>

        <p className="text-gray-600 mb-6">
          Your session has ended. Please login again to continue.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Login Again
        </button>
      </div>
    </div>
  );
}
