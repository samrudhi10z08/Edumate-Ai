import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import UploadMarks from "./components/UploadMarks";
import Performance from "./components/Performance";
import Stress from "./components/Stress";
import StudyPlan from "./components/StudyPlan";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import EdumateHomepage from "./components/EdumateHomepage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EdumateHomepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;