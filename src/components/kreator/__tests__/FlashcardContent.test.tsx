import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlashcardContent } from "../FlashcardContent";

describe("FlashcardContent", () => {
  const mockOnFlip = vi.fn();
  const mockOnEditFrontContent = vi.fn();
  const mockOnEditBackContent = vi.fn();

  const defaultProps = {
    frontContent: "Test front content",
    backContent: "Test back content",
    isFlipped: false,
    isEditing: false,
    editableFrontContent: "Editable front",
    editableBackContent: "Editable back",
    onFlip: mockOnFlip,
    onEditFrontContent: mockOnEditFrontContent,
    onEditBackContent: mockOnEditBackContent,
  };

  const editProps = {
    ...defaultProps,
    isEditing: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnFlip.mockClear();
    mockOnEditFrontContent.mockClear();
    mockOnEditBackContent.mockClear();

    // Update the function references in props
    defaultProps.onFlip = mockOnFlip;
    defaultProps.onEditFrontContent = mockOnEditFrontContent;
    defaultProps.onEditBackContent = mockOnEditBackContent;
  });

  describe("view mode (not editing)", () => {
    it("should render front content when not flipped", () => {
      // Arrange
      render(<FlashcardContent {...defaultProps} />);

      // Assert
      expect(screen.getByText("Test front content")).toBeInTheDocument();
      expect(screen.queryByText("Test back content")).not.toBeInTheDocument();
    });

    it("should render back content when flipped", () => {
      // Arrange
      render(<FlashcardContent {...defaultProps} isFlipped={true} />);

      // Assert
      expect(screen.getByText("Test back content")).toBeInTheDocument();
      expect(screen.queryByText("Test front content")).not.toBeInTheDocument();
    });

    it("should have cursor-pointer class when not editing", () => {
      // Arrange
      render(<FlashcardContent {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("flashcard-content")).toHaveClass("cursor-pointer");
    });

    it("should call onFlip when clicked", () => {
      // Arrange
      render(<FlashcardContent {...defaultProps} />);

      // Act
      fireEvent.click(screen.getByTestId("flashcard-content"));

      // Assert
      expect(mockOnFlip).toHaveBeenCalledTimes(1);
    });

    it("should call onFlip on Enter key press", () => {
      // Arrange
      render(<FlashcardContent {...defaultProps} />);

      // Act
      fireEvent.keyDown(screen.getByTestId("flashcard-content"), { key: "Enter" });

      // Assert
      expect(mockOnFlip).toHaveBeenCalledTimes(1);
    });

    it("should call onFlip on Space key press", () => {
      // Arrange
      render(<FlashcardContent {...defaultProps} />);

      // Act
      fireEvent.keyDown(screen.getByTestId("flashcard-content"), { key: " " });

      // Assert
      expect(mockOnFlip).toHaveBeenCalledTimes(1);
    });

    it("should not flip on other key presses", () => {
      // Arrange
      render(<FlashcardContent {...defaultProps} />);

      // Act
      fireEvent.keyDown(screen.getByTestId("flashcard-content"), { key: "Tab" });

      // Assert
      expect(mockOnFlip).not.toHaveBeenCalled();
    });

    it("should prevent default behavior on Enter and Space", () => {
      // Arrange
      render(<FlashcardContent {...defaultProps} />);
      const element = screen.getByTestId("flashcard-content");

      // Act
      const enterEvent = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
      const spaceEvent = new KeyboardEvent("keydown", { key: " ", bubbles: true });

      const preventDefaultSpy = vi.spyOn(enterEvent, "preventDefault");
      const preventDefaultSpy2 = vi.spyOn(spaceEvent, "preventDefault");

      element.dispatchEvent(enterEvent);
      element.dispatchEvent(spaceEvent);

      // Assert
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(preventDefaultSpy2).toHaveBeenCalled();
    });

    it("should have proper ARIA attributes for button role", () => {
      // Arrange & Act
      render(<FlashcardContent {...defaultProps} />);

      // Assert
      const container = screen.getByTestId("flashcard-content");
      expect(container).toHaveAttribute("role", "button");
      expect(container).toHaveAttribute("tabIndex", "0");
      expect(container).toHaveAttribute("aria-label", "Kliknij aby pokazać tył fiszki");
    });

    it("should have correct aria-label when flipped", () => {
      // Arrange & Act
      render(<FlashcardContent {...defaultProps} isFlipped={true} />);

      // Assert
      const container = screen.getByTestId("flashcard-content");
      expect(container).toHaveAttribute("aria-label", "Kliknij aby pokazać przód fiszki");
    });
  });

  describe("edit mode", () => {
    it("should render textareas when in edit mode", () => {
      // Arrange
      render(<FlashcardContent {...editProps} />);

      // Assert - only front textarea should be visible when not flipped
      expect(screen.getByDisplayValue("Editable front")).toBeInTheDocument();
      expect(screen.queryByDisplayValue("Editable back")).not.toBeInTheDocument();
      expect(screen.getByText("Pytanie")).toBeInTheDocument();

      // Now test flipped state
      cleanup();
      render(<FlashcardContent {...editProps} isFlipped={true} />);

      // Assert - only back textarea should be visible when flipped
      expect(screen.getByDisplayValue("Editable back")).toBeInTheDocument();
      expect(screen.queryByDisplayValue("Editable front")).not.toBeInTheDocument();
      expect(screen.getByText("Odpowiedź")).toBeInTheDocument();
    });

    it("should not have cursor-pointer class when editing", () => {
      // Arrange
      render(<FlashcardContent {...editProps} />);

      // Assert
      expect(screen.getByTestId("flashcard-content")).not.toHaveClass("cursor-pointer");
    });

    it("should not call onFlip when clicked in edit mode", () => {
      // Arrange
      render(<FlashcardContent {...editProps} />);

      // Act
      fireEvent.click(screen.getByTestId("flashcard-content"));

      // Assert
      expect(mockOnFlip).not.toHaveBeenCalled();
    });

    it("should have form role when editing", () => {
      // Arrange
      render(<FlashcardContent {...editProps} />);

      // Assert
      expect(screen.getByTestId("flashcard-content")).toHaveAttribute("role", "form");
    });

    it("should call onEditFrontContent when front textarea changes", () => {
      // Arrange
      render(<FlashcardContent {...editProps} />);
      const frontTextarea = screen.getByDisplayValue("Editable front");

      // Act
      fireEvent.change(frontTextarea, { target: { value: "New front content" } });

      // Assert
      expect(mockOnEditFrontContent).toHaveBeenCalledWith("New front content");
    });

    it("should call onEditBackContent when back textarea changes", () => {
      // Arrange
      render(<FlashcardContent {...editProps} isFlipped={true} />);
      const backTextarea = screen.getByDisplayValue("Editable back");

      // Act
      fireEvent.change(backTextarea, { target: { value: "New back content" } });

      // Assert
      expect(mockOnEditBackContent).toHaveBeenCalledWith("New back content");
    });

    it("should show editing indicator", () => {
      // Arrange
      render(<FlashcardContent {...editProps} />);

      // Assert
      expect(screen.getByText("(edytowanie)")).toBeInTheDocument();
    });

    it("should have proper textarea attributes", () => {
      // Arrange - test front textarea
      render(<FlashcardContent {...editProps} />);

      // Assert
      const frontTextarea = screen.getByDisplayValue("Editable front");
      expect(frontTextarea).toHaveAttribute("placeholder", "Wprowadź pytanie...");
      expect(frontTextarea).toHaveAttribute("data-testid", "flashcard-front-edit-input");

      // Test back textarea
      cleanup();
      render(<FlashcardContent {...editProps} isFlipped={true} />);

      const backTextarea = screen.getByDisplayValue("Editable back");
      expect(backTextarea).toHaveAttribute("placeholder", "Wprowadź odpowiedź...");
      expect(backTextarea).toHaveAttribute("data-testid", "flashcard-back-edit-input");
    });

    it("should not flip with keyboard in edit mode", () => {
      // Arrange
      render(<FlashcardContent {...editProps} />);

      // Act
      fireEvent.keyDown(screen.getByTestId("flashcard-content"), { key: "Enter" });
      fireEvent.keyDown(screen.getByTestId("flashcard-content"), { key: " " });

      // Assert
      expect(mockOnFlip).not.toHaveBeenCalled();
    });
  });

  describe("visual states and styling", () => {
    it("should apply correct background when flipped", () => {
      // Arrange & Act
      render(<FlashcardContent {...defaultProps} isFlipped={true} />);

      // Assert
      const container = screen.getByTestId("flashcard-content");
      expect(container).toHaveClass("bg-neutral-100", "text-neutral-700");
    });

    it("should apply correct background when not flipped", () => {
      // Arrange & Act
      render(<FlashcardContent {...defaultProps} isFlipped={false} />);

      // Assert
      const container = screen.getByTestId("flashcard-content");
      expect(container).toHaveClass("bg-white", "text-neutral-900");
    });

    it("should have transition classes", () => {
      // Arrange & Act
      render(<FlashcardContent {...defaultProps} />);

      // Assert
      const container = screen.getByTestId("flashcard-content");
      expect(container).toHaveClass("transition-all", "duration-300");
    });

    it("should have minimum height", () => {
      // Arrange & Act
      render(<FlashcardContent {...defaultProps} />);

      // Assert
      const container = screen.getByTestId("flashcard-content");
      expect(container).toHaveClass("min-h-[200px]");
    });

    it("should center content with flexbox", () => {
      // Arrange & Act
      render(<FlashcardContent {...defaultProps} />);

      // Assert
      const container = screen.getByTestId("flashcard-content");
      expect(container).toHaveClass("flex", "items-center", "justify-center");
    });
  });

  describe("data attributes", () => {
    it("should have correct data attributes for testing", () => {
      // Arrange & Act
      render(<FlashcardContent {...defaultProps} />);

      // Assert
      const container = screen.getByTestId("flashcard-content");
      expect(container).toHaveAttribute("data-flipped", "false");
      expect(container).toHaveAttribute("data-editing", "false");
    });

    it("should update data attributes when flipped", () => {
      // Arrange & Act
      render(<FlashcardContent {...defaultProps} isFlipped={true} />);

      // Assert
      const container = screen.getByTestId("flashcard-content");
      expect(container).toHaveAttribute("data-flipped", "true");
    });

    it("should update data attributes when editing", () => {
      // Arrange & Act
      render(<FlashcardContent {...defaultProps} isEditing={true} />);

      // Assert
      const container = screen.getByTestId("flashcard-content");
      expect(container).toHaveAttribute("data-editing", "true");
    });

    it("should accept custom data-testid", () => {
      // Arrange & Act
      render(<FlashcardContent {...defaultProps} data-testid="custom-testid" />);

      // Assert
      expect(screen.getByTestId("custom-testid")).toBeInTheDocument();
    });
  });

  describe("side indicator", () => {
    it("should show correct side indicator", () => {
      // Arrange & Act
      render(<FlashcardContent {...defaultProps} />);

      // Assert
      const indicator = screen.getByTestId("flashcard-side-indicator");
      expect(indicator).toHaveTextContent("Pytanie");
    });

    it("should show back side indicator when flipped", () => {
      // Arrange & Act
      render(<FlashcardContent {...defaultProps} isFlipped={true} />);

      // Assert
      const indicator = screen.getByTestId("flashcard-side-indicator");
      expect(indicator).toHaveTextContent("Odpowiedź");
    });

    it("should show editing indicator when in edit mode", () => {
      // Arrange & Act
      render(<FlashcardContent {...defaultProps} isEditing={true} />);

      // Assert
      const indicator = screen.getByTestId("flashcard-side-indicator");
      expect(indicator).toHaveTextContent("Pytanie");
      expect(indicator).toHaveTextContent("(edytowanie)");
    });
  });

  describe("content rendering", () => {
    it("should render empty content gracefully", () => {
      // Arrange
      const emptyProps = { ...defaultProps, frontContent: "", backContent: "" };
      render(<FlashcardContent {...emptyProps} />);

      // Assert
      expect(screen.getByTestId("flashcard-content")).toBeInTheDocument();
    });

    it("should render special characters correctly", () => {
      // Arrange
      const specialProps = {
        ...defaultProps,
        frontContent: "Ä ö ü ß & < > \" '",
        backContent: "© ® ™ € £ ¥",
      };
      render(<FlashcardContent {...specialProps} />);

      // Assert
      expect(screen.getByText("Ä ö ü ß & < > \" '")).toBeInTheDocument();
    });

    it("should render multiline content correctly", () => {
      // Arrange
      const multilineContent = "Line 1\nLine 2\nLine 3";
      const multilineProps = { ...defaultProps, frontContent: multilineContent };
      render(<FlashcardContent {...multilineProps} />);

      // Assert - HTML renders newlines as spaces in text content
      expect(screen.getByTestId("flashcard-front-content").querySelector("p")).toHaveTextContent(
        "Line 1 Line 2 Line 3"
      );
    });

    it("should render very long content", () => {
      // Arrange
      const longContent = "A".repeat(1000);
      const longProps = { ...defaultProps, frontContent: longContent };
      render(<FlashcardContent {...longProps} />);

      // Assert
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("should handle undefined content gracefully", () => {
      // Arrange
      const undefinedProps = {
        ...defaultProps,
        frontContent: undefined as unknown as string,
        backContent: undefined as unknown as string,
      };
      render(<FlashcardContent {...undefinedProps} />);

      // Assert
      expect(screen.getByTestId("flashcard-content")).toBeInTheDocument();
    });

    it("should handle null content gracefully", () => {
      // Arrange
      const nullProps = {
        ...defaultProps,
        frontContent: null as unknown as string,
        backContent: null as unknown as string,
      };
      render(<FlashcardContent {...nullProps} />);

      // Assert
      expect(screen.getByTestId("flashcard-content")).toBeInTheDocument();
    });

    it("should handle rapid flip state changes", () => {
      // Arrange
      const { rerender } = render(<FlashcardContent {...defaultProps} isFlipped={false} />);

      // Act - rapid state changes
      rerender(<FlashcardContent {...defaultProps} isFlipped={true} />);
      rerender(<FlashcardContent {...defaultProps} isFlipped={false} />);
      rerender(<FlashcardContent {...defaultProps} isFlipped={true} />);

      // Assert - should end up in final state (flipped, showing back content)
      expect(screen.getByText("Test back content")).toBeInTheDocument();
    });

    it("should handle simultaneous flip and edit state changes", () => {
      // Arrange
      const { rerender } = render(<FlashcardContent {...defaultProps} isFlipped={false} isEditing={false} />);

      // Act
      rerender(<FlashcardContent {...editProps} isFlipped={true} isEditing={true} />);

      // Assert - should show back content in edit mode when flipped
      expect(screen.getByDisplayValue("Editable back")).toBeInTheDocument();
      expect(screen.queryByDisplayValue("Editable front")).not.toBeInTheDocument();
      expect(screen.getByTestId("flashcard-content")).toHaveAttribute("data-flipped", "true");
      expect(screen.getByTestId("flashcard-content")).toHaveAttribute("data-editing", "true");
    });
  });

  describe("accessibility compliance", () => {
    it("should have proper focus management", () => {
      // Arrange
      render(<FlashcardContent {...defaultProps} />);

      // Assert
      expect(screen.getByTestId("flashcard-content")).toHaveAttribute("tabindex", "0");
    });

    it("should support keyboard navigation", () => {
      // Arrange
      render(<FlashcardContent {...defaultProps} />);

      // Act
      fireEvent.keyDown(screen.getByTestId("flashcard-content"), { key: "Enter" });

      // Assert
      expect(mockOnFlip).toHaveBeenCalledTimes(1);
    });

    it("should have semantic structure in edit mode", () => {
      // Arrange - test front side
      render(<FlashcardContent {...editProps} />);

      // Assert
      const frontTextarea = screen.getByDisplayValue("Editable front");
      expect(frontTextarea.tagName).toBe("TEXTAREA");
      expect(screen.getByTestId("flashcard-content")).toHaveAttribute("role", "form");

      // Test back side
      cleanup();
      render(<FlashcardContent {...editProps} isFlipped={true} />);

      const backTextarea = screen.getByDisplayValue("Editable back");
      expect(backTextarea.tagName).toBe("TEXTAREA");
      expect(screen.getByTestId("flashcard-content")).toHaveAttribute("role", "form");
    });

    it("should maintain proper contrast in different states", () => {
      // Arrange
      const { rerender } = render(<FlashcardContent {...defaultProps} />);

      // Assert front state
      expect(screen.getByTestId("flashcard-content")).toHaveClass("bg-white", "text-neutral-900");

      // Act
      rerender(<FlashcardContent {...defaultProps} isFlipped={true} />);

      // Assert back state
      expect(screen.getByTestId("flashcard-content")).toHaveClass("bg-neutral-100", "text-neutral-700");
    });
  });
});
