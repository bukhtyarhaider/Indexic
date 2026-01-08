import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | "success"
    | "warning"
    | "info"
    | "primary";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, children, onRemove, variant = "default", ...props },
    ref
  ) => {
    const variants = {
      default: "bg-surface text-text-main border-border",
      secondary: "bg-surface-highlight text-text-secondary border-white/10",
      outline: "bg-transparent border-border text-text-secondary",
      destructive: "bg-red-900/20 text-red-400 border-red-800/30",
      success: "bg-emerald-900/20 text-emerald-400 border-emerald-800/30",
      warning: "bg-amber-900/20 text-amber-400 border-amber-800/30",
      info: "bg-blue-900/20 text-blue-400 border-blue-800/30",
      primary: "bg-primary/20 text-primary border-primary/20",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border transition-colors",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1.5 text-current opacity-60 hover:opacity-100 transition-opacity focus:outline-none"
          >
            &times;
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = "Badge";
