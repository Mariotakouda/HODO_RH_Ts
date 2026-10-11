import type { ReactNode } from "react";
import { ListSkeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
  align?: "left" | "center";
}

interface DataTableProps<T> {
  items: T[];
  loading: boolean;
  columns: Column<T>[];
  keyField: keyof T;
  /** Rendu de la carte utilisée en mobile (< md). */
  renderMobileCard: (item: T) => ReactNode;
  emptyMessage: string;
}

/**
 * Table générique : desktop = vrai tableau, mobile = cartes.
 * Gère elle-même le squelette de chargement et l'état "aucun résultat",
 * pour que chaque écran de liste n'ait plus qu'à décrire SES colonnes.
 */
export function DataTable<T>({
  items,
  loading,
  columns,
  keyField,
  renderMobileCard,
  emptyMessage,
}: DataTableProps<T>) {
  if (loading) return <ListSkeleton />;
  if (items.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <>
      <div className="d-md-none">
        {items.map((item) => (
          <div key={String(item[keyField])}>{renderMobileCard(item)}</div>
        ))}
      </div>

      <div className="card border-0 shadow-sm d-none d-md-block rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light border-bottom">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.header}
                    className={`py-3 text-muted fw-bold ${col.align === "center" ? "text-center" : ""} ${col.className ?? ""}`}
                    style={{ fontSize: 12, textTransform: "uppercase" }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={String(item[keyField])}>
                  {columns.map((col) => (
                    <td
                      key={col.header}
                      className={`py-3 ${col.align === "center" ? "text-center" : ""} ${col.className ?? ""}`}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
