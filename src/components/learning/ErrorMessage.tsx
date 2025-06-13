import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="flex items-center space-x-2 text-destructive">
        <AlertCircle className="w-6 h-6" />
        <h3 className="text-lg font-medium">Wystąpił błąd</h3>
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-md">{message}</p>

      <Button onClick={onRetry} variant="outline" className="flex items-center space-x-2">
        <RefreshCw className="w-4 h-4" />
        <span>Spróbuj ponownie</span>
      </Button>
    </div>
  );
};

export default ErrorMessage;
