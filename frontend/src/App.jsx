import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/onboarding/Onboarding";

import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingRoute from "./components/OnboardingRoute";


function App() {
  return (
    <Routes>
      {/* default */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* onboarding – אחרי התחברות */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <OnboardingRoute>
              <Dashboard />
            </OnboardingRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
