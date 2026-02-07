import { Navigate } from "react-router-dom";

export default function OnboardingRoute({ children }) {
  const hasPreferences = localStorage.getItem("userPreferences");

  if (!hasPreferences) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
