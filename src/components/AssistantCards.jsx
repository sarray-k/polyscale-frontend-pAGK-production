import React, { useState } from 'react';

const line = '1px solid #334155';
const ui = {
  card: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 },
  head: { display: 'flex', gap: 12, alignItems: 'center' },
  icon: { fontSize: 30 },
  muted: { color: '#94a3b8', fontSize: 12 },
  details: { fontSize: 12, color: '#cbd5e1', background: '#0f172a', borderRadius: 8, padding: 8 },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  primary: { background: '#14b8a6', color: '#04111d', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, cursor: 'pointer' },
  ghost: { background: 'rgba(148,163,184,0.08)', color: '#e2e8f0', border: '1px solid rgba(148,163,184,0.25)', borderRadius: 8, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, marginTop: 8 },
  mini: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#0f172a', color: '#e2e8f0', border: line, borderRadius: 10, padding: 8, cursor: 'pointer', fontSize: 12 },
  fileList: { margin: 0, paddingLeft: 18, fontSize: 13 },
  iframe: { width: '100%', height: 260, border: line, borderRadius: 8, background: '#fff' },
  progressWrap: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 220 },
  bar: { flex: 1, height: 8, borderRadius: 999, background: '#0f172a', overflow: 'hidden' },
  fill: { height: '100%', background: '#14b8a6', transition: 'width 0.4s' }
};

export function ProgressCard({ pct }) {
  return (
    <div style={ui.progressWrap}>
      <div style={ui.bar}><div style={{ ...ui.fill, width: `${pct}%` }} /></div>
      <span style={ui.muted}>{pct}%</span>
    </div>
  );
}

export function BlueprintCard({ data, upgrade, busy, onDeploy }) {
  const [details, setDetails] = useState(false);
  const bp = data.blueprint;
  return (
    <div style={ui.card}>
      <div style={ui.head}>
        <span style={ui.icon}>{bp.icon}</span>
        <div>
          <strong>{bp.name}</strong>
          <div style={ui.muted}>{bp.description}</div>
          <div style={ui.muted}>📊 Plan requis : {bp.planLabel}</div>
        </div>
      </div>
      {details && <div style={ui.details}>Catégorie : {bp.category} · Identifiant : {bp.id}</div>}
      <div style={ui.actions}>
        {!upgrade && (
          <button type="button" style={ui.primary} disabled={busy} onClick={() => onDeploy(data)}>
            {busy ? 'Déploiement…' : '🚀 Déployer'}
          </button>
        )}
        <button type="button" style={ui.ghost} onClick={() => setDetails(!details)}>Détails</button>
      </div>
    </div>
  );
}

export function BlueprintGrid({ blueprints, disabled, onPick }) {
  return (
    <div style={ui.grid}>
      {blueprints.map((bp) => (
        <button key={bp.id} type="button" style={ui.mini} disabled={disabled} onClick={() => onPick(bp)}>
          <span style={{ fontSize: 20 }}>{bp.icon}</span>
          <span>{bp.name}</span>
        </button>
      ))}
    </div>
  );
}

export function SiteResult({ files, truncated, onOpenEditor }) {
  const [open, setOpen] = useState(false);
  const index = files.find((f) => f.content && (f.path === 'index.html' || /\.html?$/.test(f.path)));
  return (
    <div style={ui.card}>
      <div>✅ {files.length} fichier{files.length > 1 ? 's' : ''} généré{files.length > 1 ? 's' : ''} :</div>
      <ul style={ui.fileList}>{files.map((f) => <li key={f.path}>{f.path}</li>)}</ul>
      {truncated && <div style={ui.muted}>⚠️ Réponse tronquée : certains fichiers peuvent être incomplets.</div>}
      <div style={ui.actions}>
        {onOpenEditor && <button type="button" style={ui.primary} onClick={onOpenEditor}>📝 Ouvrir dans l’éditeur</button>}
        {index && <button type="button" style={ui.ghost} onClick={() => setOpen(!open)}>{open ? 'Masquer l’aperçu' : '👁️ Voir l’aperçu'}</button>}
      </div>
      {open && index && <iframe title="Aperçu du site" sandbox="" srcDoc={index.content} style={ui.iframe} />}
    </div>
  );
}
