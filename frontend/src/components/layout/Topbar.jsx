import { useAuth } from "../../context/AuthContext";

export default function Topbar({ investorType }) {
  const { user } = useAuth();

  const modeLabel = investorType ? `${investorType} Mode` : "Personalized Mode";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1>AI Crypto Advisor</h1>
        <span className="topbar-mode">{modeLabel}</span>
      </div>

      <span className="user-email">{user?.email}</span>
    </header>
  );
}
