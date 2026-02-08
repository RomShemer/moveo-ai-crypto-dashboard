const { getCache, setCache } = require("../utils/cache");
const prisma = require("../prisma");

// =======================
// Config
// =======================
const externalApisDisabled =
  process.env.DISABLE_EXTERNAL_APIS === "true";

// =======================
// Helpers
// =======================
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getUserPrefs = async (userId) => {
  try {
    return await prisma.preference.findUnique({ where: { userId } });
  } catch {
    return null;
  }
};

const withTimeout = async (promise, ms) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await promise(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
};

// =======================
// Static fallbacks
// =======================
const STATIC_NEWS = [
  { title: "Bitcoin market remains volatile", url: "https://www.reuters.com/business/bitcoin-loses-trump-era-gains-crypto-market-volatility-signals-uncertainty-2026-02-07/", source: "Static" },
  { title: "Ethereum adoption continues", url: "https://www.newsbtc.com/news/ethereum/ethereum-adoption-accelerates-as-daily-transactions-set-2025-record/", source: "Static" },
  { title: "Cardano (ADA) News", url: "https://coinmarketcap.com/cmc-ai/cardano/latest-updates/", source: "Static" },
  { title: "Solana (SOL) News", url: "https://www.newsnow.com/us/Business/Cryptocurrencies/Solana+%28SOL%29", source: "Static" },
];

const STATIC_PRICES = {
  bitcoin: 70000,
  ethereum: 2500,
  cardano: 0.5,
  solana: 100,
};

const MEMES = [
  { title: "HODL!", imageUrl: "https://i.imgflip.com/1bij.jpg" },
  { title: "Buy the dip", imageUrl: "https://i.imgflip.com/30b1gx.jpg" },
];

// =======================
// PRICES
// =======================
/*async function getPrices(req, res) {
  const cacheKey = "prices";

  // 🔒 API DISABLED MODE
  if (externalApisDisabled) {
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    return res.json({
      source: "static-only",
      items: Object.entries(STATIC_PRICES).map(([id, usd]) => ({ id, usd })),
    });
  }

  // 🟢 NORMAL MODE
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const prefs = await getUserPrefs(req.user.id);

    const nameToId = {
      BTC: "bitcoin",
      BITCOIN: "bitcoin",
      ETH: "ethereum",
      ETHEREUM: "ethereum",
      ADA: "cardano",
      CARDANO: "cardano",
      SOL: "solana",
      SOLANA: "solana",
    };

    const rawAssets = prefs?.assets?.length
      ? prefs.assets
      : ["Bitcoin", "Ethereum"];

    const ids = rawAssets
      .map((a) => nameToId[a.toUpperCase()])
      .filter(Boolean);

    const finalIds = ids.length ? ids : ["bitcoin", "ethereum"];

    const data = await withTimeout(async (signal) => {
      const r = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${finalIds.join(
          ","
        )}&vs_currencies=usd`,
        { signal }
      );
      if (!r.ok) throw new Error();
      return r.json();
    }, 3000);

    const payload = {
      source: "coingecko",
      items: finalIds.map((id) => ({
        id,
        usd: data[id]?.usd ?? STATIC_PRICES[id],
      })),
    };

    setCache(cacheKey, payload, 5 * 60 * 1000);
    return res.json(payload);
  } catch {
    return res.json({
      source: "static-fallback",
      items: Object.entries(STATIC_PRICES).map(([id, usd]) => ({ id, usd })),
    });
  }
} */
async function getPrices(req, res) {
  const cacheKey = "prices";
  const prefs = await getUserPrefs(req.user.id);

  const nameToId = {
    BTC: "bitcoin",
    BITCOIN: "bitcoin",
    ETH: "ethereum",
    ETHEREUM: "ethereum",
    ADA: "cardano",
    CARDANO: "cardano",
    SOL: "solana",
    SOLANA: "solana",
  };

  const rawAssets = prefs?.assets?.length
    ? prefs.assets
    : ["Bitcoin", "Ethereum"];

  const requiredIds = rawAssets
    .map(a => nameToId[a.toUpperCase()])
    .filter(Boolean);

  const finalIds = requiredIds.length
    ? requiredIds
    : ["bitcoin", "ethereum"];

  // 🔹 שלב 1: Cache
  const cached = getCache(cacheKey);
  const cachedItems = cached?.items ?? [];

  // 🔒 API DISABLED
  if (externalApisDisabled) {
    return res.json({
      source: "static+cache",
      items: mergePrices({
        requiredIds: finalIds,
        cachedItems,
        apiData: null,
      }),
    });
  }

  // 🟢 API ENABLED
  try {
    const apiData = await withTimeout(async (signal) => {
      const r = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${finalIds.join(
          ","
        )}&vs_currencies=usd`,
        { signal }
      );
      if (!r.ok) throw new Error();
      return r.json();
    }, 3000);

    const items = mergePrices({
      requiredIds: finalIds,
      cachedItems,
      apiData,
    });

    const payload = {
      source: "coingecko",
      items,
    };

    setCache(cacheKey, payload, 5 * 60 * 1000);
    return res.json(payload);
  } catch {
    // ❌ API נכשל → cache + static
    return res.json({
      source: "static-fallback",
      items: mergePrices({
        requiredIds: finalIds,
        cachedItems,
        apiData: null,
      }),
    });
  }
}

function mergePrices({ requiredIds, cachedItems, apiData }) {
  const cachedMap = Object.fromEntries(
    cachedItems.map(i => [i.id, i.usd])
  );

  return requiredIds.map(id => ({
    id,
    usd:
      cachedMap[id] ??
      apiData?.[id]?.usd ??
      STATIC_PRICES[id] ??
      null,
  }));
}


// =======================
// NEWS
// =======================
async function getNews(req, res) {
  const cacheKey = "news:cryptopanic";

  // 🔒 API DISABLED MODE
  if (externalApisDisabled) {
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    return res.json({
      source: "static-only",
      items: STATIC_NEWS,
    });
  }

  // 🟢 NORMAL MODE
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const token = process.env.CRYPTOPANIC_TOKEN;
    if (!token) throw new Error();

    const data = await withTimeout(async (signal) => {
      const r = await fetch(
        `https://cryptopanic.com/api/developer/v2/posts/?auth_token=${token}&public=true`,
        { signal }
      );
      if (!r.ok) throw new Error();
      return r.json();
    }, 3000);

    const payload = {
      source: "cryptopanic",
      items: (data.results || []).slice(0, 5).map((p) => ({
        title: p.title,
        url: p.url,
        source: p.source?.title,
      })),
    };

    setCache(cacheKey, payload, 10 * 60 * 1000);
    return res.json(payload);
  } catch {
    return res.json({
      source: "static-fallback",
      items: STATIC_NEWS,
    });
  }
}

