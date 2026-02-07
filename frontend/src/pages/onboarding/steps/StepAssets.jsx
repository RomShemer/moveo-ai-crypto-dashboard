import { motion } from "framer-motion";
import "../../../styles/onboarding-stepsAssets.css";

const ASSETS = [
  { id: "Bitcoin", icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
  { id: "Ethereum", icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
  { id: "Solana", icon: "https://cryptologos.cc/logos/solana-sol-logo.png" },
  { id: "Cardano", icon: "https://cryptologos.cc/logos/cardano-ada-logo.png" }
];

export default function StepAssets({ value, onChange, onNext }) {
  const toggle = (id) => {
    value.includes(id)
      ? onChange(value.filter((a) => a !== id))
      : onChange([...value, id]);
  };

  return (
    <div className="onboarding-step">
      <h2>Choose Your Assets</h2>
      <p className="step-description">
        Select the cryptocurrencies you want to track.
      </p>

      <motion.div className="options-grid">
        {ASSETS.map((asset) => (
          <motion.button
            key={asset.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`option-btn ${value.includes(asset.id) ? "selected" : ""}`}
            onClick={() => toggle(asset.id)}
          >
            <img src={asset.icon} className="option-icon" />
            <span>{asset.id}</span>
          </motion.button>
        ))}
      </motion.div>

      <button className="primary-btn" disabled={!value.length} onClick={onNext}>
        Continue
      </button>
    </div>
  );
}
