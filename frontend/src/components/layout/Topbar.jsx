import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ investorType }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const modeLabel = investorType
    ? `${investorType} Mode`
    : "Personalized Mode";

  // close menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1>AI Crypto Advisor</h1>
        <span className="topbar-mode">{modeLabel}</span>
      </div>

      <div className="topbar-right" ref={menuRef}>
        <button
          className="user-email"
          onClick={() => setOpen((v) => !v)}
        >
          {user?.email}
        </button>

        {open && (
          <div className="user-menu-dropdown">
            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
