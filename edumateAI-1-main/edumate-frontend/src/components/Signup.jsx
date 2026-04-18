import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import api from "../api/axios";

export default function Signup() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [enableFace, setEnableFace] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* STEP 1: Register user */
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/register", {
        ...form,
        enableFace,
      });

      if (enableFace) {
        setShowCamera(true);
      } else {
        navigate("/login");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* STEP 2: Capture face */
  const captureFace = async () => {
    if (!webcamRef.current) {
      alert("Camera not ready");
      return;
    }

    const image = webcamRef.current.getScreenshot();
    if (!image) {
      alert("Failed to capture image");
      return;
    }

    try {
      const res = await api.post("/face/register", {
        email: form.email,
        image,
      });

      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Face registration failed");
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">

        <h1 className="text-indigo-600 text-sm font-semibold text-center">
          Edumate AI
        </h1>
        <h2 className="text-2xl font-bold text-center mt-2">
          Create Account
        </h2>

        {!showCamera ? (
          <form className="space-y-4 mt-6" onSubmit={handleRegister}>
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-xl"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-xl"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-xl"
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={enableFace}
                onChange={(e) => setEnableFace(e.target.checked)}
              />
              Enable Face Login
            </label>

            <button
              disabled={loading}
              className="w-full py-3 text-indigo-600 rounded-xl font-semibold"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-4 text-center">
            <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/png"
            screenshotQuality={1}
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: "user",
            }}
            className="rounded-xl mx-auto"
          />


            <button
              onClick={captureFace}
              className="w-full py-3 text-indigo-600 rounded-xl font-semibold"
            >
              Capture Face
            </button>
          </div>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}
