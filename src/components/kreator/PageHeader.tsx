import React from "react";

interface PageHeaderProps {
  title: string;
  description: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="space-y-2 mb-8" data-testid="flashcard-creator-header">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">{title}</h1>
      <p className="text-muted-foreground text-neutral-500">{description}</p>
    </div>
  );
}; 