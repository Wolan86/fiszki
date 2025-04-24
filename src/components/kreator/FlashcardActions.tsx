import React from "react";
import { Button } from "@/components/ui/button";

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
    <div className="flex justify-center space-x-2 p-3 bg-neutral-50 border-t border-neutral-200">
      <Button
        onClick={onAccept}
        variant={isAccepted ? "default" : "outline"}
        size="sm"
        className={isAccepted ? "bg-green-600 hover:bg-green-700" : ""}
        disabled={isRegenerating || isAccepted}
        aria-label="Zaakceptuj fiszkę"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="ml-1">Akceptuj</span>
      </Button>
      
      <Button
        onClick={onReject}
        variant={isRejected ? "destructive" : "outline"}
        size="sm"
        disabled={isRegenerating || isRejected}
        aria-label="Odrzuć fiszkę"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        <span className="ml-1">Odrzuć</span>
      </Button>
      
      {isRejected && (
        <Button
          onClick={onRegenerate}
          variant="outline"
          size="sm"
          disabled={isRegenerating || isAccepted}
          aria-label="Regeneruj fiszkę"
          className="border-amber-500 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
        >
          {isRegenerating ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Regeneruję...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-1">Regeneruj</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}; 