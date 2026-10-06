import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: 'demo@polyscale.io', password: 'demo123' });
  const [loading, setLoading] = useState(false);

  const authenticate = async (credentials) => {
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, credentials);
      login(res.data.user, res.data.token);
      showToast('Connexion réussie', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur de connexion', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    authenticate(form);
  };

  return (
    <main style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <Link to="/" style={styles.link}>← Retour à PolyScale</Link>
        <h3>{searchParams.get('demo') === '1' ? 'Essayer PolyScale en mode démo' : 'Connexion'}</h3>
        <small style={styles.helper}>Compte de démonstration : demo@polyscale.io / demo123</small>
        <input type="email" autoComplete="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={styles.input} />
        <input type="password" autoComplete="current-password" placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={styles.input} />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <button type="button" style={styles.demoButton} disabled={loading} onClick={() => authenticate({ email: 'demo@polyscale.io', password: 'demo123' })}>
          Essayer en mode démo gratuit →
        </button>
        <small style={styles.helper}>Pas encore de compte ? <Link to="/signup" style={styles.link}>Créer un compte</Link></small>
      </form>
    </main>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'grid', alignItems: 'center', background: '#020817', color: '#f8fafc', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  form: { display: 'grid', gap: 12, width: 'min(420px, calc(100% - 40px))', margin: '40px auto', padding: 24, borderRadius: 16, border: '1px solid #334155', background: '#111827', boxSizing: 'border-box' },
  helper: { color: '#7dd3fc', fontSize: 12 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#fff' },
  button: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', opacity: 1 },
  demoButton: { background: 'transparent', color: '#7ae7ff', border: '1px solid #334155', borderRadius: 8, padding: '10px 12px', cursor: 'pointer' },
  link: { color: '#7ae7ff' }
};
