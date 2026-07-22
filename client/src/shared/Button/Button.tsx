// src/components/ui/Button.tsx
import React, { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const buttonVariants = cva(
  [
    "items-center justify-center gap-2",
    "rounded-md font-medium",
    "transition-colors",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-blue-500",
    "focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "cursor-pointer",
  ],
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",

        secondary:
          "bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400",

        outline:
          "border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100",

        ghost: "bg-transparent text-slate-900 hover:bg-slate-100",

        danger:
          "border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100 text-red-600 hover:text-red-700 active:text-red-800",

        link: "h-auto rounded-none p-0 text-blue-600 underline-offset-4 hover:underline",
      },

      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },

      fullWidth: {
        true: "w-full",
        false: "",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant,
  size,
  fullWidth,
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  disabled,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {loading ? (
        <>
          <Spinner />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span aria-hidden="true" className="shrink-0">
              {leftIcon}
            </span>
          )}

          <span>{children}</span>

          {rightIcon && (
            <span aria-hidden="true" className="shrink-0">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

Button.displayName = "Button";

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
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
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

