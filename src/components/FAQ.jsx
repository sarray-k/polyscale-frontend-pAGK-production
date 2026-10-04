import React, { useState } from 'react';

const items = [
  { q: 'Que fait PolyScale ?', a: 'Il permet de générer, gérer et déployer des blueprints applicatifs sur un cluster Kubernetes.' },
  { q: 'Peut-on intégrer un cluster ?', a: 'Oui, via kubeconfig ou apiServer + token.' },
  { q: 'Le backend est-il sécurisé ?', a: 'Il inclut JWT, validation des entrées et chiffrement des secrets.' },
  { q: 'Est-il possible de personnaliser un blueprint ?', a: 'Oui, via upload Helm ou formulaire et édition de variables.' }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div>
      <h3>FAQ</h3>
      {items.map((item, index) => (
        <div key={item.q} style={{ marginBottom: 12, border: '1px solid #334155', borderRadius: 10, overflow: 'hidden' }}>
          <button
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            style={{ width: '100%', background: '#111827', color: '#fff', border: 'none', padding: '14px 16px', textAlign: 'left', cursor: 'pointer', fontWeight: 700 }}
          >
            {item.q}
          </button>
          {openIndex === index && <p style={{ padding: '0 16px 16px', margin: 0 }}>{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
