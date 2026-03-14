export interface LoginUIProps {
  onLoginSuccess: () => void;
  onSkipLogin: () => void;
  apiBaseUrl?: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export class LoginUI {
  private container: HTMLElement;
  private props: LoginUIProps;
  private isLoading: boolean = false;
  private errorMessage: string = '';
  private apiBaseUrl: string;

  constructor(container: HTMLElement, props: LoginUIProps) {
    this.container = container;
    this.props = props;
    this.apiBaseUrl = props.apiBaseUrl || '';
    this.injectStyles();
    this.render();
  }

  private injectStyles(): void {
    const styleId = 'login-ui-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      :root {
        --login-bg: #0f0f0f;
        --login-surface: #1a1a1a;
        --login-surface-elevated: #242424;
        --login-border: #333333;
        --login-text: #f5f5f5;
        --login-text-muted: #888888;
        --login-accent: #e8a854;
        --login-accent-hover: #f0b866;
        --login-accent-glow: rgba(232, 168, 84, 0.15);
        --login-error: #e85454;
        --login-success: #54e88a;
        --login-radius: 12px;
        --login-radius-sm: 8px;
        --login-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        --login-transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        --login-font-display: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
        --login-font-mono: 'SF Mono', 'Fira Code', monospace;
      }

      .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--login-bg);
        background-image: 
          radial-gradient(ellipse at 20% 20%, var(--login-accent-glow) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(84, 168, 232, 0.08) 0%, transparent 50%);
        padding: 24px;
        font-family: var(--login-font-display);
      }

      .login-card {
        width: 100%;
        max-width: 420px;
        background: var(--login-surface);
        border: 1px solid var(--login-border);
        border-radius: var(--login-radius);
        box-shadow: var(--login-shadow);
        overflow: hidden;
      }

      .login-header {
        padding: 32px 32px 24px;
        text-align: center;
        border-bottom: 1px solid var(--login-border);
      }

      .login-logo {
        width: 56px;
        height: 56px;
        margin: 0 auto 16px;
        background: linear-gradient(135deg, var(--login-accent) 0%, #d4944a 100%);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: 700;
        color: var(--login-bg);
        letter-spacing: -1px;
      }

      .login-title {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 600;
        color: var(--login-text);
        letter-spacing: -0.5px;
      }

      .login-subtitle {
        margin: 0;
        font-size: 14px;
        color: var(--login-text-muted);
      }

      .login-form {
        padding: 24px 32px 32px;
      }

      .login-field {
        margin-bottom: 20px;
      }

      .login-label {
        display: block;
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 500;
        color: var(--login-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .login-input {
        width: 100%;
        padding: 14px 16px;
        font-size: 15px;
        font-family: var(--login-font-display);
        color: var(--login-text);
        background: var(--login-surface-elevated);
        border: 1px solid var(--login-border);
        border-radius: var(--login-radius-sm);
        outline: none;
        transition: border-color var(--login-transition), box-shadow var(--login-transition);
        box-sizing: border-box;
      }

      .login-input::placeholder {
        color: var(--login-text-muted);
        opacity: 0.6;
      }

      .login-input:focus {
        border-color: var(--login-accent);
        box-shadow: 0 0 0 3px var(--login-accent-glow);
      }

      .login-input.error {
        border-color: var(--login-error);
        box-shadow: 0 0 0 3px rgba(232, 84, 84, 0.15);
      }

      .login-error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
        padding: 12px 14px;
        font-size: 13px;
        color: var(--login-error);
        background: rgba(232, 84, 84, 0.1);
        border-radius: var(--login-radius-sm);
        animation: shake 0.4s ease-in-out;
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-4px); }
        40%, 80% { transform: translateX(4px); }
      }

      .login-error-icon {
        font-size: 16px;
      }

      .login-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;
      }

      .login-btn {
        padding: 14px 24px;
        font-size: 15px;
        font-weight: 600;
        font-family: var(--login-font-display);
        border: none;
        border-radius: var(--login-radius-sm);
        cursor: pointer;
        transition: all var(--login-transition);
        outline: none;
      }

      .login-btn:focus-visible {
        box-shadow: 0 0 0 3px var(--login-accent-glow);
      }

      .login-btn-primary {
        background: linear-gradient(135deg, var(--login-accent) 0%, #d4944a 100%);
        color: var(--login-bg);
      }

      .login-btn-primary:hover:not(:disabled) {
        background: linear-gradient(135deg, var(--login-accent-hover) 0%, var(--login-accent) 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px var(--login-accent-glow);
      }

      .login-btn-primary:active:not(:disabled) {
        transform: translateY(0);
      }

      .login-btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .login-btn-secondary {
        background: transparent;
        color: var(--login-text-muted);
        border: 1px solid var(--login-border);
      }

      .login-btn-secondary:hover:not(:disabled) {
        background: var(--login-surface-elevated);
        color: var(--login-text);
        border-color: var(--login-text-muted);
      }

      .login-btn-secondary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .login-btn-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .login-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .login-divider {
        display: flex;
        align-items: center;
        gap: 16px;
        margin: 20px 0;
      }

      .login-divider-line {
        flex: 1;
        height: 1px;
        background: var(--login-border);
      }

      .login-divider-text {
        font-size: 12px;
        color: var(--login-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .login-footer {
        padding: 16px 32px;
        text-align: center;
        background: var(--login-surface-elevated);
        border-top: 1px solid var(--login-border);
      }

      .login-footer-text {
        margin: 0;
        font-size: 12px;
        color: var(--login-text-muted);
      }

      @media (prefers-reduced-motion: reduce) {
        .login-error-message {
          animation: none;
        }
        .login-spinner {
          animation: none;
        }
        .login-btn {
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <div class="login-logo">J</div>
            <h1 class="login-title">Welcome Back</h1>
            <p class="login-subtitle">Sign in to Privy-Jiner Dashboard</p>
          </div>
          <form class="login-form" id="login-form">
            ${this.errorMessage ? this.renderError() : ''}
            <div class="login-field">
              <label class="login-label" for="login-username">Username</label>
              <input 
                type="text" 
                id="login-username" 
                class="login-input ${this.errorMessage ? 'error' : ''}"
                placeholder="Enter your username"
                autocomplete="username"
                required
              />
            </div>
            <div class="login-field">
              <label class="login-label" for="login-password">Password</label>
              <input 
                type="password" 
                id="login-password" 
                class="login-input ${this.errorMessage ? 'error' : ''}"
                placeholder="Enter your password"
                autocomplete="current-password"
                required
              />
            </div>
            <div class="login-actions">
              <button type="submit" class="login-btn login-btn-primary" id="login-submit">
                <span class="login-btn-content">
                  ${this.isLoading ? '<span class="login-spinner"></span>' : ''}
                  <span>${this.isLoading ? 'Signing in...' : 'Sign In'}</span>
                </span>
              </button>
            </div>
            <div class="login-divider">
              <span class="login-divider-line"></span>
              <span class="login-divider-text">or</span>
              <span class="login-divider-line"></span>
            </div>
            <button type="button" class="login-btn login-btn-secondary" id="login-skip">
              <span class="login-btn-content">
                ${this.isLoading ? '<span class="login-spinner"></span>' : ''}
                <span>Skip Login (Local Mode)</span>
              </span>
            </button>
          </form>
          <div class="login-footer">
            <p class="login-footer-text">Privy-Jiner · Personal AI Assistant</p>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private renderError(): string {
    return `
      <div class="login-error-message">
        <span class="login-error-icon">⚠</span>
        <span>${this.escapeHtml(this.errorMessage)}</span>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private attachEventListeners(): void {
    const form = this.container.querySelector('#login-form') as HTMLFormElement;
    const skipButton = this.container.querySelector('#login-skip') as HTMLButtonElement;

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    if (skipButton) {
      skipButton.addEventListener('click', () => {
        this.handleSkipLogin();
      });
    }

    // Clear error on input focus
    const inputs = this.container.querySelectorAll('.login-input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        this.errorMessage = '';
        input.classList.remove('error');
        const errorEl = this.container.querySelector('.login-error-message');
        if (errorEl) {
          errorEl.remove();
        }
      });
    });
  }

  private async handleLogin(): Promise<void> {
    if (this.isLoading) return;

    const usernameInput = this.container.querySelector('#login-username') as HTMLInputElement;
    const passwordInput = this.container.querySelector('#login-password') as HTMLInputElement;

    const username = usernameInput?.value.trim();
    const password = passwordInput?.value;

    if (!username || !password) {
      this.showError('Please enter both username and password');
      return;
    }

    this.setLoading(true);

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();

      if (response.ok && data.success && data.token) {
        localStorage.setItem('privy-jiner-session', data.token);
        this.props.onLoginSuccess();
      } else {
        this.showError(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showError('Unable to connect to server. Please check your connection.');
    } finally {
      this.setLoading(false);
    }
  }

  private async handleSkipLogin(): Promise<void> {
    if (this.isLoading) return;

    this.setLoading(true);

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/skip-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: LoginResponse = await response.json();

      if (response.ok && data.success) {
        if (data.token) {
          localStorage.setItem('privy-jiner-session', data.token);
        }
        this.props.onSkipLogin();
      } else {
        // Even if API fails, allow skip for local mode
        localStorage.setItem('privy-jiner-session', 'local-mode');
        this.props.onSkipLogin();
      }
    } catch (error) {
      console.error('Skip login error:', error);
      // Allow skip even if API is unavailable
      localStorage.setItem('privy-jiner-session', 'local-mode');
      this.props.onSkipLogin();
    } finally {
      this.setLoading(false);
    }
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.render();
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading;
    
    const submitBtn = this.container.querySelector('#login-submit') as HTMLButtonElement;
    const skipBtn = this.container.querySelector('#login-skip') as HTMLButtonElement;
    const inputs = this.container.querySelectorAll('.login-input') as NodeListOf<HTMLInputElement>;

    if (submitBtn) {
      submitBtn.disabled = loading;
      const content = submitBtn.querySelector('.login-btn-content');
      if (content) {
        content.innerHTML = `
          ${loading ? '<span class="login-spinner"></span>' : ''}
          <span>${loading ? 'Signing in...' : 'Sign In'}</span>
        `;
      }
    }

    if (skipBtn) {
      skipBtn.disabled = loading;
      const content = skipBtn.querySelector('.login-btn-content');
      if (content) {
        content.innerHTML = `
          ${loading ? '<span class="login-spinner"></span>' : ''}
          <span>Skip Login (Local Mode)</span>
        `;
      }
    }

    inputs.forEach(input => {
      input.disabled = loading;
    });
  }

  update(): void {
    this.render();
  }

  destroy(): void {
    this.container.innerHTML = '';
  }
}

export function createLoginUI(
  containerId: string,
  props: LoginUIProps
): LoginUI | null {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return null;
  }
  return new LoginUI(container, props);
}
