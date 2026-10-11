/**
 * Erreur typée pour tout échec d'appel API.
 * Transporte le statut HTTP et, pour les 422 Laravel, le détail des
 * erreurs de validation par champ.
 */
export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  responseBody?: unknown;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>,
    responseBody?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.responseBody = responseBody;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /** Premier message d'erreur de validation, toutes champs confondus. */
  get firstValidationMessage(): string | null {
    if (!this.errors) return null;
    const first = Object.values(this.errors)[0];
    return first?.[0] ?? null;
  }
}

/**
 * Convertit une erreur axios en ApiError exploitable par l'UI.
 * À utiliser dans un catch, aussi bien dans un service que dans un composant.
 */
export function toApiError(error: any): ApiError {
  if (error instanceof ApiError) return error;

  if (error.response) {
    const status = error.response.status;
    const data = error.response.data ?? {};
    return new ApiError(data.message || `Erreur HTTP ${status}`, status, data.errors, data);
  }

  if (error.request) {
    return new ApiError("Aucune réponse du serveur (problème réseau).", 0);
  }

  return new ApiError(error.message ?? "Erreur inconnue", 0);
}

/** Message prêt à afficher (toast, alerte) à partir de n'importe quelle erreur catchée. */
export function errorMessage(error: unknown): string {
  const apiError = toApiError(error);
  return apiError.firstValidationMessage || apiError.message;
}
