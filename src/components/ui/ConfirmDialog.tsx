import { useCallback, useState } from "react";

interface ConfirmState {
  message: string;
  resolve: (ok: boolean) => void;
}

/**
 * Remplace window.confirm() par une modale cohérente avec le reste de l'UI.
 *
 * Usage :
 *   const { confirm, ConfirmDialog } = useConfirm();
 *   ...
 *   if (await confirm("Supprimer cet employé ?")) { ... }
 *   ...
 *   return <>{ConfirmDialog}{...}</>;
 */
export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => setState({ message, resolve }));
  }, []);

  const handle = (ok: boolean) => {
    state?.resolve(ok);
    setState(null);
  };

  const ConfirmDialog = state ? (
    <div
      className="modal d-block"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={() => handle(false)}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content rounded-4 border-0 shadow">
          <div className="modal-body p-4 text-center">
            <i className="bi bi-exclamation-triangle text-warning d-block mb-3" style={{ fontSize: 32 }} />
            <p className="mb-4">{state.message}</p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-light border px-4" onClick={() => handle(false)}>
                Annuler
              </button>
              <button className="btn btn-danger px-4" onClick={() => handle(true)}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, ConfirmDialog };
}
