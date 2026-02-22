import { useContext } from "react";
import { MedGemmaContext, MedGemmaContextValue } from "../contexts/MedGemmaContext";

export function useMedGemma(): MedGemmaContextValue {
  const context = useContext(MedGemmaContext);
  if (!context) {
    throw new Error("useMedGemma must be used within a MedGemmaProvider");
  }
  return context;
}
