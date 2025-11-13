import React, { useState, useEffect } from "react";
import { SignalIcon } from "@heroicons/react/24/solid";

const RealtimeIndicator = ({ isConnected = true }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide after 5 seconds if connected
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true); // Always show if disconnected
    }
  }, [isConnected]);

  if (!isVisible && isConnected) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
        isConnected
          ? "bg-green-100 text-green-700 border border-green-200"
          : "bg-red-100 text-red-700 border border-red-200"
      }`}
      title={isConnected ? "Đang kết nối realtime" : "Mất kết nối realtime"}
    >
      <SignalIcon
        className={`h-3 w-3 ${
          isConnected ? "text-green-600 animate-pulse" : "text-red-600"
        }`}
      />
      <span>{isConnected ? "Realtime" : "Offline"}</span>
    </div>
  );
};

export default RealtimeIndicator;

