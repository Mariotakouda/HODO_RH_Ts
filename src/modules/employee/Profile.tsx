import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../api/axios";
import { Link } from "react-router-dom";

// --- Icônes SVG Professionnelles ---
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconMail = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IconPhone = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconBriefcase = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const IconCamera = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;

export default function EmployeeProfile() {
  const { employee, setEmployee } = useContext(AuthContext);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (employee?.profile_photo_url) {
      setPreviewUrl(employee.profile_photo_url);
    }
  }, [employee]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image (JPG, PNG, GIF)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('La photo ne doit pas dépasser 2MB');
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('profile_photo', file);

      const response = await api.post('/me/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.employee && setEmployee) {
        setEmployee(response.data.employee);
      }
      if (response.data.url) {
        setPreviewUrl(response.data.url);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de l\'upload');
      setPreviewUrl(employee?.profile_photo_url || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm('Supprimer votre photo de profil ?')) return;
    try {
      setUploading(true);
      const response = await api.delete('/me/profile-photo');
      if (response.data.employee && setEmployee) {
        setEmployee(response.data.employee);
      }
      setPreviewUrl(null);
    } catch (error: any) {
      alert('Erreur lors de la suppression');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    return `${employee?.first_name?.charAt(0) || ''}${employee?.last_name?.charAt(0) || ''}`;
  };

  return (
    <div className="container py-4 py-md-5" style={{ maxWidth: '1000px' }}>
      {/* Bouton Retour */}
      <div className="mb-4">
        <Link to="/employee/dashboard" className="btn btn-link text-decoration-none text-secondary ps-0 d-inline-flex align-items-center">
          <svg className="me-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          Retour au tableau de bord
        </Link>
      </div>

      <div className="row g-4">
        {/* Colonne Gauche : Photo et Actions Rapides */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 text-center p-4 h-100">
            <div className="position-relative mx-auto mb-4" style={{ width: '160px', height: '160px' }}>
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Profil" 
                  className="rounded-circle border border-4 border-white shadow-sm object-fit-cover w-100 h-100"
                />
              ) : (
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center h-100 w-100 fs-1 fw-bold">
                  {getInitials()}
                </div>
              )}
              
              {uploading && (
                <div className="position-absolute top-0 start-0 w-100 h-100 rounded-circle bg-dark bg-opacity-50 d-flex align-items-center justify-content-center text-white">
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                </div>
              )}
            </div>

            <h4 className="fw-bold mb-1">{employee?.first_name} {employee?.last_name}</h4>
            <p className="text-muted small mb-4">{employee?.department?.name || 'Collaborateur'}</p>

            <div className="d-grid gap-2 mb-4">
              <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handlePhotoChange} disabled={uploading} />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="btn btn-primary btn-sm rounded-3 d-flex align-items-center justify-content-center gap-2 py-2"
                disabled={uploading}
              >
                <IconCamera /> Modifier la photo
              </button>
              {previewUrl && (
                <button 
                  onClick={handleDeletePhoto} 
                  className="btn btn-outline-danger btn-sm rounded-3 d-flex align-items-center justify-content-center gap-2 py-2"
                  disabled={uploading}
                >
                  <IconTrash /> Supprimer
                </button>
              )}
            </div>

            <hr className="my-4 opacity-50" />

            <div className="d-grid gap-2">
              <Link to="/employee/my-tasks" className="btn btn-light btn-sm text-start py-2 px-3 border-0 rounded-3 d-flex align-items-center justify-content-between">
                <span>Mes tâches</span>
                <span className="badge bg-primary rounded-pill">Voir</span>
              </Link>
              <Link to="/employee/documents" className="btn btn-light btn-sm text-start py-2 px-3 border-0 rounded-3 d-flex align-items-center justify-content-between">
                <span>Mon dossier</span>
                <span className="badge bg-primary rounded-pill">Voir</span>
              </Link>
              <Link to="/employee/presences" className="btn btn-light btn-sm text-btn btn-light btn-sm text-start py-2 px-3 border-0 rounded-3 d-flex align-items-center justify-content-between py-2 px-3 border-0 rounded-3">
                <span>Mes présences</span>
                <span className="badge bg-primary rounded-pill">Voir</span>
              </Link>
              <Link to="/employee/leave-requests" className="btn btn-light btn-sm text-btn btn-light btn-sm text-start py-2 px-3 border-0 rounded-3 d-flex align-items-center justify-content-between py-2 px-3 border-0 rounded-3">
                <span>Mes congés</span>
                <span className="badge bg-primary rounded-pill">Voir</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Formulaire d'Infos */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4 p-md-5">
              
              <div className="mb-5">
                <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-4">
                  <IconUser /> Informations Personnelles
                </h5>
                <div className="row g-3">
                  <InfoItem label="Prénom" value={employee?.first_name} />
                  <InfoItem label="Nom" value={employee?.last_name} />
                  <InfoItem label="Email professionnel" value={employee?.email} icon={<IconMail />} fullWidth />
                  <InfoItem label="Téléphone" value={employee?.phone || 'Non renseigné'} icon={<IconPhone />} />
                </div>
              </div>

              <div className="pt-4 border-top">
                <h5 className="fw-bold text-dark d-flex align-items-center gap-2 mb-4">
                  <IconBriefcase /> Détails Professionnels
                </h5>
                <div className="row g-3">
                  <InfoItem label="Département" value={employee?.department?.name} />
                  <InfoItem label="Contrat" value={employee?.contract_type ?? undefined} />
                  <InfoItem 
                    label="Date d'embauche" 
                    icon={<IconCalendar />}
                    value={employee?.hire_date ? new Date(employee.hire_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} 
                  />
                  <InfoItem 
                    label="Rémunération" 
                    value={employee?.salary_base ? `${new Intl.NumberFormat('fr-FR').format(employee.salary_base)} FCFA` : 'Non défini'} 
                  />
                </div>
              </div>

              {employee?.roles && employee.roles.length > 0 && (
                <div className="pt-4 mt-4 border-top">
                  <label className="form-label text-muted small fw-bold text-uppercase">Accès & Rôles</label>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {employee.roles.map((role: any) => (
                      <span key={role.id} className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">
                        {role.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon, fullWidth = false }: { label: string; value: string | undefined; icon?: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? "col-12" : "col-12 col-md-6"}>
      <div className="p-3 bg-light rounded-3 border h-100 transition-hover">
        <label className="text-muted small fw-bold text-uppercase d-flex align-items-center gap-2 mb-2">
          {icon} {label}
        </label>
        <div className="text-dark fw-semibold">{value || '---'}</div>
      </div>
    </div>
  );
}