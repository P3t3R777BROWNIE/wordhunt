import React from 'react';
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Timer({ timeLeft, totalTime }) {
  const percentage = (timeLeft / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isLow = timeLeft <= 30;
  const isCritical = timeLeft <= 10;

  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-sm transition-colors",
        isCritical ? "bg-red-500/30" : isLow ? "bg-amber-500/30" : "bg-white/10"
      )}
      animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: isCritical ? Infinity : 0, duration: 0.5 }}
    >
      <Clock className={cn(
        "w-5 h-5",
        isCritical ? "text-red-400" : isLow ? "text-amber-400" : "text-white/80"
      )} />
      <div className="flex flex-col">
        <span className={cn(
          "font-mono font-bold text-lg",
          isCritical ? "text-red-400" : isLow ? "text-amber-400" : "text-white"
        )}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              isCritical ? "bg-red-400" : isLow ? "bg-amber-400" : "bg-emerald-400"
            )}
            initial={{ width: '100%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
}