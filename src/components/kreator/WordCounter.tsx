import React from "react";

interface WordCounterProps {
  currentCount: number;
  minCount: number;
  maxCount: number;
}

export const WordCounter: React.FC<WordCounterProps> = ({
  currentCount,
  minCount,
  maxCount
}) => {
  // Obliczanie procentu wypełnienia
  const percentFilled = Math.min((currentCount / minCount) * 100, 100);
  
  // Określanie stanu licznika
  const isUnderMinimum = currentCount < minCount;
  const isOverMaximum = currentCount > maxCount;
  const isValid = !isUnderMinimum && !isOverMaximum;
  
  // Określanie koloru licznika na podstawie stanu
  const getStateColor = () => {
    if (isOverMaximum) return "text-red-500";
    if (isUnderMinimum) return "text-amber-500";
    return "text-green-500";
  };
  
  // Określanie koloru paska postępu
  const getProgressColor = () => {
    if (isOverMaximum) return "bg-red-500";
    if (isUnderMinimum) return "bg-amber-500";
    return "bg-green-500";
  };
  
  return (
    <div className="space-y-1 mb-4">
      <div className="flex justify-between items-center text-sm">
        <span>Liczba słów:</span>
        <span className={getStateColor()}>
          {currentCount} / {minCount}-{maxCount}
        </span>
      </div>
      
      <div className="w-full bg-neutral-100 rounded-full h-2">
        <div
          className={`${getProgressColor()} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentFilled}%` }}
          role="progressbar"
          aria-valuenow={currentCount}
          aria-valuemin={0}
          aria-valuemax={minCount}
        />
      </div>
      
      {isUnderMinimum && (
        <p className="text-xs text-amber-500">
          Wymagane minimum {minCount} słów (brakuje {minCount - currentCount})
        </p>
      )}
      {isOverMaximum && (
        <p className="text-xs text-red-500">
          Przekroczono maksymalną liczbę {maxCount} słów (o {currentCount - maxCount})
        </p>
      )}
    </div>
  );
}; 