import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Users,
  Sparkles,
  ArrowRight,
  Loader2,
  Trophy,
  Clock,
  Settings,
  Trash2,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import PullToRefresh from "../components/wordsearch/PullToRefresh";

export default function Home() {
  const [mode, setMode] = useState(null); // 'create', 'join', 'settings'
  const [category, setCategory] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleRefresh = async () => {
    await loadUser();
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    toast.info("Please contact support to delete your account.");
  };

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const handleCreateRoom = async () => {
    if (!category.trim()) {
      toast.error("Please enter a category");
      return;
    }

    setIsLoading(true);
    const code = generateRoomCode();

    const room = await base44.entities.GameRoom.create({
      room_code: code,
      category: category.trim(),
      status: 'waiting',
      host_email: user?.email,
      time_limit: 300,
      players: [{
        email: user?.email,
        name: user?.full_name,
        score: 0,
        found_words: [],
        finished: false
      }]
    });

    setIsLoading(false);
    navigate(createPageUrl(`Game?room=${room.id}`));
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }

    setIsLoading(true);
    const rooms = await base44.entities.GameRoom.filter({
      room_code: roomCode.toUpperCase().trim()
    });

    if (rooms.length === 0) {
      toast.error("Room not found");
      setIsLoading(false);
      return;
    }

    const room = rooms[0];

    if (room.status !== 'waiting') {
      toast.error("Game has already started");
      setIsLoading(false);
      return;
    }

    // Check if user already in room
    const alreadyJoined = room.players?.some(p => p.email === user?.email);

    if (!alreadyJoined) {
      await base44.entities.GameRoom.update(room.id, {
        players: [
          ...(room.players || []),
          {
            email: user?.email,
            name: user?.full_name,
            score: 0,
            found_words: [],
            finished: false
          }
        ]
      });
    }

    setIsLoading(false);
    navigate(createPageUrl(`Game?room=${room.id}`));
  };

  const features = [
    { icon: Sparkles, title: "AI-Generated Words", desc: "Unique puzzles every time" },
    { icon: Clock, title: "Race the Clock", desc: "5 minutes to find all words" },
    { icon: Trophy, title: "Score Points", desc: "Faster finds = more points" },
    { icon: Users, title: "Multiplayer", desc: "Compete with friends" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl sm:text-6xl font-bold text-white/5"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              rotate: Math.random() * 360
            }}
            animate={{
              y: ['-10%', '110%'],
              rotate: [0, 360]
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          >
            {['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)]}
          </motion.div>
        ))}
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-2xl shadow-indigo-500/30">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3">
            Word<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Hunt</span>
          </h1>
          <p className="text-white/60 text-lg">
            Find words. Beat friends. Have fun.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-2xl w-full"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center"
            >
              <feature.icon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <p className="text-white text-sm font-medium">{feature.title}</p>
              <p className="text-white/50 text-xs">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl">
            {!mode ? (
              // Mode Selection
              <div className="space-y-4">
                <Button
                  onClick={() => setMode('create')}
                  className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl"
                >
                  <Sparkles className="w-5 h-5 mr-3" />
                  Create Game
                </Button>
                <Button
                  onClick={() => setMode('join')}
                  variant="outline"
                  className="w-full h-16 text-lg font-semibold bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-2xl"
                >
                  <Users className="w-5 h-5 mr-3" />
                  Join Game
                </Button>
              </div>
            ) : mode === 'create' ? (
              // Create Game Form
              <div className="space-y-6">
                <button
                  onClick={() => setMode(null)}
                  className="text-white/60 hover:text-white text-sm mb-2"
                >
                  ← Back
                </button>
                <div>
                  <Label className="text-white/80 text-sm mb-2 block">
                    Choose a Category
                  </Label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Animals, Sports, Movies..."
                    className="h-14 text-lg bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                  />
                  <p className="text-xs text-white/50 mt-2">
                    AI will generate 10 words based on your category
                  </p>
                </div>

                {/* Quick Category Suggestions */}
                <div className="flex flex-wrap gap-2">
                  {['Animals', 'Food', 'Sports', 'Countries', 'Movies'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className="px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-sm hover:bg-white/20 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleCreateRoom}
                  disabled={isLoading || !category.trim()}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Create Room
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              // Join Game Form
              <div className="space-y-6">
                <button
                  onClick={() => setMode(null)}
                  className="text-white/60 hover:text-white text-sm mb-2"
                >
                  ← Back
                </button>
                <div>
                  <Label className="text-white/80 text-sm mb-2 block">
                    Enter Room Code
                  </Label>
                  <Input
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXX"
                    maxLength={6}
                    className="h-14 text-2xl text-center tracking-[0.5em] font-mono bg-white/5 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                  />
                </div>
                <Button
                  onClick={handleJoinRoom}
                  disabled={isLoading || roomCode.length !== 6}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Join Room
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-4 mt-8"
        >
          <p className="text-white/40 text-sm">
            10×10 grid • 10 words • 5 minute timer
          </p>
          {user && (
            <button
              onClick={() => setMode('settings')}
              className="text-white/40 hover:text-white/70 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Settings Modal */}
        {mode === 'settings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setMode(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-white font-bold text-xl mb-6">Settings</h2>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-white/60 text-xs mb-1">Logged in as</p>
                  <p className="text-white font-medium truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => base44.auth.logout()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
              <button
                onClick={() => setMode(null)}
                className="mt-4 w-full text-white/40 hover:text-white/60 text-sm transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
        </div>
      </PullToRefresh>
    </div>
  );
}