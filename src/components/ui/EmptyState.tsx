interface EmptyStateProps {
  message: string;
  icon?: string;
}

export function EmptyState({ message, icon = "bi-inbox" }: EmptyStateProps) {
  return (
    <div className="text-center py-5 bg-white rounded-4 shadow-sm text-muted fs-5">
      <i className={`bi ${icon} d-block mb-2`} style={{ fontSize: 32 }} />
      {message}
    </div>
  );
}
