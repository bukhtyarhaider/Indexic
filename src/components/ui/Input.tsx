import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, wrapperClassName, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center group", wrapperClassName)}>
        {leftIcon && (
          <div className="absolute left-3 text-text-secondary group-focus-within:text-primary transition-colors pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-surface-highlight border border-border text-text-main rounded-lg sm:rounded-xl outline-none transition-all placeholder:text-text-secondary focus:border-border focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed",
            "px-4 py-2 sm:py-2.5 text-sm", // Default padding
            leftIcon && "pl-10 sm:pl-11", // Adjust padding for left icon
            rightIcon && "pr-10 sm:pr-11", // Adjust padding for right icon
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-text-secondary pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
