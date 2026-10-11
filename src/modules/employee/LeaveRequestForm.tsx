import { useState, type FormEvent } from 'react';
import { api } from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const Icons = {
    Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    Type: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    Info: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    Send: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    Cancel: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
};

export default function LeaveRequestForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'paid',
        start_date: '',
        end_date: '',
        message: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'danger' } | null>(null);

    // Date du jour au format YYYY-MM-DD pour le "min" des inputs
    const today = new Date().toISOString().split('T')[0];

    const isDirty = formData.start_date !== '' || formData.end_date !== '' || formData.message !== '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCancel = () => {
        if (isDirty) {
            if (!window.confirm("Modifications non enregistrées. Annuler ?")) return;
        }
        navigate('/employee/leave-requests');
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);

        // Validation 1 : Pas de date dans le passé
        if (formData.start_date < today) {
            setMessage({ text: "La date de début ne peut pas être dans le passé.", type: 'danger' });
            return;
        }

        // Validation 2 : Cohérence début/fin
        if (new Date(formData.end_date) < new Date(formData.start_date)) {
            setMessage({ text: "La date de fin doit être après le début.", type: 'danger' });
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/leave-requests', formData); 
            setMessage({ text: "Demande envoyée !", type: 'success' });
            setTimeout(() => navigate('/employee/leave-requests'), 1500);
        } catch (err: any) {
            setMessage({ text: "Erreur lors de l'envoi.", type: 'danger' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8 col-xl-6">
                    
                    <div className="d-flex align-items-center mb-4">
                        <div className="bg-primary text-white p-3 rounded-3 shadow-sm me-3"><Icons.Calendar /></div>
                        <div>
                            <h2 className="h4 mb-0 fw-bold text-dark">Demande de Congé</h2>
                            <p className="text-muted small mb-0">Anticipez vos absences</p>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-4 p-md-5">
                            {message && (
                                <div className={`alert alert-${message.type} border-0 rounded-3 d-flex align-items-center mb-4`}>
                                    <div className="me-2"><Icons.Info /></div>
                                    <div className="small fw-semibold">{message.text}</div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="row g-4">
                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Type</label>
                                        <select className="form-select border-2 py-2" name="type" value={formData.type} onChange={handleChange} required>
                                            <option value="paid">Congé Payé</option>
                                            <option value="sick">Congé Maladie</option>
                                            <option value="unpaid">Sans Solde</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Début</label>
                                        <input 
                                            type="date" 
                                            name="start_date" 
                                            min={today} 
                                            className="form-control border-2 py-2" 
                                            value={formData.start_date} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Fin</label>
                                        <input 
                                            type="date" 
                                            name="end_date" 
                                            min={formData.start_date || today} 
                                            className="form-control border-2 py-2" 
                                            value={formData.end_date} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Message</label>
                                        <textarea name="message" className="form-control border-2 p-3" value={formData.message} onChange={handleChange} rows={3} placeholder="Détails optionnels..." style={{ resize: 'none' }} />
                                    </div>

                                    <div className="col-12 mt-4">
                                        <div className="d-flex gap-3 flex-column flex-sm-row">
                                            <button type="button" onClick={handleCancel} className="btn btn-light flex-grow-1 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 border">
                                                <Icons.Cancel /> Annuler
                                            </button>
                                            <button type="submit" disabled={isLoading} className="btn btn-primary flex-grow-1 py-3 fw-bold d-flex align-items-center justify-content-center gap-2">
                                                {isLoading ? <span className="spinner-border spinner-border-sm"></span> : <Icons.Send />}
                                                <span>Soumettre</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}