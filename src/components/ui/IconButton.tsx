interface IconButtonProps {
  icon: string; // classe bootstrap-icons, ex: "bi-eye"
  onClick: () => void;
  title?: string;
  tone?: "secondary" | "warning" | "danger";
}

export function IconButton({ icon, onClick, title, tone = "secondary" }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`btn btn-sm btn-outline-${tone} border-0 p-2`}
    >
      <i className={`bi ${icon}`} />
    </button>
  );
}
