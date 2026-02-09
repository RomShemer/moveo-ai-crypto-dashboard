import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/cards/StatCard";
import AssetCard from "../components/cards/AssetCard";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ReactMarkdown from "react-markdown";

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();

  //PREFERENCES
  const [preferences, setPreferences] = useState(null);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [prefsError, setPrefsError] = useState("");

  //FEED DATA
  const [prices, setPrices] = useState([]);
  const [news, setNews] = useState([]);
  const [insight, setInsight] = useState(null);
  const [meme, setMeme] = useState(null);

  const [loadingFeed, setLoadingFeed] = useState(false);

  //LOAD PREFERENCES
  useEffect(() => {
    if (authLoading || !user) return;

    (async () => {
      try {
        setLoadingPrefs(true);
        const res = await apiRequest("/api/preferences");
        setPreferences(res.preferences);
        setPrefsError("");
      } catch (e) {
        console.error("Preferences error:", e);
        setPrefsError("Failed to load preferences");
      } finally {
        setLoadingPrefs(false);
      }
    })();
  }, [authLoading, user]);

  // sLOAD FEED (NON BLOCKING)
  useEffect(() => {
    if (authLoading || !user) return;

    (async () => {
      setLoadingFeed(true);

      const results = await Promise.allSettled([
        apiRequest("/api/feed/prices"),
        apiRequest("/api/feed/news"),
        apiRequest("/api/feed/ai-insight"),
        apiRequest("/api/feed/meme"),
      ]);

      const [pricesRes, newsRes, insightRes, memeRes] = results;

      // PRICES
      if (pricesRes.status === "fulfilled") {
        setPrices(pricesRes.value?.items ?? []);
      }

      // NEWS
      if (newsRes.status === "fulfilled") {
        setNews(newsRes.value?.items ?? []);
      }

      // AI INSIGHT
      if (insightRes.status === "fulfilled") {
        setInsight(insightRes.value?.text ?? null);
      }

      // MEME
      if (memeRes.status === "fulfilled") {
        setMeme(memeRes.value ?? null);
      }

      setLoadingFeed(false);
    })();
  }, [authLoading, user]);

  // PAGE LOADING
  if (authLoading || loadingPrefs) {
    return (
      <DashboardLayout>
        <div className="empty-state">
          <p>Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  // PAGE ERROR
  if (prefsError) {
    return (
      <DashboardLayout>
        <div className="empty-state error">
          <p>{prefsError}</p>
        </div>
      </DashboardLayout>
    );
  }

  // PREFERENCES DATA 
  const assets = preferences?.assets ?? [];
  const investorType = preferences?.investorType ?? "";
  const contentTypes = preferences?.contentTypes ?? [];

  const hasPrefs =
    assets.length > 0 || Boolean(investorType) || contentTypes.length > 0;

  // helper: symbol → coingecko id
  const symbolToId = {
    BTC: "bitcoin",
    ETH: "ethereum",
    ADA: "cardano",
    SOL: "solana",
    BITCOIN: "bitcoin",
    CARDANO: "cardano",
    ETHEREUM: "ethereum",
    SOLANA: "solana",
  };

  return (
    <DashboardLayout investorType={investorType}>
      {/* SUMMARY */}
      <section id="summary" className="dash-section summary">
        <div className="cards-grid">
          <StatCard
            title="AI Advisor Mode"
            value={investorType || "Not set"}
            subtitle="Based on onboarding"
          />
          <StatCard
            title="Tracked Assets"
            value={String(assets.length)}
            subtitle="Selected in onboarding"
          />
          <StatCard
            title="Content Types"
            value={String(contentTypes.length)}
            subtitle="Your daily feed mix"
          />
        </div>
      </section>
      {!hasPrefs ? (
        <div className="empty-state">
          <h2>No preferences found</h2>
          <p>Please complete onboarding to personalize your dashboard.</p>
        </div>
      ) : (
        <>
          {/* ASSETS */}
          <section id="assets" className="dash-section">
            <div className="dash-section-header">
              <h2>Your Assets</h2>
              <p>Live prices for selected assets</p>
            </div>

            {prices.length === 0 ? (
              <p className="muted">Prices loading...</p>
            ) : (
              <div className="cards-grid">
                {assets.map((symbol) => {
                  const id = symbolToId[symbol.toUpperCase()];
                  const priceData = prices.find((p) => p.id === id);

                  return (
                    <AssetCard
                      key={symbol}
                      assetId={id}
                      price={priceData?.usd}
                    />
                  );
                })}
              </div>
            )}
          </section>

          {/* AI INSIGHT */}
          <section id="ai-insight" className="dash-section">
            <div className="dash-section-header">
              <h2>AI Insight</h2>
              <p>Personalized market analysis</p>
            </div>

            <StatCard
              id={`ai-insight:${user.id}`}
              title={null}
              value={
                <div className="ai-chat-container">
                  <div className="ai-avatar">
                    <span>AI</span>
                  </div>

                  <div className="ai-chat-bubble">
                    {insight ? (
                      <div className="insight-markdown">
                        <ReactMarkdown>{insight}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="muted">Analyzing market trends...</p>
                    )}
                    <div className="bubble-tail" />
                  </div>
                </div>
              }
            />
          </section>

          {/* NEWS */}
          {contentTypes.includes("Market News") && (
            <section id="news" className="dash-section">
              <div className="dash-section-header">
                <h2>Latest Crypto News</h2>
                <p>Top headlines</p>
              </div>

              <StatCard
                id={`news:${user.id}`}
                title={null}
                value={
                  news.length === 0 ? (
                    <p className="muted">No news available.</p>
                  ) : (
                    <ul className="news-list">
                      {news.slice(0, 5).map((n, i) => (
                        <li key={i}>
                          <a href={n.url} target="_blank" rel="noreferrer">
                            {n.title}
                          </a>
                          {n.source && (
                            <span className="news-source">{n.source}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )
                }
              />
            </section>
          )}

          {/* MEME */}
          {contentTypes.includes("Fun") && meme && (
            <section id="meme" className="dash-section meme">
              <div className="dash-section-header">
                <h2>Fun Crypto Meme</h2>
                <p>From the crypto community</p>
              </div>

              <div className="meme-container">
                {meme.map((m, index) => (
                  <StatCard
                    key={index}
                    id={`meme:${user.id}:${index}`}
                    title={null}
                    value={
                      <div className="meme-card">
                        <p className="meme-title">{m.title}</p>
                        <img src={m.imageUrl} alt={m.title} />
                      </div>
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
