import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: 'demo@polyscale.io', password: 'demo123' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, form);
      login(res.data.user, res.data.token);
      showToast('Connexion réussie', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur de connexion', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3>Connexion</h3>
      <small style={styles.helper}>Compte de démonstration : demo@polyscale.io / demo123</small>
      <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={styles.input} />
      <input type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={styles.input} />
      <button type="submit" style={styles.button} disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
}

const styles = {
  form: { display: 'grid', gap: 12 },
  helper: { color: '#7dd3fc', fontSize: 12 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#fff' },
  button: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', opacity: 1 }
};
