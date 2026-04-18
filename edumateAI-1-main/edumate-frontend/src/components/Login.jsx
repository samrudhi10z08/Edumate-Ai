import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import api from "../api/axios";



export default function Login() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const [mode, setMode] = useState("password"); // password | face
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* Password Login */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // Redirect to dashboard after short delay for smooth transition
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  /* Face Login */
  const loginWithFace = async () => {
    setLoading(true);
    try {
      const image = webcamRef.current.getScreenshot();
      if (!image) {
        alert("Camera not ready");
        setLoading(false);
        return;
      }

      const res = await api.post("/face/login", { image });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // Redirect to dashboard after short delay for smooth transition
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      alert(err.response?.data?.message || "Face login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10">

        {/* Header */}
        <h1 className="text-indigo-600 text-sm font-semibold text-center tracking-wide">
          Edumate AI
        </h1>
        <h2 className="text-2xl font-bold text-center mt-1">
          Welcome back
        </h2>
        <p className="text-center text-slate-500 text-sm mt-1 mb-6">
          Login to your Edumate AI account
        </p>

        {/* MODE TOGGLE */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
  <button
    onClick={() => setMode("password")}
    className={`flex-1 py-2 rounded-lg font-medium transition ${
      mode === "password"
        ? "bg-white shadow text-indigo-600"
        : "text-slate-500"
    }`}
  >
    Password
  </button>

  <button
    onClick={() => setMode("face")}
    className={`flex-1 py-2 rounded-lg font-medium transition ${
      mode === "face"
        ? "bg-white shadow text-indigo-600"
        : "text-slate-500"
    }`}
  >
    Face
  </button>
</div>
        {/* PASSWORD LOGIN */}
        {mode === "password" && (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-lg transition ${
                loading
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>
        )}

       {/* FACE LOGIN */}
       {mode === "face" && (
       <div className="space-y-5 text-center">
       <Webcam
           ref={webcamRef}
           audio={false}
           screenshotFormat="image/jpeg"
           screenshotQuality={1}
           videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user",
           }}
         />


          <button
            onClick={loginWithFace}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-lg transition ${
              loading
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Authenticating...
              </span>
            ) : (
              "Login with Face"
            )}
          </button>
        </div>
      )}



        <p className="text-center text-sm text-slate-500 mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-indigo-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
