import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-primary text-white border border-border shadow-soft hover:bg-primary-hover hover:border-white/20 active:shadow-inner",
      secondary:
        "bg-surface text-text-secondary border border-border hover:bg-surface-highlight hover:text-white hover:border-white/20",
      ghost:
        "bg-transparent text-text-secondary hover:text-white hover:bg-white/5",
      danger:
        "text-red-400 hover:text-red-300 hover:bg-red-500/10 active:bg-red-500/20",
      outline:
        "bg-transparent border border-border text-text-main hover:bg-surface-highlight hover:border-white/20",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-lg",
      md: "px-4 py-2 text-sm rounded-lg sm:rounded-xl",
      lg: "px-6 py-3 text-base rounded-xl",
      icon: "p-2 rounded-lg aspect-square flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="animate-spin h-4 w-4" />
        )}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
