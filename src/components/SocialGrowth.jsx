import React, { useCallback, useEffect, useMemo, useState } from 'react';

const TABS = [
  { key: 'links', label: 'Liens & QR' },
  { key: 'content', label: 'Contenu IA' },
  { key: 'bio', label: 'Link-in-bio' },
  { key: 'ambassadors', label: 'Ambassadeurs' },
  { key: 'promo', label: 'Codes promo' },
  { key: 'attribution', label: 'Attribution' },
  { key: 'insights', label: 'Recommandations' }
];

const money = (n) => `${Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

// Neutralise l'injection de formules dans les tableurs
const csvCell = (v) => {
  let t = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return `"${t.replace(/"/g, '""')}"`;
};
function downloadCsv(filename, headers, rows) {
  const body = [headers, ...rows].map((r) => r.map(csvCell).join(';')).join('\n');
  const url = URL.createObjectURL(new Blob(['\ufeff' + body], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function RevenueBars({ rows }) {
  const max = Math.max(1, ...rows.map((r) => Number(r.revenue) || 0));
  return (
    <div style={{ display: 'grid', gap: 6, margin: '8px 0 14px' }}>
      {rows.map((r) => (
        <div key={r.platform} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 90px', gap: 8, alignItems: 'center', fontSize: 12 }}>
          <span>{r.platform}</span>
          <div style={css.bar}><div style={{ ...css.barFill, width: `${Math.round(((Number(r.revenue) || 0) / max) * 100)}%` }} /></div>
          <span style={{ textAlign: 'right' }}>{money(r.revenue)}</span>
        </div>
      ))}
    </div>
  );
}

function QrImage({ api, linkId, format = 'png' }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let url;
    let cancelled = false;
    api.blob(`/api/growth/links/${linkId}/qr?format=${format}`)
      .then((b) => { if (!cancelled) { url = URL.createObjectURL(b); setSrc(url); } })
      .catch(() => {});
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [api, linkId, format]);
  return src ? <img src={src} alt="QR code" style={css.qr} /> : <div style={css.qr} />;
}

function Quota({ label, used, max }) {
  const pct = max ? Math.min(100, Math.round((used / max) * 100)) : 0;
  return (
    <div style={css.quota}>
      <div style={css.quotaHead}><span>{label}</span><strong>{used}/{max}</strong></div>
      <div style={css.bar}><div style={{ ...css.barFill, width: `${pct}%`, background: pct >= 90 ? '#f87171' : '#4cc9f0' }} /></div>
      {pct >= 80 && <small style={{ color: pct >= 100 ? '#f87171' : '#fbbf24' }}>{pct >= 100 ? 'Quota atteint' : `Bientôt atteint (${pct} %)`}</small>}
    </div>
  );
}

export default function SocialGrowth({ token, apiUrl }) {
  const [tab, setTab] = useState('links');
  const [config, setConfig] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [kpis, setKpis] = useState(null);
  const [links, setLinks] = useState([]);
  const [ambassadors, setAmbassadors] = useState([]);
  const [promos, setPromos] = useState([]);
  const [attribution, setAttribution] = useState(null);
  const [insights, setInsights] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [selectedLink, setSelectedLink] = useState(null);

  const api = useMemo(() => {
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const call = async (method, path, body) => {
      const res = await fetch(`${apiUrl}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { const e = new Error(data.error || `Erreur ${res.status}`); e.code = data.code; throw e; }
      return data;
    };
    return {
      get: (p) => call('GET', p),
      post: (p, b) => call('POST', p, b || {}),
      put: (p, b) => call('PUT', p, b),
      patch: (p, b) => call('PATCH', p, b),
      blob: async (p) => {
        const res = await fetch(`${apiUrl}${p}`, { headers: { Authorization: headers.Authorization } });
        if (!res.ok) throw new Error('QR indisponible');
        return res.blob();
      }
    };
  }, [token, apiUrl]);

  const guard = useCallback(async (fn) => {
    setError('');
    try { return await fn(); } catch (e) {
      if (e.code === 'PLAN_NOT_INCLUDED') setBlocked(true); else setError(e.message);
      return undefined;
    }
  }, []);

  const reload = useCallback(() => guard(async () => {
    const [cfg, k, l, a, p, po, pl] = await Promise.all([
      api.get('/api/growth/config'), api.get('/api/growth/kpis'), api.get('/api/social/links'),
      api.get('/api/growth/ambassadors'), api.get('/api/growth/promo-codes'),
      api.get('/api/growth/payouts'), api.get('/api/social/platforms')
    ]);
    setConfig(cfg); setKpis(k); setLinks(l); setAmbassadors(a); setPromos(p); setPayouts(po); setPlatforms(pl);
  }), [api, guard]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (!config) return;
    if (tab === 'attribution') guard(async () => setAttribution(await api.get('/api/growth/attribution')));
    if (tab === 'insights') guard(async () => setInsights(await api.get('/api/growth/recommendations')));
  }, [tab, config, api, guard]);

  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 3500); };

  if (blocked) {
    return (
      <section style={css.panel}>
        <h3 style={css.h3}>Social Growth & Ambassadeurs</h3>
        <p style={css.muted}>Ce module n'est pas inclus dans votre plan actuel. Passez à un plan compatible depuis l'onglet Billing.</p>
      </section>
    );
  }
  if (!config) {
    return <section style={css.panel}>{error ? <p style={css.err}>{error}</p> : <p style={css.muted}>Chargement…</p>}</section>;
  }

  const allowedPlatforms = platforms.filter((p) => config.tracking.platforms.includes(p.id));

  return (
    <div style={css.root}>
      <header style={css.zoneHeader}>
        <div>
          <h3 style={css.h3}>Social Growth & Ambassadeurs</h3>
          <p style={css.muted}>Plan {config.label} · chaque client peut devenir un ambassadeur rémunéré à la performance.</p>
        </div>
        <button style={css.ghost} onClick={reload}>Actualiser</button>
      </header>

      {(error || notice) && <div style={error ? css.alertErr : css.alertOk} role="status">{error || notice}</div>}

      <section style={css.kpiZone} aria-label="KPI">
        {[
          ['Ambassadeurs actifs', kpis?.activeAmbassadors ?? 0],
          ['Taux de partage', `${kpis?.shareRate ?? 0} %`],
          ['Clics trackés', kpis?.trackedClicks ?? 0],
          ['Conversion', `${kpis?.conversionRate ?? 0} %`],
          ['Revenu / ambassadeur', money(kpis?.revenuePerAmbassador)],
          ['Coût affilié / revenu', `${kpis?.cacVsAffiliateRevenue ?? 0} %`]
        ].map(([label, value]) => (
          <div key={label} style={css.kpi}><span style={css.kpiLabel}>{label}</span><strong style={css.kpiValue}>{value}</strong></div>
        ))}
      </section>

      <div style={css.mainZone}>
        <div style={css.workZone}>
          <nav style={css.tabs} role="tablist">
            {TABS.map((t) => (
              <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                style={tab === t.key ? { ...css.tab, ...css.tabActive } : css.tab}>{t.label}</button>
            ))}
          </nav>
          <div style={css.panel}>
            {tab === 'links' && <LinksTab {...{ api, config, links, allowedPlatforms, guard, reload, flash, selectedLink, setSelectedLink }} />}
            {tab === 'content' && <ContentTab {...{ api, config, links, allowedPlatforms, guard, reload, flash }} />}
            {tab === 'bio' && <BioTab {...{ api, config, guard, flash }} />}
            {tab === 'ambassadors' && <AmbassadorsTab {...{ api, config, ambassadors, payouts, guard, reload, flash }} />}
            {tab === 'promo' && <PromoTab {...{ api, config, promos, ambassadors, guard, reload, flash }} />}
            {tab === 'attribution' && <AttributionTab data={attribution} />}
            {tab === 'insights' && <InsightsTab data={insights} config={config} />}
          </div>
        </div>

        <aside style={css.sideZone} aria-label="Quotas du plan">
          <div style={css.panel}>
            <h4 style={css.h4}>Quotas du plan</h4>
            <Quota label="Liens trackés" used={links.length} max={config.tracking.maxLinks} />
            <Quota label="Ambassadeurs" used={ambassadors.length} max={config.affiliate.maxAmbassadors} />
            <Quota label="Codes promo" used={promos.length} max={config.affiliate.promoCodes.maxCodes} />
            <p style={css.small}>Contenu IA : {config.aiContent.generationsPerMonth} générations / mois.</p>
            <p style={css.small}>Commission max : {config.affiliate.maxCommissionPercent} % · remise max : {config.affiliate.promoCodes.maxDiscountPercent} %.</p>
            <p style={css.small}>Paiement automatique dès {config.affiliate.payouts.minThresholdEur} €.</p>
          </div>
          <div style={css.panel}>
            <h4 style={css.h4}>Paliers</h4>
            {config.affiliate.tiers.map((t) => (
              <div key={t.name} style={css.tierRow}><span>{t.name}</span><span style={css.muted}>≥ {t.minConversions} ventes · {t.commissionPercent} %</span></div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function LinksTab({ api, config, links, allowedPlatforms, guard, reload, flash, selectedLink, setSelectedLink }) {
  const [form, setForm] = useState({ source: 'instagram', campaign: 'default', target: '/' });
  const [format, setFormat] = useState('png');
  const create = () => guard(async () => {
    await api.post('/api/social/links', form);
    flash('Lien créé'); await reload();
  });
  return (
    <>
      <div style={css.formRow}>
        <select style={css.input} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
          {allowedPlatforms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input style={css.input} placeholder="Campagne" value={form.campaign} onChange={(e) => setForm({ ...form, campaign: e.target.value })} />
        <input style={css.input} placeholder={config.tracking.deepLinks ? '/page ou deep link' : '/page'} value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
        <button style={css.primary} onClick={create}>Créer le lien</button>
      </div>
      <p style={css.small}>UTM ajoutés automatiquement : utm_source, utm_medium=social, utm_campaign.</p>
      <div style={css.tableWrap}>
        <table style={css.table}>
          <thead><tr>{['Code', 'Source', 'Campagne', 'Clics', 'Ventes', 'URL', ''].map((h) => <th key={h} style={css.th}>{h}</th>)}</tr></thead>
          <tbody>
            {links.length ? links.map((l) => (
              <tr key={l.id}>
                <td style={css.td}>{l.code}</td><td style={css.td}>{l.source}</td><td style={css.td}>{l.campaign}</td>
                <td style={css.td}>{l.clicks || 0}</td><td style={css.td}>{l.conversions || 0}</td>
                <td style={css.td}><a href={l.url} target="_blank" rel="noreferrer" style={css.link}>{l.url}</a></td>
                <td style={css.td}><button style={css.ghost} onClick={() => setSelectedLink(selectedLink === l.id ? null : l.id)}>QR</button></td>
              </tr>
            )) : <tr><td colSpan="7" style={{ ...css.td, ...css.muted }}>Aucun lien pour le moment.</td></tr>}
          </tbody>
        </table>
      </div>
      {selectedLink && (
        <div style={css.qrBox}>
          <QrImage api={api} linkId={selectedLink} format={format} />
          <div>
            <select style={css.input} value={format} onChange={(e) => setFormat(e.target.value)}>
              {config.tracking.qrFormats.map((f) => <option key={f} value={f}>{f.toUpperCase()}</option>)}
            </select>
            <p style={css.small}>Clic droit → enregistrer l'image.</p>
          </div>
        </div>
      )}
    </>
  );
}

function ContentTab({ links, api, allowedPlatforms, guard, reload, flash }) {
  const [platform, setPlatform] = useState(allowedPlatforms[0]?.id || 'instagram');
  const [linkId, setLinkId] = useState('');
  const [result, setResult] = useState(null);
  const generate = () => guard(async () => {
    setResult(await api.post('/api/social/content', { platform, linkId: linkId || undefined }));
    reload();
  });
  const copy = async () => { await navigator.clipboard?.writeText(result.content); flash('Copié'); };
  return (
    <>
      <div style={css.formRow}>
        <select style={css.input} value={platform} onChange={(e) => setPlatform(e.target.value)}>
          {allowedPlatforms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select style={css.input} value={linkId} onChange={(e) => setLinkId(e.target.value)}>
          <option value="">Lien par défaut</option>
          {links.map((l) => <option key={l.id} value={l.id}>{l.code} · {l.source}</option>)}
        </select>
        <button style={css.primary} onClick={generate}>Générer</button>
      </div>
      {result && (
        <div style={css.resultBox}>
          <pre style={css.pre}>{result.content}</pre>
          <p style={css.small}>{result.content.length}/{result.maxChars} caractères · quota {result.quota.used}/{result.quota.limit}</p>
          <div style={css.formRow}>
            <button style={css.ghost} onClick={copy}>Copier</button>
            {Object.entries(result.directShare).map(([k, u]) => (
              <a key={k} href={u} target="_blank" rel="noreferrer noopener" style={css.chip}>{k}</a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function BioTab({ api, config, guard, flash }) {
  const [page, setPage] = useState({ title: '', bio: '', buttons: [] });
  const [url, setUrl] = useState('');
  const max = config.linkInBio.maxButtons;
  const setBtn = (i, patch) => setPage({ ...page, buttons: page.buttons.map((b, j) => (j === i ? { ...b, ...patch } : b)) });
  const save = () => guard(async () => {
    const r = await api.put('/api/growth/bio', page);
    setUrl(r.url); flash('Page enregistrée');
  });
  return (
    <>
      <div style={css.col}>
        <input style={css.input} placeholder="Titre" maxLength={80} value={page.title} onChange={(e) => setPage({ ...page, title: e.target.value })} />
        <textarea style={{ ...css.input, minHeight: 70 }} placeholder="Bio" maxLength={300} value={page.bio} onChange={(e) => setPage({ ...page, bio: e.target.value })} />
        {page.buttons.map((b, i) => (
          <div key={i} style={css.formRow}>
            <input style={css.input} placeholder="Libellé" value={b.label || ''} onChange={(e) => setBtn(i, { label: e.target.value })} />
            <input style={css.input} placeholder="https://…" value={b.url || ''} onChange={(e) => setBtn(i, { url: e.target.value })} />
            <button style={css.ghost} onClick={() => setPage({ ...page, buttons: page.buttons.filter((_, j) => j !== i) })}>✕</button>
          </div>
        ))}
        <div style={css.formRow}>
          <button style={css.ghost} disabled={page.buttons.length >= max} onClick={() => setPage({ ...page, buttons: [...page.buttons, { label: '', url: '' }] })}>+ Bouton ({page.buttons.length}/{max})</button>
          <button style={css.primary} onClick={save}>Enregistrer</button>
        </div>
        {url && <p style={css.small}>Page publique : <a href={url} target="_blank" rel="noreferrer" style={css.link}>{url}</a></p>}
        <p style={css.small}>{config.linkInBio.maxPages} page incluse · branding PolyScale conservé sur votre plan.</p>
      </div>
    </>
  );
}

function AmbassadorsTab({ api, config, ambassadors, payouts, guard, reload, flash }) {
  const [form, setForm] = useState({ name: '', email: '', commissionPercent: config.affiliate.defaultCommissionPercent });
  const add = () => guard(async () => {
    await api.post('/api/growth/ambassadors', { ...form, commissionPercent: Number(form.commissionPercent) });
    setForm({ ...form, name: '', email: '' }); flash('Ambassadeur ajouté'); await reload();
  });
  const toggle = (a) => guard(async () => {
    await api.patch(`/api/growth/ambassadors/${a.id}`, { status: a.status === 'active' ? 'paused' : 'active' });
    await reload();
  });
  const setPayout = (id, status) => guard(async () => {
    if (status === 'paid' && !window.confirm('Confirmer que ce paiement a bien été versé ?')) return;
    await api.patch(`/api/growth/payouts/${id}`, { status });
    flash(status === 'paid' ? 'Paiement marqué comme versé' : 'Paiement annulé'); await reload();
  });
  const runPayouts = () => guard(async () => {
    const r = await api.post('/api/growth/payouts/run', {});
    flash(r.payouts.length ? `${r.payouts.length} paiement(s) créé(s)` : `Aucun solde ≥ ${r.threshold} €`);
    await reload();
  });
  return (
    <>
      <div style={css.formRow}>
        <input style={css.input} placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input style={css.input} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input style={{ ...css.input, maxWidth: 110 }} type="number" min="1" max={config.affiliate.maxCommissionPercent} value={form.commissionPercent} onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })} title="Commission %" />
        <button style={css.primary} onClick={add}>Inviter</button>
      </div>
      <div style={css.tableWrap}>
        <table style={css.table}>
          <thead><tr>{['Ambassadeur', 'Palier', 'Clics', 'Ventes', 'CA', 'Gains', 'Solde', ''].map((h) => <th key={h} style={css.th}>{h}</th>)}</tr></thead>
          <tbody>
            {ambassadors.length ? ambassadors.map((a) => (
              <tr key={a.id}>
                <td style={css.td}>{a.name}<br /><span style={css.small}>{a.code} · <a href={`/ambassador/${a.code}`} target="_blank" rel="noopener noreferrer" style={{ color: '#7dd3fc' }}>espace</a></span></td>
                <td style={css.td}>{a.tier}</td><td style={css.td}>{a.clicks}</td><td style={css.td}>{a.conversions}</td>
                <td style={css.td}>{money(a.revenue)}</td><td style={css.td}>{money(a.earned)}</td><td style={css.td}>{money(a.balance)}</td>
                <td style={css.td}><button style={css.ghost} onClick={() => toggle(a)}>{a.status === 'active' ? 'Pause' : 'Activer'}</button></td>
              </tr>
            )) : <tr><td colSpan="8" style={{ ...css.td, ...css.muted }}>Aucun ambassadeur.</td></tr>}
          </tbody>
        </table>
      </div>
      <div style={css.formRow}>
        <button style={css.primary} onClick={runPayouts}>Générer les paiements</button>
        <button style={css.ghost} onClick={() => downloadCsv('ambassadeurs.csv', ['Nom', 'Code', 'Palier', 'Clics', 'Ventes', 'CA', 'Gains', 'Solde', 'Statut'], ambassadors.map((a) => [a.name, a.code, a.tier, a.clicks, a.conversions, a.revenue, a.earned, a.balance, a.status]))}>Export CSV ambassadeurs</button>
        <button style={css.ghost} onClick={() => downloadCsv('paiements.csv', ['ID', 'Ambassadeur', 'Montant (€)', 'Méthode', 'Statut', 'Date'], payouts.map((x) => [x.id, x.ambassador_id, (x.amount_cents / 100).toFixed(2), x.method, x.status, x.created_at]))}>Export CSV paiements</button>
        <span style={css.small}>{payouts.length} paiement(s) enregistré(s) · versement via {config.affiliate.payouts.methods.join(' / ')}.</span>
      </div>
      {payouts.length > 0 && (
        <div style={css.tableWrap}>
          <h4 style={css.h4}>Paiements</h4>
          <table style={css.table}>
            <thead><tr>{['#', 'Ambassadeur', 'Montant', 'Méthode', 'Statut', 'Date', ''].map((h) => <th key={h} style={css.th}>{h}</th>)}</tr></thead>
            <tbody>
              {payouts.map((x) => (
                <tr key={x.id}>
                  <td style={css.td}>{x.id}</td>
                  <td style={css.td}>{ambassadors.find((a) => a.id === x.ambassador_id)?.name || x.ambassador_id}</td>
                  <td style={css.td}>{money(x.amount_cents / 100)}</td>
                  <td style={css.td}>{x.method}</td>
                  <td style={css.td}>{x.status}</td>
                  <td style={css.td}>{x.created_at}</td>
                  <td style={css.td}>
                    {x.status === 'pending' && (
                      <>
                        <button style={css.ghost} onClick={() => setPayout(x.id, 'paid')}>Marquer versé</button>{' '}
                        <button style={css.ghost} onClick={() => setPayout(x.id, 'cancelled')}>Annuler</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function PromoTab({ api, config, promos, ambassadors, guard, reload, flash }) {
  const [form, setForm] = useState({ code: '', discountPercent: 10, ambassadorId: '' });
  const add = () => guard(async () => {
    await api.post('/api/growth/promo-codes', {
      code: form.code || undefined, discountPercent: Number(form.discountPercent), ambassadorId: form.ambassadorId || undefined
    });
    setForm({ ...form, code: '' }); flash('Code créé'); await reload();
  });
  return (
    <>
      <div style={css.formRow}>
        <input style={css.input} placeholder="CODE (auto si vide)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        <input style={{ ...css.input, maxWidth: 110 }} type="number" min="1" max={config.affiliate.promoCodes.maxDiscountPercent} value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: e.target.value })} title="Remise %" />
        <select style={css.input} value={form.ambassadorId} onChange={(e) => setForm({ ...form, ambassadorId: e.target.value })}>
          <option value="">Sans ambassadeur</option>
          {ambassadors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <button style={css.primary} onClick={add}>Créer</button>
      </div>
      <div style={css.tableWrap}>
        <table style={css.table}>
          <thead><tr>{['Code', 'Remise', 'Ambassadeur', 'Utilisations'].map((h) => <th key={h} style={css.th}>{h}</th>)}</tr></thead>
          <tbody>
            {promos.length ? promos.map((p) => (
              <tr key={p.id}>
                <td style={css.td}>{p.code}</td><td style={css.td}>{p.discount_percent} %</td>
                <td style={css.td}>{ambassadors.find((a) => a.id === p.ambassador_id)?.name || '—'}</td><td style={css.td}>{p.uses}</td>
              </tr>
            )) : <tr><td colSpan="4" style={{ ...css.td, ...css.muted }}>Aucun code promo.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AttributionTab({ data }) {
  if (!data) return <p style={css.muted}>Chargement…</p>;
  const Table = ({ title, rows, cols }) => (
    <div style={css.tableWrap}>
      <h4 style={css.h4}>{title}</h4>
      <table style={css.table}>
        <thead><tr>{cols.map(([h]) => <th key={h} style={css.th}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((r, i) => <tr key={i}>{cols.map(([h, f]) => <td key={h} style={css.td}>{f(r)}</td>)}</tr>)
            : <tr><td colSpan={cols.length} style={{ ...css.td, ...css.muted }}>Pas encore de données.</td></tr>}
        </tbody>
      </table>
    </div>
  );
  return (
    <>
      <p style={css.small}>Période : {data.periodDays} jours · fenêtre d'attribution : {data.conversionWindowDays} jours.</p>
      <RevenueBars rows={data.byPlatform} />
      <div style={css.formRow}>
        <button style={css.ghost} onClick={() => downloadCsv('attribution-plateformes.csv', ['Plateforme', 'Clics', 'Leads', 'Ventes', 'CA', 'Conversion %'], data.byPlatform.map((r) => [r.platform, r.clicks, r.leads, r.sales, r.revenue, r.conversionRate]))}>Export CSV</button>
      </div>
      <Table title="Par plateforme" rows={data.byPlatform} cols={[['Plateforme', (r) => r.platform], ['Clics', (r) => r.clicks], ['Leads', (r) => r.leads], ['Ventes', (r) => r.sales], ['CA', (r) => money(r.revenue)], ['Conv.', (r) => `${r.conversionRate} %`]]} />
      <Table title="Par contenu" rows={data.byContent} cols={[['Contenu', (r) => r.content], ['Ventes', (r) => r.sales], ['CA', (r) => money(r.revenue)]]} />
      <Table title="Par ambassadeur" rows={data.byAmbassador} cols={[['Ambassadeur', (r) => r.name], ['Ventes', (r) => r.sales], ['CA', (r) => money(r.revenue)]]} />
    </>
  );
}

function InsightsTab({ data, config }) {
  if (!data) return <p style={css.muted}>Chargement…</p>;
  if (!data.ready) return <p style={css.muted}>{data.message}</p>;
  return (
    <div style={css.grid2}>
      <div>
        <h4 style={css.h4}>Meilleurs canaux</h4>
        {(data.bestChannels || []).map((c) => <div key={c.platform} style={css.tierRow}><span>{c.platform}</span><span style={css.muted}>{c.rate ?? 0} % · {c.clicks} clics</span></div>)}
      </div>
      <div>
        <h4 style={css.h4}>Meilleures heures de clic</h4>
        {(data.bestHours || []).map((h) => <div key={h.hour} style={css.tierRow}><span>{String(h.hour).padStart(2, '0')}h (UTC)</span><span style={css.muted}>{h.clicks} clics</span></div>)}
      </div>
      {!config.recommendations.bestFormats && <p style={{ ...css.small, gridColumn: '1 / -1' }}>Les recommandations de formats sont réservées aux plans supérieurs.</p>}
    </div>
  );
}

const border = '1px solid rgba(148,163,184,0.15)';
const css = {
  root: { display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 },
  zoneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  kpiZone: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 },
  kpi: { background: 'rgba(15,23,42,0.8)', border, borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 },
  kpiLabel: { color: '#94a3b8', fontSize: 12 },
  kpiValue: { color: '#f8fafc', fontSize: 22 },
  mainZone: { display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' },
  workZone: { flex: '2 1 520px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 },
  sideZone: { flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 },
  tabs: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  tab: { background: 'transparent', color: '#94a3b8', border, borderRadius: 999, padding: '8px 14px', cursor: 'pointer', fontWeight: 600 },
  tabActive: { background: 'rgba(76,201,240,0.15)', color: '#7ae7ff', borderColor: 'rgba(76,201,240,0.5)' },
  panel: { background: 'rgba(15,23,42,0.8)', border, borderRadius: 18, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 },
  h3: { margin: 0, color: '#f8fafc' },
  h4: { margin: '0 0 8px', color: '#e2e8f0', fontSize: 14 },
  muted: { color: '#94a3b8', margin: 0 },
  small: { color: '#94a3b8', fontSize: 12, margin: 0 },
  err: { color: '#fecaca' },
  alertErr: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(248,113,113,0.5)', color: '#fecaca', borderRadius: 10, padding: '10px 14px' },
  alertOk: { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)', color: '#bbf7d0', borderRadius: 10, padding: '10px 14px' },
  formRow: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  col: { display: 'flex', flexDirection: 'column', gap: 8 },
  input: { flex: '1 1 140px', minWidth: 0, background: 'rgba(2,6,23,0.6)', color: '#e2e8f0', border, borderRadius: 10, padding: '10px 12px' },
  primary: { background: 'linear-gradient(135deg, #4cc9f0, #7ae7ff)', color: '#04111d', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' },
  ghost: { background: 'rgba(148,163,184,0.08)', color: '#e2e8f0', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 10, padding: '8px 12px', fontWeight: 600, cursor: 'pointer' },
  chip: { color: '#7ae7ff', border: '1px solid rgba(76,201,240,0.4)', borderRadius: 999, padding: '4px 10px', fontSize: 12, textDecoration: 'none' },
  link: { color: '#7ae7ff', wordBreak: 'break-all' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', color: '#e2e8f0' },
  th: { textAlign: 'left', color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 10px', borderBottom: border, whiteSpace: 'nowrap' },
  td: { padding: '10px', borderBottom: '1px solid rgba(148,163,184,0.1)', fontSize: 13 },
  qrBox: { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' },
  qr: { width: 140, height: 140, background: '#fff', borderRadius: 8, padding: 6 },
  resultBox: { background: 'rgba(2,6,23,0.5)', border, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 },
  pre: { margin: 0, whiteSpace: 'pre-wrap', color: '#e2e8f0', fontFamily: 'inherit' },
  quota: { display: 'flex', flexDirection: 'column', gap: 4 },
  quotaHead: { display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontSize: 13 },
  bar: { height: 6, borderRadius: 999, background: 'rgba(148,163,184,0.15)', overflow: 'hidden' },
  barFill: { height: '100%' },
  tierRow: { display: 'flex', justifyContent: 'space-between', gap: 8, color: '#e2e8f0', padding: '6px 0', fontSize: 13 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }
};
