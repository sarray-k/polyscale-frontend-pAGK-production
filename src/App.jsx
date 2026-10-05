import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useToast } from './context/ToastContext.jsx';
import { ToastView } from './components/Toast.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Pricing from './components/Pricing.jsx';
import PromoPage from './components/PromoPage.jsx';
import FAQ from './components/FAQ.jsx';
import BlueprintEditor from './components/BlueprintEditor.jsx';
import AIAssistant from './components/AIAssistant.jsx';
import Help from './components/Help.jsx';

const navItems = [
  { key: 'overview', label: 'Overview', active: true },
  { key: 'clusters', label: 'Clusters' },
  { key: 'blueprints', label: 'Blueprints' },
  { key: 'deployments', label: 'Deployments' },
  { key: 'social', label: 'Social' },
  { key: 'templates', label: 'Templates' },
  { key: 'exports', label: 'Exports' },
  { key: 'admin', label: 'Admin' },
  { key: 'metrics', label: 'Metrics' },
  { key: 'billing', label: 'Billing' },
  { key: 'security', label: 'Security' },
  { key: 'support', label: 'Support' },
  { key: 'code', label: 'Code & IA' }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const defaultMetrics = [
  { label: 'Active clusters', value: '0', delta: '+0%', tone: 'cyan' },
  { label: 'Deployments', value: '0', delta: '+0%', tone: 'green' },
  { label: 'Uptime', value: '0%', delta: '+0%', tone: 'blue' },
  { label: 'AI requests', value: '0', delta: '+0%', tone: 'violet' }
];

const apps = [
  { name: 'crm-prod', cluster: 'prod-us-east', status: 'Healthy', uptime: '99.97%', owner: 'Ops' },
  { name: 'mobile-app', cluster: 'prod-eu-west', status: 'Running', uptime: '99.94%', owner: 'Platform' },
  { name: 'payments-saas', cluster: 'prod-us-west', status: 'Scaling', uptime: '99.91%', owner: 'Growth' },
  { name: 'billing-api', cluster: 'staging', status: 'Healthy', uptime: '99.92%', owner: 'Product' }
];

const planFeatures = [
  '1 cluster',
  '3 blueprints',
  '5 apps',
  'AI assistant',
  'Standard support'
];

const defaultTemplates = [
  { id: 'saas-landing', name: 'SaaS Landing', description: 'Landing page moderne pour un SaaS B2B', category: 'landing' },
  { id: 'dashboard-admin', name: 'Dashboard Admin', description: 'Interface d’administration avec sidebar et KPI', category: 'dashboard' },
  { id: 'portfolio-modern', name: 'Portfolio Moderne', description: 'Portfolio premium pour créatifs et consultants', category: 'portfolio' },
  { id: 'ecommerce-shop', name: 'E-commerce', description: 'Boutique digitale avec sections produits et CTA', category: 'ecommerce' }
];

function PublicLayout() {
  const [view, setView] = useState('pricing');

  return (
    <div style={styles.pageShell}>
      <div style={styles.heroGlow} />
      <header style={styles.topbarPublic}>
        <div style={styles.brandWrap}>
          <div style={styles.brandDot} />
          <div style={styles.brandTextGroup}>
            <span style={styles.brandText}>PolyScale</span>
            <span style={styles.partnerText}>by Elycoop</span>
          </div>
        </div>
        <div style={styles.topbarActions}>
          <button style={styles.ghostButton} onClick={() => setView('pricing')}>Pricing</button>
          <button style={styles.ghostButton} onClick={() => setView('promo')}>Promos</button>
          <button style={styles.primaryButton} onClick={() => setView('login')}>Login</button>
        </div>
      </header>

      <main style={styles.publicMain}>
        <section style={styles.heroSection}>
          <div style={styles.heroTextWrap}>
            <span style={styles.eyebrow}>Control plane for modern SaaS deployment</span>
            <h1 style={styles.heroTitle}>Deploy smarter. Manage clusters with confidence.</h1>
            <p style={styles.heroText}>
              PolyScale helps teams design, deploy, observe and secure SaaS workloads from a single cloud-native control plane.
            </p>
            <div style={styles.heroActions}>
              <button style={styles.primaryButton} onClick={() => setView('signup')}>Start free</button>
              <button style={styles.secondaryButton} onClick={() => setView('pricing')}>See pricing</button>
            </div>
            <div style={styles.trustRow}>
              <div><strong>99.97%</strong><span>uptime</span></div>
              <div><strong>12k</strong><span>deployments</span></div>
              <div><strong>24/7</strong><span>monitoring</span></div>
            </div>
          </div>

          <div style={styles.heroVisualCard}>
            <div style={styles.visualHeader}>
              <span style={styles.dotGreen} />
              <span style={styles.dotYellow} />
              <span style={styles.dotRed} />
            </div>
            <div style={styles.visualGrid}>
              <div style={styles.panelCard}>
                <span style={styles.panelLabel}>Cluster health</span>
                <strong style={styles.panelValue}>Excellent</strong>
                <div style={styles.progressTrack}><div style={{ ...styles.progressFill, width: '89%' }} /></div>
              </div>
              <div style={styles.panelCard}> 
                <span style={styles.panelLabel}>AI Assistant</span>
                <strong style={styles.panelValue}>Ready</strong>
              </div>
              <div style={styles.panelCardWide}>
                <div style={styles.rowBetween}><span>Deployments</span><span style={{ color: '#7ae7ff' }}>+18.2%</span></div>
                <div style={styles.barGroup}>
                  <span style={{ ...styles.bar, height: '58%' }} />
                  <span style={{ ...styles.bar, height: '72%' }} />
                  <span style={{ ...styles.bar, height: '81%' }} />
                  <span style={{ ...styles.bar, height: '93%' }} />
                  <span style={{ ...styles.bar, height: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.featureGrid}>
          <div style={styles.featureCard}><span>Blueprints</span><strong>Reusable app templates</strong></div>
          <div style={styles.featureCard}><span>Clusters</span><strong>Secure multi-tenant access</strong></div>
          <div style={styles.featureCard}><span>Monitoring</span><strong>Live observability</strong></div>
          <div style={styles.featureCard}><span>Automation</span><strong>GitOps and deployment flows</strong></div>
        </section>

        <section style={styles.pricingSection}>
          <div style={styles.sectionHeader}>
            <span style={styles.eyebrow}>Pricing</span>
            <h2 style={styles.sectionTitle}>Simple plans for every stage</h2>
          </div>
          <div style={styles.pricingCards}>
            <div style={styles.priceCard}>
              <span style={styles.planBadge}>Starter</span>
              <h3 style={styles.planTitle}>49€<small style={styles.planSmall}>/mo</small></h3>
              <ul style={styles.planList}>{planFeatures.map((f) => <li key={f}>{f}</li>)}</ul>
              <button style={styles.primaryButton} onClick={() => setView('signup')}>Get started</button>
            </div>
            <div style={{ ...styles.priceCard, ...styles.priceCardFeatured }}>
              <span style={{ ...styles.planBadge, ...styles.planBadgeFeatured }}>Scale-Up</span>
              <h3 style={styles.planTitle}>99€<small style={styles.planSmall}>/mo</small></h3>
              <ul style={styles.planList}>{['3 clusters', 'Unlimited blueprints', 'Advanced monitoring', 'Priority support', 'RBAC ready'].map((f) => <li key={f}>{f}</li>)}</ul>
              <button style={styles.primaryButton} onClick={() => setView('signup')}>Choose plan</button>
            </div>
            <div style={styles.priceCard}>
              <span style={styles.planBadge}>Enterprise</span>
              <h3 style={styles.planTitle}>199€<small style={styles.planSmall}>/mo</small></h3>
              <ul style={styles.planList}>{['Unlimited clusters', 'Advanced security', 'Private support', 'Custom onboarding', 'Dedicated tenant isolation'].map((f) => <li key={f}>{f}</li>)}</ul>
              <button style={styles.primaryButton} onClick={() => setView('signup')}>Talk to sales</button>
            </div>
          </div>
        </section>

        <section style={styles.switcherWrap}>
          <div style={styles.tabsRow}>
            <button style={styles.tabButton(view === 'login')} onClick={() => setView('login')}>Login</button>
            <button style={styles.tabButton(view === 'signup')} onClick={() => setView('signup')}>Signup</button>
            <button style={styles.tabButton(view === 'pricing')} onClick={() => setView('pricing')}>Tarifs</button>
            <button style={styles.tabButton(view === 'promo')} onClick={() => setView('promo')}>Promo</button>
          </div>
          {view === 'login' && <Login />}
          {view === 'signup' && <Signup />}
          {view === 'pricing' && <Pricing />}
          {view === 'promo' && <PromoPage />}
        </section>
      </main>
    </div>
  );
}

function DashboardLayout() {
  const { logout, token } = useAuth();
  const { showToast } = useToast();
  const [activeView, setActiveView] = useState('overview');
  const [dashboard, setDashboard] = useState({ metrics: defaultMetrics, applications: apps, blueprints: [] });
  const [clusters, setClusters] = useState([]);
  const [blueprints, setBlueprints] = useState([]);
  const [socialStats, setSocialStats] = useState({ totalLinks: 0, totalClicks: 0, totalConversions: 0, estimatedReward: 0 });
  const [socialLinks, setSocialLinks] = useState([]);
  const [templates, setTemplates] = useState(defaultTemplates);
  const [exportStats, setExportStats] = useState({ totalFiles: 0, totalSizeHuman: '0 B' });
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminAudit, setAdminAudit] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [appMetricsMap, setAppMetricsMap] = useState({});
  const [appMetricsErrors, setAppMetricsErrors] = useState({});
  const [blueprintVersions, setBlueprintVersions] = useState({});
  const [blueprintForm, setBlueprintForm] = useState({ name: '', description: '', version: '1.0.0' });
  const [clusterForm, setClusterForm] = useState({ clusterName: '', apiServer: '', token: '', caCert: '' });
  const [isClusterFormOpen, setIsClusterFormOpen] = useState(false);
  const [isRegisteringCluster, setIsRegisteringCluster] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [appToDelete, setAppToDelete] = useState(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [creatingLink, setCreatingLink] = useState(false);
  const [newApp, setNewApp] = useState({ name: '', blueprint: '' });

  const loadDashboard = async () => {
    if (!token) return;

    setLoading(true);

    try {
      const [overviewRes, clustersRes, blueprintsRes, applicationsRes, socialStatsRes, socialLinksRes, templatesRes, exportStatsRes, adminUsersRes, adminAuditRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/dashboard/overview`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/clusters`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/blueprints`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/applications`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/social/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/social/links`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/templates`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/export/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/audit`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const failedSources = [
        ['tableau de bord', overviewRes],
        ['clusters', clustersRes],
        ['blueprints', blueprintsRes],
        ['applications', applicationsRes]
      ].filter(([, result]) => result.status === 'rejected' || !result.value.ok);
      const sessionExpired = failedSources.some(([, result]) => result.status === 'fulfilled' && result.value.status === 401);
      setLoadError(
        failedSources.length === 0
          ? null
          : sessionExpired
            ? 'Session expirée : reconnectez-vous.'
            : `Chargement impossible : ${failedSources.map(([label]) => label).join(', ')}. Des données de démonstration peuvent s’afficher.`
      );

      const overviewData = overviewRes.status === 'fulfilled' ? await overviewRes.value.json().catch(() => ({})) : {};
      const clustersData = clustersRes.status === 'fulfilled' ? await clustersRes.value.json().catch(() => []) : [];
      const blueprintsData = blueprintsRes.status === 'fulfilled' ? await blueprintsRes.value.json().catch(() => []) : [];
      const applicationsData = applicationsRes.status === 'fulfilled' ? await applicationsRes.value.json().catch(() => []) : [];
      const socialStatsData = socialStatsRes.status === 'fulfilled' ? await socialStatsRes.value.json().catch(() => ({ totalLinks: 0, totalClicks: 0, totalConversions: 0, estimatedReward: 0 })) : { totalLinks: 0, totalClicks: 0, totalConversions: 0, estimatedReward: 0 };
      const socialLinksData = socialLinksRes.status === 'fulfilled' ? await socialLinksRes.value.json().catch(() => []) : [];
      const templatesData = templatesRes.status === 'fulfilled' ? await templatesRes.value.json().catch(() => defaultTemplates) : defaultTemplates;
      const exportStatsData = exportStatsRes.status === 'fulfilled' ? await exportStatsRes.value.json().catch(() => ({ totalFiles: 0, totalSizeHuman: '0 B' })) : { totalFiles: 0, totalSizeHuman: '0 B' };
      const adminUsersData = adminUsersRes.status === 'fulfilled' ? await adminUsersRes.value.json().catch(() => []) : [];
      const adminAuditData = adminAuditRes.status === 'fulfilled' ? await adminAuditRes.value.json().catch(() => []) : [];

      const nextBlueprints = blueprintsData.length ? blueprintsData : (overviewData.blueprints || []);
      const metrics = [
        { label: 'Active clusters', value: String(overviewData.metrics?.activeClusters ?? clustersData.length ?? 0), delta: '+0%', tone: 'cyan' },
        { label: 'Deployments', value: String(overviewData.metrics?.deployments ?? applicationsData.length ?? 0), delta: '+0%', tone: 'green' },
        { label: 'Uptime', value: String(overviewData.metrics?.availability ?? '0%'), delta: '+0%', tone: 'blue' },
        { label: 'AI requests', value: String(overviewData.metrics?.aiRequests ?? '0'), delta: '+0%', tone: 'violet' }
      ];

      setDashboard({
        metrics,
        applications: applicationsData.length ? applicationsData : (overviewData.applications?.length ? overviewData.applications : apps),
        blueprints: nextBlueprints
      });
      setClusters(clustersData.length ? clustersData : [{ name: 'prod-eu-west', apiServer: 'https://demo-cluster.example.com' }]);
      setBlueprints(nextBlueprints);
      setSocialStats(socialStatsData);
      setSocialLinks(Array.isArray(socialLinksData) ? socialLinksData : []);
      setTemplates(Array.isArray(templatesData) && templatesData.length ? templatesData : defaultTemplates);
      setExportStats(exportStatsData);
      setAdminUsers(Array.isArray(adminUsersData) ? adminUsersData : []);
      setAdminAudit(Array.isArray(adminAuditData) ? adminAuditData : []);
      setNewApp((prev) => ({
        ...prev,
        blueprint: prev.blueprint || nextBlueprints[0]?.name || ''
      }));
    } catch (error) {
      setLoadError('Chargement impossible : le serveur ne répond pas.');
      setDashboard({ metrics: defaultMetrics, applications: apps, blueprints: [] });
      setClusters([{ name: 'prod-eu-west', apiServer: 'https://demo-cluster.example.com' }]);
      setBlueprints([]);
      setSocialStats({ totalLinks: 0, totalClicks: 0, totalConversions: 0, estimatedReward: 0 });
      setSocialLinks([]);
      setTemplates(defaultTemplates);
      setExportStats({ totalFiles: 0, totalSizeHuman: '0 B' });
      setAdminUsers([]);
      setAdminAudit([]);
      setNewApp({ name: '', blueprint: '' });
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  };

  const handleCreateSocialLink = async () => {
    setCreatingLink(true);

    try {
      const response = await fetch(`${API_URL}/api/social/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ source: 'dashboard', campaign: 'polyscale', target: '/' })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de créer le lien social');
      }

      await loadDashboard();
    } catch (error) {
      showToast(error.message || 'Impossible de créer le lien social', 'error');
    } finally {
      setCreatingLink(false);
    }
  };

  const handleUseTemplate = async (templateId) => {
    try {
      const response = await fetch(`${API_URL}/api/templates/${templateId}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Impossible d’utiliser ce template');
      }

      showToast(`Template ${templateId} activé avec succès`, 'success');
    } catch (error) {
      showToast(error.message || 'Impossible d’utiliser ce template', 'error');
    }
  };

  const handleRegisterCluster = async (event) => {
    event.preventDefault();

    const clusterName = clusterForm.clusterName.trim();
    const apiServer = clusterForm.apiServer.trim();
    const clusterToken = clusterForm.token.trim();

    if (!clusterName || !apiServer || !clusterToken) {
      showToast('Nom, URL de l’API et token sont requis', 'error');
      return;
    }

    setIsRegisteringCluster(true);
    try {
      const response = await fetch(`${API_URL}/api/clusters/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          clusterName,
          apiServer,
          token: clusterToken,
          ...(clusterForm.caCert.trim() ? { caCert: clusterForm.caCert.trim() } : {})
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Impossible d’enregistrer le cluster');

      setClusterForm({ clusterName: '', apiServer: '', token: '', caCert: '' });
      setIsClusterFormOpen(false);
      await loadDashboard();
      showToast('Cluster enregistré', 'success');
    } catch (error) {
      showToast(error.message || 'Impossible d’enregistrer le cluster', 'error');
    } finally {
      setIsRegisteringCluster(false);
    }
  };

  const handleGenerateBlueprint = async (event) => {
    event.preventDefault();

    if (!blueprintForm.name.trim()) {
      showToast('Le nom du blueprint est requis', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/blueprints/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: blueprintForm.name.trim(),
          description: blueprintForm.description.trim(),
          version: blueprintForm.version.trim() || '1.0.0'
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Impossible de générer le blueprint');

      setBlueprintForm({ name: '', description: '', version: '1.0.0' });
      await loadDashboard();
      showToast('Blueprint généré', 'success');
    } catch (error) {
      showToast(error.message || 'Impossible de générer le blueprint', 'error');
    }
  };

  const handleBlueprintVersions = async (blueprintId) => {
    try {
      const response = await fetch(`${API_URL}/api/blueprints/${blueprintId}/versions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => []);
      if (!response.ok) throw new Error(data.error || 'Impossible de charger les versions');
      setBlueprintVersions((prev) => ({ ...prev, [blueprintId]: data }));
    } catch (error) {
      showToast(error.message || 'Impossible de charger les versions', 'error');
    }
  };

  const handleAppMetrics = async (appId) => {
    try {
      const response = await fetch(`${API_URL}/api/applications/${appId}/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Impossible de charger les métriques');
      setAppMetricsMap((prev) => ({ ...prev, [appId]: data }));
      setAppMetricsErrors((prev) => ({ ...prev, [appId]: null }));
    } catch (error) {
      setAppMetricsErrors((prev) => ({
        ...prev,
        [appId]: error.message || 'Impossible de charger les métriques'
      }));
      showToast(error.message || 'Impossible de charger les métriques', 'error');
    }
  };

  const handleCheckout = async (plan) => {
    try {
      const response = await fetch(`${API_URL}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Impossible de démarrer le paiement');
      if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer');
      else showToast('Session créée, vérifiez votre portefeuille de paiement.', 'info');
    } catch (error) {
      showToast(error.message || 'Impossible de démarrer le paiement', 'error');
    }
  };

  const handleDownloadExport = async () => {
    try {
      const response = await fetch(`${API_URL}/api/export/zip`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Impossible d’exporter le projet');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'polyscale-export.zip';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      showToast(error.message || 'Impossible de télécharger l’export', 'error');
    }
  };

  const handleDeployApp = async (event) => {
    event.preventDefault();

    const name = newApp.name.trim();
    const blueprint = newApp.blueprint;

    if (!name || !blueprint) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, blueprint })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Le déploiement a échoué');
      }

      setNewApp({ name: '', blueprint: blueprints[0]?.name || '' });
      setIsDeployModalOpen(false);
      await loadDashboard();
      showToast('Application créée', 'success');
    } catch (error) {
      showToast(error.message || 'Impossible de créer l’application', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteApp = async (appId) => {
    if (!appId) return;

    setDeletingId(appId);

    try {
      const response = await fetch(`${API_URL}/api/applications/${appId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'La suppression a échoué');
      }

      await loadDashboard();
      showToast('Application supprimée', 'success');
    } catch (error) {
      showToast(error.message || 'Impossible de supprimer l’application', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    loadDashboard();

    fetch(`${API_URL}/api/promotions`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setPromotions(Array.isArray(data) ? data : []))
      .catch(() => setPromotions([]));
  }, [token]);

  const metrics = dashboard.metrics ?? defaultMetrics;
  const liveApps = dashboard.applications ?? apps;
  const clusterCards = clusters.length ? clusters : [{ name: 'prod-eu-west', apiServer: 'https://demo-cluster.example.com' }];
  const blueprintList = blueprints.length ? blueprints : (dashboard.blueprints ?? []);

  const assistantContext = {
    activeView,
    clusters: clusters.slice(0, 6).map((c) => ({ name: c.name || c.clusterName, status: c.status })),
    blueprints: blueprintList.slice(0, 6).map((b) => ({ name: b.name, version: b.version })),
    applications: liveApps.slice(0, 8).map((a) => ({ name: a.name, cluster: a.cluster, status: a.status })),
    metrics: metrics.map((m) => ({ label: m.label, value: m.value }))
  };

  useEffect(() => {
    if (activeView !== 'metrics' || !token) return undefined;

    let isActive = true;
    let isRefreshing = false;
    const refreshMetrics = async () => {
      if (isRefreshing) return;
      isRefreshing = true;
      try {
        await Promise.all(liveApps.filter((app) => app.id).map(async (app) => {
          try {
            const response = await fetch(`${API_URL}/api/applications/${app.id}/metrics`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Impossible de charger les métriques');
            if (isActive) {
              setAppMetricsMap((prev) => ({ ...prev, [app.id]: data }));
              setAppMetricsErrors((prev) => ({ ...prev, [app.id]: null }));
            }
          } catch (error) {
            if (isActive) {
              setAppMetricsErrors((prev) => ({
                ...prev,
                [app.id]: error.message || 'Impossible de charger les métriques'
              }));
            }
          }
        }));
      } finally {
        isRefreshing = false;
      }
    };

    refreshMetrics();
    const intervalId = window.setInterval(refreshMetrics, 15000);
    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [activeView, liveApps, token]);

  const renderDashboardContent = () => {
    if (activeView === 'clusters') {
      return (
        <section style={styles.tablePanel}>
          <div style={styles.panelTitleRow}>
            <h3 style={styles.panelTitle}>Clusters</h3>
            <button type="button" style={styles.secondaryButton} onClick={() => setIsClusterFormOpen((open) => !open)}>
              {isClusterFormOpen ? 'Annuler' : 'Register cluster'}
            </button>
          </div>

          {isClusterFormOpen && (
            <form onSubmit={handleRegisterCluster} style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 20 }}>
              <input
                type="text"
                value={clusterForm.clusterName}
                onChange={(event) => setClusterForm((prev) => ({ ...prev, clusterName: event.target.value }))}
                placeholder="Nom du cluster"
                style={styles.fieldInput}
              />
              <input
                type="url"
                value={clusterForm.apiServer}
                onChange={(event) => setClusterForm((prev) => ({ ...prev, apiServer: event.target.value }))}
                placeholder="https://api.mon-cluster:6443"
                style={styles.fieldInput}
              />
              <input
                type="password"
                autoComplete="off"
                value={clusterForm.token}
                onChange={(event) => setClusterForm((prev) => ({ ...prev, token: event.target.value }))}
                placeholder="Token du compte de service"
                style={styles.fieldInput}
              />
              <textarea
                value={clusterForm.caCert}
                onChange={(event) => setClusterForm((prev) => ({ ...prev, caCert: event.target.value }))}
                placeholder="Certificat CA (PEM, optionnel – cluster auto-signé)"
                rows={3}
                style={{ ...styles.fieldInput, gridColumn: '1 / -1', fontFamily: 'monospace' }}
              />
              <button type="submit" style={styles.primaryButton} disabled={isRegisteringCluster}>
                {isRegisteringCluster ? 'Vérification…' : 'Enregistrer'}
              </button>
            </form>
          )}
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {clusterCards.map((cluster) => (
              <div key={cluster.id || cluster.name} style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(148,163,184,0.18)',
                borderRadius: 14,
                padding: 18
              }}>
                <div style={styles.panelTitleRow}>
                  <strong>{cluster.name || 'Cluster'}</strong>
                  <span style={styles.chip}>Healthy</span>
                </div>
                <div style={{ color: '#cbd5e1', marginTop: 10, lineHeight: 1.6 }}>
                  <div>API: {cluster.apiServer || 'https://demo-cluster.example.com'}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (activeView === 'blueprints') {
      return (
        <section style={styles.tablePanel}>
          <div style={styles.panelTitleRow}>
            <h3 style={styles.panelTitle}>Blueprints</h3>
          </div>

          <form onSubmit={handleGenerateBlueprint} style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 20 }}>
            <input
              type="text"
              value={blueprintForm.name}
              onChange={(event) => setBlueprintForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Nom du blueprint"
              style={styles.fieldInput}
            />
            <input
              type="text"
              value={blueprintForm.version}
              onChange={(event) => setBlueprintForm((prev) => ({ ...prev, version: event.target.value }))}
              placeholder="Version"
              style={styles.fieldInput}
            />
            <input
              type="text"
              value={blueprintForm.description}
              onChange={(event) => setBlueprintForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Description"
              style={styles.fieldInput}
            />
            <button type="submit" style={styles.primaryButton}>Générer</button>
          </form>

          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {blueprintList.map((bp) => (
              <div key={bp.id || bp.name} style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(148,163,184,0.18)',
                borderRadius: 14,
                padding: 18
              }}>
                <div style={styles.panelTitleRow}>
                  <strong>{bp.name}</strong>
                  <span style={styles.chip}>{bp.version || '1.0.0'}</span>
                </div>
                <p style={{ color: '#cbd5e1', margin: '12px 0 0', lineHeight: 1.6 }}>
                  {bp.description || 'Blueprint disponible'}
                </p>
                <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button style={styles.secondaryButton} onClick={() => handleBlueprintVersions(bp.id)}>Versions</button>
                </div>
                {blueprintVersions[bp.id] && (
                  <div style={{ marginTop: 12, color: '#cbd5e1', fontSize: 12, lineHeight: 1.8 }}>
                    {blueprintVersions[bp.id].length ? blueprintVersions[bp.id].map((version) => (
                      <div key={version.id || version.version}>• {version.version || '1.0.0'}</div>
                    )) : <div>Pas de version</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (activeView === 'deployments') {
      return (
        <section style={styles.tablePanel}>
          <div style={styles.panelTitleRow}>
            <h3 style={styles.panelTitle}>Deployments</h3>
            <button style={styles.secondaryButton} onClick={() => setIsDeployModalOpen(true)}>Deploy app</button>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Blueprint</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Namespace</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && !hasLoaded && [0, 1, 2].map((row) => (
                <tr key={`skeleton-${row}`}>
                  <td style={styles.td} colSpan={5}><div style={styles.skeletonLine} /></td>
                </tr>
              ))}
              {!(loading && !hasLoaded) && liveApps.map((app) => (
                <tr key={app.id || app.name}>
                  <td style={styles.td}>{app.name}</td>
                  <td style={styles.td}>{app.blueprint || app.cluster || 'CRM SaaS'}</td>
                  <td style={styles.td}><span style={styles.statusPill(app.status || 'running')}>{app.status || 'running'}</span></td>
                  <td style={styles.td}>{app.namespace || app.cluster || 'default'}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleAppMetrics(app.id)}
                        style={styles.secondaryButton}
                      >
                        Metrics
                      </button>
                      <button
                        type="button"
                        onClick={() => setAppToDelete(app)}
                        disabled={deletingId === app.id}
                        style={
                          deletingId === app.id
                            ? { ...styles.dangerButton, opacity: 0.7, cursor: 'not-allowed' }
                            : styles.dangerButton
                        }
                      >
                        {deletingId === app.id ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      );
    }

    if (activeView === 'social') {
      return (
        <section style={styles.tablePanel}>
          <div style={styles.panelTitleRow}>
            <h3 style={styles.panelTitle}>Social growth</h3>
            <button style={styles.secondaryButton} onClick={handleCreateSocialLink} disabled={creatingLink}>
              {creatingLink ? 'Création...' : 'Créer un lien'}
            </button>
          </div>

          <div style={styles.kpiGrid}>
            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Liens</span>
              <strong style={styles.kpiValue}>{socialStats.totalLinks || 0}</strong>
            </div>
            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Clicks</span>
              <strong style={styles.kpiValue}>{socialStats.totalClicks || 0}</strong>
            </div>
            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Conversions</span>
              <strong style={styles.kpiValue}>{socialStats.totalConversions || 0}</strong>
            </div>
            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Reward estimé</span>
              <strong style={styles.kpiValue}>{socialStats.estimatedReward || 0}</strong>
            </div>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Source</th>
                <th style={styles.th}>URL</th>
                <th style={styles.th}>Clicks</th>
                <th style={styles.th}>Ciblé</th>
              </tr>
            </thead>
            <tbody>
              {socialLinks.length ? socialLinks.map((link) => (
                <tr key={link.id || link.code}>
                  <td style={styles.td}>{link.code}</td>
                  <td style={styles.td}>{link.source || 'generic'}</td>
                  <td style={styles.td}><a href={link.url || '#'} target="_blank" rel="noreferrer" style={{ color: '#7ae7ff' }}>{link.url || '—'}</a></td>
                  <td style={styles.td}>{link.clicks || 0}</td>
                  <td style={styles.td}>{link.target || '/'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ ...styles.td, color: '#94a3b8' }}>Aucun lien social créé pour le moment.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      );
    }

    if (activeView === 'templates') {
      return (
        <section style={styles.tablePanel}>
          <div style={styles.panelTitleRow}>
            <h3 style={styles.panelTitle}>Templates</h3>
          </div>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {templates.map((template) => (
              <div key={template.id || template.name} style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(148,163,184,0.18)',
                borderRadius: 16,
                padding: 18
              }}>
                <div style={styles.panelTitleRow}>
                  <strong>{template.name}</strong>
                  <span style={styles.chip}>{template.category || 'marketing'}</span>
                </div>
                <p style={{ color: '#cbd5e1', margin: '0 0 16px', lineHeight: 1.6 }}>{template.description}</p>
                <button style={styles.primaryButton} onClick={() => handleUseTemplate(template.id)}>Utiliser</button>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (activeView === 'exports') {
      return (
        <section style={styles.tablePanel}>
          <div style={styles.panelTitleRow}>
            <h3 style={styles.panelTitle}>Exports</h3>
            <button style={styles.secondaryButton} onClick={handleDownloadExport}>Télécharger ZIP</button>
          </div>

          <div style={styles.kpiGrid}>
            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Fichiers</span>
              <strong style={styles.kpiValue}>{exportStats.totalFiles || 0}</strong>
            </div>
            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Taille totale</span>
              <strong style={styles.kpiValue}>{exportStats.totalSizeHuman || '0 B'}</strong>
            </div>
          </div>

          <div style={{
            padding: 18,
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(148,163,184,0.18)',
            borderRadius: 14,
            color: '#cbd5e1',
            lineHeight: 1.8
          }}>
            Exporter votre projet pour le distribuer sur n’importe quel hébergement statique ou en archive de livraison client.
          </div>
        </section>
      );
    }

    if (activeView === 'admin') {
      const hasAdminAccess = adminUsers.length > 0 || adminAudit.length > 0;
      return (
        <section style={styles.tablePanel}>
          <div style={styles.panelTitleRow}>
            <h3 style={styles.panelTitle}>Administration</h3>
            <span style={styles.chip}>{hasAdminAccess ? 'Access OK' : 'Restricted'}</span>
          </div>

          {!hasAdminAccess ? (
            <div style={{
              padding: 18,
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(148,163,184,0.18)',
              borderRadius: 14,
              color: '#cbd5e1'
            }}>
              Accès administrateur requis. Connectez-vous avec un compte admin pour voir les utilisateurs et l’audit.
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ ...styles.panelTitle, fontSize: 16, marginBottom: 12 }}>Utilisateurs</h4>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Rôle</th>
                      <th style={styles.th}>Tenant</th>
                      <th style={styles.th}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((user) => (
                      <tr key={user.id || user.email}>
                        <td style={styles.td}>{user.email}</td>
                        <td style={styles.td}>{user.role}</td>
                        <td style={styles.td}>{user.tenant || 'default'}</td>
                        <td style={styles.td}><span style={styles.statusPill(user.status || 'active')}>{user.status || 'active'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 style={{ ...styles.panelTitle, fontSize: 16, marginBottom: 12 }}>Audit log</h4>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Événement</th>
                      <th style={styles.th}>Tenant</th>
                      <th style={styles.th}>Utilisateur</th>
                      <th style={styles.th}>Détails</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminAudit.map((event) => (
                      <tr key={event.id || `${event.event}-${event.created_at}`}>
                        <td style={styles.td}>{event.event}</td>
                        <td style={styles.td}>{event.tenant || 'default'}</td>
                        <td style={styles.td}>{event.user_id || 'system'}</td>
                        <td style={styles.td}>{event.details ? JSON.stringify(event.details) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      );
    }

    if (activeView === 'metrics') {
      return (
        <section style={styles.tablePanel}>
          <div style={styles.panelTitleRow}>
            <h3 style={styles.panelTitle}>Métriques applications</h3>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>Actualisation toutes les 15 s</span>
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            {liveApps.map((app) => {
              const m = appMetricsMap[app.id];
              return (
                <div key={app.id || app.name} style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(148,163,184,0.18)',
                  borderRadius: 14,
                  padding: 18
                }}>
                  <div style={styles.panelTitleRow}>
                    <strong>{app.name}</strong>
                    <button style={styles.secondaryButton} onClick={() => handleAppMetrics(app.id)} disabled={!app.id}>Refresh</button>
                  </div>
                  {appMetricsErrors[app.id] && (
                    <div role="status" style={{ color: '#fca5a5', marginBottom: 12 }}>
                      {appMetricsErrors[app.id]}
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(120px, 1fr))', gap: 12 }}>
                    <div style={{ background: 'rgba(2,8,23,0.6)', borderRadius: 10, padding: 12 }}><div style={{ color: '#94a3b8', fontSize: 12 }}>CPU / limite</div><strong>{m ? Number(m.cpu).toFixed(1) : '—'}%</strong></div>
                    <div style={{ background: 'rgba(2,8,23,0.6)', borderRadius: 10, padding: 12 }}><div style={{ color: '#94a3b8', fontSize: 12 }}>Mémoire / limite</div><strong>{m ? Number(m.memory).toFixed(1) : '—'}%</strong></div>
                    <div style={{ background: 'rgba(2,8,23,0.6)', borderRadius: 10, padding: 12 }}><div style={{ color: '#94a3b8', fontSize: 12 }}>Latence HTTP</div><strong>{m?.latency == null ? '—' : `${Number(m.latency).toFixed(0)} ms`}</strong></div>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 10 }}>
                    {m?.measuredAt
                      ? `Mesure Kubernetes : ${new Date(m.measuredAt).toLocaleTimeString()}`
                      : 'En attente de la première mesure'}
                    {m?.latencyError ? ` · ${m.latencyError}` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    if (activeView === 'billing') {
      const plans = [
        { key: 'startup', name: 'Starter', price: '49€', features: ['1 cluster', '3 blueprints', 'AI assistant', 'Support standard'] },
        { key: 'scale-up', name: 'Scale-Up', price: '99€', features: ['3 clusters', 'Unlimited blueprints', 'RBAC', 'Priority support'] },
        { key: 'enterprise', name: 'Enterprise', price: '199€', features: ['Clusters illimités', 'Sécurité avancée', 'Private support', 'Tenant isolation'] }
      ];

      return (
        <section style={styles.tablePanel}>
          <div style={styles.panelTitleRow}>
            <h3 style={styles.panelTitle}>Billing & subscriptions</h3>
          </div>
          <div style={styles.pricingCards}>
            {plans.map((plan) => (
              <div key={plan.key} style={{ ...styles.priceCard, ...styles.priceCardFeatured }}>
                <span style={{ ...styles.planBadge, ...styles.planBadgeFeatured }}>{plan.name}</span>
                <h3 style={styles.planTitle}>{plan.price}<small style={styles.planSmall}>/mo</small></h3>
                <ul style={styles.planList}>
                  {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
                <button style={styles.primaryButton} onClick={() => handleCheckout(plan.key)}>Choisir</button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, background: 'rgba(15, 23, 42, 0.8)', borderRadius: 14, padding: 18 }}>
            <h4 style={{ ...styles.panelTitle, fontSize: 16, marginBottom: 12 }}>Promotions actives</h4>
            {promotions.length ? promotions.map((promo) => (
              <div key={promo.id || promo.code} style={{ marginBottom: 8, color: '#cbd5e1' }}>
                {promo.code} — {promo.discount_percent || 0}% off • {promo.name || 'Promotion'}
              </div>
            )) : <div style={{ color: '#cbd5e1' }}>Aucune promotion active pour le moment.</div>}
          </div>
        </section>
      );
    }

    if (activeView === 'security') {
      return (
        <section style={styles.tablePanel}>
          <div style={styles.panelTitleRow}>
            <h3 style={styles.panelTitle}>Security & tenant isolation</h3>
            <span style={styles.chip}>RBAC active</span>
          </div>

          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {[
              ['Tenant isolation', 'Chaque tenant est vérifié via req.user.tenant et les accès sont filtrés par owner/tenant.'],
              ['JWT validation', 'Les sessions sont authentifiées et rejetées si status est suspended ou blocked.'],
              ['Rate limiting', 'Protection sur login, signup et API globale pour limiter les abus et attaques.'],
              ['Secrets management', 'Les kubeconfigs sont chiffrés avant stockage et les variables sont lues depuis l’environnement.'],
              ['HTTP hardening', 'Headers de sécurité et CORS stricts sont en place sur le backend.']
            ].map(([title, text]) => (
              <div key={title} style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: 14, padding: 18, border: '1px solid rgba(148,163,184,0.18)' }}>
                <strong style={{ display: 'block', marginBottom: 10, color: '#f8fafc' }}>{title}</strong>
                <div style={{ color: '#cbd5e1', lineHeight: 1.7 }}>{text}</div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (activeView === 'support') {
      return (
        <section style={styles.tablePanel}>
          <div style={styles.panelTitleRow}>
            <h3 style={styles.panelTitle}>Monitoring & support</h3>
            <span style={styles.chip}>24/7</span>
          </div>

          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {[
              ['Service health', 'Health checks et endpoint /api/health et /api/metrics intégrés pour le monitoring.'],
              ['Alerts', 'Règles Prometheus et Grafana préparées pour latence, mémoire, CPU et erreurs.'],
              ['Runbooks', 'Procédure d’incident et support client documentés dans docs/runbooks/incident-response.md.'],
              ['Operations', 'Support client, rollback, audit log et suivi des accès sont prêts pour le terrain.']
            ].map(([title, text]) => (
              <div key={title} style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: 14, padding: 18, border: '1px solid rgba(148,163,184,0.18)' }}>
                <strong style={{ display: 'block', marginBottom: 10, color: '#f8fafc' }}>{title}</strong>
                <div style={{ color: '#cbd5e1', lineHeight: 1.7 }}>{text}</div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    return (
      <>
        <section style={styles.kpiGrid}>
          {metrics.map((metric) => (
            <div key={metric.label} style={styles.kpiCard}>
              <span style={styles.kpiLabel}>{metric.label}</span>
              <div style={styles.kpiValueRow}>
                <strong style={styles.kpiValue}>{loading ? '…' : metric.value}</strong>
                <span style={styles.kpiDelta(metric.tone)}>{metric.delta}</span>
              </div>
            </div>
          ))}
        </section>

        <section style={styles.contentGrid}>
          <div style={styles.mainPanel}> 
            <div style={styles.panelTitleRow}>
              <h3 style={styles.panelTitle}>Live deployments</h3>
              <span style={styles.chip}>Healthy</span>
            </div>
            <div style={styles.barChartWrap}>
              {[42, 58, 74, 86, 92, 99].map((h, index) => (
                <div key={index} style={styles.metricBarCol}>
                  <span style={{ ...styles.metricBar, height: `${h}%` }} />
                </div>
              ))}
            </div>
          </div>

          <div style={styles.sidePanel}>
            <div style={styles.panelTitleRow}>
              <h3 style={styles.panelTitle}>Plan</h3>
              <span style={styles.chip}>Scale-Up</span>
            </div>
            <p style={styles.sideText}>99 €/month</p>
            <ul style={styles.listSimple}>
              <li>3 clusters</li>
              <li>Unlimited blueprints</li>
              <li>RBAC controls</li>
            </ul>
          </div>
        </section>

        <section style={styles.tablePanel}>
          <div style={styles.panelTitleRow}>
            <h3 style={styles.panelTitle}>Applications</h3>
            <button style={styles.secondaryButton} onClick={() => setIsDeployModalOpen(true)}>New app</button>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Cluster</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Uptime</th>
                <th style={styles.th}>Owner</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && !hasLoaded && [0, 1, 2].map((row) => (
                <tr key={`skeleton-${row}`}>
                  <td style={styles.td} colSpan={6}><div style={styles.skeletonLine} /></td>
                </tr>
              ))}
              {!(loading && !hasLoaded) && liveApps.map((app) => (
                <tr key={app.id || app.name}>
                  <td style={styles.td}>{app.name}</td>
                  <td style={styles.td}>{app.cluster}</td>
                  <td style={styles.td}><span style={styles.statusPill(app.status || 'Healthy')}>{app.status || 'Healthy'}</span></td>
                  <td style={styles.td}>{app.uptime || '99.97%'}</td>
                  <td style={styles.td}>{app.owner || 'Ops'}</td>
                  <td style={styles.td}>
                    <button
                      type="button"
                      onClick={() => setAppToDelete(app)}
                      disabled={deletingId === app.id}
                      style={
                        deletingId === app.id
                          ? { ...styles.dangerButton, opacity: 0.7, cursor: 'not-allowed' }
                          : styles.dangerButton
                      }
                    >
                      {deletingId === app.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={styles.bottomGrid}>
          <div style={styles.panelBox}>
            <div style={styles.panelTitleRow}>
              <h3 style={styles.panelTitle}>Connected clusters</h3>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {clusterCards.map((cluster) => (
                <div key={cluster.id || cluster.name} style={{
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid rgba(148,163,184,0.2)',
                  background: 'rgba(15,23,42,0.7)'
                }}>
                  <strong>{cluster.name || 'Cluster'}</strong>
                  <div style={{ color: '#cbd5e1', fontSize: 12, marginTop: 4 }}>{cluster.apiServer || 'https://demo-cluster.example.com'}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={styles.panelBox}>
            <div style={styles.panelTitleRow}>
              <h3 style={styles.panelTitle}>Blueprint library</h3>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {blueprintList.map((bp) => (
                <div key={bp.id || bp.name} style={{
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid rgba(148,163,184,0.2)',
                  background: 'rgba(15,23,42,0.7)'
                }}>
                  <strong>{bp.name}</strong>
                  <div style={{ color: '#cbd5e1', fontSize: 12, marginTop: 4 }}>{bp.version || '1.0.0'} • {bp.description || 'Blueprint disponible'}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={styles.panelBox}>
            <div style={styles.panelTitleRow}>
              <h3 style={styles.panelTitle}>AI assistant</h3>
            </div>
            <AIAssistant context={assistantContext} />
          </div>
          <div style={styles.panelBox}>
            <div style={styles.panelTitleRow}>
              <h3 style={styles.panelTitle}>Blueprint editor</h3>
            </div>
            <BlueprintEditor onBlueprintCreated={loadDashboard} />
          </div>
        </section>
      </>
    );
  };

  return (
    <div style={styles.dashboardShell}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}> 
          <div style={styles.brandDot} />
          <span>PolyScale</span>
        </div>

        <nav style={styles.nav}> 
          {navItems.map((item) => (
            <button
              key={item.key}
              style={styles.navButton(item.key === activeView)}
              onClick={() => {
                if (item.key === 'code') {
                  window.open('/code.html', '_blank', 'noopener,noreferrer');
                  return;
                }
                setActiveView(item.key);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button style={styles.logoutButton} onClick={logout}>Déconnexion</button>
      </aside>

      <main style={styles.dashboardBody}>
        <header style={styles.dashboardHeader}>
          <div>
            <div style={styles.headerBrandRow}>
              <span style={styles.eyebrow}>Overview</span>
              <span style={styles.partnerPill}>Elycoop</span>
            </div>
            <h2 style={styles.dashboardTitle}>Control plane status</h2>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.secondaryButton} onClick={handleDownloadExport}>Export</button>
            <button style={styles.primaryButton} onClick={() => setIsDeployModalOpen(true)}>Deploy</button>
          </div>
        </header>

        <style>{'@keyframes skeleton-pulse{0%,100%{opacity:.4}50%{opacity:1}}'}</style>
        {loadError && (
          <div role="alert" style={styles.errorBanner}>
            <span>{loadError}</span>
            <button type="button" style={styles.secondaryButton} onClick={loadDashboard} disabled={loading}>
              {loading ? 'Chargement…' : 'Réessayer'}
            </button>
          </div>
        )}

        {renderDashboardContent()}

        {appToDelete && (
          <div style={styles.modalBackdrop} onClick={() => setAppToDelete(null)}>
            <div style={styles.modalCard} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <h3 style={styles.panelTitle}>Supprimer l’application ?</h3>
              <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
                <strong>{appToDelete.name}</strong> sera supprimée définitivement. Cette action est irréversible.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" style={styles.ghostButton} onClick={() => setAppToDelete(null)}>Annuler</button>
                <button
                  type="button"
                  style={styles.dangerButton}
                  onClick={async () => {
                    const target = appToDelete;
                    setAppToDelete(null);
                    await handleDeleteApp(target.id);
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {isDeployModalOpen && (
          <div style={styles.modalBackdrop} onClick={() => setIsDeployModalOpen(false)}>
            <div style={styles.modalCard} onClick={(event) => event.stopPropagation()}>
              <div style={styles.panelTitleRow}>
                <h3 style={styles.panelTitle}>Deploy application</h3>
                <button type="button" style={styles.ghostButton} onClick={() => setIsDeployModalOpen(false)}>Close</button>
              </div>

              <form onSubmit={handleDeployApp} style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={styles.fieldLabel}>Application name</label>
                  <input
                    type="text"
                    value={newApp.name}
                    onChange={(event) => setNewApp((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="crm-prod"
                    style={styles.fieldInput}
                  />
                </div>

                <div>
                  <label style={styles.fieldLabel}>Blueprint</label>
                  <select
                    value={newApp.blueprint}
                    onChange={(event) => setNewApp((prev) => ({ ...prev, blueprint: event.target.value }))}
                    style={styles.fieldInput}
                  >
                    <option value="">Select blueprint</option>
                    {blueprints.map((bp) => (
                      <option key={bp.id || bp.name} value={bp.name}>{bp.name}</option>
                    ))}
                  </select>
                </div>

                {blueprints.length === 0 && (
                  <div style={styles.emptyState}>No blueprint available yet. Create one first from the blueprint library.</div>
                )}

                <div style={styles.modalActions}>
                  <button type="button" style={styles.secondaryButton} onClick={() => setIsDeployModalOpen(false)}>Cancel</button>
                  <button type="submit" style={styles.primaryButton} disabled={isSubmitting || blueprints.length === 0}>
                    {isSubmitting ? 'Deploying...' : 'Deploy app'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer style={styles.footerBar}>
          <span>© 2026 PolyScale</span>
          <span style={styles.footerPartner}>Partnered with Elycoop</span>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#020817',
        color: '#e2e8f0',
        fontFamily: 'Inter, sans-serif'
      }}>
        Chargement de la session...
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={user ? <DashboardLayout /> : <PublicLayout />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/promo" element={<PromoPage />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/help" element={<Help />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastView />
    </>
  );
}

const styles = {
  pageShell: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, rgba(76,201,240,0.12), rgba(2,8,23,0.95) 40%, #020817 100%)',
    color: '#e2e8f0',
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    position: 'relative',
    overflow: 'hidden'
  },
  heroGlow: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at 75% 10%, rgba(76,201,240,0.2), transparent 20%)',
    pointerEvents: 'none'
  },
  topbarPublic: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 1200,
    margin: '0 auto',
    padding: '22px 20px 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  brandWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontWeight: 700,
    letterSpacing: '0.04em'
  },
  brandTextGroup: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap'
  },
  brandDot: {
    width: 10,
    height: 10,
    background: '#4cc9f0',
    borderRadius: '50%',
    boxShadow: '0 0 18px rgba(76,201,240,0.8)'
  },
  brandText: {
    color: '#f8fafc',
    fontSize: 18
  },
  partnerText: {
    color: '#7ae7ff',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  },
  topbarActions: {
    display: 'flex',
    gap: 10,
    alignItems: 'center'
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #4cc9f0, #7ae7ff)',
    color: '#04111d',
    border: 'none',
    borderRadius: 10,
    padding: '12px 18px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  secondaryButton: {
    background: 'rgba(148,163,184,0.08)',
    color: '#e2e8f0',
    border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: 10,
    padding: '12px 18px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  dangerButton: {
    background: 'rgba(239, 68, 68, 0.12)',
    color: '#fecaca',
    border: '1px solid rgba(248, 113, 113, 0.5)',
    borderRadius: 8,
    padding: '8px 12px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  ghostButton: {
    background: 'transparent',
    color: '#dbeafe',
    border: '1px solid rgba(148,163,184,0.18)',
    borderRadius: 10,
    padding: '10px 14px',
    cursor: 'pointer'
  },
  errorBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    margin: '0 0 16px',
    padding: '12px 16px',
    borderRadius: 12,
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    color: '#fecaca'
  },
  skeletonLine: {
    height: 18,
    borderRadius: 6,
    background: 'rgba(148, 163, 184, 0.2)',
    animation: 'skeleton-pulse 1.2s ease-in-out infinite'
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(2, 6, 23, 0.72)',
    display: 'grid',
    placeItems: 'center',
    zIndex: 1000,
    padding: 20
  },
  modalCard: {
    width: 'min(480px, 100%)',
    background: '#0f172a',
    border: '1px solid rgba(148,163,184,0.18)',
    borderRadius: 18,
    boxShadow: '0 24px 50px rgba(15, 23, 42, 0.8)',
    padding: 24
  },
  fieldLabel: {
    display: 'block',
    marginBottom: 8,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#7dd3fc'
  },
  fieldInput: {
    width: '100%',
    background: 'rgba(15, 23, 42, 0.9)',
    color: '#f8fafc',
    border: '1px solid rgba(148,163,184,0.22)',
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 15,
    boxSizing: 'border-box'
  },
  emptyState: {
    padding: '10px 12px',
    borderRadius: 10,
    background: 'rgba(59,130,246,0.08)',
    color: '#bfdbfe',
    border: '1px solid rgba(96,165,250,0.2)',
    fontSize: 13
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8
  },
  publicMain: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 1200,
    margin: '0 auto',
    padding: '20px 20px 60px'
  },
  heroSection: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: 28,
    alignItems: 'center',
    paddingTop: 32
  },
  heroTextWrap: {
    maxWidth: 620
  },
  eyebrow: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: 999,
    background: 'rgba(76,201,240,0.12)',
    color: '#7ae7ff',
    border: '1px solid rgba(122,231,255,0.3)',
    letterSpacing: '0.08em',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  heroTitle: {
    margin: '20px 0 18px',
    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
    lineHeight: 1.02,
    letterSpacing: '-0.06em',
    color: '#f8fafc'
  },
  heroText: {
    color: '#cbd5e1',
    fontSize: 18,
    lineHeight: 1.7,
    marginBottom: 24
  },
  heroActions: {
    display: 'flex',
    gap: 12,
    marginBottom: 28
  },
  trustRow: {
    display: 'flex',
    gap: 32,
    flexWrap: 'wrap',
    color: '#cbd5e1'
  },
  heroVisualCard: {
    border: '1px solid rgba(148,163,184,0.2)',
    background: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 20,
    boxShadow: '0 30px 60px rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(10px)',
    padding: 18
  },
  visualHeader: {
    display: 'flex',
    gap: 8,
    paddingBottom: 16
  },
  dotGreen: { width: 10, height: 10, borderRadius: '50%', background: '#22c55e' },
  dotYellow: { width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' },
  dotRed: { width: 10, height: 10, borderRadius: '50%', background: '#ef4444' },
  visualGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16
  },
  panelCard: {
    background: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 16,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  panelCardWide: {
    gridColumn: '1 / -1',
    background: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 16,
    padding: 16
  },
  panelLabel: { fontSize: 12, color: '#94a3b8' },
  panelValue: { fontSize: 22, color: '#f8fafc', fontWeight: 700 },
  progressTrack: {
    width: '100%',
    height: 8,
    background: 'rgba(148,163,184,0.12)',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4cc9f0, #7ae7ff)',
    borderRadius: 999
  },
  rowBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#cbd5e1',
    marginBottom: 14
  },
  barGroup: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 12,
    height: 120,
    paddingTop: 12
  },
  bar: {
    flex: 1,
    background: 'linear-gradient(180deg, #7ae7ff, #4cc9f0)',
    borderRadius: '10px 10px 0 0',
    minHeight: 10
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 18,
    marginTop: 40
  },
  featureCard: {
    background: 'rgba(15, 23, 42, 0.72)',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 18,
    padding: 20,
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  pricingSection: {
    marginTop: 72
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: 28
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 'clamp(2rem, 3vw, 2.8rem)',
    margin: '12px 0 0'
  },
  pricingCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 18
  },
  priceCard: {
    background: 'rgba(15, 23, 42, 0.78)',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 20,
    padding: 22,
    display: 'flex',
    flexDirection: 'column',
    gap: 18
  },
  priceCardFeatured: {
    transform: 'translateY(-8px)',
    borderColor: 'rgba(122,231,255,0.5)',
    boxShadow: '0 20px 35px rgba(76,201,240,0.18)'
  },
  planBadge: {
    display: 'inline-flex',
    alignSelf: 'flex-start',
    background: 'rgba(148,163,184,0.12)',
    color: '#cbd5e1',
    borderRadius: 999,
    padding: '7px 10px',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  planBadgeFeatured: {
    background: 'rgba(122,231,255,0.15)',
    color: '#7ae7ff'
  },
  planTitle: {
    margin: 0,
    fontSize: 40,
    color: '#f8fafc'
  },
  planSmall: {
    fontSize: 14,
    color: '#94a3b8'
  },
  planList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    color: '#cbd5e1'
  },
  switcherWrap: {
    marginTop: 48,
    background: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 20,
    padding: 18
  },
  tabsRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 18,
    flexWrap: 'wrap'
  },
  tabButton: (active) => ({
    background: active ? 'rgba(76,201,240,0.12)' : 'rgba(148,163,184,0.08)',
    color: active ? '#7ae7ff' : '#e2e8f0',
    border: active ? '1px solid rgba(122,231,255,0.4)' : '1px solid rgba(148,163,184,0.12)',
    borderRadius: 10,
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 600
  }),
  dashboardShell: {
    minHeight: '100vh',
    display: 'flex',
    background: '#020817',
    color: '#e2e8f0',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
  },
  sidebar: {
    width: 240,
    background: 'linear-gradient(180deg, rgba(15,23,42,1), rgba(9,14,28,1))',
    borderRight: '1px solid rgba(148,163,184,0.12)',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 22
  },
  sidebarBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontWeight: 700,
    fontSize: 20,
    color: '#f8fafc'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  navButton: (active) => ({
    background: active ? 'rgba(76,201,240,0.12)' : 'transparent',
    color: active ? '#7ae7ff' : '#dbeafe',
    border: active ? '1px solid rgba(122,231,255,0.35)' : '1px solid transparent',
    borderRadius: 10,
    padding: '11px 12px',
    textAlign: 'left',
    cursor: 'pointer',
    fontWeight: 600
  }),
  logoutButton: {
    marginTop: 'auto',
    background: 'rgba(239,68,68,0.1)',
    color: '#fca5a5',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 10,
    padding: '12px 14px',
    cursor: 'pointer',
    fontWeight: 600
  },
  dashboardBody: {
    flex: 1,
    padding: 28,
    background: 'radial-gradient(circle at top right, rgba(76,201,240,0.12), transparent 24%), #020817'
  },
  dashboardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  headerBrandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  partnerPill: {
    display: 'inline-flex',
    padding: '4px 8px',
    borderRadius: 999,
    background: 'rgba(122,231,255,0.12)',
    color: '#7ae7ff',
    border: '1px solid rgba(122,231,255,0.25)',
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 700
  },
  dashboardTitle: {
    margin: '6px 0 0',
    fontSize: 32,
    color: '#f8fafc'
  },
  headerActions: {
    display: 'flex',
    gap: 10
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 18,
    marginBottom: 24
  },
  kpiCard: {
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 18,
    padding: 20
  },
  kpiLabel: {
    display: 'block',
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 14
  },
  kpiValueRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  kpiValue: {
    fontSize: 30,
    color: '#f8fafc'
  },
  kpiDelta: (tone) => ({
    display: 'inline-flex',
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: tone === 'cyan' ? 'rgba(76,201,240,0.12)' : tone === 'green' ? 'rgba(34,197,94,0.12)' : tone === 'blue' ? 'rgba(96,165,250,0.12)' : 'rgba(168,85,247,0.12)',
    color: tone === 'cyan' ? '#7ae7ff' : tone === 'green' ? '#4ade80' : tone === 'blue' ? '#93c5fd' : '#c084fc'
  }),
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 0.6fr',
    gap: 18,
    marginBottom: 24
  },
  mainPanel: {
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 18,
    padding: 18
  },
  sidePanel: {
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 18,
    padding: 18
  },
  panelTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18
  },
  panelTitle: {
    margin: 0,
    color: '#f8fafc',
    fontSize: 18
  },
  chip: {
    display: 'inline-flex',
    padding: '6px 10px',
    borderRadius: 999,
    background: 'rgba(34,197,94,0.12)',
    color: '#4ade80',
    fontSize: 12,
    fontWeight: 700
  },
  barChartWrap: {
    height: 170,
    display: 'flex',
    alignItems: 'flex-end',
    gap: 12,
    paddingTop: 12
  },
  metricBarCol: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: '100%'
  },
  metricBar: {
    width: '100%',
    maxWidth: 22,
    background: 'linear-gradient(180deg, #7ae7ff, #4cc9f0)',
    borderRadius: '10px 10px 0 0'
  },
  sideText: {
    fontSize: 28,
    margin: '10px 0 16px',
    color: '#f8fafc',
    fontWeight: 700
  },
  listSimple: {
    margin: 0,
    paddingLeft: 18,
    color: '#cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  tablePanel: {
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    color: '#e2e8f0'
  },
  th: {
    textAlign: 'left',
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '10px 12px',
    borderBottom: '1px solid rgba(148,163,184,0.15)'
  },
  td: {
    padding: '14px 12px',
    borderBottom: '1px solid rgba(148,163,184,0.1)'
  },
  statusPill: (status) => ({
    display: 'inline-flex',
    padding: '6px 10px',
    borderRadius: 999,
    background: status === 'Healthy' ? 'rgba(34,197,94,0.12)' : status === 'Running' ? 'rgba(76,201,240,0.12)' : 'rgba(245,158,11,0.12)',
    color: status === 'Healthy' ? '#4ade80' : status === 'Running' ? '#7ae7ff' : '#fbbf24',
    fontWeight: 700,
    fontSize: 12
  }),
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 18
  },
  panelBox: {
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 18,
    padding: 18,
    minHeight: 220
  },
  footerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    color: '#94a3b8',
    fontSize: 12,
    paddingTop: 8,
    borderTop: '1px solid rgba(148,163,184,0.12)'
  },
  footerPartner: {
    color: '#7ae7ff',
    fontWeight: 600
  }
};
