import React from 'react';
import { Search, X } from 'lucide-react';

interface SimpleFlashcardSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading?: boolean;
}

export const SimpleFlashcardSearch: React.FC<SimpleFlashcardSearchProps> = ({
  searchQuery,
  onSearchChange,
  loading = false
}) => {
  const [debouncedQuery, setDebouncedQuery] = React.useState(searchQuery);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedQuery !== searchQuery) {
        onSearchChange(debouncedQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedQuery, searchQuery, onSearchChange]);

  const handleClear = () => {
    setDebouncedQuery('');
    onSearchChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && debouncedQuery) {
      handleClear();
    }
  };

  return (
    <div className="relative max-w-md" data-testid="flashcard-search-container">
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
        />
        <input
          type="text"
          placeholder="Szukaj w fiszkach..."
          value={debouncedQuery}
          onChange={(e) => setDebouncedQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="search-input"
        />
        {debouncedQuery && (
          <button
            onClick={handleClear}
            disabled={loading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            data-testid="search-clear-button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {loading && debouncedQuery && (
        <div className="absolute top-full left-0 mt-1 text-xs text-gray-500" data-testid="search-loading-indicator">
          Wyszukiwanie...
        </div>
      )}
    </div>
  );
}; 