import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function BlueprintEditor() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: 'payment-saas', description: '', version: '1.0.0' });
  const [file, setFile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('Landing page SaaS pour un outil de gestion de facturation B2B');
  const [aiType, setAiType] = useState('landing');
  const [aiLanguage, setAiLanguage] = useState('fr');
  const [aiTheme, setAiTheme] = useState('minimal');
  const [aiMultiPage, setAiMultiPage] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [activeFileId, setActiveFileId] = useState(null);
  const [files, setFiles] = useState([]);
  const [contents, setContents] = useState({});

  useEffect(() => {
    if (!token) return;
    fetchFiles();
  }, [token]);

  const fetchFiles = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${API_URL}/api/code/files`, { headers });
      if (!res.ok) return;
      const list = await res.json();
      if (!Array.isArray(list)) return;

      setFiles(list);
      const entries = await Promise.all(
        list.map(async (item) => {
          try {
            const r = await fetch(`${API_URL}/api/code/files/${item.id}`, { headers });
            const row = r.ok ? await r.json() : null;
            return [item.path, row?.content || ''];
          } catch {
            return [item.path, ''];
          }
        })
      );
      setContents(Object.fromEntries(entries));

      if (list.length > 0) {
        const current = list.find((item) => item.id === window.activeFileId);
        const selected = current || list.find((item) => item.path === 'index.html') || list[0];
        setActiveFileId(selected.id);
        window.activeFileId = selected.id;
      }
    } catch (error) {
      console.error('Erreur fetchFiles', error);
    }
  };

  const activeFile = files.find((item) => item.id === activeFileId);

  const selectFile = (id) => {
    setActiveFileId(id);
    window.activeFileId = id;
  };

  const previewHtml = useMemo(() => {
    if (!activeFile || !/\.html?$/i.test(activeFile.path)) return '';
    const dir = activeFile.path.includes('/') ? activeFile.path.slice(0, activeFile.path.lastIndexOf('/') + 1) : '';
    const resolve = (ref) => {
      if (/^(https?:)?\/\//i.test(ref)) return null;
      const clean = ref.replace(/^\.\//, '').replace(/^\//, '');
      return contents[ref.startsWith('/') ? clean : dir + clean] ?? contents[clean] ?? null;
    };
    return (contents[activeFile.path] || '')
      .replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi, (match, href) => {
        const css = resolve(href);
        return css === null ? match : `<style>${css}</style>`;
      })
      .replace(/<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/gi, (match, src) => {
        const js = resolve(src);
        return js === null ? match : `<script>${js.replace(/<\/script/gi, '<\\/script')}</script>`;
      });
  }, [activeFile, contents]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('create blueprint', { ...form, fileName: file?.name || 'none' });
  };

  async function generateWithAI() {
    if (isGenerating || isSuggesting) return;

    if (!token) {
      showToast('Connectez-vous pour générer avec l’IA', 'error');
      return;
    }

    const prompt = aiPrompt.trim();
    if (!prompt) {
      showToast('Décrivez le projet à générer', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      showToast('Génération IA en cours…', 'info');
      const res = await fetch(`${API_URL}/api/code/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt,
          type: aiType,
          language: aiLanguage,
          theme: aiTheme,
          multiPage: aiMultiPage
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Erreur de génération');
      }

      await fetchFiles();
      showToast('✅ Site généré par l’IA', 'success');
    } catch (error) {
      console.error('Erreur generation IA:', error);
      showToast(`Erreur : ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  }

  async function requestSuggestions() {
    if (isGenerating || isSuggesting) return;

    if (!token) {
      showToast('Connectez-vous pour obtenir des suggestions', 'error');
      return;
    }

    const prompt = aiPrompt.trim();
    if (!prompt) {
      showToast('Renseignez le brief pour avoir des suggestions', 'error');
      return;
    }

    setIsSuggesting(true);
    try {
      const res = await fetch(`${API_URL}/api/code/ai/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erreur suggestions');
      setSuggestions(data.suggestions || []);
    } catch (error) {
      showToast(`Erreur suggestions : ${error.message}`, 'error');
    } finally {
      setIsSuggesting(false);
    }
  }

  async function refineWithAI() {
    if (!token) {
      showToast('Connectez-vous pour utiliser le raffinement IA', 'error');
      return;
    }

    if (!refineInstruction.trim() || !activeFileId) {
      showToast('Sélectionnez un fichier et donnez une instruction', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/code/ai/refine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fileId: activeFileId,
          instruction: refineInstruction
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur raffinement');
      }

      setRefineInstruction('');
      window.activeFileId = activeFileId;
      await fetchFiles();
      showToast('✅ Code modifié par l’IA', 'success');
    } catch (error) {
      showToast(`Erreur raffinement : ${error.message}`, 'error');
    }
  }

  async function exportZip() {
    if (!token) {
      showToast('Connectez-vous pour exporter', 'error');
      return;
    }

    try {
      showToast('Préparation du ZIP…', 'info');

      const res = await fetch(`${API_URL}/api/export/zip`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur export');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `polyscale-export-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMenuOpen(false);
      showToast('✅ ZIP téléchargé !', 'success');
    } catch (error) {
      console.error('Erreur export:', error);
      showToast(`Erreur : ${error.message}`, 'error');
    }
  }

  async function showExportPreview() {
    if (!token) {
      showToast('Connectez-vous pour prévisualiser', 'error');
      return;
    }

    setMenuOpen(false);
    setPreviewOpen(true);
    setPreviewData(null);
    setPreviewLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/export/preview`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur aperçu');
      }

      setPreviewData(data);
    } catch (error) {
      setPreviewData({ count: 0, files: [], error: error.message });
    } finally {
      setPreviewLoading(false);
    }
  }

  function closePreview() {
    setPreviewOpen(false);
    setPreviewData(null);
  }

  return (
    <div>
      <div style={styles.toolbarRow}>
        <h3 style={styles.title}>Éditeur de blueprint</h3>

        <div style={styles.exportWrap}>
          <button style={styles.exportButton} onClick={() => setMenuOpen((value) => !value)}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M8 2v8M5 7l3 3 3-3M2 12h12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Exporter
          </button>

          {menuOpen && (
            <div style={styles.exportMenu}>
              <button style={styles.exportMenuButton} onClick={exportZip}>
                <span style={styles.exportIcon}>📦</span>
                <div>
                  <strong style={styles.menuTitle}>Télécharger ZIP</strong>
                  <small style={styles.menuMeta}>Tous les fichiers dans une archive</small>
                </div>
              </button>
              <button style={styles.exportMenuButton} onClick={showExportPreview}>
                <span style={styles.exportIcon}>👁️</span>
                <div>
                  <strong style={styles.menuTitle}>Aperçu</strong>
                  <small style={styles.menuMeta}>Voir ce qui sera exporté</small>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom" style={styles.input} />
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" style={styles.input} rows={4} />
        <input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="Version" style={styles.input} />
        <label style={{ display: 'grid', gap: 8 }}>
          <span>Helm chart (.tgz)</span>
          <input type="file" accept=".tgz" onChange={(e) => setFile(e.target.files[0])} style={styles.fileInput} />
        </label>
        <button type="submit" style={styles.button}>Créer le blueprint</button>
      </form>

      <div style={styles.aiPanel}>
        <h4 style={styles.aiTitle}>IA génération</h4>

        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={4}
          placeholder="Ex : Landing page SaaS pour un outil de gestion de facturation B2B, style premium…"
          style={styles.aiTextArea}
        />

        <div style={styles.aiOptionsRow}>
          <div style={styles.optBlock}>
            <label style={styles.label}>Type</label>
            <select value={aiType} onChange={(e) => setAiType(e.target.value)} style={styles.select}>
              <option value="landing">Landing</option>
              <option value="dashboard">Dashboard</option>
              <option value="portfolio">Portfolio</option>
              <option value="ecommerce">E-commerce</option>
              <option value="blog">Blog</option>
            </select>
          </div>

          <div style={styles.optBlock}>
            <label style={styles.label}>Langue</label>
            <select value={aiLanguage} onChange={(e) => setAiLanguage(e.target.value)} style={styles.select}>
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇬🇧 English</option>
              <option value="es">🇪🇸 Español</option>
              <option value="de">🇩🇪 Deutsch</option>
            </select>
          </div>

          <div style={styles.optBlock}>
            <label style={styles.label}>Thème</label>
            <select value={aiTheme} onChange={(e) => setAiTheme(e.target.value)} style={styles.select}>
              <option value="minimal">Minimal</option>
              <option value="bold">Bold</option>
              <option value="corporate">Corporate</option>
              <option value="creative">Créatif</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1' }}>
          <input type="checkbox" checked={aiMultiPage} onChange={(e) => setAiMultiPage(e.target.checked)} />
          Générer un site multi-pages
        </label>

        <div style={styles.aiActions}>
          <button
            type="button"
            onClick={generateWithAI}
            disabled={isGenerating || isSuggesting}
            style={styles.aiButtonPrimary}
          >
            {isGenerating ? 'Génération en cours…' : 'Générer'}
          </button>
          <button
            type="button"
            onClick={requestSuggestions}
            disabled={isGenerating || isSuggesting}
            style={styles.aiButtonSecondary}
          >
            {isSuggesting ? 'Recherche…' : 'Suggestions'}
          </button>
        </div>

        {suggestions.length > 0 && (
          <div style={styles.suggestionsBox}>
            {suggestions.map((item) => (
              <button
                key={item.title}
                type="button"
                style={styles.suggestionButton}
                onClick={() => setAiPrompt(`${aiPrompt} ${item.description}`.trim())}
              >
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div style={styles.previewPanel}>
          <div style={styles.fileList}>
            {files.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectFile(item.id)}
                style={item.id === activeFileId ? { ...styles.fileTab, ...styles.fileTabActive } : styles.fileTab}
              >
                {getFileIcon(item.path)} {item.path}
              </button>
            ))}
          </div>
          {previewHtml ? (
            <iframe
              title="Aperçu du site généré"
              sandbox="allow-scripts"
              srcDoc={previewHtml}
              style={styles.previewFrame}
            />
          ) : (
            <pre style={styles.codeView}>{contents[activeFile?.path] || ''}</pre>
          )}
        </div>
      )}

      <div style={styles.refineBar}>
        <input
          type="text"
          value={refineInstruction}
          onChange={(e) => setRefineInstruction(e.target.value)}
          style={styles.refineInput}
          placeholder="✨ Demandez une modification : « Rends le header plus sombre », « Ajoute une section pricing »…"
          onKeyDown={(event) => {
            if (event.key === 'Enter') refineWithAI();
          }}
        />
        <button type="button" onClick={refineWithAI} style={styles.refineButton}>Raffiner</button>
      </div>

      {previewOpen && (
        <div style={styles.modalOverlay} onClick={(event) => event.target === event.currentTarget && closePreview()}>
          <div style={styles.modalBox}>
            <div style={styles.modalHead}>
              <h3 style={styles.modalTitle}>Aperçu de l’export</h3>
              <button type="button" onClick={closePreview} style={styles.modalClose}>✕</button>
            </div>

            <div style={styles.modalBody}>
              {previewLoading ? (
                <div style={styles.loading}>Chargement…</div>
              ) : previewData?.error ? (
                <div style={styles.loading}>{previewData.error}</div>
              ) : !previewData || !previewData.count ? (
                <div style={styles.loading}>Aucun fichier à exporter.</div>
              ) : (
                <>
                  <div style={styles.summary}>
                    <strong>{previewData.count}</strong> fichier{previewData.count > 1 ? 's' : ''} —
                    Taille totale : <strong>{previewData.totalSizeHuman}</strong>
                  </div>

                  {previewData.files.map((file) => (
                    <div key={file.path} style={styles.fileRow}>
                      <span style={styles.fileIcon}>{getFileIcon(file.path)}</span>
                      <span style={styles.filePath}>{file.path}</span>
                      <span style={styles.fileSize}>{formatBytes(file.size)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div style={styles.modalFoot}>
              <button type="button" onClick={closePreview} style={styles.btnCancel}>Annuler</button>
              <button type="button" onClick={exportZip} style={styles.btnPrimary}>📦 Télécharger ZIP</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getFileIcon(path) {
  if (path.endsWith('.html')) return '📄';
  if (path.endsWith('.css')) return '🎨';
  if (path.endsWith('.js')) return '⚡';
  if (path.endsWith('.json')) return '📋';
  if (path.endsWith('.md')) return '📖';
  if (path.endsWith('.svg') || path.endsWith('.png')) return '🖼️';
  return '📁';
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

const styles = {
  toolbarRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
    position: 'relative'
  },
  title: { margin: 0, fontSize: 18 },
  exportWrap: { position: 'relative' },
  exportButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid #334155',
    background: '#0f172a',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600
  },
  exportMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    minWidth: 240,
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 10,
    padding: 6,
    boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
    zIndex: 50
  },
  exportMenuButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: '10px 12px',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    color: '#e2e8f0',
    cursor: 'pointer',
    textAlign: 'left'
  },
  exportIcon: { fontSize: 20, flexShrink: 0 },
  menuTitle: { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 2 },
  menuMeta: { display: 'block', fontSize: 11, color: '#94a3b8' },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#fff' },
  fileInput: { color: '#fff' },
  button: { background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 12px', cursor: 'pointer' },
  aiPanel: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    border: '1px solid #334155',
    background: '#0f172a',
    display: 'grid',
    gap: 12
  },
  aiTitle: { margin: 0, fontSize: 16 },
  aiTextArea: { width: '100%', minHeight: 92, padding: 12, borderRadius: 8, border: '1px solid #334155', background: '#020817', color: '#e2e8f0', resize: 'vertical' },
  aiOptionsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 },
  optBlock: { display: 'grid', gap: 6 },
  label: { fontSize: 12, color: '#cbd5e1' },
  select: { padding: '8px 10px', borderRadius: 8, border: '1px solid #334155', background: '#020817', color: '#e2e8f0' },
  aiActions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  aiButtonPrimary: { background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontWeight: 600 },
  aiButtonSecondary: { background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: '10px 16px', cursor: 'pointer' },
  suggestionsBox: { display: 'grid', gap: 8 },
  suggestionButton: { display: 'grid', gap: 4, textAlign: 'left', background: '#111827', border: '1px solid #334155', color: '#e2e8f0', borderRadius: 10, padding: 10, cursor: 'pointer' },
  previewPanel: { marginTop: 20, border: '1px solid #334155', borderRadius: 12, overflow: 'hidden', background: '#0f172a' },
  fileList: { display: 'flex', flexWrap: 'wrap', gap: 6, padding: 10, borderBottom: '1px solid #334155' },
  fileTab: { background: 'transparent', color: '#cbd5e1', border: '1px solid #334155', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 },
  fileTabActive: { background: 'rgba(20, 184, 166, 0.2)', borderColor: '#14b8a6', color: '#fff' },
  previewFrame: { width: '100%', height: 420, border: 'none', background: '#fff', display: 'block' },
  codeView: { margin: 0, padding: 14, maxHeight: 420, overflow: 'auto', color: '#e2e8f0', fontSize: 12 },
  refineBar: { display: 'flex', gap: 8, padding: '10px 14px', background: '#0f172a', borderTop: '1px solid #334155', marginTop: 20 },
  refineInput: { flex: 1, height: 36, padding: '0 12px', border: '1px solid #334155', borderRadius: 8, background: '#020817', color: '#e2e8f0', fontSize: 13 },
  refineButton: { padding: '0 16px', height: 36, background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(2,6,23,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 1000
  },
  modalBox: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 16,
    width: 'min(560px, 90vw)',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
  },
  modalHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 22px',
    borderBottom: '1px solid #334155'
  },
  modalTitle: { margin: 0, fontSize: 16 },
  modalClose: { width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', color: '#cbd5e1', cursor: 'pointer' },
  modalBody: { flex: 1, overflowY: 'auto', padding: '18px 22px' },
  modalFoot: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    padding: '16px 22px',
    borderTop: '1px solid #334155',
    background: '#020817'
  },
  btnCancel: { background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', padding: '9px 16px', borderRadius: 8, cursor: 'pointer' },
  btnPrimary: { background: '#8b5cf6', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 8, cursor: 'pointer' },
  loading: { textAlign: 'center', padding: '32px 16px', color: '#94a3b8' },
  summary: { background: '#111827', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13 },
  fileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    borderBottom: '1px solid #1e293b'
  },
  fileIcon: { fontSize: 16 },
  filePath: { flex: 1, fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 12, overflowWrap: 'anywhere' },
  fileSize: { color: '#94a3b8', fontSize: 11 }
};