// =======================
// AI INSIGHT
// =======================
async function getAiInsight(req, res) {
  const cacheKey = `ai:${req.user.id}`;

  // 🔒 API DISABLED MODE
  if (externalApisDisabled) {
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    return res.json({
      source: "mock-ai",
      text: "Crypto markets are calm today. Stay focused on your long-term plan.",
    });
  }

  // 🟢 NORMAL MODE
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error();

    const prefs = await getUserPrefs(req.user.id);
    const assets = prefs?.assets?.join(", ") || "BTC, ETH";

    const data = await withTimeout(async (signal) => {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            {
              role: "system",
              content:
                "You are a crypto analyst. Write a clear, structured insight with headings and bullet points.",
            },
            {
              role: "user",
              content: `Give a concise but complete crypto insight for: ${assets}`,
            },
          ],
          max_tokens: 400,
        }),
      });
      if (!r.ok) throw new Error();
      return r.json();
    }, 4000);

    const payload = {
      source: "openrouter",
      text: data.choices?.[0]?.message?.content || "No insight today",
    };

    setCache(cacheKey, payload, 30 * 60 * 1000);
    return res.json(payload);
  } catch {
    return res.json({
      source: "mock-ai",
      text: "Crypto markets are calm today. Stay focused on your long-term plan.",
    });
  }
}

// =======================
// MEME
// =======================
/*=async function getMeme(req, res) {
  const cacheKey = "meme";

  // 🔒 API DISABLED MODE
  /*if (externalApisDisabled) {
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    return res.json({
      source: "static-only",
      ...pickRandom(MEMES),
    });
  }

  // 🟢 NORMAL MODE
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const data = await withTimeout(async (signal) => {
      const r = await fetch(
        "https://www.reddit.com/r/cryptomemes/hot.json?limit=20",
        { signal, headers: { "User-Agent": "AI-Crypto-Advisor/1.0" } }
      );
      if (!r.ok) throw new Error();
      return r.json();
    }, 3000);

    const posts = data.data.children
      .map((c) => c.data)
      .filter(
        (p) =>
          p.post_hint === "image" &&
          /\.(jpg|jpeg|png)$/i.test(p.url)
      );

    if (!posts.length) throw new Error();

    const meme = {
      source: "reddit",
      title: pickRandom(posts).title,
      imageUrl: pickRandom(posts).url,
    };

    setCache(cacheKey, meme, 60 * 60 * 1000);
    return res.json(meme);
  } catch {
    return res.json({
      source: "static-fallback",
      ...pickRandom(MEMES),
    });
  }
}*/

async function getMeme(req, res) {
  try {
    const url = "https://www.reddit.com/r/cryptomemes/hot.json?limit=30";
    
    const response = await fetch(url, {
      headers: {
        // ה-User-Agent הזה קריטי כדי לעקוף שגיאת 403
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });

    if (!response.ok) {
      // אם עדיין יש 403, נדפיס לטרמינל כדי לדעת
      throw new Error(`Reddit API responded with ${response.status}`);
    }

    const data = await response.json();
    
    // סינון פוסטים שיש בהם תמונה אמיתית
    const posts = data.data.children
      .map(child => child.data)
      .filter(p => 
        !p.is_video && 
        p.url && 
        /\.(jpg|jpeg|png|gif)$/i.test(p.url)
      );

    if (posts.length < 2) throw new Error("No image memes found");

    const shuffled = posts.sort(() => 0.5 - Math.random());
    const selectedMemes = shuffled.slice(0, 2).map(m => ({
      source: "reddit",
      title: m.title,
      imageUrl: m.url,
      permalink: `https://reddit.com${m.permalink}`
    }));

    return res.json(selectedMemes); // מחזיר מערך של 2 אובייקטים

    /*const selected = pickRandom(posts);

    return res.json({
      source: "reddit",
      title: selected.title,
      imageUrl: selected.url,
      permalink: `https://reddit.com${selected.permalink}`
    });*/

  } catch (err) {
    console.error("⚠️ Reddit Fetch Failed:", err.message);
    
    // החזרת ה-Fallback הסטטי שראינו בפוסטמן
    return res.json([
      {
        source: "static-fallback",
        title: "HODL Mode Activated",
        imageUrl: "https://i.imgflip.com/1bij.jpg"
      },
      {
        source: "static-fallback",
        title: "Buy the dip!",
        imageUrl: "https://i.imgflip.com/30b1gx.jpg"
      }
    ]);
  }
}

// =======================
// Exports
// =======================
module.exports = {
  getPrices,
  getNews,
  getAiInsight,
  getMeme,
};
