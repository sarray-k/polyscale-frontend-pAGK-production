import React from 'react';

const WIDTH = 320;
const HEIGHT = 100;
const PADDING = { top: 10, right: 8, bottom: 20, left: 8 };

export default function MetricsChart({ title, unit, color, points, valueKey, fixedMax }) {
  const values = points
    .map((point) => point[valueKey])
    .filter((value) => Number.isFinite(value));
  const width = WIDTH - PADDING.left - PADDING.right;
  const height = HEIGHT - PADDING.top - PADDING.bottom;
  const max = Math.max(fixedMax || 1, Math.max(1, ...values) * 1.1);
  const coordinates = points.flatMap((point, index) => {
    const value = point[valueKey];
    if (!Number.isFinite(value)) return [];
    const x = PADDING.left + (points.length > 1 ? (index / (points.length - 1)) * width : width);
    const y = PADDING.top + height - (Math.min(value, max) / max) * height;
    return [{ x, y }];
  });
  const path = coordinates.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const latest = values.at(-1);
  const firstTime = points[0]?.timestamp;
  const lastTime = points.at(-1)?.timestamp;

  return (
    <div style={styles.card}>
      <div style={styles.heading}>
        <strong>{title}</strong>
        <span style={{ color }}>{latest == null ? '—' : `${latest.toFixed(unit === 'ms' ? 0 : 1)} ${unit}`}</span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${title} : ${values.length < 2 ? 'historique en cours de constitution' : `${values.length} mesures récentes`}`}
        style={styles.chart}
        preserveAspectRatio="none"
      >
        {[0, 0.5, 1].map((ratio) => {
          const y = PADDING.top + height * ratio;
          return <line key={ratio} x1={PADDING.left} y1={y} x2={WIDTH - PADDING.right} y2={y} stroke="rgba(148,163,184,0.16)" />;
        })}
        {path && <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
        {coordinates.length === 1 && <circle cx={coordinates[0].x} cy={coordinates[0].y} r="3.5" fill={color} />}
      </svg>
      <div style={styles.axis}>
        <span>{firstTime ? new Date(firstTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}</span>
        <span>{values.length < 2 ? 'En attente de mesures' : `${values.length} mesures`}</span>
        <span>{lastTime ? new Date(lastTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    minWidth: 0,
    padding: 12,
    borderRadius: 10,
    background: 'rgba(2,8,23,0.6)',
    border: '1px solid rgba(148,163,184,0.12)'
  },
  heading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    color: '#e2e8f0',
    fontSize: 13
  },
  chart: {
    display: 'block',
    width: '100%',
    height: 100,
    marginTop: 8,
    overflow: 'visible'
  },
  axis: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 6,
    color: '#94a3b8',
    fontSize: 10
  }
};
