import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border border-border-soft bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-canopy-400/70 focus-visible:outline-2 focus-visible:outline-ring ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-canopy-800">
      {children}
    </label>
  );
}
