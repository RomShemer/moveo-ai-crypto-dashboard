//const fetch = require("node-fetch");
const prisma = require("../prisma");

// ---------- Static fallbacks ----------
const STATIC_NEWS = [
  {
    title: "Bitcoin moves as markets react to macro signals",
    url: "https://example.com/news1",
    source: "Static",
  },
  {
    title: "Ethereum ecosystem: key trends to watch this week",
    url: "https://example.com/news2",
    source: "Static",
  },
];

const MEMES = [
  { title: "HODL Mode", imageUrl: "https://i.imgflip.com/1bij.jpg" },
  { title: "Crypto Mood", imageUrl: "https://i.imgflip.com/2wifvo.jpg" },
  {
    title: "When you buy the dip",
    imageUrl: "https://i.imgflip.com/30b1gx.jpg",
  },
];

const STATIC_PRICES = {
  bitcoin: 71000,
  ethereum: 2100,
  solana: 95,
  cardano: 0.45,
  dogecoin: 0.08,
  ripple: 0.55,
  binancecoin: 320,
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function getUserPrefs(userId) {
  return prisma.preference.findUnique({ where: { userId } });
}

// ---------- Controllers ----------

async function getNews(req, res) {
  try {
    const token = process.env.CRYPTOPANIC_TOKEN;
    if (!token) {
      throw new Error("Missing CRYPTOPANIC_TOKEN");
    }

    const url =
      `https://cryptopanic.com/api/developer/v2/posts/` +
      `?auth_token=${token}&public=true`;

    const r = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "AI-Crypto-Advisor/1.0",
      },
    });

    if (!r.ok) {
      throw new Error(`CryptoPanic failed: ${r.status}`);
    }

    const data = await r.json();

    const items = (data?.results || []).slice(0, 10).map((post) => ({
      title: post.title,
      url: post.url,
      source: post.source?.title || "CryptoPanic",
      publishedAt: post.published_at,
    }));

    return res.json({
      source: "cryptopanic",
      items,
    });
  } catch (err) {
    console.error("❌ CryptoPanic error:", err.message);

    return res.json({
      source: "static-fallback",
      note: "CryptoPanic unavailable, showing fallback news",
      items: STATIC_NEWS,
    });
  }
}

async function getPrices(req, res) {
  try {
    const prefs = await getUserPrefs(req.user.id);

    const requestedAssets = (
      prefs?.assets?.length ? prefs.assets : ["BTC", "ETH"]
    ).map((a) => a.trim().toUpperCase());

    const symbolToId = {
      BTC: "bitcoin",
      ETH: "ethereum",
      SOL: "solana",
      ADA: "cardano",
      DOGE: "dogecoin",
      XRP: "ripple",
      BNB: "binancecoin",
    };

    const ids = requestedAssets.map((sym) => symbolToId[sym]).filter(Boolean);

    const finalIds = ids.length ? ids : ["bitcoin", "ethereum"];

    const base =
      process.env.COINGECKO_BASE || "https://api.coingecko.com/api/v3";
    const url = `${base}/simple/price?ids=${finalIds.join(",")}&vs_currencies=usd`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const r = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "AI-Crypto-Advisor/1.0",
          Accept: "application/json",
        },
      });

      clearTimeout(timeout);

      if (!r.ok) throw new Error(`CoinGecko failed: ${r.status}`);

      const data = await r.json();

      const items = finalIds.map((id) => ({
        id,
        usd: data?.[id]?.usd ?? STATIC_PRICES[id] ?? null,
        source: "coingecko",
      }));

      return res.json({ source: "coingecko", items });
    } catch (apiErr) {
      // fallback עם ערכים אמיתיים
      return res.json({
        source: "static-fallback",
        note: "Live market data unavailable. Showing estimated prices.",
        items: finalIds.map((id) => ({
          id,
          usd: STATIC_PRICES[id] ?? null,
          source: "static",
        })),
      });
    }
  } catch (e) {
    return res.status(500).json({ error: "Failed to load prices" });
  }
}

