export interface DatabaseSettingsProps {
  onSave: () => void;
  apiBaseUrl?: string;
}

export interface DatabaseStatus {
  connected: boolean;
  type: 'sqlite' | 'mysql' | 'postgresql';
  path?: string;
  host?: string;
  port?: number;
  database?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  error?: string;
}

export class DatabaseSettingsUI {
  private container: HTMLElement;
  private props: DatabaseSettingsProps;
  private apiBaseUrl: string;
  private dbType: 'sqlite' | 'mysql' | 'postgresql' = 'sqlite';
  private isLoading: boolean = false;
  private errorMessage: string = '';
  private successMessage: string = '';

  constructor(container: HTMLElement, props: DatabaseSettingsProps) {
    this.container = container;
    this.props = props;
    this.apiBaseUrl = props.apiBaseUrl || '';
    this.injectStyles();
    this.render();
    this.loadStatus();
  }

  private injectStyles(): void {
    const styleId = 'db-settings-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      :root {
        --db-bg: #0f0f0f;
        --db-surface: #1a1a1a;
        --db-surface-elevated: #242424;
        --db-border: #333333;
        --db-text: #f5f5f5;
        --db-text-muted: #888888;
        --db-accent: #e8a854;
        --db-accent-hover: #f0b866;
        --db-error: #e85454;
        --db-success: #54e88a;
        --db-radius: 12px;
        --db-radius-sm: 8px;
      }

      .db-settings {
        max-width: 600px;
        margin: 0 auto;
        padding: 24px;
      }

      .db-card {
        background: var(--db-surface);
        border: 1px solid var(--db-border);
        border-radius: var(--db-radius);
        overflow: hidden;
      }

      .db-header {
        padding: 24px;
        border-bottom: 1px solid var(--db-border);
      }

      .db-title {
        margin: 0 0 8px;
        font-size: 20px;
        font-weight: 600;
        color: var(--db-text);
      }

      .db-subtitle {
        margin: 0;
        font-size: 14px;
        color: var(--db-text-muted);
      }

      .db-content {
        padding: 24px;
      }

