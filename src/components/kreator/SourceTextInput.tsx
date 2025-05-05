import React from "react";

interface SourceTextInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  isValid: boolean;
  errors: string[];
  placeholder?: string;
}

export const SourceTextInput: React.FC<SourceTextInputProps> = ({
  value,
  onChange,
  onBlur,
  isValid,
  errors,
  placeholder = "Wprowadź tekst źródłowy (minimum 1000 słów)..."
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2 w-full">
      <div className="relative">
        <textarea
          className={`w-full min-h-[300px] p-4 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            errors.length > 0
              ? "border-red-500 focus:ring-red-500"
              : "border-neutral-200 focus:ring-neutral-500"
          }`}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={!isValid}
          aria-describedby="source-text-error"
          data-testid="source-text-textarea"
        />
      </div>
      
      {errors.length > 0 && (
        <div id="source-text-error" className="text-sm text-red-500 mt-1" data-testid="source-text-errors">
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
}; 