import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(storedUser?.firstName || "");
  const [lastName, setLastName] = useState(storedUser?.lastName || "");
  const [bio, setBio] = useState(storedUser?.bio || "");
  const [image, setImage] = useState(null);

  // REMOVE PROFILE HANDLER
  async function handleRemovePhoto() {
    try {
      const res = await API.patch("/user/remove/profile-image");

      localStorage.setItem("user", JSON.stringify(res.data.result));

      alert("Profile photo removed!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to remove profile photo");
    }
  }

  // UPDATE PROFILE HANDLER
  async function handleUpdate(e) {
    e.preventDefault();

    const data = new FormData();
    data.append("firstName", firstName);
    data.append("lastName", lastName);
    data.append("bio", bio);

    if (image) {
      data.append("profileImage", image);
    }

    try {
      const res = await API.patch("/user/update/profile", data);

      localStorage.setItem("user", JSON.stringify(res.data.result));

      alert("Profile updated!");
      navigate("/feed");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">My Profile</h1>

      {/* PROFILE IMAGE + REMOVE BUTTON */}
      <div className="flex flex-col items-center mb-4">
        <img
          src={storedUser?.profileImage}
          alt="profile"
          className="w-24 h-24 rounded-full object-cover border"
        />

        <button
          type="button"
          onClick={handleRemovePhoto}
          className="text-red-600 text-sm underline mt-2"
        >
          Remove Profile Photo
        </button>
      </div>

      {/* UPDATE FORM */}
      <form onSubmit={handleUpdate} className="space-y-4">

        <input
          type="text"
          className="w-full p-3 border rounded"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          type="text"
          className="w-full p-3 border rounded"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <textarea
          className="w-full p-3 border rounded"
          placeholder="Bio"
          rows="3"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <label className="font-semibold">Update Profile Image:</label>
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />

        {/* UPDATE BUTTON — BACK AGAIN */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}
