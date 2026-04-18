import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.UI_PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Orchestra Mesh | Workflow Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0ea5e9;
      --primary-dark: #0284c7;
      --primary-light: #38bdf8;
      --success: #10b981;
      --warning: #f59e0b;
      --error: #ef4444;
      --info: #8b5cf6;
      --neutral: #64748b;
      --bg-primary: #0f172a;
      --bg-secondary: #1e293b;
      --bg-tertiary: #334155;
      --bg-card: #1e293b;
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --border: #334155;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
    }

    .app {
      display: grid;
      grid-template-columns: 260px 1fr;
      min-height: 100vh;
    }

    .sidebar {
      background: var(--bg-secondary);
      border-right: 1px solid var(--border);
      padding: 24px;
      display: flex;
      flex-direction: column;
      position: fixed;
      width: 260px;
      height: 100vh;
      overflow-y: auto;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary), var(--info));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 600;
      background: linear-gradient(90deg, var(--primary-light), var(--info));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .nav-section {
      margin-bottom: 24px;
    }

    .nav-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 4px;
    }

    .nav-item:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(14, 165, 233, 0.2), transparent);
      color: var(--primary-light);
      border-left: 3px solid var(--primary);
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      opacity: 0.7;
    }

    .main {
      margin-left: 260px;
      padding: 32px;
      width: calc(100% - 260px);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .header-left h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .header-left p {
      color: var(--text-secondary);
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
    }

    .btn-secondary {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      background: var(--bg-secondary);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: var(--bg-card);
      border-radius: 12px;
      padding: 24px;
      border: 1px solid var(--border);
      transition: all 0.3s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow);
      border-color: var(--primary);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      font-size: 24px;
    }

    .stat-icon.running { background: rgba(59, 130, 246, 0.2); }
    .stat-icon.completed { background: rgba(16, 185, 129, 0.2); }
    .stat-icon.pending { background: rgba(245, 158, 11, 0.2); }
    .stat-icon.failed { background: rgba(239, 68, 68, 0.2); }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .section {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
    }

    .workflow-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .workflow-card {
      background: var(--bg-card);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid var(--border);
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      align-items: center;
      transition: all 0.2s;
      cursor: pointer;
    }

    .workflow-card:hover {
      border-color: var(--primary);
      box-shadow: var(--shadow);
    }

    .workflow-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .workflow-id {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-light);
    }

    .workflow-meta {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .workflow-status {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-badge {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.running {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }

    .status-badge.completed {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }

    .status-badge.waiting_approval {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
    }

    .status-badge.failed {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    .status-badge.created {
      background: rgba(100, 116, 139, 0.2);
      color: #94a3b8;
    }

    .event-timeline {
      background: var(--bg-card);
      border-radius: 12px;
      padding: 24px;
      border: 1px solid var(--border);
    }

    .timeline-item {
      display: flex;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid var(--border);
    }

    .timeline-item:last-child {
      border-bottom: none;
    }

    .timeline-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--primary);
      margin-top: 4px;
      flex-shrink: 0;
    }

    .timeline-content {
      flex: 1;
    }

    .timeline-type {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .timeline-time {
      font-size: 12px;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-overlay.active {
      display: flex;
    }

    .modal {
      background: var(--bg-secondary);
      border-radius: 16px;
      padding: 32px;
      width: 90%;
      max-width: 600px;
      border: 1px solid var(--border);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .modal-title {
      font-size: 20px;
      font-weight: 600;
    }

    .modal-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 24px;
      cursor: pointer;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--text-secondary);
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 14px;
      font-family: inherit;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
    }

    .form-select {
      width: 100%;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 14px;
      font-family: inherit;
    }

    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 16px 24px;
      border-radius: 8px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      display: none;
      animation: slideIn 0.3s ease;
    }

    .toast.show {
      display: block;
    }

    .toast.success {
      border-color: var(--success);
    }

    .toast.error {
      border-color: var(--error);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary);
    }

    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .app {
        grid-template-columns: 1fr;
      }

      .sidebar {
        display: none;
      }

      .main {
        margin-left: 0;
        width: 100%;
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }
    }
  </style>
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="logo">
        <div class="logo-icon">OM</div>
        <span class="logo-text">Orchestra Mesh</span>
      </div>

      <nav class="nav-section">
        <div class="nav-title">Dashboard</div>
        <div class="nav-item active">
          <span class="nav-icon">📊</span>
          <span>Overview</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">📋</span>
          <span>Workflows</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">📈</span>
          <span>Analytics</span>
        </div>
      </nav>

      <nav class="nav-section">
        <div class="nav-title">Management</div>
        <div class="nav-item">
          <span class="nav-icon">✓</span>
          <span>Approvals</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">⚙️</span>
          <span>Settings</span>
        </div>
      </nav>

      <nav class="nav-section">
        <div class="nav-title">System</div>
        <div class="nav-item">
          <span class="nav-icon">📖</span>
          <span>API Docs</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">ℹ️</span>
          <span>About</span>
        </div>
      </nav>
    </aside>

    <main class="main">
      <header class="header">
        <div class="header-left">
          <h1>Workflow Dashboard</h1>
          <p>Real-time monitoring and management of your orchestrated workflows</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" onclick="refreshWorkflows()">
            🔄 Refresh
          </button>
          <button class="btn btn-primary" onclick="openCreateModal()">
            + New Workflow
          </button>
        </div>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon running">⚡</div>
          <div class="stat-value" id="stat-running">0</div>
          <div class="stat-label">Running</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon completed">✓</div>
          <div class="stat-value" id="stat-completed">0</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pending">⏳</div>
          <div class="stat-value" id="stat-pending">0</div>
          <div class="stat-label">Pending Approval</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon failed">✗</div>
          <div class="stat-value" id="stat-failed">0</div>
          <div class="stat-label">Failed</div>
        </div>
      </div>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Active Workflows</h2>
        </div>
        <div class="workflow-list" id="workflow-list">
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <p>No workflows found. Create your first workflow to get started.</p>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Recent Events</h2>
        </div>
        <div class="event-timeline" id="event-timeline">
          <div class="empty-state">
            <div class="empty-state-icon">📝</div>
            <p>No events yet.</p>
          </div>
        </div>
      </section>
    </main>
  </div>

  <div class="modal-overlay" id="create-modal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Create New Workflow</h3>
        <button class="modal-close" onclick="closeCreateModal()">×</button>
      </div>
      <form onsubmit="createWorkflow(event)">
        <div class="form-group">
          <label class="form-label">Workflow ID (optional)</label>
          <input type="text" class="form-input" id="workflow-id-input" placeholder="wf-001">
        </div>
        <div class="form-group">
          <label class="form-label">Initial Event Type</label>
          <select class="form-select" id="event-type-input">
            <option value="workflow.created">Workflow Created</option>
            <option value="task.started">Task Started</option>
            <option value="approval.requested">Request Approval</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Initial Status</label>
          <select class="form-select" id="status-input">
            <option value="created">Created</option>
            <option value="running">Running</option>
            <option value="waiting_approval">Waiting Approval</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">
          Create Workflow
        </button>
      </form>
    </div>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    let workflows = [];
    const API_BASE = 'http://localhost:8090/api/v1';

    async function fetchWorkflows() {
      try {
        const res = await fetch(API_BASE + '/workflows');
        const data = await res.json();
        workflows = data.data || [];
        renderWorkflows();
        updateStats();
        renderEvents();
      } catch (err) {
        showToast('Failed to connect to control plane', 'error');
      }
    }

    function updateStats() {
      const stats = { running: 0, completed: 0, waiting_approval: 0, failed: 0, created: 0 };
      workflows.forEach(wf => {
        const status = wf.state?.status || 'created';
        if (stats[status] !== undefined) stats[status]++;
        else if (status === 'running') stats.running++;
        else if (status === 'completed') stats.completed++;
        else if (status === 'waiting_approval') stats.waiting_approval++;
        else if (status === 'failed') stats.failed++;
        else stats.created++;
      });
      
      document.getElementById('stat-running').textContent = stats.running;
      document.getElementById('stat-completed').textContent = stats.completed;
      document.getElementById('stat-pending').textContent = stats.waiting_approval;
      document.getElementById('stat-failed').textContent = stats.failed;
    }

    function renderWorkflows() {
      const container = document.getElementById('workflow-list');
      if (workflows.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No workflows found. Create your first workflow to get started.</p></div>';
        return;
      }

      container.innerHTML = workflows.map(wf => {
        const status = wf.state?.status || 'created';
        const statusClass = status.replace('_', '-');
        const lastEvent = wf.state?.lastEventType || 'none';
        const timestamp = wf.events?.[wf.events.length - 1]?.timestamp || 'N/A';
        
        return \`
          <div class="workflow-card" onclick="showWorkflowDetail('\${wf.id}')">
            <div class="workflow-info">
              <div class="workflow-id">\${wf.id}</div>
              <div class="workflow-meta">
                <span>Last event: \${lastEvent}</span>
                <span>Events: \${wf.events?.length || 0}</span>
                <span>\${timestamp.substring(0, 19).replace('T', ' ')}</span>
              </div>
            </div>
            <div class="workflow-status">
              <span class="status-badge \${statusClass}">\${status.replace('_', ' ')}</span>
            </div>
          </div>
        \`;
      }).join('');
    }

    function renderEvents() {
      const container = document.getElementById('event-timeline');
      const allEvents = workflows.flatMap(wf => 
        (wf.events || []).map(e => ({ ...e, workflowId: wf.id }))
      ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

      if (allEvents.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><p>No events yet.</p></div>';
        return;
      }

      container.innerHTML = allEvents.map(event => \`
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-type">
              <span style="color: var(--primary-light);">\${event.workflowId}</span> — \${event.type}
            </div>
            <div class="timeline-time">\${event.timestamp.substring(0, 19).replace('T', ' ')}</div>
          </div>
        </div>
      \`).join('');
    }

    function openCreateModal() {
      document.getElementById('create-modal').classList.add('active');
    }

    function closeCreateModal() {
      document.getElementById('create-modal').classList.remove('active');
    }

    async function createWorkflow(e) {
      e.preventDefault();
      const id = document.getElementById('workflow-id-input').value;
      const type = document.getElementById('event-type-input').value;
      const status = document.getElementById('status-input').value;

      try {
        const res = await fetch(API_BASE + '/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, type, status })
        });
        
        if (res.ok) {
          showToast('Workflow created successfully', 'success');
          closeCreateModal();
          fetchWorkflows();
        } else {
          showToast('Failed to create workflow', 'error');
        }
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    }

    async function refreshWorkflows() {
      showToast('Refreshing...', 'success');
      await fetchWorkflows();
    }

    function showWorkflowDetail(id) {
      const wf = workflows.find(w => w.id === id);
      if (wf) {
        showToast(\`Workflow: \${wf.state?.status || 'created'}\`, 'success');
      }
    }

    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.className = 'toast ' + type + ' show';
      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    fetchWorkflows();
    setInterval(fetchWorkflows, 5000);
  </script>
</body>
</html>
`;

app.get('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

app.get('/api/status', (_req, res) => {
  res.json({
    service: 'orchestra-mesh-web-ui',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Orchestra Mesh Web UI running at http://localhost:${PORT}`);
});

export default app;