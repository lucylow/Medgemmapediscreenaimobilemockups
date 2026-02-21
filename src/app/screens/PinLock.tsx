import { useState, useEffect, useCallback } from "react";
import { MobileContainer } from "../components/MobileContainer";
import { Lock, Fingerprint, Delete, Shield } from "lucide-react";
import { motion } from "motion/react";
import { hapticImpact, hapticNotification } from "../platform/haptics";

const PIN_KEY = "pediscreen_pin";
const PIN_ENABLED_KEY = "pediscreen_pin_enabled";

export function isPinEnabled(): boolean {
  return localStorage.getItem(PIN_ENABLED_KEY) === "true";
}

export function setPinEnabled(enabled: boolean) {
  localStorage.setItem(PIN_ENABLED_KEY, enabled ? "true" : "false");
  if (!enabled) localStorage.removeItem(PIN_KEY);
}

export function getSavedPin(): string | null {
  return localStorage.getItem(PIN_KEY);
}

export function savePin(pin: string) {
  localStorage.setItem(PIN_KEY, pin);
  localStorage.setItem(PIN_ENABLED_KEY, "true");
}

interface PinLockProps {
  onUnlock: () => void;
  mode?: "verify" | "setup";
  onSetupComplete?: () => void;
}

export function PinLock({ onUnlock, mode = "verify", onSetupComplete }: PinLockProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"enter" | "confirm">(mode === "setup" ? "enter" : "enter");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const maxLen = 4;
  const savedPin = getSavedPin();

  const handleDigit = useCallback(
    (digit: string) => {
      hapticImpact("light");
      setError("");

      if (mode === "setup") {
        if (step === "enter") {
          const next = pin + digit;
          setPin(next);
          if (next.length === maxLen) {
            setTimeout(() => {
              setStep("confirm");
              setPin("");
              setConfirmPin(next);
            }, 200);
          }
        } else {
          const next = pin + digit;
          setPin(next);
          if (next.length === maxLen) {
            if (next === confirmPin) {
              hapticNotification("success");
              savePin(next);
              onSetupComplete?.();
            } else {
              hapticNotification("error");
              setError("PINs don't match. Try again.");
              setShake(true);
              setTimeout(() => {
                setShake(false);
                setPin("");
                setStep("enter");
                setConfirmPin("");
              }, 600);
            }
          }
        }
      } else {
        const next = pin + digit;
        setPin(next);
        if (next.length === maxLen) {
          if (next === savedPin) {
            hapticNotification("success");
            onUnlock();
          } else {
            hapticNotification("error");
            setError("Incorrect PIN");
            setShake(true);
            setTimeout(() => {
              setShake(false);
              setPin("");
            }, 600);
          }
        }
      }
    },
    [pin, step, confirmPin, mode, savedPin, onUnlock, onSetupComplete]
  );

  const handleDelete = useCallback(() => {
    hapticImpact("light");
    setPin((p) => p.slice(0, -1));
    setError("");
  }, []);

  const title = mode === "setup"
    ? step === "enter" ? "Create PIN" : "Confirm PIN"
    : "Enter PIN";

  const subtitle = mode === "setup"
    ? step === "enter" ? "Choose a 4-digit PIN to protect health data" : "Re-enter your PIN to confirm"
    : "Enter your PIN to access PediScreen AI";

  return (
    <MobileContainer>
      <div className="h-full flex flex-col items-center justify-center px-8 py-12">
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#1A73E8] to-[#34A853] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">{title}</h1>
          <p className="text-sm text-[#666666] mt-1">{subtitle}</p>
        </div>

        <motion.div
          className="flex gap-4 mb-8"
          animate={shake ? { x: [0, -12, 12, -12, 12, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {Array.from({ length: maxLen }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                i < pin.length
                  ? "bg-[#1A73E8] scale-125"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </motion.div>

        {error && (
          <p className="text-sm text-[#EA4335] font-semibold mb-4">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              disabled={pin.length >= maxLen}
              className="w-[72px] h-[72px] mx-auto rounded-full bg-[#F8F9FA] text-2xl font-bold text-[#1A1A1A] active:bg-[#E8F0FE] active:scale-95 transition-all flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <div className="w-[72px] h-[72px] mx-auto flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#999999]" />
          </div>
          <button
            onClick={() => handleDigit("0")}
            disabled={pin.length >= maxLen}
            className="w-[72px] h-[72px] mx-auto rounded-full bg-[#F8F9FA] text-2xl font-bold text-[#1A1A1A] active:bg-[#E8F0FE] active:scale-95 transition-all flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={pin.length === 0}
            className="w-[72px] h-[72px] mx-auto rounded-full flex items-center justify-center text-[#666666] active:bg-[#F8F9FA] active:scale-95 transition-all disabled:opacity-30"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs text-[#999999]">
          <Fingerprint className="w-4 h-4" />
          <span>Data protected on-device</span>
        </div>
      </div>
    </MobileContainer>
  );
}
