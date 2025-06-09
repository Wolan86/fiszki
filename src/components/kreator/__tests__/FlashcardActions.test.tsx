import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlashcardActions } from "../FlashcardActions";

describe("FlashcardActions", () => {
  const defaultProps = {
    onAccept: vi.fn(),
    onReject: vi.fn(),
    onRegenerate: vi.fn(),
    onSave: vi.fn(),
    onEdit: vi.fn(),
    onSaveEdit: vi.fn(),
    onCancelEdit: vi.fn(),
    isRegenerating: false,
    isSaving: false,
    isAccepted: false,
    isRejected: false,
    isEditing: false,
    showSaveButton: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("default/pending state (accepted === null)", () => {
    it("renders accept, reject, and edit buttons by default", () => {
      // Arrange & Act
      render(<FlashcardActions {...defaultProps} />);

      // Assert
      expect(screen.getByRole("button", { name: /akceptuj/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /odrzuć/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /edytuj/i })).toBeInTheDocument();
    });

    it("calls onAccept when accept button is clicked", () => {
      // Arrange
      render(<FlashcardActions {...defaultProps} />);

      // Act
      fireEvent.click(screen.getByTestId("accept-flashcard-button"));

      // Assert
      expect(defaultProps.onAccept).toHaveBeenCalledTimes(1);
    });

    it("calls onReject when reject button is clicked", () => {
      // Arrange
      render(<FlashcardActions {...defaultProps} />);

      // Act
      fireEvent.click(screen.getByTestId("reject-flashcard-button"));

      // Assert
      expect(defaultProps.onReject).toHaveBeenCalledTimes(1);
    });

    it("calls onEdit when edit button is clicked", () => {
      // Arrange
      render(<FlashcardActions {...defaultProps} />);

      // Act
      fireEvent.click(screen.getByTestId("edit-flashcard-button"));

      // Assert
      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    });

    it("hides edit button when onEdit is not provided", () => {
      // Arrange
      const propsWithoutEdit = { ...defaultProps, onEdit: undefined };

      // Act
      render(<FlashcardActions {...propsWithoutEdit} />);

      // Assert
      expect(screen.queryByTestId("edit-flashcard-button")).not.toBeInTheDocument();
      expect(screen.getByTestId("accept-flashcard-button")).toBeInTheDocument();
      expect(screen.getByTestId("reject-flashcard-button")).toBeInTheDocument();
    });

    it("disables buttons when regenerating", () => {
      // Arrange
      const props = { ...defaultProps, isRegenerating: true };

      // Act
      render(<FlashcardActions {...props} />);

      // Assert
      expect(screen.getByTestId("accept-flashcard-button")).toBeDisabled();
      expect(screen.getByTestId("reject-flashcard-button")).toBeDisabled();
      expect(screen.getByTestId("edit-flashcard-button")).toBeDisabled();
    });

    it("disables buttons when saving", () => {
      // Arrange
      const props = { ...defaultProps, isSaving: true };

      // Act
      render(<FlashcardActions {...props} />);

      // Assert
      expect(screen.getByTestId("accept-flashcard-button")).toBeDisabled();
      expect(screen.getByTestId("reject-flashcard-button")).toBeDisabled();
      expect(screen.getByTestId("edit-flashcard-button")).toBeDisabled();
    });
  });

  describe("accepted state (isAccepted === true)", () => {
    const acceptedProps = { ...defaultProps, isAccepted: true };

    it("shows edit and save buttons when accepted", () => {
      // Arrange
      const props = { ...acceptedProps, showSaveButton: true };

      // Act
      render(<FlashcardActions {...props} />);

      // Assert
      expect(screen.getByTestId("edit-flashcard-button")).toBeInTheDocument();
      expect(screen.getByTestId("save-flashcard-button")).toBeInTheDocument();
      expect(screen.getByText("Zaakceptowana")).toBeInTheDocument();
    });

    it("shows only edit button when save button is not enabled", () => {
      // Arrange
      const props = { ...acceptedProps, showSaveButton: false };

      // Act
      render(<FlashcardActions {...props} />);

      // Assert
      expect(screen.getByTestId("edit-flashcard-button")).toBeInTheDocument();
      expect(screen.queryByTestId("save-flashcard-button")).not.toBeInTheDocument();
      expect(screen.getByText("Zaakceptowana")).toBeInTheDocument();
    });

    it("hides edit button when onEdit is not provided", () => {
      // Arrange
      const props = { ...acceptedProps, onEdit: undefined, showSaveButton: true };

      // Act
      render(<FlashcardActions {...props} />);

      // Assert
      expect(screen.queryByTestId("edit-flashcard-button")).not.toBeInTheDocument();
      expect(screen.getByTestId("save-flashcard-button")).toBeInTheDocument();
    });

    it("hides save button when onSave is not provided", () => {
      // Arrange
      const props = { ...acceptedProps, onSave: undefined, showSaveButton: true };

      // Act
      render(<FlashcardActions {...props} />);

      // Assert
      expect(screen.getByTestId("edit-flashcard-button")).toBeInTheDocument();
      expect(screen.queryByTestId("save-flashcard-button")).not.toBeInTheDocument();
    });

    it("calls onEdit when edit button is clicked in accepted state", () => {
      // Arrange
      render(<FlashcardActions {...acceptedProps} />);

      // Act
      fireEvent.click(screen.getByTestId("edit-flashcard-button"));

      // Assert
      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    });

    it("calls onSave when save button is clicked", () => {
      // Arrange
      const props = { ...acceptedProps, showSaveButton: true };
      render(<FlashcardActions {...props} />);

      // Act
      fireEvent.click(screen.getByTestId("save-flashcard-button"));

      // Assert
      expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });

    it("shows loading state on save button when saving", () => {
      // Arrange
      const props = { ...acceptedProps, showSaveButton: true, isSaving: true };

      // Act
      render(<FlashcardActions {...props} />);

      // Assert
      expect(screen.getByText("Zapisuję...")).toBeInTheDocument();
      expect(screen.getByTestId("save-flashcard-button")).toBeDisabled();
    });

    it("disables edit button when saving", () => {
      // Arrange
      const props = { ...acceptedProps, isSaving: true };

      // Act
      render(<FlashcardActions {...props} />);

      // Assert
      expect(screen.getByTestId("edit-flashcard-button")).toBeDisabled();
    });

    it("does not show default action buttons in accepted state", () => {
      // Arrange
      render(<FlashcardActions {...acceptedProps} />);

      // Assert
      expect(screen.queryByTestId("accept-flashcard-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("reject-flashcard-button")).not.toBeInTheDocument();
    });
  });

  describe("rejected state (isRejected === true)", () => {
    const rejectedProps = { ...defaultProps, isRejected: true };

    it("shows regenerate button and rejected status", () => {
      // Arrange
      render(<FlashcardActions {...rejectedProps} />);

      // Assert
      expect(screen.getByTestId("regenerate-flashcard-button")).toBeInTheDocument();
      expect(screen.getByText("Odrzucona")).toBeInTheDocument();
    });

    it("calls onRegenerate when regenerate button is clicked", () => {
      // Arrange
      render(<FlashcardActions {...rejectedProps} />);

      // Act
      fireEvent.click(screen.getByTestId("regenerate-flashcard-button"));

      // Assert
      expect(defaultProps.onRegenerate).toHaveBeenCalledTimes(1);
    });

    it("shows loading state on regenerate button when regenerating", () => {
      // Arrange
      const props = { ...rejectedProps, isRegenerating: true };

      // Act
      render(<FlashcardActions {...props} />);

      // Assert
      expect(screen.getByText("Regeneruję...")).toBeInTheDocument();
      expect(screen.getByTestId("regenerate-flashcard-button")).toBeDisabled();
    });

    it("does not show default action buttons in rejected state", () => {
      // Arrange
      render(<FlashcardActions {...rejectedProps} />);

      // Assert
      expect(screen.queryByTestId("accept-flashcard-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("reject-flashcard-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("edit-flashcard-button")).not.toBeInTheDocument();
    });
  });

  describe("editing state (isEditing === true)", () => {
    const editingProps = { ...defaultProps, isEditing: true };

    it("shows save changes and cancel buttons when editing", () => {
      // Arrange
      render(<FlashcardActions {...editingProps} />);

      // Assert
      expect(screen.getByTestId("save-edit-button")).toBeInTheDocument();
      expect(screen.getByTestId("cancel-edit-button")).toBeInTheDocument();
      expect(screen.getByText("Zapisz zmiany")).toBeInTheDocument();
      expect(screen.getByText("Anuluj")).toBeInTheDocument();
    });

    it("calls onSaveEdit when save changes button is clicked", () => {
      // Arrange
      render(<FlashcardActions {...editingProps} />);

      // Act
      fireEvent.click(screen.getByTestId("save-edit-button"));

      // Assert
      expect(defaultProps.onSaveEdit).toHaveBeenCalledTimes(1);
    });

    it("calls onCancelEdit when cancel button is clicked", () => {
      // Arrange
      render(<FlashcardActions {...editingProps} />);

      // Act
      fireEvent.click(screen.getByTestId("cancel-edit-button"));

      // Assert
      expect(defaultProps.onCancelEdit).toHaveBeenCalledTimes(1);
    });

    it("disables buttons when saving during edit", () => {
      // Arrange
      const props = { ...editingProps, isSaving: true };

      // Act
      render(<FlashcardActions {...props} />);

      // Assert
      expect(screen.getByTestId("save-edit-button")).toBeDisabled();
      expect(screen.getByTestId("cancel-edit-button")).toBeDisabled();
    });

    it("does not show other action buttons when editing", () => {
      // Arrange
      render(<FlashcardActions {...editingProps} />);

      // Assert
      expect(screen.queryByTestId("accept-flashcard-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("reject-flashcard-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("edit-flashcard-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("regenerate-flashcard-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("save-flashcard-button")).not.toBeInTheDocument();
    });
  });

  describe("accessibility and styling", () => {
    it("renders with custom data-testid", () => {
      // Arrange & Act
      render(<FlashcardActions {...defaultProps} data-testid="custom-actions" />);

      // Assert
      expect(screen.getByTestId("custom-actions")).toBeInTheDocument();
    });

    it("applies correct CSS classes for layout", () => {
      // Arrange & Act
      render(<FlashcardActions {...defaultProps} />);

      // Assert
      const container = screen.getByTestId("flashcard-actions");
      expect(container).toHaveClass("flex", "justify-center", "space-x-2", "p-3", "bg-neutral-50", "border-t", "border-neutral-200");
    });

    it("applies correct button styling classes", () => {
      // Arrange & Act
      render(<FlashcardActions {...defaultProps} />);

      // Assert
      const acceptButton = screen.getByTestId("accept-flashcard-button");
      expect(acceptButton).toHaveClass("text-green-700", "hover:text-green-800", "hover:bg-green-50");

      const rejectButton = screen.getByTestId("reject-flashcard-button");
      expect(rejectButton).toHaveClass("text-red-700", "hover:text-red-800", "hover:bg-red-50");

      const editButton = screen.getByTestId("edit-flashcard-button");
      expect(editButton).toHaveClass("text-blue-700", "hover:text-blue-800", "hover:bg-blue-50");
    });

    it("includes proper icon elements", () => {
      // Arrange & Act
      render(<FlashcardActions {...defaultProps} />);

      // Assert
      const container = screen.getByTestId("flashcard-actions");
      
      // Check for Lucide React icons by looking for SVG elements
      const svgElements = container.querySelectorAll("svg");
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  describe("state combinations and edge cases", () => {
    it("prioritizes editing state over other states", () => {
      // Arrange - Multiple states set to true, but editing should take precedence
      const props = { 
        ...defaultProps, 
        isEditing: true, 
        isAccepted: true, 
        isRejected: true 
      };

      // Act
      render(<FlashcardActions {...props} />);

      // Assert - Should only show editing buttons
      expect(screen.getByTestId("save-edit-button")).toBeInTheDocument();
      expect(screen.getByTestId("cancel-edit-button")).toBeInTheDocument();
      expect(screen.queryByTestId("accept-flashcard-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("regenerate-flashcard-button")).not.toBeInTheDocument();
    });

    it("prioritizes accepted state over rejected state", () => {
      // Arrange - Both accepted and rejected set to true
      const props = { 
        ...defaultProps, 
        isAccepted: true, 
        isRejected: true 
      };

      // Act
      render(<FlashcardActions {...props} />);

      // Assert - Should show accepted state, not rejected
      expect(screen.getByText("Zaakceptowana")).toBeInTheDocument();
      expect(screen.queryByText("Odrzucona")).not.toBeInTheDocument();
      expect(screen.queryByTestId("regenerate-flashcard-button")).not.toBeInTheDocument();
    });

    it("handles missing callback functions gracefully", () => {
      // Arrange - All callbacks undefined
      const propsWithoutCallbacks = {
        onAccept: vi.fn(),
        onReject: vi.fn(),
        onRegenerate: vi.fn(),
        onSave: undefined,
        onEdit: undefined,
        onSaveEdit: undefined,
        onCancelEdit: undefined,
        isRegenerating: false,
        isSaving: false,
        isAccepted: false,
        isRejected: false,
        isEditing: false,
        showSaveButton: false,
      };

      // Act & Assert - Should not throw
      expect(() => render(<FlashcardActions {...propsWithoutCallbacks} />)).not.toThrow();
      
      // Should still show basic accept/reject buttons
      expect(screen.getByTestId("accept-flashcard-button")).toBeInTheDocument();
      expect(screen.getByTestId("reject-flashcard-button")).toBeInTheDocument();
      expect(screen.queryByTestId("edit-flashcard-button")).not.toBeInTheDocument();
    });

    it("handles both regenerating and saving states simultaneously", () => {
      // Arrange
      const props = { 
        ...defaultProps, 
        isRegenerating: true, 
        isSaving: true 
      };

      // Act
      render(<FlashcardActions {...props} />);

      // Assert - All buttons should be disabled
      expect(screen.getByTestId("accept-flashcard-button")).toBeDisabled();
      expect(screen.getByTestId("reject-flashcard-button")).toBeDisabled();
      expect(screen.getByTestId("edit-flashcard-button")).toBeDisabled();
    });

    it("shows save button only when both showSaveButton and onSave are provided", () => {
      // Test all combinations
      const combinations = [
        { showSaveButton: true, onSave: vi.fn(), shouldShow: true },
        { showSaveButton: true, onSave: undefined, shouldShow: false },
        { showSaveButton: false, onSave: vi.fn(), shouldShow: false },
        { showSaveButton: false, onSave: undefined, shouldShow: false },
      ];

      combinations.forEach(({ showSaveButton, onSave, shouldShow }) => {
        const { unmount } = render(
          <FlashcardActions 
            {...defaultProps} 
            isAccepted={true} 
            showSaveButton={showSaveButton} 
            onSave={onSave} 
          />
        );

        if (shouldShow) {
          expect(screen.getByTestId("save-flashcard-button")).toBeInTheDocument();
        } else {
          expect(screen.queryByTestId("save-flashcard-button")).not.toBeInTheDocument();
        }

        unmount();
      });
    });
  });
}); 