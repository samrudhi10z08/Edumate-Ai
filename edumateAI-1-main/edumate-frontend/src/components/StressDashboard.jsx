import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function StressDashboard() {
  const [stressData, setStressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [answers, setAnswers] = useState(Array(20).fill(""));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Questionnaire questions and scales
  const questions = [
    "1. I feel overwhelmed by my academic workload.",
    "2. I have difficulty concentrating on studies.",
    "3. I feel nervous before exams.",
    "4. I feel mentally exhausted after studying.",
    "5. I feel pressure to achieve high grades.",
    "6. I struggle to manage my study time.",
    "7. I feel anxious about my academic future.",

    "8. Do you feel stressed daily?",
    "9. Do you have trouble sleeping?",
    "10. Do you feel physically tired often?",
    "11. Do you feel difficulty relaxing?",
    "12. Do you experience headaches due to stress?",
    "13. Do you feel distracted easily?",
    "14. Do you feel irritated frequently?",
    "15. Do you feel emotionally drained?",

    "16. I feel confident about handling academic challenges.",
    "17. I feel supported by friends or family.",
    "18. I feel capable of managing stress effectively.",
    "19. I feel satisfied with my academic performance.",
    "20. I feel positive about my studies."
  ];

  const likertScale = [
    { label: "Strongly Disagree", value: 1 },
    { label: "Disagree", value: 2 },
    { label: "Neutral", value: 3 },
    { label: "Agree", value: 4 },
    { label: "Strongly Agree", value: 5 }
  ];

  const yesNoMaybe = [
    { label: "Yes", value: 1 },
    { label: "No", value: 0 },
    { label: "Maybe", value: 2 }
  ];

  const getOptions = (index) => {
    if (index <= 6) return likertScale;
    if (index >= 7 && index <= 14) return yesNoMaybe;
    return likertScale;
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...answers];
    updated[index] = Number(value);
    setAnswers(updated);
  };

  const handleSubmitQuestionnaire = async () => {
    if (answers.includes("")) {
      alert("Please answer all questions");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await fetch("http://127.0.0.1:5000/api/stress/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          student_id: user?._id,
          answers: answers,
        }),
      });

      if (!response.ok) throw new Error("Failed to analyze stress");

      const data = await response.json();
      setStressData(data);
      setShowQuestionnaire(false);
      setActiveTab("results");
    } catch (err) {
      console.error("Error:", err);
      alert("Error analyzing stress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stressFactorsData = [
    { name: "Workload", value: answers[0] || 0 },
    { name: "Concentration", value: answers[1] || 0 },
    { name: "Exam Anxiety", value: answers[2] || 0 },
    { name: "Exhaustion", value: answers[3] || 0 },
    { name: "Pressure", value: answers[4] || 0 },
    { name: "Time Mgmt", value: answers[5] || 0 }
  ];

  const historyData = [
    { date: "Mon", stress: 5, focus: 6 },
    { date: "Tue", stress: 6, focus: 5 },
    { date: "Wed", stress: 7, focus: 4 },
    { date: "Thu", stress: 8, focus: 3 },
    { date: "Fri", stress: 7, focus: 4 },
    { date: "Sat", stress: 4, focus: 8 },
    { date: "Sun", stress: 5, focus: 7 },
  ];

  const pieData = [
    { name: "Low", value: 20 },
    { name: "Medium", value: 50 },
    { name: "High", value: 20 },
    { name: "Critical", value: 10 },
  ];

  const pieColors = ["#10B981", "#F59E0B", "#EF4444", "#8B0000"];

  const getStressColor = (level) => {
    if (!level) return "#3B82F6";
    if (level === "low") return "#10B981";
    if (level === "medium") return "#F59E0B";
    if (level === "high") return "#EF4444";
    if (level === "critical") return "#8B0000";
    return "#3B82F6";
  };

  const getStressBgColor = (level) => {
    if (!level) return "bg-blue-100";
    if (level === "low") return "bg-green-100";
    if (level === "medium") return "bg-yellow-100";
    if (level === "high") return "bg-red-100";
    if (level === "critical") return "bg-red-900/20";
    return "bg-blue-100";
  };

  const getStressTextColor = (level) => {
    if (!level) return "text-blue-800";
    if (level === "low") return "text-green-800";
    if (level === "medium") return "text-yellow-800";
    if (level === "high") return "text-red-800";
    if (level === "critical") return "text-red-900";
    return "text-blue-800";
  };

  // Calculate personalized tips based on questionnaire answers
  const getPersonalizedTips = () => {
    const workloadScore = answers[0];
    const concentrationScore = answers[1];
    const examAnxietyScore = answers[2];
    const exhaustionScore = answers[3];
    const pressureScore = answers[4];
    const timeManagementScore = answers[5];
    const anxietyFutureScore = answers[6];
    const dailyStressScore = answers[7];
    const sleepScore = answers[8];
    const tiredScore = answers[9];
    const relaxScore = answers[10];
    const headacheScore = answers[11];
    const distractedScore = answers[12];
    const irritatedScore = answers[13];
    const drainedScore = answers[14];

    // Identify top stress factors
    const factors = [];

    if (sleepScore >= 2 || tiredScore >= 2) {
      factors.push({ name: "Sleep Issues", score: (sleepScore + tiredScore) / 2, category: "sleep" });
    }
    if (concentrationScore >= 3 || distractedScore >= 2) {
      factors.push({ name: "Poor Concentration", score: (concentrationScore + distractedScore) / 2, category: "focus" });
    }
    if (examAnxietyScore >= 3) {
      factors.push({ name: "Exam Anxiety", score: examAnxietyScore, category: "exam-prep" });
    }
    if (timeManagementScore >= 3) {
      factors.push({ name: "Time Management", score: timeManagementScore, category: "time-management" });
    }
    if (irritatedScore >= 2 || drainedScore >= 2) {
      factors.push({ name: "Mood Issues", score: (irritatedScore + drainedScore) / 2, category: "mental-wellness" });
    }
    if (workloadScore >= 3) {
      factors.push({ name: "High Workload", score: workloadScore, category: "time-management" });
    }

    factors.sort((a, b) => b.score - a.score);
    const topFactors = factors.slice(0, 3).map(f => f.category);

    const allTips = {
      "sleep": {
        emoji: "🌙",
        title: "Sleep Optimization",
        color: "bg-blue-50 border-blue-600",
        textColor: "text-blue-900",
        tips: [
          "Maintain consistent sleep schedule (go to bed at same time)",
          "Target 7-8 hours of sleep nightly",
          "Avoid screens 1 hour before bed",
          "Keep bedroom cool, dark, and quiet",
          "Avoid caffeine after 2 PM"
        ],
        priority: "HIGH"
      },
      "focus": {
        emoji: "🎯",
        title: "Improve Concentration",
        color: "bg-indigo-50 border-indigo-600",
        textColor: "text-indigo-900",
        tips: [
          "Study in distraction-free environment",
          "Use Pomodoro technique (25 min focus, 5 min break)",
          "Put phone in another room during study",
          "Minimize notifications and tabs",
          "Practice mindfulness or meditation before studying"
        ],
        priority: "HIGH"
      },
      "exam-prep": {
        emoji: "📚",
        title: "Exam Confidence Building",
        color: "bg-purple-50 border-purple-600",
        textColor: "text-purple-900",
        tips: [
          "Start exam prep 3-4 weeks in advance",
          "Practice with past papers and mock tests",
          "Focus on weaker topics first",
          "Form study groups for discussion",
          "Visualize success before exams"
        ],
        priority: "HIGH"
      },
      "time-management": {
        emoji: "⏰",
        title: "Time Management Mastery",
        color: "bg-yellow-50 border-yellow-600",
        textColor: "text-yellow-900",
        tips: [
          "Use a planner or calendar app",
          "Break large tasks into smaller steps",
          "Prioritize 3 main tasks each day",
          "Learn to say 'no' to non-essentials",
          "Review and adjust daily schedule"
        ],
        priority: "HIGH"
      },
      "mental-wellness": {
        emoji: "🧘",
        title: "Mental Wellness",
        color: "bg-pink-50 border-pink-600",
        textColor: "text-pink-900",
        tips: [
          "Practice deep breathing (4-7-8 technique)",
          "Journal thoughts and feelings daily",
          "Maintain regular contact with friends",
          "Take 10-minute meditation breaks",
          "Practice gratitude journaling"
        ],
        priority: "MEDIUM"
      }
    };

    return topFactors.map(category => allTips[category]).filter(Boolean);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4 rounded-lg">
        <h1 className="text-3xl font-bold mb-1">Stress Analysis Dashboard</h1>
        <p className="text-red-100">Track and manage your academic stress levels</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-medium rounded-lg transition whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => {
            setShowQuestionnaire(true);
            setActiveTab("assessment");
            setCurrentQuestionIndex(0);
          }}
          className={`px-4 py-2 font-medium rounded-lg transition whitespace-nowrap ${
            activeTab === "assessment"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          📋 Assessment Quiz
        </button>
        {stressData && (
          <>
            <button
              onClick={() => setActiveTab("results")}
              className={`px-4 py-2 font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === "results"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📈 Results
            </button>
            <button
              onClick={() => setActiveTab("factors")}
              className={`px-4 py-2 font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === "factors"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🎯 Factors
            </button>
            <button
              onClick={() => setActiveTab("tips")}
              className={`px-4 py-2 font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === "tips"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              💡 Tips
            </button>
          </>
        )}
      </div>

      {/* Questionnaire Modal */}
      {showQuestionnaire && activeTab !== "assessment" && (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Stress Assessment Quiz</h2>
            <button
              onClick={() => setShowQuestionnaire(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <p className="text-gray-700 text-center py-4">
            Please click the <strong>📋 Assessment Quiz</strong> tab above to start the questionnaire.
          </p>
        </div>
      )}

      {/* Assessment Tab - Card Format */}
      {activeTab === "assessment" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-lg">
            <h2 className="text-2xl font-bold mb-1">Stress Assessment Quiz</h2>
            <p className="text-red-100">Answer questions to get your personalized stress analysis</p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <p className="text-sm font-semibold text-red-600">
                {Math.round((currentQuestionIndex / questions.length) * 100)}% Complete
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Single Question Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-600 min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  {currentQuestionIndex + 1}
                </span>
                <h3 className="text-xl font-bold text-gray-800">{questions[currentQuestionIndex]}</h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {getOptions(currentQuestionIndex).map((opt) => (
                  <label 
                    key={opt.value} 
                    className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition border-2 ${
                      answers[currentQuestionIndex] === opt.value
                        ? "bg-red-100 border-red-600"
                        : "bg-gray-50 border-gray-200 hover:border-red-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${currentQuestionIndex}`}
                      value={opt.value}
                      checked={answers[currentQuestionIndex] === opt.value}
                      onChange={() => handleQuestionChange(currentQuestionIndex, opt.value)}
                      className="form-radio text-red-600 w-5 h-5"
                    />
                    <span className="text-base text-gray-800 font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t-2 border-gray-100">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex-1 bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() => {
                    if (answers[currentQuestionIndex] !== "") {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                    } else {
                      alert("Please answer this question before moving to the next");
                    }
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuestionnaire}
                  disabled={loading || answers.includes("")}
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {loading ? "Analyzing..." : "✓ Submit & Analyze"}
                </button>
              )}
            </div>
          </div>

          {/* Answered Questions Summary */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
            <p className="text-sm font-semibold text-blue-900">
              ✓ Answered: {answers.filter(a => a !== "").length} / {questions.length}
            </p>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === "overview" && !showQuestionnaire && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 rounded-lg shadow">
              <p className="text-sm font-semibold mb-1">Low Stress</p>
              <p className="text-3xl font-bold">20%</p>
              <p className="text-xs mt-1 opacity-90">Well managed</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-3 rounded-lg shadow">
              <p className="text-sm font-semibold mb-1">Medium Stress</p>
              <p className="text-3xl font-bold">50%</p>
              <p className="text-xs mt-1 opacity-90">Room for improvement</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-3 rounded-lg shadow">
              <p className="text-sm font-semibold mb-1">High Stress</p>
              <p className="text-3xl font-bold">30%</p>
              <p className="text-xs mt-1 opacity-90">Needs attention</p>
            </div>
          </div>

          {stressData ? (
            <div className={`${getStressBgColor(stressData.stress_level)} p-3 rounded-lg border-l-4 border-red-600`}>
              <p className="text-sm font-semibold text-gray-700 mb-1">Current Stress Level</p>
              <p className={`text-3xl font-bold ${getStressTextColor(stressData.stress_level)}`}>
                {stressData.stress_level?.toUpperCase() || "NOT ASSESSED"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {stressData.stress_level === "low"
                  ? "✅ Your stress levels are healthy. Keep maintaining good habits!"
                  : stressData.stress_level === "medium"
                  ? "⚠️ Moderate stress detected. Consider implementing stress management techniques."
                  : "🔴 High stress - Implement stress management and seek support if needed."}
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-600 text-center">
              <p className="text-gray-700 mb-3">Take the assessment quiz to get your stress analysis</p>
              <button
                onClick={() => {
                  setShowQuestionnaire(true);
                  setActiveTab("assessment");
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
              >
                📋 Start Assessment Quiz
              </button>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Weekly Stress Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === "results" && stressData && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className={`${getStressBgColor(stressData.stress_level)} p-6 rounded-lg border-l-4 border-red-600`}>
            <h2 className="text-2xl font-bold mb-2">Your Stress Assessment Results</h2>
            <p className={`text-3xl font-bold ${getStressTextColor(stressData.stress_level)}`}>
              {stressData.stress_level?.toUpperCase()}
            </p>
            {stressData.analysis && (
              <p className="text-gray-700 mt-3 leading-relaxed">{stressData.analysis}</p>
            )}
          </div>
        </div>
      )}
      )}

      {/* Factors Tab */}
      {activeTab === "factors" && stressData && (
        <div className="space-y-3">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Your Stress Profile</h3>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={stressFactorsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={90} domain={[0, 5]} />
                <Radar
                  name="Stress Level"
                  dataKey="value"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Factor Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stressFactorsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="value" fill="#EF4444" name="Stress Level" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Stress Trend (Weekly)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="stress"
                  stroke="#EF4444"
                  fillOpacity={1}
                  fill="url(#colorStress)"
                  name="Stress Level"
                />
                <Area
                  type="monotone"
                  dataKey="focus"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorFocus)"
                  name="Focus Level"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Stress Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="stress" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={{ fill: '#EF4444', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Stress Level"
                />
                <Line 
                  type="monotone" 
                  dataKey="focus" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Focus Level"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-bold mb-3 text-gray-800">Stress by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-bold mb-3 text-gray-800">Score Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" type="category" />
                  <YAxis dataKey="stress" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Stress Pattern" dataKey="stress" data={historyData} fill="#EF4444" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tips Tab - Personalized */}
      {activeTab === "tips" && stressData && (
        <div className="space-y-3">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded-lg">
            <p className="text-sm font-semibold text-blue-900">
              💡 Personalized tips based on your assessment
            </p>
          </div>

          <div className="space-y-3">
            {getPersonalizedTips().map((tipCategory, idx) => (
              <div key={idx} className={`${tipCategory.color} p-3 rounded-lg border-l-4 shadow hover:shadow-lg transition`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-bold text-sm ${tipCategory.textColor}`}>
                    {tipCategory.emoji} {tipCategory.title}
                  </h3>
                  <span className="text-xs font-semibold bg-red-500 text-white px-2 py-1 rounded">
                    {tipCategory.priority}
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-gray-700">
                  {tipCategory.tips.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setAnswers(Array(20).fill(""));
              setCurrentQuestionIndex(0);
              setActiveTab("assessment");
              setShowQuestionnaire(false);
            }}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700"
          >
            🔄 Retake Assessment
          </button>
        </div>
      )}
    </div>
  );
}
