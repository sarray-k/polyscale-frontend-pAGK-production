import React, { useMemo } from 'react';

const promotions = [
  { name: 'Startup', discount: 40, slots: 25, remaining: 25 },
  { name: 'Scale-up', discount: 35, slots: 15, remaining: 15 },
  { name: 'Enterprise', discount: 30, slots: 30, remaining: 30 }
];

export default function PromoPage() {
  const items = useMemo(() => promotions, []);

  return (
    <div>
      <h3>Promotions en cours</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {items.map((promo) => (
          <div key={promo.name} style={{ background: '#111827', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
            <h4>{promo.name}</h4>
            <p style={{ fontSize: 24, fontWeight: 'bold', color: '#fbbf24' }}>{promo.discount}%</p>
            <p>Places restantes : <strong>{promo.remaining}</strong> / {promo.slots}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
