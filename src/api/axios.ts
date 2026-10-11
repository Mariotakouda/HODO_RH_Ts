// Compatibilité transitoire : le client axios vit maintenant dans lib/api/client.ts.
// Les modules pas encore migrés vers la nouvelle arborescence continuent d'importer
// ce fichier sans rien casser. À supprimer une fois TOUS les modules migrés
// (voir CHANGELOG_FRONTEND.md).
export { api } from "../lib/api/client";
