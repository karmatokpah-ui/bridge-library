import type { ButtonHTMLAttributes } from "react";

export function Button({ className = "", variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" }) {
  return <button {...props} className={`bl-btn bl-btn-${variant} ${className}`} />;
}