interface ProgressIndicatorProps {
  current: number;
  total: number;
  showPercentage?: boolean;
}

const ProgressIndicator = ({ current, total, showPercentage = false }: ProgressIndicatorProps) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="flex items-center space-x-4">
      {/* Progress bar */}
      <div className="flex items-center space-x-2">
        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${percentage}%` }} />
        </div>
        {showPercentage && <span className="text-sm text-muted-foreground font-medium">{percentage}%</span>}
      </div>

      {/* Counter */}
      <div className="text-sm font-medium">
        <span className="text-foreground">{current}</span>
        <span className="text-muted-foreground"> / {total}</span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
