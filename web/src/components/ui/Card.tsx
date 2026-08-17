import React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ className, hoverable = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs transition-colors duration-150",
        hoverable &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "brand" | "secondary" | "outline" | "success";
}

export function Badge({
  className,
  variant = "secondary",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    brand: "bg-[#E84326]/10 text-[#E84326] border border-[#E84326]/20 font-semibold",
    secondary: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium",
    outline: "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium",
    success: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
