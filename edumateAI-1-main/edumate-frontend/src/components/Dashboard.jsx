import { useState, useEffect } from "react";
import { useNavigate, NavLink, Routes, Route } from "react-router-dom";
import api from "../api/axios";  
import DashboardHome from "./DashboardHome";
import UploadMarks from "./UploadMarks";
import Performance from "./Performance";
import StressDashboard from "./StressDashboard";
import StudyPlan from "./StudyPlan";
import Notifications from "./Notifications";
import { BrowserRouter} from "react-router-dom";
export default function Dashboard() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
        const parsedUser = JSON.parse(user);
      setUserName(parsedUser.name);
    }
  }, []);
  const [mode, setMode] = useState("ocr");

  const [subjects, setSubjects] = useState([
    { subject: "", credits: "" }
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const addRow = () => {
    setSubjects([...subjects, { subject: "", credits: "" }]);
  };

  const removeRow = (index) => {
    const updated = subjects.filter((_, i) => i !== index);
    setSubjects(updated);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen w-full bg-white text-slate-800 font-sans">

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
        
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg z-40 text-indigo-600 w-64 p-6 fixed md:static 
        min-h-screen transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`}
      >
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-bold">EduMate AI</h2>
          {userName && (
            <p className="text-sm text-black-500 mt-1">
              Welcome, {userName}
            </p>
          )}
        </div>

        <nav className="space-y-4">
          <NavLink
            to="/dashboard"   
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `block p-2 rounded ${
                isActive
                  ? "text-indigo-600"
                  : "hover:bg-slate-200 hover:text-indigo-600 transition"
              }`
            }
          >
           Home
          </NavLink>

          <NavLink
            to="/dashboard/upload"   
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `block p-2 rounded ${
                isActive
                  ? "text-indigo-600"
                  : "hover:bg-slate-200 hover:text-indigo-600 transition"
              }`
            }
          >
           Upload Marks
          </NavLink>

          <NavLink
            to="/dashboard/performance"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `block p-2 rounded ${
                isActive
                  ? "text-indigo-600"
                  : "hover:bg-slate-200 hover:text-indigo-600 transition"
              }`
            }
          >
            Performance Analysis
          </NavLink>

          <NavLink
            to="/dashboard/stress"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `block p-2 rounded ${
                isActive
                  ? "text-indigo-600"
                  : "hover:bg-slate-200 hover:text-indigo-600 transition"
              }`
            }
          >
            Stress Analysis
          </NavLink>

          <NavLink
            to="/dashboard/studyplan"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `block p-2 rounded ${
                isActive
                  ? "text-indigo-600"
                  : "hover:bg-slate-200 hover:text-indigo-600 transition"
              }`
            }
          >
            Study Plan
          </NavLink>
        </nav>
      </div>

      {/* Main Section */}
      <div className="flex-1 md:ml-64">
        
        {/* Desktop Top Bar */}
        <div className="hidden md:flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-4">
            <Notifications />
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-slate-200 transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile Navbar */}
        <div className="md:hidden text-indigo-600 p-4 flex justify-between items-center border-b">
          <button onClick={() => setIsOpen(!isOpen)}>☰</button>
          <span className="font-bold">EduMate Dashboard</span>
          <div className="flex items-center gap-2">
            <Notifications />
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-white text-indigo-600 border-indigo-600 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        
          <div className="p-3">
            <Routes>
              <Route index element={<DashboardHome />} />
              <Route path="upload" element={<UploadMarks />} />
              <Route path="performance" element={<Performance />} />
              <Route path="stress" element={<StressDashboard />} />
              <Route path="studyplan" element={<StudyPlan />} />
            </Routes>
          </div>
      </div>
    </div>
  );
}
