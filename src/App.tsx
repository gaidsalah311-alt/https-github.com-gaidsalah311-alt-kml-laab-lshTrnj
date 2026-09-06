import React, { useState, useEffect, useCallback } from 'react';
import { DifficultyId, GameMode, GameSettings, GameStats, Side } from './types/chess';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { SettingsModal } from './components/SettingsModal';

const SETTINGS_KEY = 'kml_chess_settings_v2';
const STATS_KEY = 'kml_chess_stats_v2';
const SAVED_GAME_KEY = 'kml_chess_saved_game_v2';

const DEFAULT_SETTINGS: GameSettings = {
  timerEnabled: true,
  timerMinutes: 10,
  showCoordinates: true,
  aiDifficulty: 'medium',
  soundEnabled: true,
  playerSide: 'white',
};

const DEFAULT_STATS: GameStats = {
  games: 0,
  wins: 0,
  losses: 0,
  draws: 0,
};

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'game'>('home');
  const [gameMode, setGameMode] = useState<GameMode>('computer');
  const [playerSide, setPlayerSide] = useState<Side>('white');
  const [isResume, setIsResume] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Persistence State
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      return saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  const [savedGame, setSavedGame] = useState<any>(() => {
    try {
      const saved = localStorage.getItem(SAVED_GAME_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Save settings when updated
  const handleUpdateSettings = (patch: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...patch };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch {
        // Storage safe fallback
      }
      return updated;
    });
  };

  // Record match result in stats
  const handleRecordResult = useCallback((result: 'win' | 'loss' | 'draw') => {
    setStats((prev) => {
      const next = {
        games: prev.games + 1,
        wins: result === 'win' ? prev.wins + 1 : prev.wins,
        losses: result === 'loss' ? prev.losses + 1 : prev.losses,
        draws: result === 'draw' ? prev.draws + 1 : prev.draws,
      };
      try {
        localStorage.setItem(STATS_KEY, JSON.stringify(next));
      } catch {
        // Safe
      }
      return next;
    });
  }, []);

  // Save game state without causing App re-renders during active gameplay
  const handleSaveGameState = useCallback((state: unknown) => {
    try {
      if (!state) {
        localStorage.removeItem(SAVED_GAME_KEY);
        setSavedGame(null);
      } else {
        localStorage.setItem(SAVED_GAME_KEY, JSON.stringify(state));
      }
    } catch {
      // Safe
    }
  }, []);

  // Return to home and synchronize saved game state for the resume card
  const handleBackToHome = useCallback(() => {
    try {
      const saved = localStorage.getItem(SAVED_GAME_KEY);
      setSavedGame(saved ? JSON.parse(saved) : null);
    } catch {
      setSavedGame(null);
    }
    setCurrentView('home');
  }, []);

  // Start a game
  const handleStartGame = (mode: GameMode, resume = false, chosenSide: Side = 'white') => {
    setGameMode(mode);
    setPlayerSide(chosenSide);
    setIsResume(resume);
    setCurrentView('game');
  };

  return (
    <div className="min-h-screen bg-[#131110] text-stone-100 font-sans antialiased flex flex-col justify-between selection:bg-amber-600 selection:text-white">
      {/* Background radial highlight */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-[#131110] to-[#131110]" />

      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        {currentView === 'home' ? (
          <HomeScreen
            hasSavedGame={Boolean(savedGame)}
            savedMode={savedGame?.gameMode || 'computer'}
            settings={settings}
            stats={stats}
            onStart={handleStartGame}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSelectDifficulty={(diff: DifficultyId) => handleUpdateSettings({ aiDifficulty: diff })}
            onSelectPlayerSide={(side: 'white' | 'black' | 'random') =>
              handleUpdateSettings({ playerSide: side })
            }
          />
        ) : (
          <GameScreen
            gameMode={gameMode}
            playerSide={playerSide}
            settings={settings}
            resume={isResume}
            onBackToHome={handleBackToHome}
            onRecordResult={handleRecordResult}
            onSaveGameState={handleSaveGameState}
            savedState={savedGame}
          />
        )}
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdate={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
