import React, { useEffect, useRef, useState } from 'react';
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

const MAX_STORED_MESSAGES = 50;
const WELCOME = {
  role: 'assistant',
  text: 'Je peux vous aider à générer un blueprint, sécuriser la plateforme ou préparer un plan de production.'
};

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <code key={index} style={codeInlineStyle}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function MessageContent({ text }) {
  const blocks = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push(<pre key={blocks.length} style={codeBlockStyle}>{code.join('\n')}</pre>);
      continue;
    }

    const listMatch = /^\s*(?:[-*]|\d+[.)])\s+/.exec(line);
    if (listMatch) {
      const ordered = /^\s*\d/.test(line);
      const items = [];
      while (i < lines.length && /^\s*(?:[-*]|\d+[.)])\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*(?:[-*]|\d+[.)])\s+/, ''));
        i += 1;
      }
      const ListTag = ordered ? 'ol' : 'ul';
      blocks.push(
        <ListTag key={blocks.length} style={{ margin: '4px 0', paddingLeft: 20, lineHeight: 1.6 }}>
          {items.map((item, index) => <li key={index}>{renderInline(item)}</li>)}
        </ListTag>
      );
      continue;
    }

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const heading = /^#{1,3}\s+(.*)$/.exec(line);
    blocks.push(
      <p key={blocks.length} style={{ margin: '4px 0', lineHeight: 1.6, fontWeight: heading ? 700 : 400 }}>
        {renderInline(heading ? heading[1] : line)}
      </p>
    );
    i += 1;
  }

  return <>{blocks}</>;
}

const codeInlineStyle = { background: '#0f172a', padding: '1px 5px', borderRadius: 4, fontSize: '0.9em' };
const codeBlockStyle = { background: '#0b1220', padding: 10, borderRadius: 8, overflowX: 'auto', fontSize: 12, margin: '6px 0' };
const smallButtonStyle = {
  background: 'transparent',
  color: '#94a3b8',
  border: '1px solid #334155',
  borderRadius: 6,
  padding: '2px 8px',
  cursor: 'pointer',
  fontSize: 11
};

function loadHistory(storageKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (Array.isArray(saved) && saved.length > 0) return saved;
  } catch {
    // stockage corrompu, on repart d'une conversation vide
  }
  return [WELCOME];
}

export default function AIAssistant({ context = {} }) {
  const { token, user } = useAuth();
  const storageKey = `polyscale-ai-chat-${user?.id ?? user?.email ?? 'anon'}`;
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState(() => loadHistory(storageKey));
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history.slice(-MAX_STORED_MESSAGES)));
    } catch {
      // quota dépassé : la conversation reste en mémoire
    }
  }, [history, storageKey]);

  const resetConversation = () => setHistory([WELCOME]);

  const copyMessage = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      setCopiedIndex(null);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    const previousMessages = history
      .filter((entry) => entry.text !== WELCOME.text)
      .slice(-10)
      .map((entry) => ({ role: entry.role, content: entry.text.slice(0, 1500) }));

    setLoading(true);
    setMessage('');
    setHistory((prev) => [...prev, { role: 'user', text: trimmed }]);
    const addReply = (text) => setHistory((prev) => [...prev, { role: 'assistant', text }]);

    try {
      const response = await fetch(`${API_URL}/api/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: trimmed,
          history: previousMessages,
          context: { platform: 'PolyScale', ...context }
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Le service IA est momentanément indisponible.');
      }

      addReply(data.reply || fallbackReply(trimmed));
    } catch (error) {
      addReply(`${fallbackReply(trimmed)}\n\nNote: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', maxWidth: 650 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Assistant IA</h3>
        <button type="button" onClick={resetConversation} disabled={loading} style={smallButtonStyle}>
          Nouvelle conversation
        </button>
      </div>

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

      <div style={{ background: '#111827', borderRadius: 12, padding: 16, border: '1px solid #334155', minHeight: 140, maxHeight: 360, overflowY: 'auto', display: 'grid', gap: 10 }}>
        {history.map((entry, index) => (
          <div
            key={index}
            style={{
              justifySelf: entry.role === 'user' ? 'end' : 'start',
              maxWidth: '85%',
              padding: '8px 12px',
              borderRadius: 10,
              background: entry.role === 'user' ? 'rgba(20, 184, 166, 0.25)' : '#1e293b',
              color: '#e2e8f0'
            }}
          >
            {entry.role === 'assistant' ? <MessageContent text={entry.text} /> : (
              <p style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6 }}>{entry.text}</p>
            )}
            {entry.role === 'assistant' && index > 0 && (
              <button type="button" onClick={() => copyMessage(entry.text, index)} style={{ ...smallButtonStyle, marginTop: 6 }}>
                {copiedIndex === index ? 'Copié ✓' : 'Copier'}
              </button>
            )}
          </div>
        ))}
        {loading && <div style={{ color: '#94a3b8', fontSize: 13 }}>L’assistant réfléchit…</div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
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
