import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardActionsProps {
  onAccept: () => void;
  onReject: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  isAccepted?: boolean;
  isRejected?: boolean;
}

export const FlashcardActions: React.FC<FlashcardActionsProps> = ({
  onAccept,
  onReject,
  onRegenerate,
  isRegenerating,
  isAccepted = false,
  isRejected = false
}) => {
  return (
    <div className="flex justify-center space-x-2 p-3 bg-neutral-50 border-t border-neutral-200" data-testid="flashcard-actions">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "text-green-700 hover:text-green-800 hover:bg-green-50",
          isAccepted && "bg-green-50"
        )}
        onClick={onAccept}
        disabled={isRegenerating}
        data-testid="accept-flashcard-button"
      >
        <Check className="w-4 h-4 mr-1" />
        <span>Akceptuj</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "text-red-700 hover:text-red-800 hover:bg-red-50",
          isRejected && "bg-red-50"
        )}
        onClick={onReject}
        disabled={isRegenerating}
        data-testid="reject-flashcard-button"
      >
        <X className="w-4 h-4 mr-1" />
        <span>Odrzuć</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="text-blue-700 hover:text-blue-800 hover:bg-blue-50"
        onClick={onRegenerate}
        disabled={isRegenerating}
        data-testid="regenerate-flashcard-button"
      >
        {isRegenerating ? (
          <>
            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
            <span>Regeneruję...</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-1" />
            <span>Regeneruj</span>
          </>
        )}
      </Button>
    </div>
  );
}; 