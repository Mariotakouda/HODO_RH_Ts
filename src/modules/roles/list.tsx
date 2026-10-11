import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { RoleService } from "./service";
import type { Role, LaravelPaginationResponse } from "./model";

// --- LOGIQUE SKELETON ---
const RoleSkeleton = () => (
  <div className="animate-pulse">
    <style>{`
      @keyframes shimmer { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
      .skeleton-item { animation: shimmer 1.5s infinite ease-in-out; background: #e9ecef; border-radius: 8px; }
    `}</style>
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      <div className="table-responsive">
        <table className="table mb-0">
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td className="px-4 py-4"><div className="skeleton-item" style={{ width: '150px', height: '18px' }}></div></td>
                <td className="py-4"><div className="skeleton-item mx-auto" style={{ width: '80px', height: '25px', borderRadius: '20px' }}></div></td>
                <td className="px-4 py-4 text-center"><div className="skeleton-item mx-auto" style={{ width: '100px', height: '32px' }}></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const initialPaginationState: LaravelPaginationResponse<Role> = {
  current_page: 1, data: [], last_page: 1, per_page: 10, total: 0,
  first_page_url: '', last_page_url: '', next_page_url: null, prev_page_url: null,
  from: null, to: null, path: '',
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
};

const Icon = ({ name }: { name: 'eye' | 'edit' | 'trash' | 'plus' | 'search' }) => {
  const icons = {
    eye: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    edit: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
    trash: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
    plus: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14"/></svg>,
    search: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  };
  return <span className="d-flex align-items-center">{icons[name]}</span>;
};

export default function RoleList() {
  const [paginationData, setPaginationData] = useState<LaravelPaginationResponse<Role>>(initialPaginationState);
  const [searchInput, setSearchInput] = useState(""); // Valeur du champ de saisie
  const [search, setSearch] = useState("");           // Valeur réelle filtrée
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: roles, total, current_page, last_page } = paginationData;

  // Fonction de chargement mémorisée
  const load = useCallback(async (currentPage: number, currentSearch: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await RoleService.list(currentPage, currentSearch);
      setPaginationData(res); 
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur de chargement.");
      setPaginationData(prev => ({ ...prev, data: [] })); 
    } finally {
      setLoading(false);
    }
  }, []);

  // Effet pour gérer la recherche automatique (Debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // On revient à la page 1 lors d'une nouvelle recherche
    }, 500); // Attend 500ms d'inactivité avant de lancer la recherche

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Effet pour déclencher le chargement quand la page ou le filtre change
  useEffect(() => {
    load(page, search);
  }, [page, search, load]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const remove = async (id: number, name: string) => {
    if (!window.confirm(`Supprimer le rôle "${name}" ?`)) return;
    try {
      await RoleService.remove(id);
      load(page, search);
    } catch (err: any) {
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="container-fluid py-4 py-md-5 px-3 px-md-5 bg-light min-vh-100">
      
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Rôles Utilisateurs</h1>
          <p className="text-muted mb-0 font-monospace" style={{ fontSize: '13px' }}>
            TOTAL: <span className="fw-bold text-primary">{total}</span>
          </p>
        </div>
        <Link to="create" className="btn btn-primary d-inline-flex align-items-center shadow-sm px-4 py-2 rounded-3">
          <Icon name="plus" />
          <span className="fw-bold ms-2">Nouveau rôle</span>
        </Link>
      </div>

      {/* Recherche */}
      <div className="card border-0 shadow-sm mb-4 rounded-3">
        <div className="card-body p-2">
          <form onSubmit={handleSearchSubmit} className="row g-2">
            <div className="col-12 col-md">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-0 text-muted ps-3">
                  <Icon name="search" />
                </span>
                <input 
                  type="text"
                  className="form-control border-0 bg-transparent shadow-none" 
                  placeholder="Rechercher un rôle (ex: Manager...)" 
                  value={searchInput} 
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{ fontSize: '15px', padding: '12px 10px' }}
                />
              </div>
            </div>
            <div className="col-12 col-md-auto d-flex gap-2">
              <button type="submit" className="btn btn-dark px-4 fw-bold flex-grow-1" disabled={loading}>
                {loading ? '...' : 'Filtrer'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 shadow-sm rounded-3 mb-4">
          <small>{error}</small>
        </div>
      )}

      {/* Table Section */}
      {loading && roles.length === 0 ? (
        <RoleSkeleton />
      ) : (
        <>
          <div className={`card border-0 shadow-sm rounded-4 overflow-hidden bg-white ${loading ? 'opacity-50' : ''}`}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr style={{ fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>
                    <th className="px-4 py-3">Intitulé</th>
                    <th className="py-3 text-center">Effectif</th>
                    <th className="py-3">Créé le</th>
                    <th className="py-3 text-center px-4">Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '14px' }}>
                  {roles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-5 text-muted">
                        {search ? `Aucun résultat pour "${search}"` : "Aucun rôle disponible."}
                      </td>
                    </tr>
                  ) : (
                    roles.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-4 fw-bold text-dark">{r.name}</td>
                        <td className="py-4 text-center">
                          <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
                            {r.employees_count ?? 0}
                          </span>
                        </td>
                        <td className="py-4 text-muted">{formatDate(r.created_at)}</td>
                        <td className="text-center px-4">
                          <div className="d-inline-flex gap-2">
                            <Link to={`${r.id}`} className="btn btn-sm btn-outline-primary rounded-3"><Icon name="eye" /></Link>
                            <Link to={`${r.id}/edit`} className="btn btn-sm btn-outline-warning rounded-3"><Icon name="edit" /></Link>
                            <button onClick={() => remove(r.id, r.name)} className="btn btn-sm btn-outline-danger rounded-3"><Icon name="trash" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {last_page > 1 && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-3">
              <div className="text-muted small">
                Page <strong>{current_page}</strong> sur <strong>{last_page}</strong>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-white border px-4 py-2 fw-bold shadow-sm rounded-3" 
                  onClick={() => setPage(page - 1)} 
                  disabled={loading || current_page === 1}
                >
                  Précédent
                </button>
                <button 
                  className="btn btn-white border px-4 py-2 fw-bold shadow-sm rounded-3" 
                  onClick={() => setPage(page + 1)} 
                  disabled={loading || current_page === last_page}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}