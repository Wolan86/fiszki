import React, { useState, useEffect } from "react";

export interface LearningSettings {
  difficulty: "easy" | "medium" | "hard" | "adaptive";
  cardOrder: "sequential" | "random" | "by-difficulty";
  reviewMode: "standard" | "spaced-repetition" | "mastery";
  autoFlip: boolean;
  autoFlipDelay: number; // w sekundach
  showProgress: boolean;
  soundEnabled: boolean;
  keyboardShortcuts: boolean;
  sessionLength: number; // liczba kart lub czas w minutach
  sessionType: "cards" | "time";
  showHints: boolean;
  darkMode: boolean;
}

interface LearningSettingsProps {
  settings: LearningSettings;
  onSettingsChange: (settings: LearningSettings) => void;
  onClose: () => void;
  className?: string;
}

const LearningSettingsComponent = ({
  settings,
  onSettingsChange,
  onClose,
}: Omit<LearningSettingsProps, "className">) => {
  const [localSettings, setLocalSettings] = useState<LearningSettings>(settings);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    setIsChanged(JSON.stringify(settings) !== JSON.stringify(localSettings));
  }, [settings, localSettings]);

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSettingChange = <K extends keyof LearningSettings>(key: K, value: LearningSettings[K]) => {
    setLocalSettings((prev: LearningSettings) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: LearningSettings = {
      difficulty: "medium",
      cardOrder: "sequential",
      reviewMode: "standard",
      autoFlip: false,
      autoFlipDelay: 5,
      showProgress: true,
      soundEnabled: true,
      keyboardShortcuts: true,
      sessionLength: 20,
      sessionType: "cards",
      showHints: true,
      darkMode: false,
    };
    setLocalSettings(defaultSettings);
  };

  const modalStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    animation: "fadeIn 0.2s ease-out",
  };

  const contentStyle: React.CSSProperties = {
    backgroundColor: "hsl(var(--background))",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    border: "1px solid hsl(var(--border))",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    animation: "slideIn 0.3s ease-out",
  };

  const toggleStyle: React.CSSProperties = {
    appearance: "none",
    width: "48px",
    height: "24px",
    borderRadius: "12px",
    backgroundColor: "hsl(var(--muted))",
    border: "2px solid hsl(var(--border))",
    position: "relative",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

  const toggleCheckedStyle: React.CSSProperties = {
    ...toggleStyle,
    backgroundColor: "hsl(var(--primary))",
    borderColor: "hsl(var(--primary))",
  };

  return (
    <button
      style={modalStyle}
      onClick={onClose}
      type="button"
      aria-label="Close settings modal"
      className="block w-full h-full"
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <div
        style={contentStyle}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="settings-title"
        aria-modal="true"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="settings-title" className="text-xl font-bold text-foreground">
            Ustawienia Nauki
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Poziom trudności */}
          <div className="setting-group">
            <label htmlFor="difficulty-select" className="block text-sm font-medium text-foreground mb-2">
              Poziom trudności
            </label>
            <select
              id="difficulty-select"
              value={localSettings.difficulty}
              onChange={(e) => handleSettingChange("difficulty", e.target.value as LearningSettings["difficulty"])}
              className="w-full p-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="easy">Łatwy</option>
              <option value="medium">Średni</option>
              <option value="hard">Trudny</option>
              <option value="adaptive">Adaptacyjny</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Adaptacyjny automatycznie dostosuje się do Twojego poziomu
            </p>
          </div>

          {/* Kolejność kart */}
          <div className="setting-group">
            <label htmlFor="card-order-select" className="block text-sm font-medium text-foreground mb-2">
              Kolejność kart
            </label>
            <select
              id="card-order-select"
              value={localSettings.cardOrder}
              onChange={(e) => handleSettingChange("cardOrder", e.target.value as LearningSettings["cardOrder"])}
              className="w-full p-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="sequential">Sekwencyjna</option>
              <option value="random">Losowa</option>
              <option value="by-difficulty">Według trudności</option>
            </select>
          </div>

          {/* Tryb powtórek */}
          <div className="setting-group">
            <label htmlFor="review-mode-select" className="block text-sm font-medium text-foreground mb-2">
              Tryb powtórek
            </label>
            <select
              id="review-mode-select"
              value={localSettings.reviewMode}
              onChange={(e) => handleSettingChange("reviewMode", e.target.value as LearningSettings["reviewMode"])}
              className="w-full p-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="standard">Standardowy</option>
              <option value="spaced-repetition">Powtórka przestrzenna</option>
              <option value="mastery">Mistrzostwo</option>
            </select>
          </div>

          {/* Długość sesji */}
          <div className="setting-group">
            <fieldset>
              <legend className="block text-sm font-medium text-foreground mb-2">Długość sesji</legend>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cards"
                    name="sessionType"
                    checked={localSettings.sessionType === "cards"}
                    onChange={() => handleSettingChange("sessionType", "cards")}
                    className="mr-2"
                  />
                  <label htmlFor="cards" className="text-sm text-foreground">
                    Liczba kart
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="time"
                    name="sessionType"
                    checked={localSettings.sessionType === "time"}
                    onChange={() => handleSettingChange("sessionType", "time")}
                    className="mr-2"
                  />
                  <label htmlFor="time" className="text-sm text-foreground">
                    Czas
                  </label>
                </div>
              </div>
              <div className="mt-2">
                <label htmlFor="session-length-range" className="sr-only">
                  Długość sesji: {localSettings.sessionLength} {localSettings.sessionType === "cards" ? "kart" : "min"}
                </label>
                <input
                  id="session-length-range"
                  type="range"
                  min={localSettings.sessionType === "cards" ? 5 : 5}
                  max={localSettings.sessionType === "cards" ? 100 : 60}
                  step={localSettings.sessionType === "cards" ? 5 : 5}
                  value={localSettings.sessionLength}
                  onChange={(e) => handleSettingChange("sessionLength", parseInt(e.target.value))}
                  className="w-full"
                  aria-label={`Długość sesji: ${localSettings.sessionLength} ${localSettings.sessionType === "cards" ? "kart" : "min"}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>
                    {localSettings.sessionLength} {localSettings.sessionType === "cards" ? "kart" : "min"}
                  </span>
                  <span>Max: {localSettings.sessionType === "cards" ? "100 kart" : "60 min"}</span>
                </div>
              </div>
            </fieldset>
          </div>

          {/* Auto-flip */}
          <div className="setting-group">
            <div className="flex items-center justify-between">
              <label htmlFor="auto-flip-checkbox" className="text-sm font-medium text-foreground">
                Automatyczne odwracanie
              </label>
              <input
                id="auto-flip-checkbox"
                type="checkbox"
                checked={localSettings.autoFlip}
                onChange={(e) => handleSettingChange("autoFlip", e.target.checked)}
                style={localSettings.autoFlip ? toggleCheckedStyle : toggleStyle}
              />
            </div>
            {localSettings.autoFlip && (
              <div className="mt-2">
                <label htmlFor="auto-flip-delay-range" className="block text-xs text-muted-foreground mb-1">
                  Opóźnienie: {localSettings.autoFlipDelay}s
                </label>
                <input
                  id="auto-flip-delay-range"
                  type="range"
                  min="2"
                  max="10"
                  step="0.5"
                  value={localSettings.autoFlipDelay}
                  onChange={(e) => handleSettingChange("autoFlipDelay", parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Pozostałe ustawienia */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="show-progress-checkbox" className="text-sm font-medium text-foreground">
                Pokaż postęp
              </label>
              <input
                id="show-progress-checkbox"
                type="checkbox"
                checked={localSettings.showProgress}
                onChange={(e) => handleSettingChange("showProgress", e.target.checked)}
                style={localSettings.showProgress ? toggleCheckedStyle : toggleStyle}
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="sound-enabled-checkbox" className="text-sm font-medium text-foreground">
                Dźwięki
              </label>
              <input
                id="sound-enabled-checkbox"
                type="checkbox"
                checked={localSettings.soundEnabled}
                onChange={(e) => handleSettingChange("soundEnabled", e.target.checked)}
                style={localSettings.soundEnabled ? toggleCheckedStyle : toggleStyle}
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="keyboard-shortcuts-checkbox" className="text-sm font-medium text-foreground">
                Skróty klawiszowe
              </label>
              <input
                id="keyboard-shortcuts-checkbox"
                type="checkbox"
                checked={localSettings.keyboardShortcuts}
                onChange={(e) => handleSettingChange("keyboardShortcuts", e.target.checked)}
                style={localSettings.keyboardShortcuts ? toggleCheckedStyle : toggleStyle}
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="show-hints-checkbox" className="text-sm font-medium text-foreground">
                Pokaż podpowiedzi
              </label>
              <input
                id="show-hints-checkbox"
                type="checkbox"
                checked={localSettings.showHints}
                onChange={(e) => handleSettingChange("showHints", e.target.checked)}
                style={localSettings.showHints ? toggleCheckedStyle : toggleStyle}
              />
            </div>
          </div>
        </div>

        {/* Przyciski akcji */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Resetuj do domyślnych
          </button>

          <div className="space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={handleSave}
              disabled={!isChanged}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                isChanged
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Zapisz
            </button>
          </div>
        </div>

        {/* Informacja o skrótach klawiszowych */}
        {localSettings.keyboardShortcuts && (
          <div className="mt-6 p-3 bg-muted rounded-md">
            <h4 className="text-sm font-medium text-foreground mb-2">Skróty klawiszowe:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>Space: Odwróć kartę</div>
              <div>→: Następna karta</div>
              <div>←: Poprzednia karta</div>
              <div>F: Pełny ekran</div>
              <div>S: Ustawienia</div>
              <div>Esc: Wyjście</div>
            </div>
          </div>
        )}
      </div>
    </button>
  );
};

export default LearningSettingsComponent;
