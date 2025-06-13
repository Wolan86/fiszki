import React from "react";
import { Button } from "@/components/ui/button";

interface TestButtonProps {
  onClick: () => void;
}

export const TestButton: React.FC<TestButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={() => {
        onClick();
      }}
    >
      Test Button
    </Button>
  );
};
