import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_UNPACKED_SIZE = 50 * 1024 * 1024;

function parseChartMetadata(chartYaml) {
  const fields = {};
  for (const key of ['name', 'version', 'description']) {
    const match = new RegExp(`^${key}:\\s*(.*)$`, 'm').exec(chartYaml);
    if (match) fields[key] = match[1].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return fields;
}

async function readChartYaml(file) {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('La prévisualisation .tgz nécessite un navigateur récent.');
  }

  const reader = file.stream().pipeThrough(new DecompressionStream('gzip')).getReader();
  const chunks = [];
  let totalSize = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      totalSize += value.byteLength;
      if (totalSize > MAX_UNPACKED_SIZE) {
        await reader.cancel();
        throw new Error('Le contenu décompressé dépasse la limite de prévisualisation de 50 MB.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const tar = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    tar.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const decoder = new TextDecoder();
  for (let position = 0; position + 512 <= tar.length;) {
    const header = tar.subarray(position, position + 512);
    if (header.every((byte) => byte === 0)) break;

    const name = decoder.decode(header.subarray(0, 100)).replace(/\0.*$/, '');
    const prefix = decoder.decode(header.subarray(345, 500)).replace(/\0.*$/, '');
    const path = prefix ? `${prefix}/${name}` : name;
    const sizeText = decoder.decode(header.subarray(124, 136)).replace(/\0.*$/, '').trim();
    const size = Number.parseInt(sizeText || '0', 8);
    if (!Number.isSafeInteger(size) || size < 0 || position + 512 + size > tar.length) {
      throw new Error('Archive Helm invalide ou tronquée.');
    }

    if (path.split('/').at(-1) === 'Chart.yaml') {
      return decoder.decode(tar.subarray(position + 512, position + 512 + size));
    }

    position += 512 + Math.ceil(size / 512) * 512;
  }

  throw new Error('Le fichier Chart.yaml est introuvable dans cette archive.');
}

export default function BlueprintImport({ onBlueprintCreated }) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [chartYaml, setChartYaml] = useState('');
  const [blueprint, setBlueprint] = useState({});
  const [previewError, setPreviewError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [customBlueprints, setCustomBlueprints] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [viewingBlueprint, setViewingBlueprint] = useState(null);

  const loadCustomBlueprints = useCallback(async () => {
    if (!token) return;
    setIsLoadingList(true);
    setListError('');
    try {
      const response = await fetch(`${API_URL}/api/blueprints/custom`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Impossible de charger vos blueprints importés.');
      if (!Array.isArray(data)) throw new Error('Réponse inattendue du serveur pour les blueprints importés.');
      setCustomBlueprints(data);
    } catch (error) {
      setListError(error.message || 'Impossible de charger vos blueprints importés.');
    } finally {
      setIsLoadingList(false);
    }
  }, [token]);

  useEffect(() => {
    loadCustomBlueprints();
  }, [loadCustomBlueprints]);

  const resetForm = () => {
    setSelectedFile(null);
    setChartYaml('');
    setBlueprint({});
    setPreviewError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = async (file) => {
    if (!/\.(tgz|tar\.gz)$/i.test(file.name)) {
      showToast('Format invalide. Utilisez .tgz ou .tar.gz', 'error');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast('Fichier trop volumineux (maximum 50 MB).', 'error');
      return;
    }

    setSelectedFile(file);
    setChartYaml('');
    setPreviewError('');
    setBlueprint({
      name: file.name.replace(/\.(tgz|tar\.gz)$/i, ''),
      description: '',
      version: ''
    });

    try {
      const yaml = await readChartYaml(file);
      const metadata = parseChartMetadata(yaml);
      setChartYaml(yaml);
      setBlueprint({
        name: metadata.name || file.name.replace(/\.(tgz|tar\.gz)$/i, ''),
        description: metadata.description || '',
        version: metadata.version || ''
      });
    } catch (error) {
      setPreviewError(error.message || 'Impossible de lire le Chart.yaml.');
      showToast(error.message || 'Impossible de lire le Chart.yaml.', 'error');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const createBlueprint = async () => {
    if (!selectedFile) {
      showToast('Aucun fichier sélectionné.', 'error');
      return;
    }
    if (previewError || !blueprint.name) {
      showToast('Le Chart.yaml doit être lisible avant de créer le blueprint.', 'error');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('chart', selectedFile);
    formData.append('name', blueprint.name);
    formData.append('description', blueprint.description);

    try {
      const response = await fetch(`${API_URL}/api/blueprints/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.details) console.error('Détails de validation du chart :', data.details);
        throw new Error(data.error || 'Erreur lors de l’import du blueprint.');
      }

      const created = data.blueprint || data;
      showToast(`Blueprint « ${created.name || blueprint.name} » créé.`, 'success');
      resetForm();
      await loadCustomBlueprints();
      onBlueprintCreated?.();
    } catch (error) {
      showToast(error.message || 'Erreur réseau lors de l’import.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteCustom = async (id) => {
    if (!window.confirm('Supprimer ce blueprint ?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`${API_URL}/api/blueprints/custom/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Impossible de supprimer ce blueprint.');
      showToast('Blueprint supprimé.', 'success');
      await loadCustomBlueprints();
      onBlueprintCreated?.();
    } catch (error) {
      showToast(error.message || 'Impossible de supprimer ce blueprint.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section style={styles.section}>
      {!selectedFile ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Choisir ou déposer un Helm Chart à importer"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{ ...styles.uploadZone, ...(isDragging ? styles.uploadZoneActive : {}) }}
        >
          <div style={{ fontSize: 32 }}>📦</div>
          <h3 style={{ margin: '10px 0 6px', fontSize: 16 }}>Glissez votre Helm Chart ici</h3>
          <p style={{ margin: 0, color: '#94a3b8' }}>ou cliquez pour parcourir</p>
          <small style={{ display: 'block', marginTop: 10, color: '#64748b' }}>Formats acceptés : .tgz, .tar.gz — maximum 50 MB</small>
          <input
            ref={fileInputRef}
            type="file"
            accept=".tgz,.tar.gz"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div style={styles.uploadForm}>
          <div style={styles.uploadPreview}>
            <span style={{ fontSize: 20 }}>📄</span>
            <strong style={{ overflowWrap: 'anywhere' }}>{selectedFile.name}</strong>
            <span style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: 12, flexShrink: 0 }}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>

          <label style={styles.field}>
            <span>Nom du blueprint</span>
            <input readOnly value={blueprint.name || ''} style={styles.input} />
          </label>
          <label style={styles.field}>
            <span>Description</span>
            <textarea readOnly value={blueprint.description || ''} placeholder="Description absente du Chart.yaml" rows={3} style={styles.input} />
          </label>
          {blueprint.version && <div style={{ color: '#94a3b8', fontSize: 12 }}>Version du chart : {blueprint.version}</div>}
          <div style={styles.field}>
            <span>Aperçu du Chart.yaml</span>
            <pre style={styles.chartPreview}>{chartYaml || previewError || 'Analyse du chart…'}</pre>
          </div>
          {previewError && <div role="alert" style={styles.error}>{previewError}</div>}

          <div style={styles.actions}>
            <button type="button" onClick={resetForm} disabled={isUploading} style={styles.secondaryButton}>Annuler</button>
            <button
              type="button"
              onClick={createBlueprint}
              disabled={isUploading || Boolean(previewError) || !chartYaml}
              style={styles.primaryButton}
            >
              {isUploading ? 'Upload en cours…' : '✨ Créer le blueprint'}
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 36 }}>
        <h3 style={{ fontSize: 15, margin: '0 0 16px' }}>
          Mes blueprints importés <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 400 }}>({customBlueprints.length})</span>
        </h3>
        {isLoadingList ? (
          <p style={styles.empty}>Chargement…</p>
        ) : listError ? (
          <div role="alert" style={styles.error}>
            {listError} <button type="button" onClick={loadCustomBlueprints} style={styles.linkButton}>Réessayer</button>
          </div>
        ) : customBlueprints.length === 0 ? (
          <p style={styles.empty}>Aucun blueprint importé.</p>
        ) : (
          customBlueprints.map((item) => (
            <div key={item.id} style={styles.customCard}>
              <span style={{ fontSize: 24 }}>📦</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: 14 }}>{item.name}</strong>
                <small style={{ display: 'block', color: '#94a3b8', margin: '3px 0' }}>v{item.version || '—'}</small>
                <span style={{ color: '#cbd5e1', fontSize: 12 }}>{item.description || 'Sans description'}</span>
              </div>
              <div style={styles.actions}>
                <button type="button" onClick={() => setViewingBlueprint(item)} style={styles.secondaryButton}>Voir</button>
                <button
                  type="button"
                  onClick={() => deleteCustom(item.id)}
                  disabled={deletingId === item.id}
                  style={styles.deleteButton}
                >
                  {deletingId === item.id ? 'Suppression…' : 'Suppr.'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {viewingBlueprint && (
        <div style={styles.modalOverlay} onClick={(event) => event.target === event.currentTarget && setViewingBlueprint(null)}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>{viewingBlueprint.name}</h3>
              <button type="button" onClick={() => setViewingBlueprint(null)} style={styles.linkButton}>Fermer</button>
            </div>
            <p style={{ color: '#94a3b8' }}>Version {viewingBlueprint.version || '—'}</p>
            <p style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>{viewingBlueprint.description || 'Sans description'}</p>
            {viewingBlueprint.created_at && (
              <small style={{ color: '#64748b' }}>
                Importé le {new Date(viewingBlueprint.created_at).toLocaleString('fr-FR')}
              </small>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

const styles = {
  section: { display: 'grid', gap: 18, color: '#e2e8f0' },
  uploadZone: {
    padding: '36px 20px',
    border: '2px dashed #334155',
    borderRadius: 14,
    background: 'rgba(15,23,42,0.5)',
    textAlign: 'center',
    cursor: 'pointer',
    outline: 'none'
  },
  uploadZoneActive: { borderColor: '#38bdf8', background: 'rgba(14,165,233,0.1)' },
  uploadForm: { display: 'grid', gap: 16, maxWidth: 720 },
  uploadPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: 'rgba(2,8,23,0.6)',
    borderRadius: 8,
    fontSize: 13
  },
  field: { display: 'grid', gap: 8, color: '#cbd5e1', fontSize: 13 },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #334155',
    background: '#0f172a',
    color: '#e2e8f0'
  },
  chartPreview: {
    maxHeight: 220,
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    padding: 12,
    borderRadius: 8,
    background: 'rgba(2,8,23,0.8)',
    border: '1px solid #334155',
    color: '#cbd5e1',
    fontSize: 12
  },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  primaryButton: {
    padding: '10px 14px',
    border: 0,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #4cc9f0, #7ae7ff)',
    color: '#04111d',
    fontWeight: 700,
    cursor: 'pointer'
  },
  secondaryButton: {
    padding: '9px 12px',
    border: '1px solid #334155',
    borderRadius: 8,
    background: '#0f172a',
    color: '#cbd5e1',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '9px 12px',
    border: '1px solid rgba(248,113,113,0.4)',
    borderRadius: 8,
    background: 'rgba(127,29,29,0.15)',
    color: '#fca5a5',
    cursor: 'pointer'
  },
  customCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    marginBottom: 10,
    background: 'rgba(15,23,42,0.7)',
    border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: 12
  },
  empty: { textAlign: 'center', color: '#94a3b8', padding: 20 },
  error: { color: '#fca5a5', padding: 12, borderRadius: 8, background: 'rgba(127,29,29,0.16)' },
  linkButton: { border: 0, background: 'transparent', color: '#7ae7ff', cursor: 'pointer', textDecoration: 'underline' },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1100,
    display: 'grid',
    placeItems: 'center',
    padding: 20,
    background: 'rgba(2,6,23,0.75)'
  },
  modal: {
    width: 'min(500px, 100%)',
    padding: 22,
    borderRadius: 14,
    border: '1px solid #334155',
    background: '#0f172a'
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }
};
