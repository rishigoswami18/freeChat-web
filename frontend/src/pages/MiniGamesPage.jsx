import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Dices, Trophy, Zap, ArrowLeft } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const MiniGamesPage = () => {
  const queryClient = useQueryClient();
  const [activeGame, setActiveGame] = useState(null); // "coin-flip" | "dice-roll"
  const [wager, setWager] = useState(10);
  const [lastResult, setLastResult] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: wallet } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: async () => {
      const res = await axiosInstance.get('/wallet/balance');
      return res.data;
    }
  });

  const balance = (wallet?.winnings || 0) + (wallet?.bonusBalance || 0);

  const gameMutation = useMutation({
    mutationFn: async ({ game, payload }) => {
      const res = await axiosInstance.post(`/minigame/${game}`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      setLastResult(data);
      queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
      if (data.won) toast.success(`You won 🪙 ${data.payout}!`);
      else toast.error(`Lost 🪙 ${Math.abs(data.payout)}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Game error"),
    onSettled: () => setTimeout(() => setIsAnimating(false), 600)
  });

  const playCoinFlip = (choice) => {
    setIsAnimating(true);
    setLastResult(null);
    setTimeout(() => {
      gameMutation.mutate({ game: "coin-flip", payload: { wager, choice } });
    }, 1200);
  };

  const playDiceRoll = (choice) => {
    setIsAnimating(true);
    setLastResult(null);
    setTimeout(() => {
      gameMutation.mutate({ game: "dice-roll", payload: { wager, choice } });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-outfit p-4 lg:p-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-all flex items-center gap-2 mb-2">
              <ArrowLeft className="size-3" /> Back
            </Link>
            <h1 className="text-4xl font-black italic tracking-tighter">Mini Arena</h1>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-right">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Balance</p>
            <p className="text-lg font-black">🪙 {balance.toLocaleString()}</p>
          </div>
        </header>

        {/* Game Selector */}
        {!activeGame && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => setActiveGame("coin-flip")}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 cursor-pointer hover:bg-white/10 transition-all text-center space-y-4 group"
            >
              <div className="text-6xl">🪙</div>
              <h2 className="text-2xl font-black italic">Coin Flip</h2>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Heads or Tails • 2x Payout</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => setActiveGame("dice-roll")}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 cursor-pointer hover:bg-white/10 transition-all text-center space-y-4 group"
            >
              <div className="text-6xl">🎲</div>
              <h2 className="text-2xl font-black italic">Dice Roll</h2>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Over or Under 3.5 • 2x Payout</p>
            </motion.div>
          </div>
        )}

        {/* Active Game */}
        <AnimatePresence mode="wait">
          {activeGame && (
            <motion.div
              key={activeGame}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-10"
            >
              {/* Back Button */}
              <button onClick={() => { setActiveGame(null); setLastResult(null); }} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all flex items-center gap-2">
                <ArrowLeft className="size-3" /> Choose Another Game
              </button>

              {/* Game Title */}
              <div className="text-center space-y-2">
                <div className={`text-7xl ${isAnimating ? 'animate-bounce' : ''}`}>
                  {activeGame === "coin-flip" ? "🪙" : "🎲"}
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter">
                  {activeGame === "coin-flip" ? "Coin Flip" : "Dice Roll"}
                </h2>
              </div>

              {/* Result Display */}
              {lastResult && !isAnimating && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-center p-6 rounded-3xl border-2 ${lastResult.won ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}
                >
                  <p className="text-4xl font-black mb-2">{lastResult.won ? "🎉" : "😢"}</p>
                  <p className="text-xl font-black italic">{lastResult.won ? "You Won!" : "You Lost"}</p>
                  <p className="text-sm font-bold text-white/50 mt-1">
                    {activeGame === "coin-flip"
                      ? `Result: ${lastResult.result.toUpperCase()}`
                      : `Rolled: ${lastResult.roll}`}
                    {" • "}
                    <span className={lastResult.won ? "text-emerald-400" : "text-red-400"}>
                      {lastResult.won ? "+" : ""}{lastResult.payout} BC
                    </span>
                  </p>
                </motion.div>
              )}

              {/* Wager Slider */}
              <div className="space-y-3 max-w-sm mx-auto">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-1">
                  <span className="text-white/30">Wager</span>
                  <span className="text-amber-500">🪙 {wager}</span>
                </div>
                <input
                  type="range" min="5" max="500" step="5"
                  value={wager}
                  onChange={(e) => setWager(parseInt(e.target.value))}
                  className="range range-xs range-primary w-full"
                />
                <div className="flex justify-between text-[8px] font-black text-white/20">
                  <span>5</span><span>250</span><span>500</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                {activeGame === "coin-flip" ? (
                  <>
                    <button
                      onClick={() => playCoinFlip("heads")}
                      disabled={isAnimating || balance < wager}
                      className="px-10 py-5 bg-amber-500 text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                    >
                      Heads
                    </button>
                    <button
                      onClick={() => playCoinFlip("tails")}
                      disabled={isAnimating || balance < wager}
                      className="px-10 py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                    >
                      Tails
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => playDiceRoll("over")}
                      disabled={isAnimating || balance < wager}
                      className="px-10 py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                    >
                      Over 3
                    </button>
                    <button
                      onClick={() => playDiceRoll("under")}
                      disabled={isAnimating || balance < wager}
                      className="px-10 py-5 bg-red-500 text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                    >
                      Under 4
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MiniGamesPage;
