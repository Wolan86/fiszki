import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";
import type { CreateFlashcardCommand } from "@/types";
import { useFlashcardCreation } from "./hooks/useFlashcardCreation";
import { ErrorMessage } from "./ErrorMessage";
import { cn } from "@/lib/utils";

interface FlashcardCreationFormProps {
  sourceTextId?: string;
  onFlashcardCreated?: (flashcard: any) => void;
  "data-testid"?: string;
}

export const FlashcardCreationForm: React.FC<FlashcardCreationFormProps> = ({
  sourceTextId,
  onFlashcardCreated,
  "data-testid": dataTestId = "flashcard-creation-form"
}) => {
  const [frontContent, setFrontContent] = useState("");
  const [backContent, setBackContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const { isCreating, error, createNewFlashcard, reset } = useFlashcardCreation({
    onSuccess: (flashcard) => {
      // Reset form after successful creation
      setFrontContent("");
      setBackContent("");
      setIsExpanded(false);
      onFlashcardCreated?.(flashcard);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!frontContent.trim() || !backContent.trim()) {
      return;
    }

    const command: CreateFlashcardCommand = {
      front_content: frontContent.trim(),
      back_content: backContent.trim(),
      source_text_id: sourceTextId
    };

    await createNewFlashcard(command);
  };

  const handleCancel = () => {
    setFrontContent("");
    setBackContent("");
    setIsExpanded(false);
    reset();
  };

  const isFormValid = frontContent.trim().length > 0 && backContent.trim().length > 0;

  if (!isExpanded) {
    return (
      <Card className="mb-6" data-testid={dataTestId}>
        <CardContent className="pt-6">
          <Button
            onClick={() => setIsExpanded(true)}
            variant="outline"
            className="w-full"
            data-testid="expand-creation-form-button"
          >
            <Save className="w-4 h-4 mr-2" />
            Utwórz nową fiszkę
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6" data-testid={dataTestId}>
      <CardHeader>
        <CardTitle className="text-lg">Utwórz nową fiszkę</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4">
            <ErrorMessage
              error={error}
              onRetry={() => reset()}
              data-testid="flashcard-creation-error"
            />
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="front-content" className="block text-sm font-medium mb-2">
              Przód fiszki (pytanie)
            </label>
            <textarea
              id="front-content"
              value={frontContent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFrontContent(e.target.value)}
              placeholder="Wprowadź pytanie lub termin..."
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              )}
              disabled={isCreating}
              data-testid="front-content-input"
            />
          </div>
          
          <div>
            <label htmlFor="back-content" className="block text-sm font-medium mb-2">
              Tył fiszki (odpowiedź)
            </label>
            <textarea
              id="back-content"
              value={backContent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBackContent(e.target.value)}
              placeholder="Wprowadź odpowiedź lub definicję..."
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              )}
              disabled={isCreating}
              data-testid="back-content-input"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={!isFormValid || isCreating}
              data-testid="save-flashcard-button"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Zapisuję...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Zapisz fiszkę
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating}
              data-testid="cancel-creation-button"
            >
              Anuluj
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 