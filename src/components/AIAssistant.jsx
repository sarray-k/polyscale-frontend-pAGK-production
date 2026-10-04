import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const quickPrompts = [
  'Crée un blueprint SaaS pour un dashboard B2B avec auth, billing et monitoring.',
  'Quels indicateurs doivent être surveillés pour un cluster de production ?',
  'Propose une architecture multi-tenant sécurisée pour une API de paiement.',
  'Décris le plan de déploiement d’une app web avec PostgreSQL et Redis.'
];

const fallbackReply = (message) => {
  const lower = message.toLowerCase();

  if (lower.includes('blueprint') || lower.includes('saas') || lower.includes('dashboard')) {
    return 'Voici un bon point de départ : 1) frontend statique ou app React, 2) backend API protectrice, 3) PostgreSQL pour les données, 4) Redis pour cache et sessions, 5) observabilité avec Prometheus/Grafana. Le blueprint idéal garde les tenants isolés et les secrets hors du dépôt.';
  }

  if (lower.includes('métr') || lower.includes('monitor') || lower.includes('observ')) {
    return 'Surveillez surtout : latence p95, CPU/mémoire, taux d’erreur, saturation réseau, uptime, saturation disque, et nombre de requêtes par tenant. Mettez des alertes sur seuils critiques et sur anomalie de volume.';
  }

  if (lower.includes('multi') || lower.includes('tenant') || lower.includes('sécur')) {
    return 'Pour un modèle multi-tenant solide : isolation stricte des données, RBAC par rôle, validation systématique des permissions, secrets en variables d’environnement, journaux d’audit, rate limiting et segmentation réseau.';
  }

  if (lower.includes('déploi') || lower.includes('deploy') || lower.includes('prod')) {
    return 'Pour un déploiement produit, utilisez un pipeline CI/CD, build sécurisé, scan des dépendances, env de staging puis production, DNS/TLS, health checks, autoscaling et runbooks de rollback.';
  }

  return 'Je peux vous aider à concevoir un blueprint, sécuriser un tenant, choisir des métriques, ou préparer un plan de déploiement production. Décrivez votre besoin en une phrase.';
};

export default function AIAssistant() {
  const { token } = useAuth();
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('Je peux vous aider à générer un blueprint, sécuriser la plateforme ou préparer un plan de production.');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setReply('Je traite votre demande...');

    try {
      const response = await fetch(`${API_URL}/api/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: trimmed,
          context: {
            platform: 'PolyScale',
            environment: 'production-readiness',
            tenant: 'demo',
            modules: ['dashboard', 'deployments', 'blueprints', 'metrics', 'security']
          }
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Le service IA est momentanément indisponible.');
      }

      setReply(data.reply || fallbackReply(trimmed));
      setMessage('');
    } catch (error) {
      setReply(`${fallbackReply(trimmed)}\n\nNote: ${error.message}`);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', maxWidth: 650 }}>
      <h3 style={{ marginBottom: 12 }}>Assistant IA</h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => setMessage(prompt)}
            style={{
              background: 'rgba(15, 118, 110, 0.18)',
              color: '#d1fae5',
              border: '1px solid rgba(45, 212, 191, 0.35)',
              borderRadius: 999,
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            {prompt.slice(0, 36)}{prompt.length > 36 ? '…' : ''}
          </button>
        ))}
      </div>

      <div style={{ background: '#111827', borderRadius: 12, padding: 16, border: '1px solid #334155', minHeight: 140 }}>
        <p style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6, color: '#e2e8f0' }}>{reply}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Posez une question à l’assistant IA..."
          style={{
            padding: 12,
            borderRadius: 8,
            background: '#0f172a',
            color: '#fff',
            border: '1px solid #334155',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#475569' : '#14b8a6',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600
          }}
        >
          {loading ? 'Analyse en cours...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
}
