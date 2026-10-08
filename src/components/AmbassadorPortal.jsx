import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const eur = (n) => `${Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

export default function AmbassadorPortal({ code }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/growth/portal/${encodeURIComponent(code)}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || 'Espace introuvable');
        setData(d);
      })
      .catch((e) => setError(e.message));
  }, [code]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(data.link); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#0b1220', color: '#e2e8f0', display: 'grid', placeItems: 'center', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ width: '100%', maxWidth: 520, background: '#111827', border: '1px solid #334155', borderRadius: 14, padding: 24 }}>
        <h1 style={{ marginTop: 0, fontSize: 22 }}>Espace ambassadeur</h1>
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
        {!data && !error && <p>Chargement…</p>}
        {data && (
          <>
            <p>Bonjour <strong>{data.name}</strong> · palier <strong>{data.tier}</strong> · commission {data.commissionPercent} %</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, margin: '16px 0' }}>
              {[['Clics', data.clicks], ['Ventes', data.conversions], ['Gains', eur(data.earned)]].map(([l, v]) => (
                <div key={l} style={{ background: '#0f172a', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{l}</div>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
            {data.link && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <code style={{ flex: 1, wordBreak: 'break-all', background: '#0f172a', padding: 8, borderRadius: 8 }}>{data.link}</code>
                <button type="button" onClick={copy} style={{ background: '#14b8a6', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, cursor: 'pointer' }}>
                  {copied ? 'Copié ✓' : 'Copier'}
                </button>
              </div>
            )}
            {data.promoCodes?.length > 0 && (
              <p style={{ fontSize: 13 }}>Vos codes promo : {data.promoCodes.map((c) => `${c.code} (-${c.discount_percent} %)`).join(', ')}</p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
