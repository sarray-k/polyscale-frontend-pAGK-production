import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const plans = [
  {
    key: 'startup',
    name: 'Startup',
    price: '€29/mois',
    discount: '40%',
    modules: ['1 cluster', 'Blueprints', 'Monitoring', 'Support basic']
  },
  {
    key: 'scale-up',
    name: 'Scale-up',
    price: '€79/mois',
    discount: '35%',
    modules: ['5 clusters', 'CI/CD', 'AI Assistant', 'SLA Premium']
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: '€199/mois',
    discount: '30%',
    modules: ['Clusters illimités', 'RBAC avancé', 'Audit trail', 'Support 24/7']
  }
];

export default function Pricing() {
  const { token } = useAuth();
  const [status, setStatus] = useState('');
  const [busyPlan, setBusyPlan] = useState('');

  const handleSelectPlan = async (planKey) => {
    if (!token) {
      setStatus('Connectez-vous pour choisir un plan.');
      return;
    }

    setBusyPlan(planKey);
    setStatus('');

    try {
      const response = await fetch(`${API_URL}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan: planKey })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'La création du checkout a échoué.');
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setStatus(`Plan ${planKey} réservé en mode preview.`);
    } catch (error) {
      setStatus(error.message || 'Impossible de finaliser ce plan pour le moment.');
    } finally {
      setBusyPlan('');
    }
  };

  return (
    <div>
      <h3>Tarifs</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {plans.map((plan) => (
          <div key={plan.name} style={{ background: '#111827', padding: 20, borderRadius: 12, border: '1px solid #334155' }}>
            <h4>{plan.name}</h4>
            <p style={{ fontSize: 24, fontWeight: 'bold', margin: '12px 0' }}>{plan.price}</p>
            <small style={{ color: '#a5f3fc' }}>Réduction: {plan.discount}</small>
            <ul style={{ marginTop: 16, paddingLeft: 18 }}>
              {plan.modules.map((module) => (
                <li key={module}>{module}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => handleSelectPlan(plan.key)}
              disabled={busyPlan === plan.key}
              style={{
                marginTop: 18,
                width: '100%',
                border: 'none',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #4cc9f0, #7ae7ff)',
                color: '#04111d',
                fontWeight: 700,
                padding: '12px 14px',
                cursor: busyPlan === plan.key ? 'not-allowed' : 'pointer',
                opacity: busyPlan === plan.key ? 0.7 : 1
              }}
            >
              {busyPlan === plan.key ? 'Chargement...' : 'Choisir ce plan'}
            </button>
          </div>
        ))}
      </div>

      {status && (
        <p style={{ marginTop: 16, color: '#bae6fd', minHeight: 24 }}>
          {status}
        </p>
      )}
    </div>
  );
}
