import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface WrapperProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldWrapper({ label, error, required, children }: WrapperProps) {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold small text-muted">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
}

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function InputField({ label, error, required, className = "", ...rest }: InputFieldProps) {
  return (
    <FieldWrapper label={label} error={error} required={required}>
      <input
        className={`form-control ${error ? "is-invalid" : ""} ${className}`}
        required={required}
        {...rest}
      />
    </FieldWrapper>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  children: ReactNode;
};

export function SelectField({ label, error, required, children, className = "", ...rest }: SelectFieldProps) {
  return (
    <FieldWrapper label={label} error={error} required={required}>
      <select className={`form-select ${error ? "is-invalid" : ""} ${className}`} required={required} {...rest}>
        {children}
      </select>
    </FieldWrapper>
  );
}

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function TextareaField({ label, error, required, className = "", ...rest }: TextareaFieldProps) {
  return (
    <FieldWrapper label={label} error={error} required={required}>
      <textarea className={`form-control ${error ? "is-invalid" : ""} ${className}`} required={required} {...rest} />
    </FieldWrapper>
  );
}
