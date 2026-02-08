import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OnboardingRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
