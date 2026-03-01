import React, { useState, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function WordGrid({ grid, wordPositions, foundWords, onWordFound }) {
  const [selection, setSelection] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const getCellKey = (row, col) => `${row}-${col}`;

  const isPartOfFoundWord = useCallback((row, col) => {
    for (const wp of wordPositions || []) {
      if (foundWords.includes(wp.word.toUpperCase())) {
        if (wp.positions.some(p => p.row === row && p.col === col)) {
          return wp.word;
        }
      }
    }
    return null;
  }, [wordPositions, foundWords]);

  const isSelected = (row, col) => {
    return selection.some(s => s.row === row && s.col === col);
  };

  const handleMouseDown = (row, col) => {
    setIsSelecting(true);
    setSelection([{ row, col }]);
  };

  const handleMouseEnter = (row, col) => {
    if (!isSelecting) return;

    const start = selection[0];
    if (!start) return;

    const newSelection = [];
    const dr = row - start.row;
    const dc = col - start.col;

    // Check if it's a valid direction (horizontal, vertical, or diagonal)
    const isDiagonal = Math.abs(dr) === Math.abs(dc) && dr !== 0;
    const isHorizontal = dr === 0 && dc !== 0;
    const isVertical = dc === 0 && dr !== 0;

    if (isDiagonal || isHorizontal || isVertical) {
      const steps = Math.max(Math.abs(dr), Math.abs(dc));
      const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
      const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

      for (let i = 0; i <= steps; i++) {
        newSelection.push({
          row: start.row + i * stepR,
          col: start.col + i * stepC
        });
      }
      setSelection(newSelection);
    }
  };

  const handleMouseUp = () => {
    if (selection.length > 1) {
      const selectedWord = selection
        .map(s => grid[s.row]?.[s.col] || '')
        .join('')
        .toUpperCase();

      const reversedWord = [...selectedWord].reverse().join('');

      // Check if selected word matches any word
      for (const wp of wordPositions || []) {
        const word = wp.word.toUpperCase();
        if (word === selectedWord || word === reversedWord) {
          if (!foundWords.includes(word)) {
            onWordFound(word);
          }
          break;
        }
      }
    }

    setIsSelecting(false);
    setSelection([]);
  };

  const getFoundWordColor = (word) => {
    const colors = [
      'bg-emerald-400/40',
      'bg-amber-400/40',
      'bg-rose-400/40',
      'bg-sky-400/40',
      'bg-purple-400/40',
      'bg-pink-400/40',
      'bg-teal-400/40',
      'bg-orange-400/40',
      'bg-indigo-400/40',
      'bg-lime-400/40',
    ];
    const index = (wordPositions || []).findIndex(wp => wp.word.toUpperCase() === word?.toUpperCase());
    return colors[index % colors.length];
  };

  return (
    <div
      className="select-none touch-none"
      onMouseLeave={() => {
        if (isSelecting) {
          setIsSelecting(false);
          setSelection([]);
        }
      }}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      <div className="grid gap-0.5 sm:gap-1 bg-slate-900/50 p-2 sm:p-3 rounded-2xl backdrop-blur-sm">
        {(grid || []).map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-0.5 sm:gap-1">
            {(row || []).map((letter, colIndex) => {
              const foundWord = isPartOfFoundWord(rowIndex, colIndex);
              const selected = isSelected(rowIndex, colIndex);

              return (
                <motion.div
                  key={getCellKey(rowIndex, colIndex)}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (rowIndex * 15 + colIndex) * 0.002 }}
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center",
                    "rounded-md sm:rounded-lg font-bold text-sm sm:text-base md:text-lg cursor-pointer",
                    "transition-all duration-150",
                    foundWord
                      ? `${getFoundWordColor(foundWord)} text-white`
                      : selected
                        ? "bg-indigo-500 text-white scale-110"
                        : "bg-white/90 text-slate-800 hover:bg-white"
                  )}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onTouchStart={() => handleMouseDown(rowIndex, colIndex)}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (element) {
                      const cellData = element.getAttribute('data-cell');
                      if (cellData) {
                        const [r, c] = cellData.split('-').map(Number);
                        handleMouseEnter(r, c);
                      }
                    }
                  }}
                  data-cell={getCellKey(rowIndex, colIndex)}
                >
                  {letter}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}