/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { Heart, Zap, Trophy, MapPin, Diamond, Rocket, ArrowUpCircle, Shield, Activity, PlusCircle, Play, RotateCcw } from 'lucide-react';
import { useStore } from '@/features/game/state/store';
import { GameStatus, GEMINI_COLORS, ShopItem, RUN_SPEED_BASE } from '@/shared/types/types';
import { audio } from '@/systems/audio/AudioEngine';

// Available Shop Items - BALANCED ECONOMY (TASK-019)
const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'DOUBLE_JUMP',
        name: 'DOBLE SALTO',
        description: 'Salta de nuevo en el aire. Vital para esquivar.',
        cost: 600, // Reduced from 1000 for better accessibility
        icon: ArrowUpCircle,
        oneTime: true
    },
    {
        id: 'MAX_LIFE',
        name: 'VIDA MÁXIMA',
        description: 'Añade un corazón permanente y te cura.',
        cost: 800, // Reduced from 1500, scales with usage
        icon: Activity
    },
    {
        id: 'HEAL',
        name: 'PEZ FRESCO',
        description: 'Restaura 1 punto de vida al instante.',
        cost: 500, // Reduced from 1000, daily limit applies
        icon: PlusCircle
    },
    {
        id: 'IMMORTAL',
        name: 'ESCUDO TINTA',
        description: 'Habilidad: Pulsa Espacio/Toca para ser invencible 5s.',
        cost: 1500, // Reduced from 3000 for power/toughness ratio
        icon: Shield,
        oneTime: true
    }
];

const ShopScreen: React.FC = () => {
    const { score, buyItem, closeShop, hasDoubleJump, hasImmortality } = useStore();
    const [items, setItems] = useState<ShopItem[]>([]);

    useEffect(() => {
        let pool = SHOP_ITEMS.filter(item => {
            if (item.id === 'DOUBLE_JUMP' && hasDoubleJump) return false;
            if (item.id === 'IMMORTAL' && hasImmortality) return false;
            return true;
        });
        pool = pool.sort(() => 0.5 - Math.random());
        setItems(pool.slice(0, 3));
    }, []);

    return (
        <div className="absolute inset-0 bg-blue-900/90 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
             <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                 <h2 className="text-3xl md:text-4xl font-black text-yellow-400 mb-2 font-cyber tracking-widest text-center">TIENDA PLAYERA</h2>
                 <div className="flex items-center text-white mb-6 md:mb-8">
                     <span className="text-base md:text-lg mr-2">CERVEZAS DISPONIBLES:</span>
                     <span className="text-xl md:text-2xl font-bold">{score.toLocaleString()}</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full mb-8">
                     {items.map(item => {
                         const Icon = item.icon;
                         const canAfford = score >= item.cost;
                         return (
                             <div key={item.id} className="bg-white/10 border border-white/30 p-4 md:p-6 rounded-xl flex flex-col items-center text-center hover:border-yellow-400 transition-colors">
                                 <div className="bg-blue-800 p-3 md:p-4 rounded-full mb-3 md:mb-4">
                                     <Icon className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
                                 </div>
                                 <h3 className="text-lg md:text-xl font-bold mb-2">{item.name}</h3>
                                 <p className="text-gray-200 text-xs md:text-sm mb-4 h-10 md:h-12 flex items-center justify-center">{item.description}</p>
                                 <button
                                    onClick={() => buyItem(item.id as any, item.cost)}
                                    disabled={!canAfford}
                                    className={`px-4 md:px-6 py-2 rounded font-bold w-full text-sm md:text-base ${canAfford ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:brightness-110 text-black' : 'bg-gray-700 cursor-not-allowed opacity-50'}`}
                                 >
                                     {item.cost}
                                 </button>
                             </div>
                         );
                     })}
                 </div>

                 <button
                    onClick={closeShop}
                    className="flex items-center px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-lg md:text-xl rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                 >
                     VOLVER A NADAR <Play className="ml-2 w-5 h-5" fill="white" />
                 </button>
             </div>
        </div>
    );
};

