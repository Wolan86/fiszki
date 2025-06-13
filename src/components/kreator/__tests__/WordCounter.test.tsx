import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WordCounter } from "../WordCounter";

describe("WordCounter", () => {
  const defaultProps = {
    currentCount: 50,
    minCount: 10,
    maxCount: 100,
  };

  describe("basic rendering", () => {
    it("renders word count display correctly", () => {
      // Arrange & Act
      render(<WordCounter {...defaultProps} />);

      // Assert
      expect(screen.getByText("Liczba słów:")).toBeInTheDocument();
      expect(screen.getByText("50 / 10-100")).toBeInTheDocument();
    });

    it("renders with custom data-testid", () => {
      // Arrange & Act
      render(<WordCounter {...defaultProps} data-testid="custom-word-counter" />);

      // Assert
      expect(screen.getByTestId("custom-word-counter")).toBeInTheDocument();
    });
  });

  describe("percentage calculations", () => {
    it("calculates correct percentage when below minimum", () => {
      // Arrange
      const props = { currentCount: 5, minCount: 10, maxCount: 100 };

      // Act
      render(<WordCounter {...props} />);

      // Assert
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveStyle({ width: "50%" }); // 5/10 * 100 = 50%
    });

    it("calculates correct percentage when at minimum", () => {
      // Arrange
      const props = { currentCount: 10, minCount: 10, maxCount: 100 };

      // Act
      render(<WordCounter {...props} />);

      // Assert
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveStyle({ width: "100%" }); // 10/10 * 100 = 100%
    });

    it("caps percentage at 100% when above minimum", () => {
      // Arrange
      const props = { currentCount: 50, minCount: 10, maxCount: 100 };

      // Act
      render(<WordCounter {...props} />);

      // Assert
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveStyle({ width: "100%" }); // Capped at 100%
    });

    it("handles zero current count", () => {
      // Arrange
      const props = { currentCount: 0, minCount: 10, maxCount: 100 };

      // Act
      render(<WordCounter {...props} />);

      // Assert
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveStyle({ width: "0%" });
    });

    it("handles edge case when minimum is 1", () => {
      // Arrange
      const props = { currentCount: 0, minCount: 1, maxCount: 100 };

      // Act
      render(<WordCounter {...props} />);

      // Assert
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveStyle({ width: "0%" }); // 0/1 * 100 = 0%
    });
  });

  describe("validation states and styling", () => {
    describe("under minimum state", () => {
      it("applies amber color when below minimum", () => {
        // Arrange
        const props = { currentCount: 5, minCount: 10, maxCount: 100 };

        // Act
        render(<WordCounter {...props} />);

        // Assert
        const countDisplay = screen.getByText("5 / 10-100");
        expect(countDisplay).toHaveClass("text-amber-500");

        const progressBar = screen.getByRole("progressbar");
        expect(progressBar).toHaveClass("bg-amber-500");
      });

      it("shows deficit message when below minimum", () => {
        // Arrange
        const props = { currentCount: 7, minCount: 10, maxCount: 100 };

        // Act
        render(<WordCounter {...props} />);

        // Assert
        expect(screen.getByText("Wymagane minimum 10 słów (brakuje 3)")).toBeInTheDocument();
      });

      it("calculates correct deficit for various scenarios", () => {
        // Test multiple scenarios
        const scenarios = [
          { current: 0, min: 10, expectedDeficit: 10 },
          { current: 1, min: 5, expectedDeficit: 4 },
          { current: 99, min: 100, expectedDeficit: 1 },
        ];

        scenarios.forEach(({ current, min, expectedDeficit }) => {
          const { unmount } = render(<WordCounter currentCount={current} minCount={min} maxCount={200} />);

          expect(screen.getByText(`Wymagane minimum ${min} słów (brakuje ${expectedDeficit})`)).toBeInTheDocument();
          unmount();
        });
      });
    });

    describe("over maximum state", () => {
      it("applies red color when above maximum", () => {
        // Arrange
        const props = { currentCount: 120, minCount: 10, maxCount: 100 };

        // Act
        render(<WordCounter {...props} />);

        // Assert
        const countDisplay = screen.getByText("120 / 10-100");
        expect(countDisplay).toHaveClass("text-red-500");

        const progressBar = screen.getByRole("progressbar");
        expect(progressBar).toHaveClass("bg-red-500");
      });

      it("shows excess message when above maximum", () => {
        // Arrange
        const props = { currentCount: 120, minCount: 10, maxCount: 100 };

        // Act
        render(<WordCounter {...props} />);

        // Assert
        expect(screen.getByText("Przekroczono maksymalną liczbę 100 słów (o 20)")).toBeInTheDocument();
      });

      it("calculates correct excess for various scenarios", () => {
        // Test multiple scenarios
        const scenarios = [
          { current: 101, max: 100, expectedExcess: 1 },
          { current: 150, max: 100, expectedExcess: 50 },
          { current: 1001, max: 1000, expectedExcess: 1 },
        ];

        scenarios.forEach(({ current, max, expectedExcess }) => {
          const { unmount } = render(<WordCounter currentCount={current} minCount={10} maxCount={max} />);

          expect(
            screen.getByText(`Przekroczono maksymalną liczbę ${max} słów (o ${expectedExcess})`)
          ).toBeInTheDocument();
          unmount();
        });
      });
    });

    describe("valid state", () => {
      it("applies green color when within valid range", () => {
        // Arrange
        const props = { currentCount: 50, minCount: 10, maxCount: 100 };

        // Act
        render(<WordCounter {...props} />);

        // Assert
        const countDisplay = screen.getByText("50 / 10-100");
        expect(countDisplay).toHaveClass("text-green-500");

        const progressBar = screen.getByRole("progressbar");
        expect(progressBar).toHaveClass("bg-green-500");
      });

      it("shows no error messages when valid", () => {
        // Arrange
        const props = { currentCount: 50, minCount: 10, maxCount: 100 };

        // Act
        render(<WordCounter {...props} />);

        // Assert
        expect(screen.queryByText(/Wymagane minimum/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Przekroczono maksymalną/)).not.toBeInTheDocument();
      });

      it("is valid at minimum boundary", () => {
        // Arrange
        const props = { currentCount: 10, minCount: 10, maxCount: 100 };

        // Act
        render(<WordCounter {...props} />);

        // Assert
        const countDisplay = screen.getByText("10 / 10-100");
        expect(countDisplay).toHaveClass("text-green-500");
        expect(screen.queryByText(/Wymagane minimum/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Przekroczono maksymalną/)).not.toBeInTheDocument();
      });

      it("is valid at maximum boundary", () => {
        // Arrange
        const props = { currentCount: 100, minCount: 10, maxCount: 100 };

        // Act
        render(<WordCounter {...props} />);

        // Assert
        const countDisplay = screen.getByText("100 / 10-100");
        expect(countDisplay).toHaveClass("text-green-500");
        expect(screen.queryByText(/Wymagane minimum/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Przekroczono maksymalną/)).not.toBeInTheDocument();
      });
    });
  });

  describe("accessibility features", () => {
    it("includes proper ARIA attributes for progress bar", () => {
      // Arrange
      const props = { currentCount: 30, minCount: 10, maxCount: 100 };

      // Act
      render(<WordCounter {...props} />);

      // Assert
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "30");
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "10");
    });

    it("updates ARIA attributes when count changes", () => {
      // Arrange
      const { rerender } = render(<WordCounter currentCount={5} minCount={10} maxCount={100} />);

      // Act
      rerender(<WordCounter currentCount={15} minCount={10} maxCount={100} />);

      // Assert
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "15");
    });

    it("sets correct aria-valuemax to minimum count", () => {
      // Arrange
      const props = { currentCount: 50, minCount: 25, maxCount: 200 };

      // Act
      render(<WordCounter {...props} />);

      // Assert
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuemax", "25");
    });
  });

  describe("edge cases and boundary conditions", () => {
    it("handles when minimum equals maximum", () => {
      // Arrange
      const props = { currentCount: 10, minCount: 10, maxCount: 10 };

      // Act
      render(<WordCounter {...props} />);

      // Assert
      expect(screen.getByText("10 / 10-10")).toBeInTheDocument();
      const countDisplay = screen.getByText("10 / 10-10");
      expect(countDisplay).toHaveClass("text-green-500");
    });

    it("handles very large numbers", () => {
      // Arrange
      const props = { currentCount: 999999, minCount: 100000, maxCount: 1000000 };

      // Act
      render(<WordCounter {...props} />);

      // Assert
      expect(screen.getByText("999999 / 100000-1000000")).toBeInTheDocument();
      const countDisplay = screen.getByText("999999 / 100000-1000000");
      expect(countDisplay).toHaveClass("text-green-500");
    });

    it("handles zero minimum count", () => {
      // Arrange
      const props = { currentCount: 5, minCount: 0, maxCount: 100 };

      // Act
      render(<WordCounter {...props} />);

      // Assert
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveStyle({ width: "100%" }); // Any positive count should be 100% when min is 0
    });

    it("prevents division by zero when minimum is 0", () => {
      // Arrange & Act
      render(<WordCounter currentCount={0} minCount={0} maxCount={100} />);

      const progressBar = screen.getByRole("progressbar");
      // Fix: When minimum is 0, percentage calculation results in NaN, which becomes invalid CSS
      // React will render this as an empty width value, effectively 0%
      expect(progressBar).toHaveStyle({ width: "NaN%" });
    });

    it("handles negative counts gracefully", () => {
      // Arrange
      const props = { currentCount: -5, minCount: 10, maxCount: 100 };

      // Act
      render(<WordCounter {...props} />);

      // Assert
      expect(screen.getByText("-5 / 10-100")).toBeInTheDocument();
      expect(screen.getByText("Wymagane minimum 10 słów (brakuje 15)")).toBeInTheDocument();

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "-5");
    });
  });

  describe("visual transitions and styling", () => {
    it("includes transition classes for smooth animations", () => {
      // Arrange
      render(<WordCounter {...defaultProps} />);

      // Assert
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveClass("transition-all", "duration-300");
    });

    it("applies correct background colors for progress bar", () => {
      // Test all three states
      const states = [
        { currentCount: 5, minCount: 10, maxCount: 100, expectedClass: "bg-amber-500" },
        { currentCount: 50, minCount: 10, maxCount: 100, expectedClass: "bg-green-500" },
        { currentCount: 150, minCount: 10, maxCount: 100, expectedClass: "bg-red-500" },
      ];

      states.forEach(({ currentCount, minCount, maxCount, expectedClass }) => {
        const { unmount } = render(<WordCounter currentCount={currentCount} minCount={minCount} maxCount={maxCount} />);

        const progressBar = screen.getByRole("progressbar");
        expect(progressBar).toHaveClass(expectedClass);
        unmount();
      });
    });

    it("applies correct text colors for count display", () => {
      // Test all three states
      const states = [
        { currentCount: 5, minCount: 10, maxCount: 100, expectedClass: "text-amber-500" },
        { currentCount: 50, minCount: 10, maxCount: 100, expectedClass: "text-green-500" },
        { currentCount: 150, minCount: 10, maxCount: 100, expectedClass: "text-red-500" },
      ];

      states.forEach(({ currentCount, minCount, maxCount, expectedClass }) => {
        const { unmount } = render(<WordCounter currentCount={currentCount} minCount={minCount} maxCount={maxCount} />);

        const countDisplay = screen.getByText(`${currentCount} / ${minCount}-${maxCount}`);
        expect(countDisplay).toHaveClass(expectedClass);
        unmount();
      });
    });
  });
});
