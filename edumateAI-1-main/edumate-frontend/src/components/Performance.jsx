import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { getPerformanceAnalytics } from "../api/axios";

export default function Performance() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getPerformanceAnalytics();
        if (res.data.success) {
          setAnalytics(res.data);
        } else {
          setError(res.data.message || "Failed to load performance analytics");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load performance analytics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // ========== LOADING & ERROR STATES ==========
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 max-w-md">
          <h2 className="text-red-700 font-semibold mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/dashboard/upload-marks")}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Upload Marks First
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No performance data available</p>
      </div>
    );
  }

  // ========== COLOR SCHEMES ==========
  const COLORS = ["#4f46e5", "#7c3aed", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
  const gradeColors = {
    excellent: "#10b981",
    good: "#3b82f6",
    average: "#f59e0b",
    poor: "#ef4444"
  };

  // ========== CALCULATED DATA ==========
  const performanceDistribution = [
    { name: "Excellent (9-10)", value: analytics.excellentCount, color: "#10b981" },
    { name: "Good (7-8)", value: analytics.goodCount, color: "#3b82f6" },
    { name: "Average (5-6)", value: analytics.averageCount, color: "#f59e0b" },
    { name: "Poor (<5)", value: analytics.poorCount, color: "#ef4444" }
  ].filter(item => item.value > 0);

  const radarData = analytics.chartData.slice(0, 8).map(item => ({
    subject: item.subject,
    grade: item.grade,
    fullMark: 10
  }));

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">
            Performance Dashboard
          </h1>
          <p className="text-gray-600">
            Last updated: {new Date(analytics.updated_at).toLocaleDateString()}
          </p>
        </div>

        {/* OVERALL STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          
          {/* GPA Card */}
          <div className="bg-white rounded-xl shadow-md border border-indigo-100 p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">GPA</p>
                <p className="text-3xl font-bold text-indigo-600">{analytics.gpa}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">out of 10</p>
          </div>

          {/* Percentage Card */}
          <div className="bg-white rounded-xl shadow-md border border-purple-100 p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Percentage</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.percentage}%</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">overall score</p>
          </div>

          {/* Performance Level Card */}
          <div className="bg-white rounded-xl shadow-md border border-pink-100 p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Performance</p>
                <p className="text-2xl font-bold text-pink-600">{analytics.performance_level}</p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">based on ML model</p>
          </div>

          {/* Total Subjects Card */}
          <div className="bg-white rounded-xl shadow-md border border-amber-100 p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Subjects</p>
                <p className="text-3xl font-bold text-amber-600">{analytics.totalSubjects}</p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">subjects recorded</p>
          </div>
        </div>

        {/* MAIN CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Subject-wise Grades Bar Chart */}
          <div className="bg-white rounded-xl shadow-md border p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Subject-wise Grades</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.chartData} margin={{ left: 0, right: 10, top: 10, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="subject"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  formatter={(value) => value.toFixed(1)}
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-gray-900 text-white p-2 rounded shadow-lg">
                          <p className="text-sm">{payload[0].payload.fullSubject}</p>
                          <p className="font-semibold">{payload[0].value.toFixed(1)}/10</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="grade" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Distribution Pie Chart */}
          <div className="bg-white rounded-xl shadow-md border p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Performance Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {performanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RADAR CHART & CATEGORY COMPARISON */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Radar Chart */}
          <div className="bg-white rounded-xl shadow-md border p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Subject Comparison (First 8)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 10]} />
                <Radar
                  name="Grade"
                  dataKey="grade"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.6}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Comparison Bar Chart */}
          <div className="bg-white rounded-xl shadow-md border p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Theory vs Computational</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.categoryComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  formatter={(value) => value.toFixed(2)}
                  cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="average" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DETAILED ANALYSIS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Strong Subjects */}
          <div className="bg-white rounded-xl shadow-md border border-green-100 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="text-2xl">⭐</span> Strong Subjects
            </h2>
            {analytics.strongSubjects.length > 0 ? (
              <div className="space-y-2">
                {analytics.strongSubjects.map((subject, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-gray-700">{subject.subject}</span>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {subject.grade}/10
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No strong subjects yet</p>
            )}
          </div>

          {/* Weak Subjects */}
          <div className="bg-white rounded-xl shadow-md border border-red-100 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span> Areas for Improvement
            </h2>
            {analytics.weakSubjects.length > 0 ? (
              <div className="space-y-2">
                {analytics.weakSubjects.map((subject, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-gray-700">{subject.subject}</span>
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {subject.grade}/10
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No weak subjects - Great job!</p>
            )}
          </div>
        </div>

        {/* AI ANALYSIS & INSIGHTS */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-md border border-indigo-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🤖</span> AI Analysis & Insights
          </h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            {analytics.analysis}
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-200">
            <div>
              <p className="text-gray-600 text-sm">Theory Average</p>
              <p className="text-2xl font-bold text-indigo-600">{analytics.theoryAverage}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Computational Avg</p>
              <p className="text-2xl font-bold text-purple-600">{analytics.compAverage}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Excellent Subjects</p>
              <p className="text-2xl font-bold text-green-600">{analytics.excellentCount}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Needs Work</p>
              <p className="text-2xl font-bold text-red-600">{analytics.poorCount}</p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/dashboard/upload-marks")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            ← Update Marks
          </button>
          <button
            onClick={() => navigate("/dashboard/stress")}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition"
          >
            Next → Get Stress Analysis
          </button>
        </div>
      </div>
    </div>
  );
}