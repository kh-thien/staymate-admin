import React from "react";

export default function PasswordStrengthIndicator({ password }) {
  const getStrength = (password) => {
    if (!password) return { level: 0, text: "", color: "" };

    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, text: "Weak", color: "bg-red-500" };
    if (score <= 4) return { level: 2, text: "Medium", color: "bg-yellow-500" };
    if (score <= 5) return { level: 3, text: "Strong", color: "bg-green-500" };
    return { level: 4, text: "Very Strong", color: "bg-green-600" };
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${(strength.level / 4) * 100}%` }}
          ></div>
        </div>
        <span
          className={`text-xs font-medium ${
            strength.level <= 2
              ? "text-red-600"
              : strength.level === 3
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {strength.text}
        </span>
      </div>

      {password && strength.level < 3 && (
        <div className="mt-2 text-xs text-gray-600">
          <p>Password should contain:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            {password.length < 8 && <li>At least 8 characters</li>}
            {!/[a-z]/.test(password) && <li>One lowercase letter</li>}
            {!/[A-Z]/.test(password) && <li>One uppercase letter</li>}
            {!/[0-9]/.test(password) && <li>One number</li>}
            {!/[^A-Za-z0-9]/.test(password) && <li>One special character</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
