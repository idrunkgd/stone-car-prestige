import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="my-2.5">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-[11px] uppercase tracking-wider text-ink-muted"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-[10px] border border-line-soft bg-night-2 px-3.5 py-3 text-[15px] text-ink",
            "placeholder:text-ink-faint focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/15",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = "Input";
