"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, X, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface WeatherAlert {
  type: "info" | "warning" | "danger";
  message: string;
}

interface WeatherAlertsProps {
  alert: WeatherAlert | null;
  onDismiss?: () => void;
}

const alertConfig = {
  info: {
    icon: Info,
    bg: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    iconColor: "text-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-500/10 border-yellow-500/20",
    text: "text-yellow-600 dark:text-yellow-400",
    iconColor: "text-yellow-500",
  },
  danger: {
    icon: AlertCircle,
    bg: "bg-red-500/10 border-red-500/20",
    text: "text-red-600 dark:text-red-400",
    iconColor: "text-red-500",
  },
};

export default function WeatherAlerts({ alert, onDismiss }: WeatherAlertsProps) {
  const [visible, setVisible] = useState(true);

  // Reset visibility when alert changes - using key prop pattern instead
  if (!alert) return null;

  const config = alertConfig[alert.type];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className={`rounded-2xl border p-4 ${config.bg} relative`}
        >
          <div className="flex items-start gap-3">
            <config.icon size={20} className={`${config.iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${config.text}`}>
                {alert.type === "danger"
                  ? "🚨 Severe Weather Alert"
                  : alert.type === "warning"
                  ? "⚠️ Weather Advisory"
                  : "ℹ️ Weather Info"}
              </p>
              <p className={`text-sm mt-1 ${config.text} opacity-90`}>{alert.message}</p>
            </div>
            <button
              onClick={() => {
                setVisible(false);
                onDismiss?.();
              }}
              className={`flex-shrink-0 ${config.text} hover:opacity-70 transition-opacity`}
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

