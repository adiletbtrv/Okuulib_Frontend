import React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-[#1A1A2E] placeholder:text-gray-400 transition-all duration-150 focus:border-[#E84326] focus:outline-none focus:ring-2 focus:ring-[#E84326]/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
