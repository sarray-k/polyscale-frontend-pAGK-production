import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Signup() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '', status: 'startup', siret: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, form);
      login(res.data.user, res.data.token);
      showToast('Compte créé avec succès', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors de l’inscription', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3>Inscription</h3>
      <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={styles.input} />
      <input type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={styles.input} />
      <input type="text" placeholder="SIRET" value={form.siret} onChange={(e) => setForm({ ...form, siret: e.target.value })} style={styles.input} />
      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={styles.input}>
        <option value="startup">Startup</option>
        <option value="scale-up">Scale-up</option>
        <option value="enterprise">Enterprise</option>
      </select>
      <button type="submit" style={styles.button}>Créer mon compte</button>
    </form>
  );
}

const styles = {
  form: { display: 'grid', gap: 12 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#fff' },
  button: { background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 12px', cursor: 'pointer' }
};
