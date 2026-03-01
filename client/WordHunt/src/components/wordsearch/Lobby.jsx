import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Play,
  Copy,
  Check,
  Loader2,
  Crown,
  UserPlus,
  ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Lobby({
  room,
  currentUserEmail,
  isHost,
  onStartGame,
  isGenerating
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.room_code);
    setCopied(true);
    toast.success("Room code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(createPageUrl("Home"))}
              className="flex items-center gap-1 text-white/60 hover:text-white transition-colors mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Waiting for Players
              </h1>
              <p className="text-white/60">
                Category: <span className="text-indigo-300 font-medium">{room.category}</span>
              </p>
            </div>
          </div>

          {/* Room Code */}
          <div className="mb-8">
            <Label className="text-white/70 text-sm mb-2 block">Room Code</Label>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-center">
                <span className="text-3xl font-mono font-bold text-white tracking-widest">
                  {room.room_code}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyRoomCode}
                className="h-auto aspect-square bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
            <p className="text-xs text-white/50 mt-2 text-center">
              Share this code with friends to join the game
            </p>
          </div>

          {/* Players List */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-white/70 text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Players ({room.players?.length || 0})
              </Label>
            </div>
            <div className="space-y-2">
              {(room.players || []).map((player, index) => (
                <motion.div
                  key={player.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl",
                    player.email === currentUserEmail
                      ? "bg-indigo-500/30 ring-2 ring-indigo-400"
                      : "bg-white/5"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                    player.email === room.host_email
                      ? "bg-amber-500/30 text-amber-300"
                      : "bg-white/10 text-white"
                  )}>
                    {player.email === room.host_email ? (
                      <Crown className="w-5 h-5" />
                    ) : (
                      (player.name || player.email)?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">
                      {player.name || player.email?.split('@')[0]}
                    </p>
                    {player.email === room.host_email && (
                      <p className="text-xs text-amber-300">Host</p>
                    )}
                  </div>
                  {player.email === currentUserEmail && (
                    <span className="text-xs text-indigo-300 bg-indigo-500/30 px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </motion.div>
              ))}

              {/* Waiting for more players */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border-2 border-dashed border-white/20">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white/40" />
                </div>
                <p className="text-white/40 text-sm">Waiting for players...</p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          {isHost ? (
            <Button
              onClick={onStartGame}
              disabled={isGenerating || (room.players?.length || 0) < 1}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Puzzle...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Game
                </>
              )}
            </Button>
          ) : (
            <div className="text-center text-white/60 py-4 bg-white/5 rounded-xl">
              <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" />
              Waiting for host to start the game...
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}