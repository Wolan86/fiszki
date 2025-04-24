import React from "react";
import { Card } from "@/components/ui/card";
import type { ApiErrorResponse } from "./types";

interface ErrorMessageProps {
  error: ApiErrorResponse | null;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  onRetry,
  className = ""
}) => {
  if (!error) return null;

  // Mapowanie kodów błędów na przydatne informacje dla użytkownika
  const getErrorDetails = () => {
    switch (error.code) {
      case "AI_SERVICE_UNAVAILABLE":
        return {
          title: "Usługa AI niedostępna",
          message: "Usługa generowania fiszek jest obecnie niedostępna. Spróbuj ponownie za kilka minut.",
          showRetry: true
        };
      case "AI_GENERATION_FAILED":
        return {
          title: "Błąd generowania",
          message: "Nie udało się wygenerować fiszek z podanego tekstu. Spróbuj zmodyfikować tekst źródłowy.",
          showRetry: true
        };
      case "GENERATION_FAILED":
        return {
          title: "Błąd generowania",
          message: error.message || "Wystąpił problem podczas generowania fiszek.",
          showRetry: true
        };
      case "UPDATE_FAILED":
        return {
          title: "Błąd aktualizacji",
          message: error.message || "Nie udało się zaktualizować fiszki.",
          showRetry: false
        };
      case "REGENERATION_FAILED":
        return {
          title: "Błąd regeneracji",
          message: error.message || "Nie udało się zregenerować fiszki.",
          showRetry: true
        };
      default:
        return {
          title: "Wystąpił błąd",
          message: error.message || "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
          showRetry: false
        };
    }
  };

  const details = getErrorDetails();

  return (
    <Card className={`bg-red-50 border-red-200 p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className="h-5 w-5 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{details.title}</h3>
          <div className="mt-1 text-sm text-red-700">
            <p>{details.message}</p>
          </div>
          {details.showRetry && onRetry && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Spróbuj ponownie
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}; 