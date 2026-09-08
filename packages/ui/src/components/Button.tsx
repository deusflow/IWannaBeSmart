import React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-blue text-white hover:bg-accent-blue-hover border border-transparent shadow-paper-sm focus-visible:ring-2 focus-visible:ring-accent-blue/30",
  secondary:
    "bg-paper-subtle text-ink hover:bg-paper border border-paper-border shadow-paper-sm focus-visible:ring-2 focus-visible:ring-ink-border",
  ghost:
    "bg-transparent text-ink-muted hover:text-ink hover:bg-paper/80 border border-transparent focus-visible:ring-2 focus-visible:ring-slate-300",
  danger:
    "bg-accent-break text-white hover:bg-accent-break-hover border border-transparent shadow-paper-sm focus-visible:ring-2 focus-visible:ring-accent-break/30",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs rounded-md gap-1.5 font-medium",
  md: "px-3.5 py-1.5 text-sm rounded-md gap-2 font-medium",
  lg: "px-5 py-2.5 text-base rounded-lg gap-2.5 font-semibold",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyle =
      "inline-flex items-center justify-center select-none cursor-pointer transition-all duration-150 ease-out active:scale-[0.98] outline-none disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
