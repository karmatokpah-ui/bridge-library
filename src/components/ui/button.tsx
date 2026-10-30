import type { ButtonHTMLAttributes } from "react";

export function Button({ className = "", variant = "primary", size, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "default" | "ghost" | "secondary" | "destructive" | "link"; size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-xs" }) {
  return <button {...props} data-size={size} className={`bl-btn bl-btn-${variant === 'default' ? 'primary' : variant} ${className}`} />;
}