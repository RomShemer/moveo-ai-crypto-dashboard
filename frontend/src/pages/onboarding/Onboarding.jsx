import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StepAssets from "./steps/StepAssets";
import StepInvestorType from "./steps/StepInvestorType";
import StepContent from "./steps/StepContent";
import "../../styles/onboarding.css";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    assets: [],
    investorType: "",
    contentTypes: [],
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const finish = () => {
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
    navigate("/dashboard");
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.98 },
  };

  return (
    <div className="onboarding-wrapper">
      <motion.div
        className="onboarding-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="onboarding-header">
          <div className="onboarding-progress">Step {step} of 3</div>
          <div className="progress-bar-container">
            <motion.div
              className="progress-bar-fill"
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {step === 1 && (
              <StepAssets
                value={preferences.assets}
                onChange={(assets) =>
                  setPreferences({ ...preferences, assets })
                }
                onNext={next}
              />
            )}

            {step === 2 && (
              <StepInvestorType
                value={preferences.investorType}
                onChange={(investorType) =>
                  setPreferences({ ...preferences, investorType })
                }
                onNext={next}
                onBack={back}
              />
            )}

            {step === 3 && (
              <StepContent
                value={preferences.contentTypes}
                onChange={(contentTypes) =>
                  setPreferences({ ...preferences, contentTypes })
                }
                onBack={back}
                onFinish={finish}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
