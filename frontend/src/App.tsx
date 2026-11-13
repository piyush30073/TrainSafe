import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Performance from "./pages/Performance";
import InjuryPrevention from "./pages/InjuryPrevention";
import Recovery from "./pages/Recovery";
import Nutrition from "./pages/Nutrition";
import WorkoutAI from "./pages/WorkoutAI";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated application */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workout-ai" element={<WorkoutAI />} />
          <Route path="/injury-prevention" element={<InjuryPrevention />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
