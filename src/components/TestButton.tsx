import React from "react";
import { Button } from "@/components/ui/button";

interface TestButtonProps {
  onClick: () => void;
}

export const TestButton: React.FC<TestButtonProps> = ({ onClick }) => {
  console.log("TestButton rendered, onClick type:", typeof onClick);

  return (
    <Button 
      onClick={() => {
        console.log("Button clicked");
        onClick();
      }}
    >
      Test Button
    </Button>
  );
}; 