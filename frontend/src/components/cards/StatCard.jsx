import { useEffect, useState } from "react";
import {
  sendVote,
  removeVote,
  getMyVote,
} from "../../services/votes";

export default function StatCard({ id, section = "general", title, value, subtitle }) {
  const [vote, setVote] = useState(null); // "up" | "down" | null
  const [loading, setLoading] = useState(false);

  // ===== Load vote from backend =====
  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    (async () => {
      try {
        const backendValue = await getMyVote(id);
        if (!isMounted) return;

        if (backendValue === 1) setVote("up");
        else if (backendValue === -1) setVote("down");
        else setVote(null);
      } catch (err) {
        console.warn("Failed to load vote:", err);
        setVote(null);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // ===== Handle vote =====
  async function handleVote(next) {
    if (!id || loading) return;

    const prevVote = vote;
    const newVote = vote === next ? null : next;

    setVote(newVote);
    setLoading(true);

    try {
      if (newVote) {
        await sendVote({
          section,
          itemKey: id,
          value: newVote === "up" ? 1 : -1,
        });
      } else {
        await removeVote(id);
      }
    } catch (err) {
      console.error("Vote request failed:", err);
      setVote(prevVote);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stat-card">
      <div className="stat-card-head">
        {title && <span className="stat-title">{title}</span>}

        {id && (
          <div className="vote">
            <button
              type="button"
              className={`vote-btn ${vote === "up" ? "active" : ""}`}
              onClick={() => handleVote("up")}
              disabled={loading}
              aria-label="Thumbs up"
            >
              👍
            </button>

            <button
              type="button"
              className={`vote-btn ${vote === "down" ? "active" : ""}`}
              onClick={() => handleVote("down")}
              disabled={loading}
              aria-label="Thumbs down"
            >
              👎
            </button>
          </div>
        )}
      </div>

      <div className="stat-value">{value}</div>

      {subtitle && (
        <div className="stat-subtitle">{subtitle}</div>
      )}
    </div>
  );
}
