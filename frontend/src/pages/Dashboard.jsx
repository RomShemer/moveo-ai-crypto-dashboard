import { useMemo } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/cards/StatCard";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const preferences = useMemo(() => {
    const raw = localStorage.getItem("userPreferences");
    return raw ? safeParse(raw) : null;
  }, []);

  const assets = preferences?.assets ?? [];
  const investorType = preferences?.investorType ?? "";
  const contentTypes = preferences?.contentTypes ?? [];

  const hasPrefs =
    assets.length > 0 || Boolean(investorType) || contentTypes.length > 0;

  return (
    <DashboardLayout investorType={investorType}>
      <div className="cards-grid">
        <StatCard
          id="summary-mode"
          title="AI Advisor Mode"
          value={investorType || "Not set"}
          subtitle="Based on onboarding"
        />
        <StatCard
          id="summary-assets"
          title="Tracked Assets"
          value={String(assets.length)}
          subtitle="Selected in onboarding"
        />
        <StatCard
          id="summary-content"
          title="Content Types"
          value={String(contentTypes.length)}
          subtitle="Your daily feed mix"
        />
      </div>

      {!hasPrefs ? (
        <div className="empty-state">
          <h2>No preferences found</h2>
          <p>Please complete onboarding to personalize your dashboard.</p>
        </div>
      ) : (
        <>
          <section className="dash-section">
            <div className="dash-section-header">
              <h2>Your Assets</h2>
              <p>Cards shown only for selected assets</p>
            </div>

            {assets.length === 0 ? (
              <div className="empty-state compact">
                <p>No assets selected.</p>
              </div>
            ) : (
              <div className="cards-grid">
                {assets.map((symbol) => (
                  <StatCard
                    key={symbol}
                    id={`asset:${symbol}`}
                    title={symbol}
                    value="—"
                    subtitle="(price placeholder)"
                  />
                ))}
              </div>
            )}
          </section>

          <section className="dash-section">
            <div className="dash-section-header">
              <h2>Today’s Feed</h2>
              <p>Only the content types you selected</p>
            </div>

            {contentTypes.length === 0 ? (
              <div className="empty-state compact">
                <p>No content types selected.</p>
              </div>
            ) : (
              <div className="cards-grid">
                {contentTypes.map((type) => (
                  <StatCard
                    key={type}
                    id={`content:${type}`}
                    title={type}
                    value="AI curated"
                    subtitle="(static MVP)"
                  />
                ))}
              </div>
            )}
          </section>

          {contentTypes.includes("Fun") && (
            <section className="dash-section">
              <div className="dash-section-header">
                <h2>Fun Crypto Meme</h2>
                <p>Updates when dashboard refreshes (MVP)</p>
              </div>

              <div className="cards-grid">
                <StatCard
                  id="meme"
                  title="Meme of the day"
                  value="😂 Placeholder"
                  subtitle="(next: random from static list)"
                />
              </div>
            </section>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
