import { motion } from "framer-motion";
import "../../../styles/onboarding-stepContent.css";

import marketNewsImg from "../../../assets/onboarding/MarketNews.png";
import liveChartsImg from "../../../assets/onboarding/LiveCharts.png";
import socialTrendsImg from "../../../assets/onboarding/SocialTrends.png";
import cryptoFunImg from "../../../assets/onboarding/CryptoFun.png";

const CONTENT_OPTIONS = [
  {
    id: "Market News",
    label: "Market News",
    desc: "Latest crypto headlines.",
    image: marketNewsImg,
  },
  {
    id: "Charts",
    label: "Live Charts",
    desc: "Real-time price data",
    image: liveChartsImg,
  },
  {
    id: "Social",
    label: "Social Trends",
    desc: "What's viral on social media",
    image: socialTrendsImg,
  },
  {
    id: "Fun",
    label: "Crypto Fun",
    desc: "Memes and crypto culture",
    image: cryptoFunImg,
  },
];

export default function StepContent({ value = [], onChange, onBack, onFinish }) {
  
  const toggle = (id) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="onboarding-step compact">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2>Your Content Preferences</h2>
        <p className="step-description">
          Select the type of content you want to see in your feed.
        </p>
      </motion.div>

      <motion.div
        className="content-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {CONTENT_OPTIONS.map((option) => {
          const isSelected = value.includes(option.id);
          return (
            <motion.button
              key={option.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`content-card ${isSelected ? "selected" : ""}`}
              onClick={() => toggle(option.id)}
            >
              <div className="content-image-wrapper">
                <img src={option.image} alt={option.label} className="content-image" />
              </div>

              <div className="option-title">{option.label}</div>
              <div className="option-desc">{option.desc}</div>
              
              {isSelected && (
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="selection-dot"
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      <div className="actions">
        <button className="back-btn" onClick={onBack}>
          Back
        </button>
        <button
          className="primary-btn"
          disabled={value.length === 0}
          onClick={onFinish}
        >
          Finish
        </button>
      </div>
    </div>
  );
}