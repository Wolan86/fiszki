import React from "react";
import { Card } from "@/components/ui/card";

interface ProgressIndicatorProps {
  isGenerating: boolean;
  progressText?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  isGenerating,
  progressText = "Generowanie fiszek. Proszę czekać..."
}) => {
  if (!isGenerating) return null;

  return (
    <Card className="p-6 my-6 border border-neutral-200">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
          {/* Pulsujące okręgi */}
          <div className="absolute inset-0 rounded-full bg-neutral-200 opacity-25 animate-ping"></div>
          <div className="absolute inset-2 rounded-full bg-neutral-300 opacity-50 animate-pulse"></div>
          <div className="absolute inset-4 rounded-full bg-neutral-400 opacity-75"></div>
          <div className="absolute inset-6 rounded-full bg-neutral-500"></div>
        </div>
        
        <div className="text-center">
          <p className="text-lg font-medium">{progressText}</p>
          <p className="text-sm text-neutral-500 mt-1">
            Ten proces może potrwać do 30 sekund
          </p>
        </div>
        
        {/* Pasek postępu */}
        <div className="w-full max-w-md h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-neutral-500 rounded-full animate-progress"></div>
        </div>
      </div>
    </Card>
  );
};

// Dodajemy stylistykę animacji do globalnych stylów, 
// alternatywnie można dodać to do pliku tailwind.config.js
const globalStyles = `
@keyframes progress {
  0% { width: 5%; }
  50% { width: 70%; }
  100% { width: 90%; }
}

.animate-progress {
  animation: progress 20s ease-in-out forwards;
}
`;

// Dodajemy style do komponentu
const styleElement = typeof document !== 'undefined' ? document.createElement('style') : null;
if (styleElement) {
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);
} 