import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { plans } from '../data/plans.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Pricing() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('');
  const [busyPlan, setBusyPlan] = useState('');
  const [promoCode, setPromoCode] = useState('');

  const handleSelectPlan = async (planKey) => {
    if (!token) {
      navigate(`/signup?plan=${planKey}`);
      return;
    }

    setBusyPlan(planKey);
    setStatus('');

    try {
      const ref = searchParams.get('ref')?.trim() || '';
      const response = await fetch(`${API_URL}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: planKey,
          ...(promoCode.trim() ? { promoCode: promoCode.trim() } : {}),
          ...(ref ? { ref } : {})
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'La création du paiement a échoué.');
      if (!data.url) throw new Error('Le lien de paiement Stripe est absent de la réponse.');
      window.location.assign(data.url);
    } catch (error) {
      setStatus(error.message || 'Impossible de finaliser ce plan pour le moment.');
    } finally {
      setBusyPlan('');
    }
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.link}>← Retour à PolyScale</Link>
        <Link to="/blueprints" style={styles.link}>Explorer les 50 blueprints</Link>
      </header>
      <section style={styles.intro}>
        <span style={styles.eyebrow}>OFFRES POLYSCALE</span>
        <h1 style={styles.title}>Un plan pour chaque étape</h1>
        <p style={styles.description}>Commencez avec Starter et évoluez quand votre projet grandit.</p>
      </section>
      <section style={styles.promoSection} aria-label="Code promotionnel">
        <label htmlFor="promo-code" style={styles.promoLabel}>Vous avez un code promo ?</label>
        <input
          id="promo-code"
          type="text"
          value={promoCode}
          onChange={(event) => setPromoCode(event.target.value)}
          placeholder="PROMO2026"
          autoComplete="off"
          style={styles.promoInput}
        />
      </section>
      <section style={styles.grid}>
        {plans.map((plan) => (
          <article key={plan.key} style={{ ...styles.card, ...(plan.key === 'scale-up' ? styles.featured : {}) }}>
            {plan.key === 'scale-up' && <span style={styles.recommended}>RECOMMANDÉ</span>}
            <span style={styles.name}>{plan.emoji} {plan.name}</span>
            <div>
              <del style={{ color: '#94a3b8' }}>{plan.regularPrice} €</del>
              <div style={styles.price}>{plan.price} €<small style={styles.perMonth}>/mois</small></div>
              <span style={styles.discount}>-{plan.discount}% · offre de lancement</span>
            </div>
            <p style={styles.audience}>{plan.audience}</p>
            <p style={styles.count}>
              {plan.blueprintAccessCount} blueprints accessibles
              {plan.blueprintCount < plan.blueprintAccessCount && ` · ${plan.blueprintCount} ${plan.name} supplémentaires`}
            </p>
            <ul style={styles.list}>{plan.limits.map((limit) => <li key={limit}>✓ {limit}</li>)}</ul>
            <button type="button" onClick={() => handleSelectPlan(plan.key)} disabled={busyPlan === plan.key} style={styles.button}>
              {busyPlan === plan.key ? 'Redirection vers Stripe…' : `Choisir ${plan.name}`}
            </button>
          </article>
        ))}
      </section>
      {status && <p role="alert" style={styles.error}>{status}</p>}
      <p style={styles.note}>Vous pouvez parcourir le catalogue complet avant de créer un compte.</p>
    </main>
  );
}

const styles = {
  page: { minHeight: '100vh', padding: '28px 20px 64px', boxSizing: 'border-box', background: '#020817', color: '#e2e8f0', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  header: { maxWidth: 1100, margin: '0 auto 40px', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  link: { color: '#7ae7ff', textDecoration: 'none', fontWeight: 700 },
  intro: { textAlign: 'center', marginBottom: 34 },
  eyebrow: { color: '#7ae7ff', fontSize: 12, fontWeight: 700, letterSpacing: '.12em' },
  title: { color: '#f8fafc', fontSize: 'clamp(2rem, 4vw, 3.25rem)', margin: '12px 0' },
  description: { color: '#cbd5e1' },
  promoSection: { maxWidth: 1100, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' },
  promoLabel: { color: '#cbd5e1', fontWeight: 700 },
  promoInput: { width: 180, padding: '10px 12px', border: '1px solid rgba(122,231,255,.45)', borderRadius: 10, background: '#0f172a', color: '#f8fafc', font: 'inherit' },
  grid: { maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18, alignItems: 'stretch' },
  card: { position: 'relative', display: 'flex', flexDirection: 'column', gap: 15, padding: 24, borderRadius: 18, border: '1px solid rgba(148,163,184,.2)', background: 'rgba(15,23,42,.86)' },
  featured: { borderColor: 'rgba(122,231,255,.6)', boxShadow: '0 18px 35px rgba(76,201,240,.12)' },
  recommended: { position: 'absolute', top: 12, right: 14, fontSize: 10, color: '#7ae7ff', fontWeight: 800 },
  name: { fontSize: 19, fontWeight: 800, color: '#f8fafc' },
  price: { fontSize: 38, fontWeight: 800, color: '#f8fafc', marginTop: 4 },
  perMonth: { fontSize: 14, fontWeight: 500, color: '#94a3b8' },
  discount: { color: '#4ade80', fontSize: 13 },
  audience: { minHeight: 42, margin: 0, color: '#cbd5e1' },
  count: { margin: 0, color: '#7ae7ff', fontWeight: 700 },
  list: { listStyle: 'none', padding: 0, margin: '0 0 8px', display: 'grid', gap: 11, color: '#cbd5e1', flex: 1 },
  button: { border: 0, borderRadius: 10, padding: '13px 16px', background: 'linear-gradient(135deg,#4cc9f0,#7ae7ff)', color: '#04111d', fontWeight: 800, cursor: 'pointer' },
  error: { maxWidth: 1100, margin: '20px auto', color: '#fecaca' },
  note: { textAlign: 'center', color: '#94a3b8', marginTop: 30 }
};
