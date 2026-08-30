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

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================================
            LANDING
        ================================= */}
        <Route
          path="/"
          element={<Landing />}
        />

        {/* ================================
            AUTHENTICATION
        ================================= */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ================================
            MAIN DASHBOARD
        ================================= */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* ================================
            AI WORKOUT / POSTURE SCAN
        ================================= */}
        <Route
          path="/workout-ai"
          element={<WorkoutAI />}
        />

        {/* ================================
            INJURY PREVENTION
        ================================= */}
        <Route
          path="/injury-prevention"
          element={<InjuryPrevention />}
        />

        {/* ================================
            RECOVERY
        ================================= */}
        <Route
          path="/recovery"
          element={<Recovery />}
        />

        {/* ================================
            NUTRITION
        ================================= */}
        <Route
          path="/nutrition"
          element={<Nutrition />}
        />

        {/* ================================
            PERFORMANCE
        ================================= */}
        <Route
          path="/performance"
          element={<Performance />}
        />

        {/* ================================
            PROFILE
        ================================= */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* ================================
            UNKNOWN ROUTES
        ================================= */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;