import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function StudyPlan() {
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudyPlan();
  }, []);

  const fetchStudyPlan = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/studyplan/get", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 404) {
        // Generate new plan
        generateStudyPlan();
        return;
      }

      const data = await response.json();
      if (data.success) {
        setStudyPlan(data.study_plan);
      }
    } catch (err) {
      console.error("Error fetching study plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateStudyPlan = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/studyplan/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStudyPlan(data.study_plan);
      }
    } catch (err) {
      console.error("Error generating study plan:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!studyPlan) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-600 mb-4">No study plan found</p>
        <button
          onClick={() => navigate("/dashboard/performance")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Upload Marks First
        </button>
      </div>
    );
  }

  const plan = studyPlan.study_plan || {};
  const profile = studyPlan.student_profile || {};
  const overview = plan.overview || {};
  const schedule = plan.study_schedule || {};
  const weakPlan = plan.weak_subject_plan || {};
  const stressMgmt = plan.stress_management || {};
  const examPrep = plan.exam_preparation || {};

  const Tab = ({ name, label }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`px-4 py-2 font-medium rounded-lg transition ${
        activeTab === name
          ? "bg-indigo-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Your Personalized Study Plan</h1>
        <p className="text-indigo-100">Generated on {studyPlan.generated_at}</p>
      </div>

      {/* Student Profile */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-600">
          <p className="text-gray-600 text-sm">Current Performance</p>
          <p className="text-2xl font-bold text-indigo-600">{profile.performance_level}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-600">
          <p className="text-gray-600 text-sm">Percentage</p>
          <p className="text-2xl font-bold text-purple-600">{profile.current_performance}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-600">
          <p className="text-gray-600 text-sm">Stress Level</p>
          <p className="text-2xl font-bold text-red-600">{profile.stress_status}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-600">
          <p className="text-gray-600 text-sm">Weak Subjects</p>
          <p className="text-2xl font-bold text-orange-600">{profile.weak_subjects_count}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap overflow-x-auto">
        <Tab name="overview" label="📊 Overview" />
        <Tab name="schedule" label="📅 Schedule" />
        <Tab name="subjects" label="📚 Subject Strategies" />
        <Tab name="weak" label="⚠️ Weak Subjects" />
        <Tab name="stress" label="🧘 Stress Management" />
        <Tab name="exam" label="✏️ Exam Prep" />
        <Tab name="resources" label="🔗 Resources" />
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-indigo-600">📈 Performance Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-700">Focus Area</p>
                  <p className="text-lg text-indigo-600 font-bold">{overview.focus_area}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-700">Overall Strategy</p>
                  <p className="text-lg text-purple-600">{overview.overall_strategy}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Key Insights</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Estimated improvement: {overview.estimated_improvement}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">!</span>
                  <span>Priority Level: <strong>{overview.priority_level}</strong></span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === "schedule" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-indigo-600">📅 Weekly Study Schedule</h2>
            
            <div className="bg-indigo-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-semibold text-gray-700">Total Weekly Hours: {schedule.total_weekly_hours}</p>
              <p className="text-sm text-gray-600">Rest Days: {schedule.rest_days}</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg">Daily Schedule</h3>
              {Object.entries(schedule.daily_schedule || {}).map(([slot, details]) => (
                <div key={slot} className="border-l-4 border-indigo-600 pl-4 py-2">
                  <p className="font-semibold text-gray-800 capitalize">{slot}</p>
                  <p className="text-sm text-gray-600">{details.time}</p>
                  <p className="text-sm text-gray-700">📌 {details.focus}</p>
                  <p className="text-xs text-gray-500">Duration: {details.duration} | Break: {details.break}</p>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500 mt-4">
              <h3 className="font-bold mb-2">Weekly Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {Object.entries(schedule.weekly_breakdown || {}).map(([day, tasks]) => (
                  <div key={day} className="bg-white p-2 rounded">
                    <p className="font-semibold text-indigo-600">{day}</p>
                    <ul className="text-xs text-gray-600 list-disc list-inside">
                      {tasks.map((task, idx) => <li key={idx}>{task}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Subject Strategies Tab */}
        {activeTab === "subjects" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-indigo-600">📚 Subject-Specific Strategies</h2>
            
            {Object.entries(plan.subject_strategies || {}).map(([type, strategy]) => (
              <div key={type} className="border rounded-lg p-4 hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-gray-800 mb-3 capitalize">
                  {type.replace(/_/g, " ")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Approach: {strategy.approach}</p>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Daily Time: {strategy.daily_time}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Resources:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {strategy.resources?.map((r, i) => <li key={i}>• {r}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Key Tips:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {strategy.tips?.map((tip, i) => <li key={i}>✓ {tip}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Weak Subjects Tab */}
        {activeTab === "weak" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-orange-600">⚠️ Weak Subject Improvement Plan</h2>
            
            {weakPlan.status ? (
              <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-600">
                <p className="text-green-800 font-semibold">✓ {weakPlan.status}</p>
                <p className="text-green-700">{weakPlan.congratulations}</p>
              </div>
            ) : (
              <>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="font-bold text-red-800">Weak Subjects: {weakPlan.subjects?.join(", ")}</p>
                  <p className="text-sm text-red-700 mt-1">Focus Intensity: {weakPlan.focus_intensity}</p>
                  <p className="text-sm text-red-700">Time Allocation: {weakPlan.time_allocation}</p>
                </div>

                <div className="space-y-3">
                  {Object.entries(weakPlan.phases || {}).map(([phase, details]) => (
                    <div key={phase} className="border rounded-lg p-4 bg-orange-50">
                      <h4 className="font-bold text-gray-800 mb-2 capitalize">
                        {phase.replace(/_/g, " ")} - {details.duration}
                      </h4>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Focus: {details.focus}</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {details.activities?.map((activity, i) => (
                          <li key={i}>→ {activity}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                  <p className="font-bold text-blue-800 mb-2">Expected Improvement</p>
                  <p className="text-blue-700">{weakPlan.expected_improvement}</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Stress Management Tab */}
        {activeTab === "stress" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-red-600">🧘 Stress Management Plan</h2>
            
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-600">
              <p className="text-lg font-bold text-red-800">Current Stress Level: {stressMgmt.current_stress_level}</p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-gray-800">🎯 Immediate Actions</h3>
              <ul className="space-y-2">
                {stressMgmt.immediate_actions?.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-gray-800">🎧 Relaxation Techniques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stressMgmt.relaxation_techniques?.map((technique, i) => (
                  <div key={i} className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-600">
                    <p className="text-sm font-semibold text-gray-800">{technique}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-gray-800">🏠 Ideal Daily Routine</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm bg-blue-50 p-4 rounded-lg">
                {Object.entries(stressMgmt.daily_routine || {}).map(([time, activity]) => (
                  <div key={time} className="flex justify-between">
                    <span className="font-semibold text-gray-700">{time}:</span>
                    <span className="text-gray-600">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Exam Prep Tab */}
        {activeTab === "exam" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-purple-600">✏️ Exam Preparation Strategy</h2>
            
            <div>
              <h3 className="font-bold text-lg mb-3 text-gray-800">📅 Timeline by Weeks</h3>
              <div className="space-y-2">
                {Object.entries(examPrep.weeks_before_exam || {}).map(([week, tasks]) => (
                  <div key={week} className="border-l-4 border-purple-600 pl-4 py-2 bg-purple-50 rounded-r-lg">
                    <p className="font-bold text-gray-800 capitalize">{week.replace(/_/g, " ")}</p>
                    <ul className="text-sm text-gray-700 mt-1 space-y-1">
                      {tasks.map((task, i) => (
                        <li key={i}>→ {task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3 text-gray-800">💡 Exam Day Tips</h3>
              <ul className="space-y-2">
                {examPrep.exam_day_tips?.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 bg-yellow-50 p-2 rounded-lg">
                    <span className="text-yellow-600 font-bold">★</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === "resources" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-600">🔗 Learning Resources</h2>
            
            {Object.entries(plan.resources || {}).map(([category, items]) => (
              <div key={category} className="border rounded-lg p-4 hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-gray-800 mb-3 capitalize">
                  {category.replace(/_/g, " ")}
                </h3>
                <ul className="space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Goals */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">🎯 Weekly Goals & Checkpoints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(plan.weekly_goals || {}).map(([week, goal]) => (
            <div key={week} className="border-l-4 border-indigo-600 pl-4 py-2 bg-indigo-50 rounded-r-lg">
              <p className="font-bold text-gray-800 capitalize">{week.replace(/_/g, " ")}</p>
              <p className="text-sm text-gray-700 mt-1"><strong>Goal:</strong> {goal.goal}</p>
              <p className="text-sm text-gray-700"><strong>Target:</strong> {goal.target}</p>
              {goal.study_hours && (
                <p className="text-sm text-gray-700"><strong>Hours:</strong> {goal.study_hours}</p>
              )}
              {goal.measurable && (
                <p className="text-sm text-green-700 font-semibold mt-1">✓ {goal.measurable}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Motivation & Tips */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-purple-600">💪 Motivation & Success Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Affirmations</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {plan.motivation_tips?.affirmations?.map((aff, i) => (
                <li key={i}>✨ {aff}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-2">How to Handle Failures</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {plan.motivation_tips?.dealing_with_failures?.map((tip, i) => (
                <li key={i}>💪 {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-lg text-center">
        <p className="text-lg font-bold mb-3">Ready to start your study journey?</p>
        <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition">
          Start Studying Now
        </button>
      </div>
    </div>
  );
}
