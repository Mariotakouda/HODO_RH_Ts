import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "react-hot-toast";
import { api } from "../../lib/api/client";
import { errorMessage } from "../../lib/api/errors";

interface MyDocument {
  id: number;
  type: string;
  title: string;
  original_name: string;
  size: number;
  created_at: string;
  can_delete: boolean;
  uploader?: { id: number; name: string } | null;
}

const TYPE_LABELS: Record<string, string> = {
  contrat: "Contrat",
  piece_identite: "Pièce d'identité",
  diplome: "Diplôme",
  attestation: "Attestation",
  autre: "Autre",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function MyDocuments() {
  const [documents, setDocuments] = useState<MyDocument[]>([]);
  const [allowedTypes, setAllowedTypes] = useState<string[]>(["piece_identite", "diplome", "attestation", "autre"]);
  const [maxDocuments, setMaxDocuments] = useState(30);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [type, setType] = useState("piece_identite");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: MyDocument[]; allowed_types: string[]; max_documents: number }>("/me/documents");
      setDocuments(res.data.data);
      if (res.data.allowed_types?.length) setAllowedTypes(res.data.allowed_types);
      if (res.data.max_documents) setMaxDocuments(res.data.max_documents);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Sélectionnez un fichier.");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    if (title.trim()) form.append("title", title.trim());

    try {
      setUploading(true);
      const res = await api.post<{ message: string }>("/me/documents", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);
      setFile(null);
      setTitle("");
      setFileKey((k) => k + 1);
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: MyDocument) => {
    try {
      const res = await api.get<Blob>(`/me/documents/${doc.id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.original_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleDelete = async (doc: MyDocument) => {
    if (!window.confirm(`Supprimer « ${doc.title} » de votre dossier ?`)) return;
    try {
      await api.delete(`/me/documents/${doc.id}`);
      toast.success("Pièce supprimée.");
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const full = documents.length >= maxDocuments;

  return (
    <div className="container-fluid py-4 px-md-5">
      <h1 className="h3 fw-bold mb-1">Mon dossier</h1>
      <p className="text-muted mb-4">
        Ajoutez vos pièces (pièce d'identité, diplômes, attestations…) une par une. Seuls vous et l'administration y avez accès.
      </p>

      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
        <div className="card-body p-4">
          <h6 className="fw-bold mb-3">Ajouter une pièce</h6>
          <form onSubmit={handleUpload} className="row g-2 align-items-end">
            <div className="col-12 col-md-3">
              <label className="form-label small text-muted mb-1">Type</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                {allowedTypes.map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label small text-muted mb-1">Titre (facultatif)</label>
              <input className="form-control" maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small text-muted mb-1">Fichier (PDF, image, Word — 5 Mo max)</label>
              <input
                key={fileKey}
                type="file"
                className="form-control"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="col-12 col-md-2 d-grid">
              <button className="btn btn-primary" type="submit" disabled={uploading || !file || full}>
                {uploading ? "Envoi…" : "Ajouter"}
              </button>
            </div>
          </form>
          {full && <p className="text-danger small mt-2 mb-0">Votre dossier a atteint {maxDocuments} pièces : supprimez-en une pour en ajouter.</p>}
        </div>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-0">
          {loading ? (
            <p className="text-center text-muted py-5 mb-0">Chargement…</p>
          ) : documents.length === 0 ? (
            <p className="text-center text-muted py-5 mb-0">Votre dossier est vide pour le moment.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Titre</th><th>Type</th><th>Taille</th><th>Ajouté le</th><th>Par</th><th /></tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="fw-semibold">
                        {doc.title}
                        <div className="text-muted small fw-normal">{doc.original_name}</div>
                      </td>
                      <td>{TYPE_LABELS[doc.type] ?? doc.type}</td>
                      <td>{formatSize(doc.size)}</td>
                      <td>{new Date(doc.created_at).toLocaleDateString("fr-FR")}</td>
                      <td>{doc.can_delete ? "Vous" : "Administration"}</td>
                      <td className="text-end text-nowrap">
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleDownload(doc)}>Télécharger</button>
                        {doc.can_delete ? (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(doc)}>Supprimer</button>
                        ) : (
                          <span className="text-muted small">Lecture seule</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
