import React from 'react';
import { Trophy, Medal, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ScoreBoard({ players, currentUserEmail }) {
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.finished && b.finished) {
      return (a.finish_time || 0) - (b.finish_time || 0);
    }
    if (a.finished) return -1;
    if (b.finished) return 1;
    return (b.score || 0) - (a.score || 0);
  });

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-5 h-5 text-amber-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-slate-300" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Star className="w-4 h-4 text-white/40" />;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
      <h3 className="text-white/80 font-semibold mb-4 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-400" />
        Leaderboard
      </h3>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => {
          const isCurrentUser = player.email === currentUserEmail;
          return (
            <motion.div
              key={player.email}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                isCurrentUser
                  ? "bg-indigo-500/40 ring-2 ring-indigo-400"
                  : "bg-white/5",
                player.finished && "border-l-4 border-emerald-400"
              )}
            >
              <div className="flex-shrink-0 w-8 flex justify-center">
                {getRankIcon(index)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium truncate",
                  isCurrentUser ? "text-white" : "text-white/80"
                )}>
                  {player.name || player.email?.split('@')[0]}
                  {isCurrentUser && <span className="text-indigo-300 ml-1">(you)</span>}
                </p>
                <p className="text-xs text-white/50">
                  {player.found_words?.length || 0}/10 words
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-white">
                  {player.score || 0}
                </p>
                <p className="text-xs text-white/50">pts</p>
              </div>
              {player.finished && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2"
                >
                  <Trophy className="w-5 h-5 text-emerald-400" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}