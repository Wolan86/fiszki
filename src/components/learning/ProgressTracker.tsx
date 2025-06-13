import { useState, useEffect } from "react";

interface ProgressStats {
  totalFlashcards: number;
  currentIndex: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedCards: number;
  sessionDuration: number;
  averageResponseTime: number;
  streak: number;
  accuracy: number;
}

interface ProgressTrackerProps {
  stats: ProgressStats;
  showDetailedStats?: boolean;
  onStatsToggle?: () => void;
}

const ProgressTracker = ({ stats, showDetailedStats = false, onStatsToggle }: ProgressTrackerProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);

  const progress = (stats.currentIndex / stats.totalFlashcards) * 100;
  const accuracy =
    stats.totalFlashcards > 0 ? (stats.correctAnswers / (stats.correctAnswers + stats.incorrectAnswers)) * 100 : 0;

  // Animacja postępu
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
      setAnimatedAccuracy(accuracy);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress, accuracy]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 10) return "text-green-600";
    if (streak >= 5) return "text-yellow-600";
    return "text-gray-600";
  };

  // getAccuracyColor function removed - not currently used

  const progressBarStyle: React.CSSProperties = {
    width: "100%",
    height: "8px",
    backgroundColor: "hsl(var(--muted))",
    borderRadius: "4px",
    overflow: "hidden",
    position: "relative",
  };

  const progressFillStyle: React.CSSProperties = {
    height: "100%",
    background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)) 50%, hsl(var(--primary)/0.8))",
    borderRadius: "4px",
    transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    width: `${animatedProgress}%`,
    position: "relative",
  };

  const shimmerStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
    animation: progress > 0 ? "shimmer 2s infinite" : "none",
  };

  const accuracyRingStyle: React.CSSProperties = {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: `conic-gradient(hsl(var(--primary)) ${animatedAccuracy * 3.6}deg, hsl(var(--muted)) 0deg)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    transition: "background 0.5s ease",
  };

  const accuracyInnerStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "hsl(var(--background))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
    color: "hsl(var(--foreground))",
  };

  const fadeInStyle: React.CSSProperties = {
    animation: "fadeIn 0.3s ease-out",
  };

  return (
    <div className="progress-tracker bg-card border border-border rounded-lg p-4 shadow-sm">
      {/* Główny pasek postępu */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">
            Postęp: {stats.currentIndex} / {stats.totalFlashcards}
          </span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div style={progressBarStyle}>
          <div style={progressFillStyle}>
            {/* Animowany blask */}
            <div style={shimmerStyle} />
          </div>
        </div>
      </div>

      {/* Podstawowe statystyki */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <div style={accuracyRingStyle}>
              <div style={accuracyInnerStyle}>{Math.round(animatedAccuracy)}%</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Celność</div>
        </div>

        <div className="text-center">
          <div className={`text-2xl font-bold ${getStreakColor(stats.streak)}`}>{stats.streak}</div>
          <div className="text-xs text-muted-foreground">Seria</div>
        </div>
      </div>

      {/* Szczegółowe statystyki */}
      {showDetailedStats && (
        <div className="detailed-stats border-t border-border pt-4 space-y-3" style={fadeInStyle}>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <div className="text-green-600 font-semibold">{stats.correctAnswers}</div>
              <div className="text-xs text-muted-foreground">Poprawne</div>
            </div>
            <div className="text-center">
              <div className="text-red-600 font-semibold">{stats.incorrectAnswers}</div>
              <div className="text-xs text-muted-foreground">Błędne</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-600 font-semibold">{stats.skippedCards}</div>
              <div className="text-xs text-muted-foreground">Pominięte</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-foreground">{formatTime(stats.sessionDuration)}</div>
              <div className="text-xs text-muted-foreground">Czas sesji</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">{stats.averageResponseTime.toFixed(1)}s</div>
              <div className="text-xs text-muted-foreground">Śr. czas</div>
            </div>
          </div>
        </div>
      )}

      {/* Przycisk do pokazania/ukrycia szczegółów */}
      {onStatsToggle && (
        <button
          onClick={onStatsToggle}
          className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          {showDetailedStats ? "▼ Ukryj szczegóły" : "▲ Pokaż szczegóły"}
        </button>
      )}
    </div>
  );
};

export default ProgressTracker;
