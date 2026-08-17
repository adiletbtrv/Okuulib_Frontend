import React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ className, hoverable = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-100 bg-white p-5 shadow-xs",
        hoverable &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-gray-200",
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
    secondary: "bg-gray-100 text-gray-700 font-medium",
    outline: "border border-gray-200 text-gray-600 font-medium",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold",
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
