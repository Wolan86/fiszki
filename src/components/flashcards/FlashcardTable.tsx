import React, { useState } from "react";
import type { FlashcardDto } from "../../types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";

interface FlashcardTableProps {
  flashcards: FlashcardDto[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onPreview: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onBulkDelete: (ids: string[]) => Promise<void>;
  loading?: boolean;
}

const FlashcardTable: React.FC<FlashcardTableProps> = ({
  flashcards,
  selectedIds,
  onSelectionChange,
  onPreview,
  onEdit,
  onDelete,
  onBulkDelete,
  loading = false,
}) => {
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  const handleSelectAll = () => {
    if (selectedIds.size === flashcards.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(flashcards.map((f) => f.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onSelectionChange(newSelected);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę fiszkę?")) {
      setDeleting((prev) => new Set(prev).add(id));
      try {
        await onDelete(id);
      } finally {
        setDeleting((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (window.confirm(`Czy na pewno chcesz usunąć ${count} fiszek?`)) {
      const idsArray = Array.from(selectedIds);
      setDeleting(new Set(idsArray));
      try {
        await onBulkDelete(idsArray);
        onSelectionChange(new Set());
      } finally {
        setDeleting(new Set());
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCreationTypeLabel = (type: string | null) => {
    if (!type) return "Nieznany";
    const labels = {
      ai_generated: "AI",
      ai_edited: "AI (edytowane)",
      manual: "Ręczne",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getAcceptedLabel = (accepted: boolean | null) => {
    if (accepted === true) return "Tak";
    if (accepted === false) return "Nie";
    return "Oczekuje";
  };

  if (loading && flashcards.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie fiszek...</p>
        </CardContent>
      </Card>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600 mb-4">Nie znaleziono fiszek.</p>
          <Button onClick={() => (window.location.href = "/kreator")}>Stwórz pierwszą fiszkę</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-blue-700">Zaznaczono {selectedIds.size} fiszek</p>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => onSelectionChange(new Set())}>
                Odznacz wszystkie
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={deleting.size > 0}>
                Usuń zaznaczone
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Checkbox
              checked={selectedIds.size === flashcards.length && flashcards.length > 0}
              onCheckedChange={handleSelectAll}
              disabled={loading}
            />
            <span>Fiszki ({flashcards.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wybór
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Treść przednia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Treść tylna
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utworzono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flashcards.map((flashcard) => (
                  <tr key={flashcard.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Checkbox
                        checked={selectedIds.has(flashcard.id)}
                        onCheckedChange={() => handleSelectOne(flashcard.id)}
                        disabled={loading || deleting.has(flashcard.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{flashcard.front_content}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{flashcard.back_content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getCreationTypeLabel(flashcard.creation_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          flashcard.accepted === true
                            ? "bg-green-100 text-green-800"
                            : flashcard.accepted === false
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {getAcceptedLabel(flashcard.accepted)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(flashcard.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button variant="outline" size="sm" onClick={() => onPreview(flashcard.id)} disabled={loading}>
                        Podgląd
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onEdit(flashcard.id)} disabled={loading}>
                        Edytuj
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(flashcard.id)}
                        disabled={loading || deleting.has(flashcard.id)}
                      >
                        {deleting.has(flashcard.id) ? "Usuwanie..." : "Usuń"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlashcardTable;