      .db-status-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: var(--db-surface-elevated);
        border-radius: var(--db-radius-sm);
        margin-bottom: 24px;
      }

      .db-status-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--db-success);
      }

      .db-status-indicator.disconnected {
        background: var(--db-error);
      }

      .db-status-text {
        font-size: 14px;
        color: var(--db-text);
      }

      .db-field {
        margin-bottom: 20px;
      }

      .db-label {
        display: block;
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 500;
        color: var(--db-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .db-select, .db-input {
        width: 100%;
        padding: 12px 16px;
        font-size: 14px;
        color: var(--db-text);
        background: var(--db-surface-elevated);
        border: 1px solid var(--db-border);
        border-radius: var(--db-radius-sm);
        outline: none;
        box-sizing: border-box;
      }

      .db-select:focus, .db-input:focus {
        border-color: var(--db-accent);
      }

      .db-row {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 16px;
      }

      .db-message {
        padding: 12px 16px;
        border-radius: var(--db-radius-sm);
        font-size: 14px;
        margin-bottom: 20px;
      }

      .db-message.error {
        background: rgba(232, 84, 84, 0.1);
        color: var(--db-error);
        border: 1px solid var(--db-error);
      }

      .db-message.success {
        background: rgba(84, 232, 138, 0.1);
        color: var(--db-success);
        border: 1px solid var(--db-success);
      }

      .db-actions {
        display: flex;
        gap: 12px;
        padding-top: 16px;
        border-top: 1px solid var(--db-border);
      }

      .db-btn {
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 600;
        border: none;
        border-radius: var(--db-radius-sm);
        cursor: pointer;
        transition: all 0.2s;
      }

      .db-btn-primary {
        background: var(--db-accent);
        color: var(--db-bg);
      }

      .db-btn-primary:hover:not(:disabled) {
        background: var(--db-accent-hover);
      }

      .db-btn-secondary {
        background: transparent;
        color: var(--db-text-muted);
        border: 1px solid var(--db-border);
      }

      .db-btn-secondary:hover:not(:disabled) {
        background: var(--db-surface-elevated);
        color: var(--db-text);
      }

      .db-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .db-spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid transparent;
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-right: 8px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .db-hidden {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  private render(): void {
    const showConnectionForm = this.dbType !== 'sqlite';

    this.container.innerHTML = `
      <div class="db-settings">
        <div class="db-card">
          <div class="db-header">
            <h2 class="db-title">Database Settings</h2>
            <p class="db-subtitle">Configure your database connection</p>
          </div>
          <div class="db-content">
            <div class="db-status-bar">
              <div class="db-status-indicator" id="db-status-dot"></div>
              <span class="db-status-text" id="db-status-text">Checking...</span>
            </div>

            ${this.errorMessage ? `<div class="db-message error">${this.escapeHtml(this.errorMessage)}</div>` : ''}
            ${this.successMessage ? `<div class="db-message success">${this.escapeHtml(this.successMessage)}</div>` : ''}

            <div class="db-field">
              <label class="db-label">Database Type</label>
              <select class="db-select" id="db-type">
                <option value="sqlite" ${this.dbType === 'sqlite' ? 'selected' : ''}>SQLite (Local)</option>
                <option value="mysql" ${this.dbType === 'mysql' ? 'selected' : ''}>MySQL</option>
                <option value="postgresql" ${this.dbType === 'postgresql' ? 'selected' : ''}>PostgreSQL</option>
              </select>
            </div>

            <div id="db-sqlite-config" class="${!showConnectionForm ? '' : 'db-hidden'}">
              <div class="db-field">
                <label class="db-label">Database Path</label>
                <input type="text" class="db-input" id="db-path" value=".privy-jiner/data/core.db" />
              </div>
            </div>

            <div id="db-connection-config" class="${showConnectionForm ? '' : 'db-hidden'}">
              <div class="db-field">
                <label class="db-label">Host</label>
                <input type="text" class="db-input" id="db-host" placeholder="localhost" />
              </div>
              <div class="db-row">
                <div class="db-field">
                  <label class="db-label">Port</label>
                  <input type="number" class="db-input" id="db-port" placeholder="${this.dbType === 'mysql' ? '3306' : '5432'}" />
                </div>
                <div class="db-field">
                  <label class="db-label">Database Name</label>
                  <input type="text" class="db-input" id="db-name" placeholder="privy_jiner" />
                </div>
              </div>
              <div class="db-field">
                <label class="db-label">Username</label>
                <input type="text" class="db-input" id="db-username" placeholder="root" />
              </div>
              <div class="db-field">
                <label class="db-label">Password</label>
                <input type="password" class="db-input" id="db-password" placeholder="Enter password" />
              </div>
            </div>

            <div class="db-actions">
              <button class="db-btn db-btn-secondary" id="db-test-btn">
                Test Connection
              </button>
              <button class="db-btn db-btn-primary" id="db-save-btn">
                Save & Initialize
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private attachEventListeners(): void {
    const typeSelect = this.container.querySelector('#db-type') as HTMLSelectElement;
    const testBtn = this.container.querySelector('#db-test-btn') as HTMLButtonElement;
    const saveBtn = this.container.querySelector('#db-save-btn') as HTMLButtonElement;

    typeSelect?.addEventListener('change', () => {
      this.dbType = typeSelect.value as 'sqlite' | 'mysql' | 'postgresql';
      this.render();
    });

    testBtn?.addEventListener('click', () => this.testConnection());
    saveBtn?.addEventListener('click', () => this.saveAndInitialize());
  }

  private async loadStatus(): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/database/status`);
      const status: DatabaseStatus = await response.json();
      this.updateStatusDisplay(status);
    } catch {
      this.updateStatusDisplay({ connected: false, type: 'sqlite' });
    }
  }

  private updateStatusDisplay(status: DatabaseStatus): void {
    const dot = this.container.querySelector('#db-status-dot');
    const text = this.container.querySelector('#db-status-text');

    if (dot && text) {
      if (status.connected) {
        dot.classList.remove('disconnected');
        let info = status.type.toUpperCase();
        if (status.type !== 'sqlite' && status.host) {
          info += ` - ${status.host}:${status.port}/${status.database}`;
        }
        text.textContent = `Connected (${info})`;
      } else {
        dot.classList.add('disconnected');
        text.textContent = 'Not connected';
      }
    }
  }

  private getConnectionConfig(): Record<string, string> {
    const config: Record<string, string> = {
      type: this.dbType,
    };

    if (this.dbType === 'sqlite') {
      const pathInput = this.container.querySelector('#db-path') as HTMLInputElement;
      config.path = pathInput?.value || '';
    } else {
      const hostInput = this.container.querySelector('#db-host') as HTMLInputElement;
      const portInput = this.container.querySelector('#db-port') as HTMLInputElement;
      const nameInput = this.container.querySelector('#db-name') as HTMLInputElement;
      const usernameInput = this.container.querySelector('#db-username') as HTMLInputElement;
      const passwordInput = this.container.querySelector('#db-password') as HTMLInputElement;

      config.host = hostInput?.value || '';
      config.port = portInput?.value || (this.dbType === 'mysql' ? '3306' : '5432');
      config.database = nameInput?.value || '';
      config.username = usernameInput?.value || '';
      config.password = passwordInput?.value || '';
    }

    return config;
  }

  private async testConnection(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.setLoading(true);

    try {
      const config = this.getConnectionConfig();
      const response = await fetch(`${this.apiBaseUrl}/api/database/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data: TestConnectionResponse = await response.json();

      if (data.success) {
        this.successMessage = 'Connection successful!';
      } else {
        this.errorMessage = data.error || 'Connection failed';
      }
    } catch (err) {
      this.errorMessage = 'Failed to connect to server';
    } finally {
      this.isLoading = false;
      this.setLoading(false);
      this.render();
    }
  }

  private async saveAndInitialize(): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.setLoading(true);

    try {
      const config = this.getConnectionConfig();
      const response = await fetch(`${this.apiBaseUrl}/api/database/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data: TestConnectionResponse = await response.json();

      if (data.success) {
        this.successMessage = 'Database initialized successfully!';
        this.props.onSave();
        this.loadStatus();
      } else {
        this.errorMessage = data.error || 'Initialization failed';
      }
    } catch (err) {
      this.errorMessage = 'Failed to initialize database';
    } finally {
      this.isLoading = false;
      this.setLoading(false);
      this.render();
    }
  }

  private setLoading(loading: boolean): void {
    const testBtn = this.container.querySelector('#db-test-btn') as HTMLButtonElement;
    const saveBtn = this.container.querySelector('#db-save-btn') as HTMLButtonElement;

    if (testBtn) testBtn.disabled = loading;
    if (saveBtn) saveBtn.disabled = loading;
  }
}

export function createDatabaseSettingsUI(
  containerId: string,
  props: DatabaseSettingsProps
): DatabaseSettingsUI | null {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return null;
  }
  return new DatabaseSettingsUI(container, props);
}
