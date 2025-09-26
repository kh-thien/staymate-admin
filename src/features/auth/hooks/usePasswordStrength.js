/**
 * Password Strength Hook
 * Hook for managing password strength calculation and display
 */
import { useState, useEffect } from "react";
import { calculatePasswordStrength } from "../domain/validators";

export const usePasswordStrength = (password) => {
  const [strength, setStrength] = useState(0);
  const [strengthText, setStrengthText] = useState("");
  const [strengthColor, setStrengthColor] = useState("");

  useEffect(() => {
    const score = calculatePasswordStrength(password);
    setStrength(score);

    // Update strength text and color
    switch (score) {
      case 0:
        setStrengthText("");
        setStrengthColor("");
        break;
      case 1:
        setStrengthText("Very Weak");
        setStrengthColor("text-red-500");
        break;
      case 2:
        setStrengthText("Weak");
        setStrengthColor("text-orange-500");
        break;
      case 3:
        setStrengthText("Good");
        setStrengthColor("text-yellow-500");
        break;
      case 4:
        setStrengthText("Strong");
        setStrengthColor("text-green-500");
        break;
      default:
        setStrengthText("");
        setStrengthColor("");
    }
  }, [password]);

  return {
    strength,
    strengthText,
    strengthColor,
    maxStrength: 4,
  };
};
