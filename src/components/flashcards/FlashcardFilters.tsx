import React from "react";
import type { FlashcardFilters, CreationType, SortField } from "../../types";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";

interface FlashcardFiltersProps {
  filters: FlashcardFilters;
  onFiltersChange: (filters: FlashcardFilters) => void;
  loading?: boolean;
}

const CREATION_TYPE_OPTIONS: { value: CreationType; label: string }[] = [
  { value: "all", label: "Wszystkie" },
  { value: "ai_generated", label: "Wygenerowane przez AI" },
  { value: "ai_edited", label: "Edytowane przez AI" },
  { value: "manual", label: "Ręczne" },
];

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "created_at", label: "Data utworzenia" },
  { value: "updated_at", label: "Data modyfikacji" },
  { value: "front_content", label: "Treść przednia" },
];

const ACCEPTED_OPTIONS = [
  { value: "all", label: "Wszystkie" },
  { value: "true", label: "Zaakceptowane" },
  { value: "false", label: "Niezaakceptowane" },
  { value: "null", label: "Oczekujące" },
];

const FlashcardFilters: React.FC<FlashcardFiltersProps> = ({ filters, onFiltersChange, loading = false }) => {
  const handleFilterChange = (key: keyof FlashcardFilters, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      offset: 0, // Reset to first page when filters change
    });
  };

  const handleReset = () => {
    onFiltersChange({
      limit: 10,
      offset: 0,
      sort: "created_at",
      order: "desc",
    });
  };

  const getAcceptedValue = (accepted?: boolean) => {
    if (accepted === true) return "true";
    if (accepted === false) return "false";
    if (accepted === null) return "null";
    return "all";
  };

  const parseAcceptedValue = (value: string): boolean | undefined => {
    if (value === "true") return true;
    if (value === "false") return false;
    if (value === "null") return null as unknown as boolean; // null represents pending state
    return undefined;
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label htmlFor="creation-type-select" className="block text-sm font-medium text-gray-700 mb-2">
            Typ tworzenia
          </label>
          <Select
            value={filters.creation_type || "all"}
            onValueChange={(value: string) => handleFilterChange("creation_type", value === "all" ? undefined : value)}
            disabled={loading}
          >
            <SelectTrigger id="creation-type-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CREATION_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="accepted-status-select" className="block text-sm font-medium text-gray-700 mb-2">
            Status akceptacji
          </label>
          <Select
            value={getAcceptedValue(filters.accepted)}
            onValueChange={(value: string) => handleFilterChange("accepted", parseAcceptedValue(value))}
            disabled={loading}
          >
            <SelectTrigger id="accepted-status-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCEPTED_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
            Sortowanie
          </label>
          <Select
            value={filters.sort}
            onValueChange={(value: string) => handleFilterChange("sort", value)}
            disabled={loading}
          >
            <SelectTrigger id="sort-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="order-select" className="block text-sm font-medium text-gray-700 mb-2">
            Kolejność
          </label>
          <Select
            value={filters.order}
            onValueChange={(value: string) => handleFilterChange("order", value)}
            disabled={loading}
          >
            <SelectTrigger id="order-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Malejąco</SelectItem>
              <SelectItem value="asc">Rosnąco</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="source-text-id-input" className="block text-sm font-medium text-gray-700 mb-2">
            ID tekstu źródłowego
          </label>
          <Input
            id="source-text-id-input"
            type="text"
            placeholder="Wprowadź UUID tekstu źródłowego"
            value={filters.source_text_id || ""}
            onChange={(e) => handleFilterChange("source_text_id", e.target.value || undefined)}
            disabled={loading}
          />
        </div>

        <Button variant="outline" onClick={handleReset} disabled={loading} className="h-10">
          Resetuj filtry
        </Button>
      </div>
    </div>
  );
};

export default FlashcardFilters;
