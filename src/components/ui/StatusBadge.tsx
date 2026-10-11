export type BadgeTone = "success" | "warning" | "danger" | "info" | "secondary" | "primary";

export interface StatusConfig {
  label: string;
  tone: BadgeTone;
}

interface StatusBadgeProps<S extends string> {
  status: S;
  config: Record<S, StatusConfig>;
}

/**
 * Badge de statut générique. Chaque domaine (employés, tâches, congés...)
 * passe juste sa table de correspondance statut -> {label, tone} :
 *
 *   <StatusBadge status={task.status} config={TASK_STATUS_CONFIG} />
 */
export function StatusBadge<S extends string>({ status, config }: StatusBadgeProps<S>) {
  const { label, tone } = config[status] ?? { label: status, tone: "secondary" as BadgeTone };

  return (
    <span
      className={`badge rounded-pill border bg-${tone} bg-opacity-10 text-${tone} fw-normal px-2 py-1`}
      style={{ fontSize: 11 }}
    >
      {label}
    </span>
  );
}
