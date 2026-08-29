import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Performance from "./pages/Performance";
import InjuryPrevention from "./pages/InjuryPrevention";
import Recovery from "./pages/Recovery";
import Nutrition from "./pages/Nutrition";
import WorkoutAI from "./pages/WorkoutAi";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================
            LANDING PAGE
        ===================================== */}

        <Route
          path="/"
          element={<Landing />}
        />

        {/* =====================================
            AUTHENTICATION
        ===================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =====================================
            MAIN APPLICATION
        ===================================== */}
        <Route
          path="/workout-ai"
          element={<WorkoutAI />}
        />
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/injury-prevention"
          element={<InjuryPrevention />}
        />

        <Route
          path="/recovery"
          element={<Recovery />}
        />

        <Route
          path="/nutrition"
          element={<Nutrition />}
        />

        <Route
          path="/performance"
          element={<Performance />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* =====================================
            UNKNOWN ROUTES
        ===================================== */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;