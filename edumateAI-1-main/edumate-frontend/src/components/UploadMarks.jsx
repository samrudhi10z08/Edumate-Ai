import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveMarks, extractMarksOCR } from "../api/axios";

export default function UploadMarks() {
  const [mode, setMode] = useState("upload");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [ocrResults, setOcrResults] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);

  const validGrades = ["O", "A+", "A", "B+", "B", "C", "D", "P", "F"];

  const subjectsList = [
   
    'Systems in mechanical engg',
    'Basic electrical engg',
    'Engineering  Physics',
    'Programming & Problem solving',
    'Engg Mathematics - I',
    'Engineering  Mechanics',
    'Basic electronics engineering ',
    'Engg Chemistry',
    'Engg Graphics',
    'Engg Mathematics II',
    'Fundamentals of Programming Languages\n(For 2024 Pattern only!)'
  ];

  const [grades, setGrades] = useState(
    subjectsList.map(() => "")
  );

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a file first");
      return;
    }

    setOcrLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setOcrResults(null);

    try {
      const response = await extractMarksOCR(file);

      if (response.data.success && response.data.marks.length > 0) {
        // Map OCR results to subject list and auto-fill grades
        const extractedMarks = response.data.marks;
        const updatedGrades = [...grades];

        extractedMarks.forEach((mark) => {
          const subjectIndex = subjectsList.findIndex(
            (s) => s.toLowerCase().includes(mark.subject.toLowerCase()) ||
                   mark.subject.toLowerCase().includes(s.toLowerCase())
          );
          if (subjectIndex !== -1) {
            updatedGrades[subjectIndex] = mark.grade;
          }
        });

        setGrades(updatedGrades);
        setOcrResults({
          extracted: extractedMarks.length,
          total: subjectsList.length,
          marks: extractedMarks,
        });
        setSuccessMessage(
          `✓ OCR extracted ${extractedMarks.length} subject(s) successfully! Grades auto-filled.`
        );
      } else {
        setErrorMessage(
          response.data.message || "No marks could be extracted from the file"
        );
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to extract marks from file";
      const suggestion = error.response?.data?.suggestion;
      
      const fullMessage = suggestion ? `${errorMsg}\n\n💡 ${suggestion}` : errorMsg;
      setErrorMessage(fullMessage);
      console.error("OCR Error:", error);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleGradeChange = (index, value) => {
    const updated = [...grades];
    const upperValue = value.toUpperCase();

    updated[index] = upperValue;
    setGrades(updated);

    if (upperValue === "" || validGrades.includes(upperValue)) {
      setErrors((prev) => ({
        ...prev,
        [index]: "",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [index]: "Invalid grade",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    let hasErrors = false;
    const validationErrors = {};

    grades.forEach((grade, index) => {
      if (!grade) {
        validationErrors[index] = "Grade is required";
        hasErrors = true;
      } else if (!validGrades.includes(grade)) {
        validationErrors[index] = "Invalid grade";
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(validationErrors);
      setErrorMessage("Please fix all errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const marksData = subjectsList.map((subject, index) => ({
        subject,
        grade: grades[index],
      }));

      await saveMarks(marksData);

      setSuccessMessage("✓ Marks saved successfully!");
      setGrades(subjectsList.map(() => ""));
      setErrors({});

      setTimeout(() => {
        navigate("/dashboard/performance");
      }, 2000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to save marks";
      setErrorMessage(errorMsg);
      console.error("Error saving marks:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-2xl">

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-indigo-600 text-center">
          Upload Marksheet
        </h1>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border">

          {/* Toggle Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium ${
                mode === "upload"
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              Upload Marksheet
            </button>

            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium ${
                mode === "manual"
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              Enter Manually
            </button>
          </div>

          {/* Success */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Error */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg whitespace-pre-wrap">
              {errorMessage}
            </div>
          )}

          {/* Upload Mode */}
          {mode === "upload" ? (
            <>
              <label className="block mb-3 text-sm font-medium text-slate-700">
                Choose Marksheet File (PDF/Image)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={ocrLoading}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-100
                       file:text-indigo-600 hover:file:bg-indigo-200 cursor-pointer disabled:opacity-50"
              />
              {file && (
                <p className="mt-3 text-sm text-slate-500 break-all">
                  Selected: <span className="font-medium">{file.name}</span>
                </p>
              )}

              {/* OCR Results Preview */}
              {ocrResults && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    ✓ Extracted {ocrResults.extracted} of {ocrResults.total} subjects:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {ocrResults.marks.map((mark, idx) => (
                      <li key={idx}>
                        <span className="font-medium">{mark.subject}</span> → {mark.grade}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || ocrLoading}
                className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl
                         hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ocrLoading ? "Processing OCR..." : "Upload & Extract Marks"}
              </button>

              {/* Switch to Manual Mode */}
              <p className="mt-4 text-center text-sm text-slate-600">
                Can't upload? Switch to{" "}
                <button
                  onClick={() => setMode("manual")}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  manual entry
                </button>
              </p>

              {/* Setup Info */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                <p className="font-semibold mb-2">📋 OCR Troubleshooting:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Upload a clear image (JPG/PNG) of your marksheet</li>
                  <li>Ensure text is readable and not too small</li>
                  <li>If PDF upload fails, try converting to image first</li>
                  <li>Use manual entry mode as an alternative</li>
                </ul>
              </div>
            </>
                          ) : (
           
                  <form onSubmit={handleSubmit} className="space-y-4">

              {subjectsList.map((subject, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-3 bg-gray-50 p-3 rounded-lg"
                >
                  {/* Subject */}
                  <div className="w-full sm:w-1/2 font-medium text-slate-700">
                    {subject}
                  </div>

                  {/* Grade */}
                  <div className="w-full sm:w-1/2">
                    <input
                      type="text"
                      value={grades[index]}
                      onChange={(e) =>
                        handleGradeChange(index, e.target.value)
                      }
                      className={`w-full border rounded-lg p-2 ${
                        errors[index]
                          ? "border-red-500"
                          : "border-slate-300"
                      }`}
                      placeholder="Enter Grade"
                      required
                    />

                    {errors[index] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[index]}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl ${
                  loading
                    ? "bg-indigo-400"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } text-white`}
              >
                {loading ? "Saving..." : "Submit"}
              </button>
            </form>
          )}
        </div>

        {/* Next Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate("/dashboard/performance")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            Next → Get Performance Analysis
          </button>
        </div>
      </div>
    </div>
  );
}