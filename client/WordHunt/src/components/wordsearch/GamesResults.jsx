import React from 'react';
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, Star, RotateCcw, Home } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function GameResults({ players, currentUserEmail, onPlayAgain }) {
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.finished && b.finished) {
      return (a.finish_time || 0) - (b.finish_time || 0);
    }
    if (a.finished) return -1;
    if (b.finished) return 1;
    return (b.score || 0) - (a.score || 0);
  });

  const currentUserRank = sortedPlayers.findIndex(p => p.email === currentUserEmail) + 1;
  const currentPlayer = players.find(p => p.email === currentUserEmail);
  const winner = sortedPlayers[0];
  const isWinner = winner?.email === currentUserEmail;

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-8 h-8 text-amber-400" />;
    if (index === 1) return <Medal className="w-7 h-7 text-slate-300" />;
    if (index === 2) return <Medal className="w-7 h-7 text-amber-600" />;
    return <Star className="w-6 h-6 text-white/40" />;
  };

  const getPositionSuffix = (pos) => {
    if (pos === 1) return 'st';
    if (pos === 2) return 'nd';
    if (pos === 3) return 'rd';
    return 'th';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
    >
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Trophy className={cn(
              "w-16 h-16 mx-auto mb-4",
              isWinner ? "text-amber-400" : "text-slate-400"
            )} />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {isWinner ? "🎉 You Won! 🎉" : "Game Over!"}
          </h2>
          <p className="text-white/60">
            You finished {currentUserRank}{getPositionSuffix(currentUserRank)} with{' '}
            <span className="text-indigo-400 font-bold">{currentPlayer?.score || 0} points</span>
          </p>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3 mb-8">
          {sortedPlayers.slice(0, 5).map((player, index) => {
            const isCurrentUser = player.email === currentUserEmail;
            return (
              <motion.div
                key={player.email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl",
                  index === 0 ? "bg-amber-500/20 ring-2 ring-amber-400/50" :
                  isCurrentUser ? "bg-indigo-500/20 ring-2 ring-indigo-400/50" :
                  "bg-white/5"
                )}
              >
                <div className="flex-shrink-0">
                  {getRankIcon(index)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {player.name || player.email?.split('@')[0]}
                    {isCurrentUser && <span className="text-indigo-300 ml-2">(you)</span>}
                  </p>
                  <p className="text-sm text-white/50">
                    {player.found_words?.length || 0} words found
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-white">{player.score || 0}</p>
                  <p className="text-xs text-white/50">points</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to={createPageUrl("Home")} className="flex-1">
            <Button variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <Button
            onClick={onPlayAgain}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </motion.div>
  );
}