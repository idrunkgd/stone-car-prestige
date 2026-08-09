import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "danger" | "subtle";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-gold-grad text-[#1a1400] font-bold shadow-gold hover:brightness-110 active:brightness-95",
  ghost:
    "bg-transparent text-gold-1 border border-line-gold hover:bg-gold/[0.08]",
  danger: "bg-state-red text-white hover:brightness-110",
  subtle:
    "bg-night-panel text-ink border border-line-soft hover:border-line-gold",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-3 text-sm",
  lg: "px-7 py-4 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-display uppercase tracking-wide transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
