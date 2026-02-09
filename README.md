# 🧠 AI Crypto Advisor

A full-stack web application that provides a **personalized crypto advisory dashboard**, combining live market data, curated news, AI-generated insights, and user interaction.

Built as part of a web development coding task.

---

## 🌐 Live Demo

- **Frontend:**  
  https://ai-crypto-advisor-front.netlify.app

- **Backend API:**  
  https://ai-crypto-advisor-backend-1o0m.onrender.com

---

## 🚀 What Is This?

**AI Crypto Advisor** helps users track the crypto market in a smart and personalized way.

After signing up and completing a short onboarding flow, users get:
- A tailored dashboard
- Live prices for selected assets
- Relevant crypto news
- AI-generated market insights
- The ability to interact with content using likes/dislikes

The system is built to stay functional even when external APIs fail or hit rate limits.

---

## ✨ Main Features

### 🔐 Authentication
- Sign up & login
- JWT-based authentication
- Protected API routes

### 🧭 Onboarding
- Select investor type
- Choose crypto assets to track
- Choose preferred content types
- Preferences saved to database

### 📊 Personalized Dashboard
- Summary cards based on onboarding
- Tracked crypto assets
- AI market insights
- Crypto news feed
- Fun crypto memes

### 💰 Crypto Prices
- Live prices via CoinGecko
- User-specific asset tracking
- Smart data merge:
  - API data
  - Cached data
  - Static fallback
- Graceful handling of API limits

### 📰 Crypto News
- Live news via CryptoPanic
- Cached results
- Static fallback when API is unavailable

### 🤖 AI Market Insight
- Generated using an LLM (OpenRouter)
- Personalized by user’s selected assets
- Cached per user
- Timeout & fallback handling

### 👍 Voting System
- Like / dislike any content item
- One vote per user per item
- Optimistic UI updates
- Votes persisted in database

---

## 🛠️ Technologies Used

### Frontend
- React
- Vite
- CSS
- Context API
- Deployed on **Netlify**

### Backend
- Node.js
- Express
- Prisma ORM
- JWT Authentication
- Deployed on **Render**

### Database
- PostgreSQL (Render managed)
- Prisma schema & migrations

### External APIs
- CoinGecko (prices)
- CryptoPanic (news)
- OpenRouter (AI insights)
- Reddit (memes)

---

## 🧠 Design Highlights

- Server-side caching to reduce API usage
- Static fallbacks to guarantee UX continuity
- Environment flag to disable external APIs
- Optimistic UI for better user experience
- Clear separation between frontend & backend

---

## 💡 Future Improvements (Bonus: Model Training)

The system is architected to support future machine learning enhancements without requiring structural changes.

By leveraging the stored user feedback (likes and dislikes), the platform could support:

- **Personalized Recommendation Optimization**  
  Historical voting data can be analyzed to dynamically adjust content weighting per user or user cluster.

- **AI Insight Refinement**  
  Positive and negative feedback signals can be used to improve prompt engineering and fine-tune the parameters used for generating the daily AI market insights.

This design enables continuous learning and personalization while keeping the current implementation lightweight and maintainable.