async function getAiInsight(req, res) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENROUTER_API_KEY");
    }

    const prefs = await getUserPrefs(req.user.id);

    const assets = prefs?.assets?.length ? prefs.assets.join(", ") : "BTC, ETH";
    const investorType = prefs?.investorType || "HODLer";

    const prompt = `
You are a crypto market assistant.
User assets: ${assets}
Investor type: ${investorType}

Give ONE short daily insight (2–3 sentences max).
No financial advice disclaimer.
Friendly, clear tone.
`;

    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:4000",
        "X-Title": "AI Crypto Advisor",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 120,
        temperature: 0.7,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      throw new Error(`OpenRouter failed: ${r.status} ${errText}`);
    }

    const data = await r.json();
    const text =
      data?.choices?.[0]?.message?.content || "No insight generated.";

    return res.json({
      source: "openrouter",
      text,
    });
  } catch (err) {
    console.error("❌ AI Insight error:", err.message);

    // 🔁 fallback (ה־mock שלך)
    return res.json({
      source: "mock-ai",
      text: "Markets are mixed today. Stick to your long-term plan and avoid emotional decisions.",
    });
  }
}

async function getMeme(req, res) {
  try {
    const url = "https://www.reddit.com/r/cryptomemes/hot.json?limit=25";

    const r = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-Crypto-Advisor-App-v1.0 (by /u/YourRedditUsername)",
        Accept: "application/json",
      },
    });

    if (!r.ok) throw new Error(`Reddit failed: ${r.status}`);

    const data = await r.json();
    const posts = (data?.data?.children || []).map((c) => c.data);

    function decodeHtml(s) {
      return (s || "").replace(/&amp;/g, "&");
    }

    function getImageUrl(p) {
      // 1) direct image url
      if (
        typeof p.url === "string" &&
        (p.url.includes("i.redd.it") || p.url.includes("i.imgur.com"))
      ) {
        return p.url;
      }

      // 2) preview image
      const previewUrl = p.preview?.images?.[0]?.source?.url;
      if (previewUrl) return decodeHtml(previewUrl);

      // 3) gallery (!!! נפוץ מאוד ב־cryptomemes)
      if (p.is_gallery && p.gallery_data?.items?.length && p.media_metadata) {
        const first = p.gallery_data.items[0];
        const media = p.media_metadata[first.media_id];
        const galleryUrl = media?.s?.u || media?.p?.[0]?.u;
        if (galleryUrl) return decodeHtml(galleryUrl);
      }

      // 4) thumbnail (גיבוי אחרון)
      if (typeof p.thumbnail === "string" && p.thumbnail.startsWith("http")) {
        return p.thumbnail;
      }

      return null;
    }

    const valid = posts
      .filter((p) => !p.over_18)
      .map((p) => {
        const imageUrl = getImageUrl(p);
        return imageUrl
          ? {
              title: p.title,
              imageUrl,
              permalink: `https://reddit.com${p.permalink}`,
            }
          : null;
      })
      .filter(Boolean);

    if (!valid.length) {
      // נדפיס קצת דיבוג כדי להבין מה קיבלנו
      console.log(
        "Reddit sample urls:",
        posts.slice(0, 10).map((p) => ({
          title: p.title,
          url: p.url,
          is_gallery: p.is_gallery,
          has_preview: !!p.preview,
          thumbnail: p.thumbnail,
        })),
      );
      throw new Error("No valid meme posts found");
    }

    const meme = valid[Math.floor(Math.random() * valid.length)];

    return res.json({
      source: "reddit",
      ...meme,
    });
  } catch (err) {
    console.error("❌ Reddit meme error:", err.message);

    // fallback סטטי אם Reddit לא עוזר
    const fallback = pickRandom(MEMES);
    return res.json({
      source: "static-fallback",
      title: fallback.title,
      imageUrl: fallback.imageUrl,
    });
  }
}

// ---------- Exports ----------
module.exports = {
  getNews,
  getPrices,
  getAiInsight,
  getMeme,
};
