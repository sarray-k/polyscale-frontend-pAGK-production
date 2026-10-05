import { useEffect, useMemo, useState } from 'react';

const normalize = (value) => String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function useListFilter(items, { getText, getStatus, sorters = {} }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('default');

  const statuses = useMemo(
    () => (getStatus ? [...new Set(items.map(getStatus).filter(Boolean))].sort() : []),
    [items, getStatus]
  );

  const filtered = useMemo(() => {
    const needle = normalize(query).trim();
    let result = items.filter((item) => {
      if (status !== 'all' && getStatus && getStatus(item) !== status) return false;
      return !needle || normalize(getText(item)).includes(needle);
    });
    if (sort !== 'default' && sorters[sort]) {
      result = [...result].sort(sorters[sort].compare);
    }
    return result;
  }, [items, query, status, sort, getText, getStatus, sorters]);

  const isFiltered = query.trim() !== '' || status !== 'all' || sort !== 'default';
  const reset = () => {
    setQuery('');
    setStatus('all');
    setSort('default');
  };

  return { query, setQuery, status, setStatus, sort, setSort, statuses, sorters, filtered, total: items.length, isFiltered, reset };
}

export default function FilterBar({ filter, placeholder = 'Rechercher…' }) {
  const { query, setQuery, status, setStatus, sort, setSort, statuses, sorters, filtered, total, isFiltered, reset } = filter;
  const [draft, setDraft] = useState(query);

  // Debounce typing; also follow external resets
  useEffect(() => {
    if (draft === query) return undefined;
    const timer = setTimeout(() => setQuery(draft), 250);
    return () => clearTimeout(timer);
  }, [draft]);
  useEffect(() => {
    setDraft(query);
  }, [query]);

  const sorterKeys = Object.keys(sorters);

  return (
    <div style={barStyles.bar}>
      <input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{ ...barStyles.control, flex: '1 1 220px' }}
      />
      {statuses.length > 1 && (
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrer par statut" style={barStyles.control}>
          <option value="all">Tous les statuts</option>
          {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      )}
      {sorterKeys.length > 0 && (
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Trier" style={barStyles.control}>
          <option value="default">Tri par défaut</option>
          {sorterKeys.map((key) => <option key={key} value={key}>{sorters[key].label}</option>)}
        </select>
      )}
      <small style={{ color: '#94a3b8' }} aria-live="polite">
        {isFiltered ? `${filtered.length} résultat${filtered.length > 1 ? 's' : ''} sur ${total}` : `${total} élément${total > 1 ? 's' : ''}`}
      </small>
      {isFiltered && (
        <button type="button" onClick={reset} style={barStyles.clear}>Effacer les filtres</button>
      )}
    </div>
  );
}

export function NoResults({ filter, colSpan }) {
  if (!filter.isFiltered || filter.filtered.length > 0 || filter.total === 0) return null;
  const content = <span style={{ color: '#94a3b8' }}>Aucun résultat pour ces filtres.</span>;
  return colSpan ? <tr><td colSpan={colSpan} style={{ padding: 16, textAlign: 'center' }}>{content}</td></tr> : <div style={{ padding: 16 }}>{content}</div>;
}

const barStyles = {
  bar: { display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 16 },
  control: {
    background: 'rgba(15, 23, 42, 0.9)',
    color: '#f8fafc',
    border: '1px solid rgba(148,163,184,0.22)',
    borderRadius: 10,
    padding: '9px 12px',
    fontSize: 14,
    boxSizing: 'border-box'
  },
  clear: {
    background: 'transparent',
    color: '#a78bfa',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    textDecoration: 'underline'
  }
};
