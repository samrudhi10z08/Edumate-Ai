import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Stress() {
  const navigate = useNavigate();

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

  const agreementScale = likertScale;

  const getOptions = (index) => {
    if (index <= 6) return likertScale;
    if (index >= 7 && index <= 14) return yesNoMaybe;
    return agreementScale;
  };

  const [answers, setAnswers] = useState(Array(20).fill(""));
  const [result, setResult] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (index, value) => {
    const updated = [...answers];
    updated[index] = Number(value);
    setAnswers(updated);
  };

  //  NEW: Planner Intelligence Builder
  const buildPlannerInsights = (answers) => {
    let insights = [];

    // 🔹 A. Fatigue → session duration
    const fatigueScore =
      (answers[3] + answers[9] + answers[10] + answers[14]) / 4;

    if (fatigueScore >= 4) {
      insights.push(
        "High fatigue detected. Keep study sessions short (25–40 mins) with frequent breaks."
      );
    } else if (fatigueScore >= 3) {
      insights.push(
        "Moderate fatigue. Use balanced sessions (45–60 mins) with structured breaks."
      );
    } else {
      insights.push(
        "Low fatigue. You can handle longer sessions (60–90 mins)."
      );
    }

    // 🔹 B. Focus → best study time
    const focusScore = (answers[1] + answers[12]) / 2;

    if (focusScore >= 4) {
      insights.push(
        "Concentration issues detected. Prefer studying during high-energy periods (morning recommended)."
      );
    } else {
      insights.push(
        "Stable concentration. Flexible study timing should work well for you."
      );
    }

    // 🔹 C. Cognitive Capacity
    const confidenceScore = (answers[15] + answers[17]) / 2;

    if (confidenceScore >= 4) {
      insights.push(
        "High capability. Tackle difficult subjects first when your mind is fresh."
      );
    } else if (confidenceScore >= 3) {
      insights.push(
        "Moderate capability. Mix easy and difficult subjects to maintain balance."
      );
    } else {
      insights.push(
        "Lower confidence. Start with easier topics and gradually increase difficulty."
      );
    }

    return insights.join(" ");
  };

  const handleSubmit = async () => {
    if (answers.includes("")) {
      alert("Please answer all questions");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const student_id = user?._id;

    if (!student_id) {
      alert("Please login first");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/stress/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            student_id: student_id,
            answers: answers
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data.stress_level);

      //  Merge backend + planner intelligence
      const plannerInsights = buildPlannerInsights(answers);
      setAnalysis(data.analysis + " " + plannerInsights);

    } catch (error) {
      console.error(error);
      alert(error.message || "Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-indigo-600">
        Stress Analysis
      </h1>

      <div className="space-y-5">
        {questions.map((q, index) => {
          const options = getOptions(index);

          return (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <p className="font-medium mb-2">{q}</p>

              <div className="flex flex-wrap gap-4">
                {options.map((opt) => (
                  <label key={opt.value} className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name={`q-${index}`}
                      value={opt.value}
                      checked={answers[index] === opt.value}
                      onChange={() => handleChange(index, opt.value)}
                      className="form-radio text-indigo-600"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}

        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg 
          hover:bg-indigo-700 transition duration-200 font-medium"
        >
          {loading ? "Analyzing..." : "Analyze Stress"}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-indigo-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">
              Predicted Stress Level: {result}
            </h2>

            {analysis && (
              <p className="text-gray-700 leading-relaxed">
                {analysis}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => navigate("/dashboard/studyplan")}
            className=" bg-indigo-600 text-white py-2 rounded-lg 
            hover:bg-indigo-700 transition duration-200 font-medium"
          >
            Next → Get Study Plan
          </button>
        </div>
      </div>
    </div>
  );
}