export const HUD: React.FC = () => {
  const { score, lives, maxLives, collectedLetters, status, level, restartGame, restartFromCheckpoint, startGame, beersCollected, distance, isImmortalityActive, speed, hasCheckpoint } = useStore();
  const target = ['C', 'A', 'L', 'A', 'M', 'A', 'R', 'L', 'O', 'C', 'O'];
  const [checkpointMessage, setCheckpointMessage] = useState<string | null>(null);

  const containerClass = "absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-50";

  // Handle checkpoint created events
  useEffect(() => {
    const handleCheckpointCreated = (e: CustomEvent) => {
      const { distance } = e.detail;
      setCheckpointMessage(`Checkpoint alcanzado en ${distance}m`);
      setTimeout(() => setCheckpointMessage(null), 3000); // Hide after 3 seconds
    };

    window.addEventListener('checkpoint-created', handleCheckpointCreated as any);
    return () => window.removeEventListener('checkpoint-created', handleCheckpointCreated as any);
  }, []);

  if (status === GameStatus.SHOP) {
      return <ShopScreen />;
  }

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-blue-900/80 backdrop-blur-sm p-4 pointer-events-auto">
              {/* Card Container */}
              <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/20 animate-in zoom-in-95 duration-500 bg-black">

                {/* Logo Image Container */}
                <div className="relative w-full aspect-video flex items-center justify-center bg-black">
                     <img
                        src="./logo.jpg"
                        alt="El Calamar Loco"
                        className="w-full h-full object-cover"
                     />
                </div>

                <div className="flex flex-col justify-end items-center p-6 bg-white text-center z-10">
                    <button
                        onClick={() => { audio.unlock(); startGame(); }}
                        className="w-full group relative px-6 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-black text-xl rounded-xl transition-all shadow-[0_4px_15px_rgba(255,100,0,0.4)] hover:scale-[1.02] overflow-hidden"
                    >
                        <span className="relative z-10 tracking-widest flex items-center justify-center">
                            A NADAR <Play className="ml-2 w-5 h-5 fill-white" />
                        </span>
                    </button>

                    <p className="text-gray-500 text-[10px] md:text-xs font-mono mt-3 tracking-wider">
                        [ FLECHAS / TAP LADOS / SWIPE ]
                    </p>
                    <div className="text-gray-400 text-[9px] mt-2 space-y-1">
                        <p>📱 Tap izq/der = mover | Centro = saltar</p>
                        <p>👆 Swipe arriba = saltar | Doble tap = escudo</p>
                    </div>
                </div>
              </div>
          </div>
      );
  }

  if (status === GameStatus.GAME_OVER) {
      return (
          <div className="absolute inset-0 bg-black/80 z-[100] text-white pointer-events-auto backdrop-blur-sm overflow-y-auto">
              <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] font-cyber text-center">¡REVOLCÓN!</h1>

                <div className="grid grid-cols-1 gap-3 md:gap-4 text-center mb-8 w-full max-w-md">
                    <div className="bg-white/10 p-3 md:p-4 rounded-lg border border-white/10 flex items-center justify-between">
                        <div className="flex items-center text-yellow-400 text-sm md:text-base"><Trophy className="mr-2 w-4 h-4 md:w-5 md:h-5"/> NIVEL</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{level} / 3</div>
                    </div>
                    <div className="bg-white/10 p-3 md:p-4 rounded-lg border border-white/10 flex items-center justify-between">
                        <div className="flex items-center text-cyan-400 text-sm md:text-base"><Diamond className="mr-2 w-4 h-4 md:w-5 md:h-5"/> CERVEZAS</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{beersCollected}</div>
                    </div>
                    <div className="bg-white/10 p-3 md:p-4 rounded-lg border border-white/10 flex items-center justify-between">
                        <div className="flex items-center text-purple-400 text-sm md:text-base"><MapPin className="mr-2 w-4 h-4 md:w-5 md:h-5"/> DISTANCIA</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{Math.floor(distance)} M</div>
                    </div>
                     <div className="bg-blue-600/50 p-3 md:p-4 rounded-lg flex items-center justify-between mt-2">
                        <div className="flex items-center text-white text-sm md:text-base">PUNTOS TOTALES</div>
                        <div className="text-2xl md:text-3xl font-bold font-cyber text-white">{score.toLocaleString()}</div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                  {hasCheckpoint() && (
                    <button
                      onClick={() => { audio.unlock(); restartFromCheckpoint(); }}
                      className="flex items-center justify-center px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg md:text-xl rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                    >
                        <RotateCcw className="mr-2 w-5 h-5" /> REINTENTAR DESDE CHECKPOINT
                    </button>
                  )}
                  <button
                    onClick={() => { audio.unlock(); restartGame(); }}
                    className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg md:text-xl rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                  >
                      REINTENTAR DESDE EL INICIO
                  </button>
                </div>
              </div>
          </div>
      );
  }

  if (status === GameStatus.VICTORY) {
    return (
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-300 via-orange-400 to-pink-500 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
            <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <Rocket className="w-16 h-16 md:w-24 md:h-24 text-white mb-4 animate-bounce" />
                <h1 className="text-3xl md:text-7xl font-black text-white mb-2 drop-shadow-md font-cyber text-center leading-tight">
                    ¡FIESTA!
                </h1>
                <p className="text-white/80 text-sm md:text-2xl font-mono mb-8 tracking-widest text-center">
                    ERES EL REY DE LA PLAYA
                </p>

                <div className="grid grid-cols-1 gap-4 text-center mb-8 w-full max-w-md">
                    <div className="bg-white/20 p-6 rounded-xl border border-white/30">
                        <div className="text-xs md:text-sm text-white mb-1 tracking-wider">PUNTUACIÓN FINAL</div>
                        <div className="text-3xl md:text-4xl font-bold font-cyber text-white">{score.toLocaleString()}</div>
                    </div>
                </div>

                <button
                  onClick={() => { audio.unlock(); restartGame(); }}
                  className="px-8 md:px-12 py-4 md:py-5 bg-white text-pink-600 font-black text-lg md:text-xl rounded-full hover:scale-105 transition-all shadow-xl tracking-widest"
                >
                    JUGAR DE NUEVO
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className={containerClass}>
        {/* Top Bar - Redesigned for better hierarchy */}
        <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
                <div className="text-2xl md:text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] font-cyber">
                    {score.toLocaleString()}
                </div>
                <div className="text-sm md:text-lg text-yellow-400 font-mono">
                    CERVEZAS
                </div>
            </div>

            <div className="flex space-x-2 md:space-x-3">
                {[...Array(maxLives)].map((_, i) => (
                    <Heart
                        key={i}
                        className={`w-12 h-12 md:w-14 md:h-14 ${i < lives ? 'text-red-500 fill-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]' : 'text-gray-600 fill-gray-600'} transition-all duration-200`}
                        style={{
                            filter: i < lives ? 'drop-shadow(0 0 8px rgba(255,0,0,0.8))' : 'none'
                        }}
                    />
                ))}
            </div>
        </div>

        {/* Level Indicator */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-sm md:text-lg text-white font-bold tracking-wider font-mono bg-black/20 px-4 py-1 rounded-full backdrop-blur-sm z-50">
            NIVEL {level} <span className="text-white/60 text-xs md:text-sm">/ 3</span>
        </div>

        {/* Checkpoint Message */}
        {checkpointMessage && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-green-400 font-bold text-lg md:text-xl animate-bounce bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm z-50">
            {checkpointMessage}
          </div>
        )}

        {/* Active Skill Indicator */}
        {isImmortalityActive && (
             <div className="absolute top-24 left-1/2 transform -translate-x-1/2 text-black font-bold text-xl md:text-2xl animate-pulse flex items-center bg-yellow-400 px-3 py-1 rounded">
                 <Shield className="mr-2 fill-black" /> ESCUDO TINTA
             </div>
        )}

        {/* Letters Collection Progress Bar */}
        <div className="absolute top-16 md:top-24 left-1/2 transform -translate-x-1/2">
            <div className="bg-black/60 rounded-full px-4 py-2 backdrop-blur-sm border border-white/20">
                <div className="text-xs md:text-sm text-white/80 font-mono mb-1 text-center">
                    LETRAS: {collectedLetters.length}/{target.length}
                </div>
                <div className="flex space-x-1">
                    {target.map((char, idx) => {
                        const isCollected = collectedLetters.includes(idx);
                        const color = GEMINI_COLORS[idx];

                        return (
                            <div
                                key={idx}
                                style={{
                                    backgroundColor: isCollected ? color : 'rgba(255, 255, 255, 0.2)',
                                    color: isCollected ? '#fff' : 'rgba(255,255,255,0.5)',
                                }}
                                className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center font-black text-xs md:text-sm font-cyber rounded transition-all duration-500 ${isCollected ? 'animate-pulse scale-110' : ''}`}
                            >
                                {char}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Bottom Overlay */}
        <div className="w-full flex justify-end items-end">
             <div className="flex items-center space-x-2 text-white drop-shadow-md">
                 <Zap className="w-4 h-4 md:w-6 md:h-6 animate-pulse" fill="yellow" />
                 <span className="font-mono text-base md:text-xl">VELOCIDAD {Math.round((speed / RUN_SPEED_BASE) * 100)}%</span>
             </div>
        </div>
    </div>
  );
};
