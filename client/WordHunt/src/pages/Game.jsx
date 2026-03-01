import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

import WordGrid from "../components/wordsearch/WordGrid";
import WordList from "../components/wordsearch/WordList";
import Timer from "../components/wordsearch/Timer";
import ScoreBoard from "../components/wordsearch/ScoreBoard";
import GameResults from "../components/wordsearch/GameResults";
import Lobby from "../components/wordsearch/Lobby";

export default function Game() {
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('room');

  // Load user and room
  useEffect(() => {
    const init = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    init();
  }, []);

  // Poll for room updates
  useEffect(() => {
    if (!roomId) {
      navigate(createPageUrl("Home"));
      return;
    }

    const fetchRoom = async () => {
      const rooms = await base44.entities.GameRoom.filter({ id: roomId });
      if (rooms.length > 0) {
        setRoom(rooms[0]);

        // Set timer based on game state
        if (rooms[0].status === 'playing' && rooms[0].start_time) {
          const elapsed = Math.floor((Date.now() - rooms[0].start_time) / 1000);
          const remaining = Math.max(0, (rooms[0].time_limit || 300) - elapsed);
          setTimeLeft(remaining);
        }

        if (rooms[0].status === 'finished') {
          setShowResults(true);
        }
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, 2000);
    return () => clearInterval(interval);
  }, [roomId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (room?.status !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [room?.status]);

  const generatePuzzle = async () => {
    setIsGenerating(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate exactly 10 unique words related to the category "${room.category}".
      Rules:
      - Words should be between 4-8 letters long (max 8 letters!)
      - No spaces or special characters
      - All words must be common, recognizable English words
      - Return ONLY the words, nothing else`,
      response_json_schema: {
        type: "object",
        properties: {
          words: {
            type: "array",
            items: { type: "string" },
            minItems: 10,
            maxItems: 10
          }
        },
        required: ["words"]
      }
    });

    const words = result.words.map(w => w.toUpperCase().replace(/[^A-Z]/g, '')).slice(0, 10);
    const { grid, wordPositions } = createGrid(words);

    await base44.entities.GameRoom.update(room.id, {
      words,
      grid,
      word_positions: wordPositions,
      status: 'playing',
      start_time: Date.now()
    });

    setIsGenerating(false);
  };

  const createGrid = (words) => {
    const size = 10;
    const grid = Array(size).fill(null).map(() => Array(size).fill(''));
    const wordPositions = [];
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down-right
      [1, -1],  // diagonal down-left
      [0, -1],  // horizontal reverse
      [-1, 0],  // vertical reverse
      [-1, -1], // diagonal up-left
      [-1, 1]   // diagonal up-right
    ];

    // Sort words by length (longer first for better placement)
    const sortedWords = [...words].sort((a, b) => b.length - a.length);

    for (const word of sortedWords) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const [dr, dc] = dir;

        const maxRow = dr === 0 ? size : (dr > 0 ? size - word.length : size);
        const minRow = dr === 0 ? 0 : (dr > 0 ? 0 : word.length - 1);
        const maxCol = dc === 0 ? size : (dc > 0 ? size - word.length : size);
        const minCol = dc === 0 ? 0 : (dc > 0 ? 0 : word.length - 1);

        if (maxRow <= minRow || maxCol <= minCol) {
          attempts++;
          continue;
        }

        const startRow = Math.floor(Math.random() * (maxRow - minRow)) + minRow;
        const startCol = Math.floor(Math.random() * (maxCol - minCol)) + minCol;

        // Check if word fits
        let canPlace = true;
        const positions = [];

        for (let i = 0; i < word.length; i++) {
          const row = startRow + i * dr;
          const col = startCol + i * dc;

          if (row < 0 || row >= size || col < 0 || col >= size) {
            canPlace = false;
            break;
          }

          const currentCell = grid[row][col];
          if (currentCell !== '' && currentCell !== word[i]) {
            canPlace = false;
            break;
          }
          positions.push({ row, col });
        }

        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            const row = startRow + i * dr;
            const col = startCol + i * dc;
            grid[row][col] = word[i];
          }
          wordPositions.push({ word, positions });
          placed = true;
        }

        attempts++;
      }
    }

    // Fill remaining cells with random letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (grid[i][j] === '') {
          grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }

    return { grid, wordPositions };
  };

  const handleWordFound = async (word) => {
    if (!room || !user) return;

    const playerIndex = room.players.findIndex(p => p.email === user.email);
    if (playerIndex === -1) return;

    const player = room.players[playerIndex];
    if (player.found_words?.includes(word)) return;

    // Calculate score based on time remaining
    const basePoints = 100;
    const timeBonus = Math.floor(timeLeft / 10);
    const points = basePoints + timeBonus;

    const updatedPlayers = [...room.players];
    updatedPlayers[playerIndex] = {
      ...player,
      found_words: [...(player.found_words || []), word],
      score: (player.score || 0) + points
    };

    // Check if player found all words
    const allFound = updatedPlayers[playerIndex].found_words.length >= (room.words?.length || 10);
    if (allFound) {
      updatedPlayers[playerIndex].finished = true;
      updatedPlayers[playerIndex].finish_time = Date.now() - room.start_time;
    }

    // Check if all players finished
    const allFinished = updatedPlayers.every(p => p.finished);

    // Optimistic update - apply locally immediately
    setRoom(prev => ({ ...prev, players: updatedPlayers, status: allFinished ? 'finished' : 'playing' }));
    if (allFinished) setShowResults(true);

    toast.success(`+${points} points!`, { duration: 1500 });

    // Persist to backend
    await base44.entities.GameRoom.update(room.id, {
      players: updatedPlayers,
      status: allFinished ? 'finished' : 'playing'
    });
  };

  const handleGameEnd = async () => {
    if (!room) return;
    await base44.entities.GameRoom.update(room.id, { status: 'finished' });
    setShowResults(true);
  };

  const handlePlayAgain = () => {
    navigate(createPageUrl("Home"));
  };

  const currentPlayer = room?.players?.find(p => p.email === user?.email);
  const isHost = room?.host_email === user?.email;

  // Loading state
  if (!room || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  // Lobby state
  if (room.status === 'waiting') {
    return (
      <Lobby
        room={room}
        currentUserEmail={user?.email}
        isHost={isHost}
        onStartGame={generatePuzzle}
        isGenerating={isGenerating}
      />
    );
  }

  // Game state
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(createPageUrl("Home"))}
              className="text-white/60 hover:text-white transition-colors p-1"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {room.category}
              </h1>
              <p className="text-white/50 text-sm">
                Room: {room.room_code}
              </p>
            </div>
          </div>
          <Timer timeLeft={timeLeft} totalTime={room.time_limit || 300} />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Game Grid */}
          <div className="lg:col-span-2">
            <WordGrid
              grid={room.grid}
              wordPositions={room.word_positions}
              foundWords={currentPlayer?.found_words || []}
              onWordFound={handleWordFound}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <WordList
              words={room.words || []}
              foundWords={currentPlayer?.found_words || []}
            />
            <ScoreBoard
              players={room.players || []}
              currentUserEmail={user?.email}
            />
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showResults && (
        <GameResults
          players={room.players || []}
          currentUserEmail={user?.email}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}