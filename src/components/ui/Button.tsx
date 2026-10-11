import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "danger" | "light" | "success";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  icon?: string; // classe bootstrap-icons, ex: "bi-plus-lg"
  children?: ReactNode;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn-primary",
  outline: "btn-outline-secondary",
  danger: "btn-outline-danger",
  light: "btn-light border",
  success: "btn-success",
};

export function Button({
  variant = "primary",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`btn ${VARIANT_CLASS[variant]} d-inline-flex align-items-center justify-content-center gap-2 ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
      ) : (
        icon && <i className={`bi ${icon}`} />
      )}
      {children}
    </button>
  );
}
