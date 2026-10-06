import React from 'react';
import { Link } from 'react-router-dom';
import { plans } from '../data/plans.js';

export default function PromoPage() {
  return (
    <main style={styles.page}>
      <Link to="/" style={styles.link}>← Retour à PolyScale</Link>
      <header style={styles.header}>
        <span style={styles.eyebrow}>OFFRES DE LANCEMENT</span>
        <h1 style={styles.title}>Choisissez votre plan PolyScale</h1>
        <p style={styles.description}>Des tarifs de lancement clairement affichés, sans remise trompeuse.</p>
      </header>
      <section style={styles.grid}>
        {plans.map((plan) => (
          <article key={plan.key} style={styles.card}>
            <h2 style={styles.plan}>{plan.emoji} {plan.name}</h2>
            <p><del style={styles.regular}>{plan.regularPrice} €</del> <strong style={styles.price}>{plan.price} €/mois</strong></p>
            <p style={styles.discount}>-{plan.discount}%</p>
            <p style={styles.text}>{plan.audience}</p>
            <p style={styles.text}>{plan.blueprintAccessCount} blueprints accessibles ({plan.blueprintCount} {plan.name} supplémentaires inclus)</p>
            <Link to={`/signup?plan=${plan.key}`} style={styles.button}>Choisir ce plan</Link>
          </article>
        ))}
      </section>
    </main>
  );
}

const styles = {
  page: { minHeight: '100vh', padding: '32px 20px', boxSizing: 'border-box', background: '#020817', color: '#e2e8f0', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  link: { color: '#7ae7ff', textDecoration: 'none', fontWeight: 700 },
  header: { textAlign: 'center', margin: '38px auto', maxWidth: 700 },
  eyebrow: { color: '#7ae7ff', fontSize: 12, fontWeight: 700, letterSpacing: '.12em' },
  title: { color: '#f8fafc', fontSize: 'clamp(2rem, 4vw, 3rem)' },
  description: { color: '#cbd5e1' },
  grid: { maxWidth: 1050, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 },
  card: { padding: 22, borderRadius: 16, border: '1px solid rgba(148,163,184,.2)', background: 'rgba(15,23,42,.85)' },
  plan: { color: '#f8fafc' },
  regular: { color: '#94a3b8', marginRight: 8 },
  price: { color: '#f8fafc', fontSize: 22 },
  discount: { color: '#4ade80', fontWeight: 700 },
  text: { color: '#cbd5e1' },
  button: { display: 'inline-block', marginTop: 10, padding: '11px 14px', borderRadius: 9, background: 'linear-gradient(135deg,#4cc9f0,#7ae7ff)', color: '#04111d', fontWeight: 700, textDecoration: 'none' }
};
