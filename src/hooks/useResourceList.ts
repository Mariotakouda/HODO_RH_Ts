import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { errorMessage } from "../lib/api/errors";

interface UseResourceListOptions<T> {
  /** Doit renvoyer la liste complète (le hook gère ensuite la recherche côté client). */
  fetchAll: () => Promise<T[]>;
  /** Optionnel : appelé par `remove(id)`. */
  deleteOne?: (id: number) => Promise<void>;
  /** Filtre une entrée selon le terme de recherche (déjà en minuscules). */
  matches?: (item: T, term: string) => boolean;
  /** Message de succès après suppression. */
  deleteSuccessMessage?: string;
}

/**
 * Centralise le pattern répété dans tous les écrans `list.tsx` :
 * chargement initial, état loading/erreur, recherche texte côté client,
 * suppression avec toast de confirmation + rechargement.
 */
export function useResourceList<T extends { id: number }>({
  fetchAll,
  deleteOne,
  matches,
  deleteSuccessMessage = "Supprimé avec succès",
}: UseResourceListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchAll());
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => (matches ? matches(item, term) : true));
  }, [items, search, matches]);

  const remove = useCallback(
    async (id: number) => {
      if (!deleteOne) return;
      try {
        await deleteOne(id);
        toast.success(deleteSuccessMessage);
        setItems((current) => current.filter((item) => item.id !== id));
      } catch (err) {
        toast.error(errorMessage(err));
      }
    },
    [deleteOne, deleteSuccessMessage]
  );

  return { items: filtered, allItems: items, loading, search, setSearch, reload: load, remove };
}
