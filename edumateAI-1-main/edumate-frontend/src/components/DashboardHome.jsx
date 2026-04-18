import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardHome() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    marksUploaded: false,
    performanceAnalyzed: false,
    stressAnalyzed: false
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserName(parsedUser.name);
    }

    // Check what's been completed
    checkStats();
  }, []);

  const checkStats = async () => {
    try {
      // Check if marks exist
      const marksRes = await fetch("http://127.0.0.1:5000/api/performance/marks", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setStats(prev => ({ ...prev, marksUploaded: marksRes.ok }));

      // Check if performance analyzed
      const perfRes = await fetch("http://127.0.0.1:5000/api/performance/analytics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setStats(prev => ({ ...prev, performanceAnalyzed: perfRes.ok }));
    } catch (err) {
      // Silently fail - these are optional checks
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Welcome Header */}
        <div className="mb-4 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, <span className="text-indigo-600">{userName || "Student"}</span>! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Let's track your academic performance and improve your study habits
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
          
          {/* Upload Marks Card */}
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 border-t-4 border-indigo-600 cursor-pointer"
               onClick={() => navigate("/dashboard/upload")}>
            <div className="text-4xl mb-2">📄</div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Upload Marks</h3>
            <p className="text-gray-600 mb-2 text-sm">Upload your marksheet or enter marks manually</p>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium">
              Get Started →
            </button>
          </div>

          {/* Performance Analysis Card */}
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 border-t-4 border-purple-600 cursor-pointer"
               onClick={() => navigate("/dashboard/performance")}>
            <div className="text-4xl mb-2">📊</div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Performance Analysis</h3>
            <p className="text-gray-600 mb-2 text-sm">View detailed charts and analytics of your grades</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium">
              View Analytics →
            </button>
          </div>

          {/* Stress Analysis Card */}
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 border-t-4 border-pink-600 cursor-pointer"
               onClick={() => navigate("/dashboard/stress")}>
            <div className="text-4xl mb-2">🧠</div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Stress Analysis</h3>
            <p className="text-gray-600 mb-2 text-sm">Get AI-powered stress level predictions and tips</p>
            <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition font-medium">
              Check Stress Level →
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Why EduMate AI?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            <div className="flex gap-2">
              <div className="text-3xl">🎯</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Smart Analytics</h3>
                <p className="text-gray-600 text-sm">Get insights into your academic performance with AI-powered analysis</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="text-3xl">📸</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Easy Mark Upload</h3>
                <p className="text-gray-600 text-sm">Upload marksheets via camera/PDF or enter marks manually</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="text-3xl">💡</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Personalized Insights</h3>
                <p className="text-gray-600 text-sm">Get personalized study recommendations based on your performance</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="text-3xl">🎓</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Study Plans</h3>
                <p className="text-gray-600 text-sm">Get customized study plans tailored to your needs</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="text-3xl">📈</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Track Progress</h3>
                <p className="text-gray-600 text-sm">Monitor your academic progress over time</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="text-3xl">😌</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Stress Management</h3>
                <p className="text-gray-600 text-sm">Get stress level analysis and management tips</p>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Steps */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Getting Started in 3 Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="text-center">
              <div className="bg-white text-indigo-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold mb-2">Upload Your Marks</h3>
              <p className="text-indigo-100">Upload a photo/PDF of your marksheet or enter marks manually</p>
            </div>

            <div className="text-center">
              <div className="bg-white text-indigo-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold mb-2">View Analytics</h3>
              <p className="text-indigo-100">See detailed performance analysis with interactive charts</p>
            </div>

            <div className="text-center">
              <div className="bg-white text-indigo-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold mb-2">Get Recommendations</h3>
              <p className="text-indigo-100">Receive personalized study plans and insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
