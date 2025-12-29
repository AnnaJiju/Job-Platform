import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import JobseekerDashboard from "./pages/JobseekerDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Jobs from "./pages/Jobs";
import RecommendedJobs from "./pages/RecommendedJobs";
import SavedJobs from "./pages/SavedJobs";
import MyApplications from "./pages/MyApplications";
import PostJob from "./pages/PostJob";
import MyJobs from "./pages/MyJobs";
import Applicants from "./pages/Applicants";
import Analytics from "./pages/admin/Analytics";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageJobs from "./pages/admin/ManageJobs";
import AuthProvider from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
          {/* Jobseeker Routes */}
          <Route path="/dashboard" element={<JobseekerDashboard />}>
            <Route index element={<Navigate to="/dashboard/jobs" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="recommended" element={<RecommendedJobs />} />
            <Route path="saved" element={<SavedJobs />} />
            <Route path="applications" element={<MyApplications />} />
          </Route>

          {/* Recruiter Routes */}
          <Route path="/recruiter" element={<RecruiterDashboard />}>
            <Route index element={<Navigate to="/recruiter/my-jobs" replace />} />
            <Route path="post-job" element={<PostJob />} />
            <Route path="my-jobs" element={<MyJobs />} />
            <Route path="applicants/:jobId" element={<Applicants />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<Navigate to="/admin/analytics" replace />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="jobs" element={<ManageJobs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
