import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { blueprints, blueprintCategories } from '../data/blueprints.js';
import { plans } from '../data/plans.js';

const styles = {
  shell: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, rgba(76,201,240,0.12), rgba(2,8,23,0.95) 40%, #020817 100%)',
    color: '#e2e8f0',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
  },
  main: { maxWidth: 1200, margin: '0 auto', padding: '32px 20px 64px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 36 },
  link: { color: '#7ae7ff', textDecoration: 'none', fontWeight: 700 },
  intro: { textAlign: 'center', marginBottom: 30 },
  title: { color: '#f8fafc', fontSize: 'clamp(2rem, 4vw, 3.5rem)', margin: '12px 0' },
  muted: { color: '#cbd5e1', lineHeight: 1.7 },
  row: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', margin: '18px 0' },
  filter: { background: 'rgba(148,163,184,0.08)', color: '#cbd5e1', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 999, padding: '9px 14px', cursor: 'pointer' },
  active: { background: 'rgba(76,201,240,0.16)', color: '#7ae7ff', borderColor: 'rgba(122,231,255,0.55)' },
  plans: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, margin: '26px 0 34px' },
  plan: { padding: 16, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 14, color: '#e2e8f0', textAlign: 'left', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(235px, 1fr))', gap: 14 },
  card: { display: 'flex', flexDirection: 'column', padding: 18, borderRadius: 14, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(148,163,184,0.18)' },
  badge: { color: '#7ae7ff', fontSize: 12, fontWeight: 700 },
  button: { background: 'linear-gradient(135deg, #4cc9f0, #7ae7ff)', color: '#04111d', border: 0, borderRadius: 9, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' },
  secondary: { background: 'rgba(148,163,184,0.08)', color: '#e2e8f0', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 9, padding: '10px 14px', fontWeight: 600, cursor: 'pointer' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(2,6,23,.78)', display: 'grid', placeItems: 'center', zIndex: 10, padding: 20 },
  modalCard: { width: 'min(520px, 100%)', background: '#0f172a', border: '1px solid rgba(148,163,184,.25)', borderRadius: 18, padding: 24 },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap', marginTop: 22 }
};

export default function BlueprintCatalog() {
  const [category, setCategory] = useState('Tous');
  const [plan, setPlan] = useState('all');
  const [preview, setPreview] = useState(null);

  const visibleBlueprints = useMemo(
    () => blueprints.filter((blueprint) =>
      (category === 'Tous' || blueprint.category === category) &&
      (plan === 'all' || blueprint.plan === plan)
    ),
    [category, plan]
  );

  return (
    <div style={styles.shell}>
      <main style={styles.main}>
        <header style={styles.header}>
          <Link to="/" style={{ ...styles.link, fontSize: 20 }}>PolyScale</Link>
          <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/" style={styles.link}>Accueil</Link>
            <Link to="/pricing" style={styles.link}>Tarifs</Link>
            <Link to="/login" style={styles.link}>Connexion</Link>
          </nav>
        </header>

        <section style={styles.intro}>
          <span style={styles.badge}>CATALOGUE POLYSCALE</span>
          <h1 style={styles.title}>50 blueprints pour lancer votre prochain projet</h1>
          <p style={styles.muted}>Parcourez le catalogue complet et consultez chaque aperçu, sans inscription.</p>
          <div style={styles.row} aria-label="Filtrer par catégorie">
            {['Tous', ...blueprintCategories].map((item) => (
              <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} style={{ ...styles.filter, ...(category === item ? styles.active : {}) }}>
                {item}
              </button>
            ))}
          </div>
          <div style={styles.row} aria-label="Filtrer par plan">
            <button type="button" aria-pressed={plan === 'all'} onClick={() => setPlan('all')} style={{ ...styles.filter, ...(plan === 'all' ? styles.active : {}) }}>Tous les plans</button>
            {plans.map((item) => (
              <button key={item.catalogKey} type="button" aria-pressed={plan === item.catalogKey} onClick={() => setPlan(item.catalogKey)} style={{ ...styles.filter, ...(plan === item.catalogKey ? styles.active : {}) }}>
                {item.emoji} {item.name} ({item.blueprintCount})
              </button>
            ))}
          </div>
        </section>

        <div style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 18 }} role="status">
          {visibleBlueprints.length} blueprint{visibleBlueprints.length > 1 ? 's' : ''} affiché{visibleBlueprints.length > 1 ? 's' : ''} sur {blueprints.length}
        </div>
        <section style={styles.grid} aria-label="Catalogue de blueprints">
          {visibleBlueprints.map((blueprint) => {
            const blueprintPlan = plans.find((item) => item.catalogKey === blueprint.plan);
            return (
              <article key={blueprint.id} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <strong style={{ color: '#f8fafc' }}>{blueprint.icon} {blueprint.name}</strong>
                  <span style={styles.badge}>{blueprintPlan?.emoji} {blueprintPlan?.name}</span>
                </div>
                <p style={{ ...styles.muted, flex: 1 }}>{blueprint.description}</p>
                <span style={{ color: '#94a3b8', fontSize: 12, marginBottom: 14 }}>{blueprint.category}</span>
                {blueprint.compliance && <span style={{ ...styles.badge, marginBottom: 12 }}>{blueprint.compliance}</span>}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" style={styles.secondary} onClick={() => setPreview(blueprint)}>Aperçu</button>
                  <Link to="/signup" style={{ ...styles.button, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Déployer</Link>
                </div>
              </article>
            );
          })}
        </section>
      </main>

      {preview && (
        <div style={styles.modal} onClick={() => setPreview(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="blueprint-preview-title" style={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <span style={styles.badge}>{preview.icon} {preview.category} · {plans.find((item) => item.catalogKey === preview.plan)?.name}</span>
            <h2 id="blueprint-preview-title" style={{ color: '#f8fafc' }}>{preview.name}</h2>
            <p style={styles.muted}>{preview.description}</p>
            {preview.compliance && <p style={styles.muted}>Référentiel indiqué : <strong>{preview.compliance}</strong></p>}
            <p style={styles.muted}>Ce blueprint est inclus dans le plan {plans.find((item) => item.catalogKey === preview.plan)?.name}. Créez un compte pour le déployer.</p>
            <div style={styles.actions}>
              <button type="button" style={styles.secondary} onClick={() => setPreview(null)}>Fermer</button>
              <Link to="/signup" style={{ ...styles.button, textDecoration: 'none' }}>Créer un compte et déployer</Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
