import React from "react";
import { Card } from "@/components/ui/card";
import type { GenerationStatsViewModel } from "./types";

interface GenerationStatsProps {
  stats: GenerationStatsViewModel;
}

export const GenerationStats: React.FC<GenerationStatsProps> = ({ stats }) => {
  return (
    <Card className="p-4 bg-neutral-50 border-neutral-200">
      <div className="text-sm text-neutral-600">
        <div className="flex justify-between items-center">
          <span>Czas generowania:</span>
          <span className="font-medium">{stats.formattedTime}</span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <span>Wygenerowano:</span>
          <span className="font-medium">{stats.generatedCount} z {stats.requestedCount} fiszek</span>
        </div>
        
        {stats.generatedCount < stats.requestedCount && (
          <p className="text-xs text-amber-600 mt-2">
            Uwaga: Nie udało się wygenerować wszystkich fiszek. Spróbuj ponownie lub edytuj tekst źródłowy.
          </p>
        )}
      </div>
    </Card>
  );
}; 