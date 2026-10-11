import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h1 className="display-6 fw-bold text-dark mb-1">{title}</h1>
        {subtitle && <p className="text-muted mb-0 fs-5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
