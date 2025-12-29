import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import JobseekerDashboard from "./pages/JobseekerDashboard";
import Profile from "./pages/Profile";
import Jobs from "./pages/Jobs";
import RecommendedJobs from "./pages/RecommendedJobs";
import SavedJobs from "./pages/SavedJobs";
import MyApplications from "./pages/MyApplications";
import AuthProvider from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={<JobseekerDashboard />}>
            <Route index element={<Navigate to="/dashboard/jobs" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="recommended" element={<RecommendedJobs />} />
            <Route path="saved" element={<SavedJobs />} />
            <Route path="applications" element={<MyApplications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
