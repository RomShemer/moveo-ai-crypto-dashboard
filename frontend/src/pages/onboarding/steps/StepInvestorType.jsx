import { motion } from "framer-motion";
import "../../../styles/onboarding-stepInvestor.css";

// ייבוא התמונות שייצרנו
import hodlerImg from "../../../assets/onboarding/HODler.png";
import dayTraderImg from "../../../assets/onboarding/DayTrader.png";
import nftCollectorImg from "../../../assets/onboarding/NFTcollector.png";

const INVESTOR_TYPES = [
  {
    id: "HODLer",
    label: "HODLer",
    desc: "Long-term believer, patient & steady.",
    image: hodlerImg,
  },
  {
    id: "Day Trader",
    label: "Day Trader",
    desc: "Fast moves, high frequency, market watcher.",
    image: dayTraderImg,
  },
  {
    id: "NFT Collector",
    label: "NFT Collector",
    desc: "Art enthusiast, floor price hunter.",
    image: nftCollectorImg,
  },
];

export default function StepInvestorType({ value, onChange, onNext, onBack }) {
  
  // פונקציה לטיפול בבחירה וביטול בחירה
  const handleSelect = (id) => {
    if (value === id) {
      // אם המשתמש לחץ על מה שכבר נבחר -> נבטל את הבחירה
      onChange(null);
    } else {
      // אם המשתמש לחץ על אופציה חדשה -> נבחר אותה
      onChange(id);
    }
  };

  // הגדרות אנימציה
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="onboarding-step compact">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2>Your Investor Profile</h2>
        <p className="step-description">
          Tell us your style so our AI can curate the best insights for you.
        </p>
      </motion.div>

      <motion.div 
        className="investor-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {INVESTOR_TYPES.map((type) => (
          <motion.button
            key={type.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`investor-card ${
              value === type.id ? "selected" : ""
            }`}
            onClick={() => handleSelect(type.id)}
          >
            <div className="investor-image-wrapper">
              <img
                src={type.image}
                alt={type.label}
                className="investor-image"
              />
            </div>

            <div className="option-title">{type.label}</div>
            <div className="option-desc">{type.desc}</div>
          </motion.button>
        ))}
      </motion.div>

      <div className="actions">
        <button className="back-btn" onClick={onBack}>
          Back
        </button>
        <button 
          className="primary-btn" 
          disabled={!value} // הכפתור כבוי אם לא נבחרה אף אופציה
          onClick={onNext}
        >
          Continue
        </button>
      </div>
    </div>
  );
}