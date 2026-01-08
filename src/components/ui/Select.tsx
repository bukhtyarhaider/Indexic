import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  wrapperClassName?: string;
  icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, wrapperClassName, icon, children, ...props }, ref) => {
    return (
      <div className={cn("relative", wrapperClassName)}>
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none z-10">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none bg-surface-highlight border border-border text-text-main rounded-lg sm:rounded-xl outline-none transition-all focus:border-border focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed",
            "px-4 py-2 sm:py-2.5 text-sm", // Default padding
            icon ? "pl-10" : "pl-4", // Adjust padding for left icon
            "pr-10", // Space for chevron
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
