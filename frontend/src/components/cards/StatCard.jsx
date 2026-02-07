import { useEffect, useMemo, useState } from "react";

function storageKey(id) {
  return `votes:${id}`;
}

export default function StatCard({ id, title, value, subtitle }) {
  const key = useMemo(() => (id ? storageKey(id) : null), [id]);
  const [vote, setVote] = useState(null); // "up" | "down" | null

  useEffect(() => {
    if (!key) return;
    const saved = localStorage.getItem(key);
    if (saved === "up" || saved === "down") setVote(saved);
  }, [key]);

  function handleVote(next) {
    if (!key) return;
    const newVote = vote === next ? null : next; // toggle
    setVote(newVote);
    if (newVote) localStorage.setItem(key, newVote);
    else localStorage.removeItem(key);
  }

  return (
    <div className="stat-card">
      <div className="stat-card-head">
        <span className="stat-title">{title}</span>

        {id && (
          <div className="vote">
            <button
              type="button"
              className={`vote-btn ${vote === "up" ? "active" : ""}`}
              onClick={() => handleVote("up")}
              aria-label="Thumbs up"
            >
              👍
            </button>
            <button
              type="button"
              className={`vote-btn ${vote === "down" ? "active" : ""}`}
              onClick={() => handleVote("down")}
              aria-label="Thumbs down"
            >
              👎
            </button>
          </div>
        )}
      </div>

      <span className="stat-value">{value}</span>
      {subtitle ? <div className="stat-subtitle">{subtitle}</div> : null}
    </div>
  );
}
