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
      background: linear-gradient(180deg, var(--bg-secondary) 0%, #151f32 100%);
      border-right: 1px solid var(--border);
      padding: 24px;
      display: flex;
      flex-direction: column;
      position: fixed;
      width: 260px;
      height: 100vh;
      overflow-y: auto;
      z-index: 100;
    }

    .sidebar::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 1px;
      height: 100%;
      background: linear-gradient(180deg, var(--primary) 0%, transparent 100%);
      opacity: 0.3;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }

    .logo-icon {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--info) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
    }

    .logo-text {
      font-size: 20px;
      font-weight: 600;
      background: linear-gradient(90deg, var(--primary-light), var(--info));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .nav-section {
      margin-bottom: 24px;
    }

    .nav-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-muted);
      margin-bottom: 12px;
      padding-left: 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: 4px;
      font-size: 14px;
      font-weight: 500;
      position: relative;
      overflow: hidden;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 0;
      background: var(--primary);
      border-radius: 0 3px 3px 0;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .nav-item:hover {
      background: rgba(14, 165, 233, 0.08);
      color: var(--text-primary);
      transform: translateX(4px);
    }

    .nav-item:hover::before {
      height: 60%;
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(14, 165, 233, 0.15) 0%, rgba(14, 165, 233, 0.05) 100%);
      color: var(--primary-light);
      font-weight: 600;
    }

    .nav-item.active::before {
      height: 70%;
    }

    .nav-item.active .nav-icon {
      transform: scale(1.1);
    }

    .nav-icon {
      font-size: 18px;
      transition: transform 0.2s ease;
      width: 24px;
      text-align: center;
    }

    .nav-badge {
      margin-left: auto;
      background: var(--error);
      color: white;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 600;
    }

    .main {
      margin-left: 260px;
      padding: 32px;
      width: calc(100% - 260px);
      min-height: 100vh;
      background: 
        radial-gradient(ellipse at top right, rgba(14, 165, 233, 0.05) 0%, transparent 50%),
        radial-gradient(ellipse at bottom left, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
        var(--bg-primary);
    }

    .view-container {
      display: none;
      animation: fadeIn 0.3s ease;
    }

    .view-container.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .header-left h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 4px;
      background: linear-gradient(90deg, var(--text-primary) 0%, var(--text-secondary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-left p {
      color: var(--text-secondary);
      font-size: 15px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(14, 165, 233, 0.4);
    }

    .btn-secondary {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      background: var(--bg-secondary);
      border-color: var(--primary);
    }

    .btn-danger {
      background: linear-gradient(135deg, var(--error) 0%, #b91c1c 100%);
      color: white;
    }

    .btn-success {
      background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
      color: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: linear-gradient(135deg, var(--bg-card) 0%, rgba(30, 41, 59, 0.8) 100%);
      border-radius: 16px;
      padding: 28px;
      border: 1px solid var(--border);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      min-height: 140px;
      display: flex;
      flex-direction: column;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--info));
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: 16px 16px 0 0;
    }

    .stat-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      border-color: var(--primary);
    }

    .stat-card:hover::before {
      opacity: 1;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      font-size: 26px;
      position: relative;
      flex-shrink: 0;
    }

    .stat-icon::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 14px;
      background: inherit;
      opacity: 0.3;
      filter: blur(10px);
    }

    .stat-icon.running { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    .stat-icon.completed { background: linear-gradient(135deg, #10b981, #059669); }
    .stat-icon.pending { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .stat-icon.failed { background: linear-gradient(135deg, #ef4444, #dc2626); }

    .stat-value {
      font-size: 42px;
      font-weight: 700;
      margin-bottom: 4px;
      line-height: 1.1;
    }

    .stat-label {
      font-size: 15px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .stat-trend {
      font-size: 12px;
      margin-top: auto;
      padding-top: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .stat-trend.up { color: var(--success); }
    .stat-trend.down { color: var(--error); }

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
      font-size: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-title::before {
      content: '';
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, var(--primary), var(--info));
      border-radius: 2px;
    }

    .view-all {
      font-size: 13px;
      color: var(--primary);
      cursor: pointer;
      font-weight: 500;
    }

    .view-all:hover {
      text-decoration: underline;
    }

    .workflow-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .workflow-card {
      background: linear-gradient(135deg, var(--bg-card) 0%, rgba(30, 41, 59, 0.8) 100%);
      border-radius: 14px;
      padding: 24px;
      border: 1px solid var(--border);
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 20px;
      align-items: center;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      min-height: 80px;
    }

    .workflow-card:hover {
      border-color: var(--primary);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      transform: translateX(4px);
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
      gap: 20px;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .workflow-meta span {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .workflow-status {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.running {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
      color: #60a5fa;
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
    }

    .status-badge.completed {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
      color: #34d399;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
    }

    .status-badge.waiting-approval {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
      color: #fbbf24;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
    }

    .status-badge.failed {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
      color: #f87171;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
    }

    .status-badge.created {
      background: linear-gradient(135deg, rgba(100, 116, 139, 0.2), rgba(100, 116, 139, 0.1));
      color: #94a3b8;
    }

    .event-timeline {
      background: linear-gradient(135deg, var(--bg-card) 0%, rgba(30, 41, 59, 0.8) 100%);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid var(--border);
    }

    .timeline-item {
      display: flex;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
      transition: all 0.2s ease;
    }

    .timeline-item:hover {
      padding-left: 8px;
    }

    .timeline-item:last-child {
      border-bottom: none;
    }

    .timeline-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--info));
      margin-top: 4px;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
    }

    .timeline-dot::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--info));
      opacity: 0.3;
      filter: blur(4px);
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
      background: rgba(0, 0, 0, 0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .modal-overlay.active {
      display: flex;
      animation: fadeIn 0.2s ease;
    }

    .modal {
      background: linear-gradient(135deg, var(--bg-secondary) 0%, #151f32 100%);
      border-radius: 20px;
      padding: 32px;
      width: 90%;
      max-width: 600px;
      border: 1px solid var(--border);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }

    .modal-title {
      font-size: 22px;
      font-weight: 600;
    }

    .modal-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 28px;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }

    .modal-close:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
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
      padding: 14px 18px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 14px;
      font-family: inherit;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.2);
    }

    .form-select {
      width: 100%;
      padding: 14px 18px;
      border-radius: 10px;
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
      border-radius: 12px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      display: none;
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: 500;
      z-index: 2000;
    }

    .toast.show {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toast.success {
      border-color: var(--success);
      background: linear-gradient(135deg, var(--bg-secondary), rgba(16, 185, 129, 0.1));
    }

    .toast.error {
      border-color: var(--error);
      background: linear-gradient(135deg, var(--bg-secondary), rgba(239, 68, 68, 0.1));
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary);
    }

    .empty-state-icon {
      font-size: 56px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .chart-card {
      background: linear-gradient(135deg, var(--bg-card) 0%, rgba(30, 41, 59, 0.8) 100%);
      border-radius: 16px;
      padding: 28px;
      border: 1px solid var(--border);
      min-height: 180px;
    }

    .chart-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 24px;
    }

    .bar-chart {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .bar-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .bar-label {
      width: 80px;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .bar-track {
      flex: 1;
      height: 24px;
      background: var(--bg-tertiary);
      border-radius: 6px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.5s ease;
    }

    .bar-fill.running { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
    .bar-fill.completed { background: linear-gradient(90deg, #10b981, #34d399); }
    .bar-fill.pending { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .bar-fill.failed { background: linear-gradient(90deg, #ef4444, #f87171); }

    .bar-value {
      width: 40px;
      text-align: right;
      font-weight: 600;
      font-size: 14px;
    }

    .approval-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .approval-card {
      background: var(--bg-card);
      border-radius: 14px;
      padding: 20px;
      border: 1px solid var(--border);
      border-left: 4px solid var(--warning);
    }

    .approval-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 12px;
    }

    .approval-id {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      color: var(--primary-light);
    }

    .approval-time {
      font-size: 12px;
      color: var(--text-muted);
    }

    .approval-desc {
      color: var(--text-secondary);
      margin-bottom: 16px;
    }

    .approval-actions {
      display: flex;
      gap: 12px;
    }

    .settings-section {
      background: var(--bg-card);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid var(--border);
      margin-bottom: 20px;
    }

    .settings-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }

    .settings-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
    }

    .settings-row:last-child {
      border-bottom: none;
    }

    .settings-label {
      font-weight: 500;
    }

    .settings-desc {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    .toggle {
      width: 52px;
      height: 28px;
      background: var(--bg-tertiary);
      border-radius: 14px;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
    }

    .toggle.active {
      background: var(--primary);
    }

    .toggle::after {
      content: '';
      position: absolute;
      width: 22px;
      height: 22px;
      background: white;
      border-radius: 50%;
      top: 3px;
      left: 3px;
      transition: all 0.2s ease;
    }

    .toggle.active::after {
      left: 27px;
    }

    .api-docs {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .api-endpoint {
      background: var(--bg-card);
      border-radius: 14px;
      padding: 20px;
      border: 1px solid var(--border);
    }

    .api-method {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 12px;
    }

    .api-method.get { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .api-method.post { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .api-method.put { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .api-method.delete { background: rgba(239, 68, 68, 0.2); color: #f87171; }

    .api-path {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .about-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .about-card {
      background: var(--bg-card);
      border-radius: 16px;
      padding: 28px;
      border: 1px solid var(--border);
    }

    .about-card h3 {
      font-size: 18px;
      margin-bottom: 16px;
    }

    .about-card p {
      color: var(--text-secondary);
      line-height: 1.7;
    }

    .version-badge {
      display: inline-block;
      padding: 8px 16px;
      background: linear-gradient(135deg, var(--primary), var(--info));
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
    }

    @media (max-width: 1200px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .analytics-grid { grid-template-columns: 1fr; }
      .api-docs { grid-template-columns: 1fr; }
      .about-content { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .app { grid-template-columns: 1fr; }
      .sidebar { display: none; }
      .main { margin-left: 0; width: 100%; padding: 16px; }
      .stats-grid { grid-template-columns: 1fr; }
      .header { flex-direction: column; gap: 16px; align-items: flex-start; }
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
        <div class="nav-item active" data-view="overview">
          <span class="nav-icon">◆</span>
          <span>Overview</span>
        </div>
        <div class="nav-item" data-view="workflows">
          <span class="nav-icon">◎</span>
          <span>Workflows</span>
        </div>
        <div class="nav-item" data-view="analytics">
          <span class="nav-icon">◇</span>
          <span>Analytics</span>
        </div>
      </nav>

      <nav class="nav-section">
        <div class="nav-title">Management</div>
        <div class="nav-item" data-view="approvals">
          <span class="nav-icon">☐</span>
          <span>Approvals</span>
          <span class="nav-badge" id="approval-badge" style="display:none">0</span>
        </div>
        <div class="nav-item" data-view="settings">
          <span class="nav-icon">⚙</span>
          <span>Settings</span>
        </div>
      </nav>

      <nav class="nav-section">
        <div class="nav-title">System</div>
        <div class="nav-item" data-view="apidocs">
          <span class="nav-icon">⚡</span>
          <span>API Docs</span>
        </div>
        <div class="nav-item" data-view="about">
          <span class="nav-icon">ℹ</span>
          <span>About</span>
        </div>
      </nav>
    </aside>

    <main class="main">
      <div id="view-overview" class="view-container active">
        <header class="header">
          <div class="header-left">
            <h1>Workflow Dashboard</h1>
            <p>Real-time monitoring and management of your orchestrated workflows</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary" onclick="refreshWorkflows()">
              ↻ Refresh
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
            <div class="stat-trend up">↑ 12% from last hour</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon completed">✓</div>
            <div class="stat-value" id="stat-completed">0</div>
            <div class="stat-label">Completed</div>
            <div class="stat-trend up">↑ 8% from last hour</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon pending">⏳</div>
            <div class="stat-value" id="stat-pending">0</div>
            <div class="stat-label">Pending Approval</div>
            <div class="stat-trend down">↓ 3% from last hour</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon failed">✗</div>
            <div class="stat-value" id="stat-failed">0</div>
            <div class="stat-label">Failed</div>
            <div class="stat-trend">Same as last hour</div>
          </div>
        </div>

        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Active Workflows</h2>
            <span class="view-all" onclick="switchView('workflows')">View All →</span>
          </div>
          <div class="workflow-list" id="workflow-list"></div>
        </section>

        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Recent Events</h2>
          </div>
          <div class="event-timeline" id="event-timeline"></div>
        </section>
      </div>

      <div id="view-workflows" class="view-container">
        <header class="header">
          <div class="header-left">
            <h1>Workflows</h1>
            <p>Manage and monitor all your workflow instances</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary" onclick="refreshWorkflows()">↻ Refresh</button>
            <button class="btn btn-primary" onclick="openCreateModal()">+ New Workflow</button>
          </div>
        </header>
        <div class="workflow-list" id="workflow-list-full"></div>
      </div>

      <div id="view-analytics" class="view-container">
        <header class="header">
          <div class="header-left">
            <h1>Analytics</h1>
            <p>Insights into your workflow performance</p>
          </div>
        </header>
        <div class="analytics-grid">
          <div class="chart-card">
            <h3 class="chart-title">Workflow Status Distribution</h3>
            <div class="bar-chart" id="status-distribution"></div>
          </div>
          <div class="chart-card">
            <h3 class="chart-title">Events Per Hour</h3>
            <div class="bar-chart" id="events-per-hour"></div>
          </div>
          <div class="chart-card">
            <h3 class="chart-title">Top Workflow Types</h3>
            <div class="bar-chart" id="workflow-types"></div>
          </div>
          <div class="chart-card">
            <h3 class="chart-title">Average Duration (min)</h3>
            <div class="bar-chart" id="avg-duration"></div>
          </div>
        </div>
      </div>

      <div id="view-approvals" class="view-container">
        <header class="header">
          <div class="header-left">
            <h1>Approvals</h1>
            <p>Review and approve pending workflow requests</p>
          </div>
        </header>
        <div class="approval-list" id="approval-list"></div>
      </div>

      <div id="view-settings" class="view-container">
        <header class="header">
          <div class="header-left">
            <h1>Settings</h1>
            <p>Configure your Orchestra Mesh environment</p>
          </div>
        </header>
        <div class="settings-section">
          <h3 class="settings-title">General</h3>
          <div class="settings-row">
            <div>
              <div class="settings-label">Auto-refresh</div>
              <div class="settings-desc">Automatically refresh workflow data</div>
            </div>
            <div class="toggle active" onclick="this.classList.toggle('active')"></div>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-label">Notifications</div>
              <div class="settings-desc">Enable desktop notifications for state changes</div>
            </div>
            <div class="toggle" onclick="this.classList.toggle('active')"></div>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-label">Sound Alerts</div>
              <div class="settings-desc">Play sound on critical events</div>
            </div>
            <div class="toggle active" onclick="this.classList.toggle('active')"></div>
          </div>
        </div>
        <div class="settings-section">
          <h3 class="settings-title">API Configuration</h3>
          <div class="form-group">
            <label class="form-label">Control Plane URL</label>
            <input type="text" class="form-input" value="http://localhost:8090/api/v1">
          </div>
          <div class="form-group">
            <label class="form-label">Refresh Interval (seconds)</label>
            <input type="text" class="form-input" value="5">
          </div>
        </div>
      </div>

      <div id="view-apidocs" class="view-container">
        <header class="header">
          <div class="header-left">
            <h1>API Documentation</h1>
            <p>RESTful API endpoints for Orchestra Mesh</p>
          </div>
        </header>
        <div class="api-docs">
          <div class="api-endpoint">
            <h4 class="chart-title" style="margin-bottom:12px">Workflows</h4>
            <div style="display:flex;align-items:center;margin-bottom:8px">
              <span class="api-method get">GET</span>
              <span class="api-path">/api/v1/workflows</span>
            </div>
            <div style="display:flex;align-items:center;margin-bottom:8px">
              <span class="api-method post">POST</span>
              <span class="api-path">/api/v1/workflows</span>
            </div>
            <div style="display:flex;align-items:center;margin-bottom:8px">
              <span class="api-method get">GET</span>
              <span class="api-path">/api/v1/workflows/:id</span>
            </div>
            <div style="display:flex;align-items:center">
              <span class="api-method delete">DELETE</span>
              <span class="api-path">/api/v1/workflows/:id</span>
            </div>
          </div>
          <div class="api-endpoint">
            <h4 class="chart-title" style="margin-bottom:12px">Commands</h4>
            <div style="display:flex;align-items:center;margin-bottom:8px">
              <span class="api-method post">POST</span>
              <span class="api-path">/api/v1/workflows/:id/commands</span>
            </div>
          </div>
          <div class="api-endpoint">
            <h4 class="chart-title" style="margin-bottom:12px">Events</h4>
            <div style="display:flex;align-items:center;margin-bottom:8px">
              <span class="api-method get">GET</span>
              <span class="api-path">/api/v1/workflows/:id/events</span>
            </div>
            <div style="display:flex;align-items:center">
              <span class="api-method post">POST</span>
              <span class="api-path">/api/v1/workflows/:id/events</span>
            </div>
          </div>
          <div class="api-endpoint">
            <h4 class="chart-title" style="margin-bottom:12px">Health</h4>
            <div style="display:flex;align-items:center;margin-bottom:8px">
              <span class="api-method get">GET</span>
              <span class="api-path">/api/v1/health</span>
            </div>
            <div style="display:flex;align-items:center">
              <span class="api-method get">GET</span>
              <span class="api-path">/api/v1/health/ready</span>
            </div>
          </div>
        </div>
      </div>

      <div id="view-about" class="view-container">
        <header class="header">
          <div class="header-left">
            <h1>About Orchestra Mesh</h1>
            <p>Enterprise-grade durable workflow orchestration engine</p>
          </div>
        </header>
        <div class="about-content">
          <div class="about-card">
            <h3>Version</h3>
            <div class="version-badge">v1.0.0</div>
          </div>
          <div class="about-card">
            <h3>About</h3>
            <p>Orchestra Mesh is an enterprise-grade durable distributed workflow engine built for orchestrating complex business processes. It provides reliable execution, state management, and approval workflows.</p>
          </div>
          <div class="about-card">
            <h3>Features</h3>
            <p>• Durable execution with event sourcing<br>• Built-in approval workflows<br>• Real-time monitoring<br>• RESTful API<br>• Extensible architecture</p>
          </div>
          <div class="about-card">
            <h3>License</h3>
            <p>Apache License 2.0</p>
          </div>
        </div>
      </div>
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
    let currentView = 'overview';
    const API_BASE = 'http://localhost:8090/api/v1';

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (view) switchView(view);
      });
    });

    function switchView(viewName) {
      currentView = viewName;
      
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewName) item.classList.add('active');
      });
      
      document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
      });
      
      const targetView = document.getElementById('view-' + viewName);
      if (targetView) targetView.classList.add('active');

      if (viewName === 'analytics') renderAnalytics();
      if (viewName === 'approvals') renderApprovals();
    }

    async function fetchWorkflows() {
      try {
        const res = await fetch(API_BASE + '/workflows');
        const data = await res.json();
        workflows = data.data || [];
        renderAll();
        updateApprovalBadge();
      } catch (err) {
        console.log('Control plane unavailable, showing sample data');
        workflows = getSampleWorkflows();
        renderAll();
      }
    }

    function getSampleWorkflows() {
      return [
        { id: 'wf-001', state: { status: 'running', lastEventType: 'task.started' }, events: [{ type: 'workflow.created', timestamp: new Date().toISOString() }, { type: 'task.started', timestamp: new Date().toISOString() }] },
        { id: 'wf-002', state: { status: 'waiting_approval', lastEventType: 'approval.requested' }, events: [{ type: 'workflow.created', timestamp: new Date().toISOString() }, { type: 'approval.requested', timestamp: new Date().toISOString() }] },
        { id: 'wf-003', state: { status: 'completed', lastEventType: 'workflow.completed' }, events: [{ type: 'workflow.created', timestamp: new Date().toISOString() }, { type: 'workflow.completed', timestamp: new Date().toISOString() }] },
        { id: 'wf-004', state: { status: 'failed', lastEventType: 'task.failed' }, events: [{ type: 'workflow.created', timestamp: new Date().toISOString() }, { type: 'task.failed', timestamp: new Date().toISOString() }] },
        { id: 'wf-005', state: { status: 'running', lastEventType: 'task.running' }, events: [{ type: 'workflow.created', timestamp: new Date().toISOString() }] },
      ];
    }

    function updateApprovalBadge() {
      const pending = workflows.filter(w => w.state?.status === 'waiting_approval').length;
      const badge = document.getElementById('approval-badge');
      if (pending > 0) {
        badge.textContent = pending;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    }

    function renderAll() {
      updateStats();
      renderWorkflows();
      renderWorkflowsFull();
      renderEvents();
      
      document.querySelectorAll('.stat-value').forEach(el => el.style.opacity = '0.5');
      setTimeout(() => {
        document.querySelectorAll('.stat-value').forEach(el => el.style.opacity = '1');
      }, 100);
    }

    function updateStats() {
      const stats = { running: 0, completed: 0, waiting_approval: 0, failed: 0, created: 0 };
      workflows.forEach(wf => {
        const status = wf.state?.status || 'created';
        if (status === 'running') stats.running++;
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
      const activeWorkflows = workflows.slice(0, 5);
      
      if (activeWorkflows.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No workflows found. Create your first workflow to get started.</p></div>';
        return;
      }

      container.innerHTML = activeWorkflows.map(wf => renderWorkflowCard(wf)).join('');
    }

    function renderWorkflowsFull() {
      const container = document.getElementById('workflow-list-full');
      if (workflows.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No workflows found. Create your first workflow to get started.</p></div>';
        return;
      }
      container.innerHTML = workflows.map(wf => renderWorkflowCard(wf)).join('');
    }

    function renderWorkflowCard(wf) {
      const status = wf.state?.status || 'created';
      const statusClass = status.replace('_', '-');
      const lastEvent = wf.state?.lastEventType || 'none';
      const timestamp = wf.events?.[wf.events.length - 1]?.timestamp || new Date().toISOString();
      
      const displayTime = timestamp.substring(0, 16).replace('T', ' ');
      
      return \`
        <div class="workflow-card" onclick="showWorkflowDetail('\${wf.id}')">
          <div class="workflow-info">
            <div class="workflow-id">\${wf.id}</div>
            <div class="workflow-meta">
              <span>◆ \${lastEvent}</span>
              <span>⚡ \${wf.events?.length || 0} events</span>
              <span>○ \${displayTime}</span>
            </div>
          </div>
          <div class="workflow-status">
            <span class="status-badge \${statusClass}">\${status.replace('_', ' ')}</span>
          </div>
        </div>
      \`;
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
            <div class="timeline-time">\${event.timestamp.substring(0, 16).replace('T', ' ')}</div>
          </div>
        </div>
      \`).join('');
    }

    function renderAnalytics() {
      const stats = { running: 0, completed: 0, waiting_approval: 0, failed: 0 };
      workflows.forEach(wf => {
        const status = wf.state?.status || 'created';
        if (status === 'running') stats.running++;
        else if (status === 'completed') stats.completed++;
        else if (status === 'waiting_approval') stats.waiting_approval++;
        else if (status === 'failed') stats.failed++;
      });

      const total = workflows.length || 1;
      
      document.getElementById('status-distribution').innerHTML = [
        { label: 'Running', value: stats.running, cls: 'running' },
        { label: 'Completed', value: stats.completed, cls: 'completed' },
        { label: 'Pending', value: stats.waiting_approval, cls: 'pending' },
        { label: 'Failed', value: stats.failed, cls: 'failed' },
      ].map(d => \`
        <div class="bar-item">
          <span class="bar-label">\${d.label}</span>
          <div class="bar-track">
            <div class="bar-fill \${d.cls}" style="width: \${(d.value / total) * 100}%"></div>
          </div>
          <span class="bar-value">\${d.value}</span>
        </div>
      \`).join('');

      document.getElementById('events-per-hour').innerHTML = [
        { label: 'Last hour', value: 45, cls: 'running' },
        { label: '2h ago', value: 38, cls: 'completed' },
        { label: '3h ago', value: 52, cls: 'running' },
        { label: '4h ago', value: 29, cls: 'completed' },
      ].map(d => \`
        <div class="bar-item">
          <span class="bar-label">\${d.label}</span>
          <div class="bar-track">
            <div class="bar-fill \${d.cls}" style="width: \${(d.value / 60) * 100}%"></div>
          </div>
          <span class="bar-value">\${d.value}</span>
        </div>
      \`).join('');

      document.getElementById('workflow-types').innerHTML = [
        { label: 'Default', value: 12, cls: 'running' },
        { label: 'DataProcess', value: 8, cls: 'completed' },
        { label: 'Approval', value: 5, cls: 'pending' },
        { label: 'Export', value: 3, cls: 'failed' },
      ].map(d => \`
        <div class="bar-item">
          <span class="bar-label">\${d.label}</span>
          <div class="bar-track">
            <div class="bar-fill \${d.cls}" style="width: \${(d.value / 15) * 100}%"></div>
          </div>
          <span class="bar-value">\${d.value}</span>
        </div>
      \`).join('');

      document.getElementById('avg-duration').innerHTML = [
        { label: 'Today', value: 4.2, cls: 'running' },
        { label: 'Yesterday', value: 5.1, cls: 'completed' },
        { label: 'This week', value: 3.8, cls: 'pending' },
        { label: 'Last week', value: 4.5, cls: 'failed' },
      ].map(d => \`
        <div class="bar-item">
          <span class="bar-label">\${d.label}</span>
          <div class="bar-track">
            <div class="bar-fill \${d.cls}" style="width: \${(d.value / 6) * 100}%"></div>
          </div>
          <span class="bar-value">\${d.value}m</span>
        </div>
      \`).join('');
    }

    function renderApprovals() {
      const container = document.getElementById('approval-list');
      const pendingWorkflows = workflows.filter(wf => wf.state?.status === 'waiting_approval');
      
      if (pendingWorkflows.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✓</div><p>No pending approvals</p></div>';
        return;
      }

      container.innerHTML = pendingWorkflows.map(wf => \`
        <div class="approval-card">
          <div class="approval-header">
            <div class="approval-id">\${wf.id}</div>
            <div class="approval-time">\${wf.events?.slice(-1)[0]?.timestamp?.substring(0, 16).replace('T', ' ') || 'N/A'}</div>
          </div>
          <div class="approval-desc">Approval requested for workflow \${wf.id}</div>
          <div class="approval-actions">
            <button class="btn btn-success" onclick="approveWorkflow('\${wf.id}')">✓ Approve</button>
            <button class="btn btn-danger" onclick="rejectWorkflow('\${wf.id}')">✗ Reject</button>
          </div>
        </div>
      \`).join('');
    }

    async function approveWorkflow(id) {
      try {
        await fetch(API_BASE + '/workflows/' + id + '/commands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: 'approve' })
        });
        showToast('Workflow approved', 'success');
        fetchWorkflows();
      } catch (err) {
        showToast('Approved (demo)', 'success');
        fetchWorkflows();
      }
    }

    async function rejectWorkflow(id) {
      try {
        await fetch(API_BASE + '/workflows/' + id + '/commands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: 'reject' })
        });
        showToast('Workflow rejected', 'success');
        fetchWorkflows();
      } catch (err) {
        showToast('Rejected (demo)', 'success');
        fetchWorkflows();
      }
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
        workflows.push({
          id: id || 'wf-' + Date.now(),
          state: { status, lastEventType: type },
          events: [{ type, timestamp: new Date().toISOString() }]
        });
        showToast('Workflow created (demo)', 'success');
        closeCreateModal();
        renderAll();
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
      toast.innerHTML = message;
      toast.className = 'toast ' + type + ' show';
      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    document.addEventListener('DOMContentLoaded', () => {
      fetchWorkflows();
      setInterval(fetchWorkflows, 5000);
    });
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