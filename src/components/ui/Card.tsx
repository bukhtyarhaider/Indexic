import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "surface" | "surface-highlight";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "surface", children, ...props }, ref) => {
    const variants = {
      glass: "glass",
      surface: "bg-surface border border-border",
      "surface-highlight": "bg-surface-highlight border border-border",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl sm:rounded-2xl transition-all",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
