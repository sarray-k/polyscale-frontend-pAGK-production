import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Signup() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '', status: 'startup', siret: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      showToast('Veuillez accepter les conditions pour créer votre compte.', 'error');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, form);
      login(res.data.user, res.data.token);
      showToast('Compte créé avec succès. Votre espace Starter est prêt.', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors de l’inscription', 'error');
    }
  };

  return (
    <main style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3>Créez votre compte gratuit</h3>
        {searchParams.get('plan') && <p style={styles.helper}>Vous pourrez choisir cette offre après avoir découvert votre espace Starter.</p>}
        <label style={styles.label}>Adresse e-mail
          <input type="email" autoComplete="email" required placeholder="vous@entreprise.fr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={styles.input} />
        </label>
        <label style={styles.label}>Mot de passe
          <input type="password" autoComplete="new-password" required minLength={8} placeholder="8 caractères minimum" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={styles.input} />
        </label>
        <label style={styles.label}>SIRET <span style={styles.helper}>(optionnel)</span>
          <input type="text" inputMode="numeric" autoComplete="off" placeholder="Votre numéro SIRET" value={form.siret} onChange={(e) => setForm({ ...form, siret: e.target.value })} style={styles.input} />
        </label>
        <label style={styles.label}>Votre profil
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={styles.input}>
            <option value="startup">Startup</option>
            <option value="scale-up">Scale-up</option>
            <option value="enterprise">Entreprise</option>
          </select>
        </label>
        <label style={styles.terms}>
          <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} required />
          J’accepte les conditions générales d’utilisation.
        </label>
        <button type="submit" style={styles.button}>Créer mon compte gratuit</button>
        <div style={styles.separator}>Ou essayer sans inscription</div>
        <Link to="/login?demo=1" style={styles.demoButton}>Essayer en mode démo →</Link>
        <p style={styles.helper}>Déjà inscrit ? <Link to="/login" style={styles.link}>Se connecter</Link></p>
      </form>
    </main>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'grid', alignItems: 'center', background: '#020817', color: '#f8fafc', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  form: { display: 'grid', gap: 14, width: 'min(460px, calc(100% - 40px))', margin: '40px auto', padding: 24, borderRadius: 16, border: '1px solid #334155', background: '#111827', color: '#f8fafc', boxSizing: 'border-box' },
  label: { display: 'grid', gap: 7, color: '#cbd5e1', fontSize: 14, fontWeight: 600 },
  input: { width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#fff' },
  button: { background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', cursor: 'pointer', fontWeight: 700 },
  demoButton: { color: '#7ae7ff', border: '1px solid #334155', borderRadius: 8, padding: 12, textAlign: 'center', textDecoration: 'none' },
  terms: { display: 'flex', alignItems: 'center', gap: 9, color: '#cbd5e1', fontSize: 13 },
  separator: { textAlign: 'center', color: '#94a3b8', fontSize: 13 },
  helper: { color: '#94a3b8', margin: 0, fontSize: 13 },
  link: { color: '#7ae7ff' }
};
