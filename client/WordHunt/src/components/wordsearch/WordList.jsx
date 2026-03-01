import React from 'react';
import { cn } from "@/lib/utils";
import { Check, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function WordList({ words, foundWords }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
      <h3 className="text-white/80 font-semibold mb-4 flex items-center gap-2">
        <Search className="w-4 h-4" />
        Words to Find ({foundWords.length}/{words.length})
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {words.map((word, index) => {
          const isFound = foundWords.includes(word.toUpperCase());
          return (
            <motion.div
              key={word}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-300",
                isFound
                  ? "bg-emerald-500/30 text-emerald-300"
                  : "bg-white/5 text-white/70"
              )}
            >
              {isFound ? (
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 flex-shrink-0" />
              )}
              <span className={cn(
                "text-sm font-medium truncate",
                isFound && "line-through"
              )}>
                {word.toUpperCase()}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}