import { Plugin, PluginManifest, PluginStatus } from '../../core/src/plugin/index.js';

export interface PluginDiscoveryProps {
  plugins: Plugin[];
  onEnable: (pluginId: string) => void;
  onDisable: (pluginId: string) => void;
  onUninstall: (pluginId: string) => void;
}

export class PluginDiscoveryUI {
  private container: HTMLElement;
  private props: PluginDiscoveryProps;

  constructor(container: HTMLElement, props: PluginDiscoveryProps) {
    this.container = container;
    this.props = props;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="plugin-discovery">
        <h2>Plugin Discovery</h2>
        <div class="plugin-list">
          ${this.props.plugins.length === 0 ? '<p class="no-plugins">No plugins installed</p>' : ''}
          ${this.props.plugins.map(plugin => this.renderPluginCard(plugin)).join('')}
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }

  private renderPluginCard(plugin: Plugin): string {
    const status = plugin.status;
    const isEnabled = status === 'loaded';
    const isError = status === 'error';
    
    return `
      <div class="plugin-card" data-plugin-id="${plugin.manifest.id}">
        <div class="plugin-header">
          <h3>${plugin.manifest.name}</h3>
          <span class="plugin-version">v${plugin.manifest.version}</span>
        </div>
        <p class="plugin-description">${plugin.manifest.description || 'No description'}</p>
        <div class="plugin-meta">
          <span class="plugin-status ${isEnabled ? 'enabled' : ''} ${isError ? 'error' : ''}">
            ${status}
          </span>
          ${plugin.manifest.author ? `<span class="plugin-author">by ${plugin.manifest.author}</span>` : ''}
        </div>
        <div class="plugin-capabilities">
          ${(plugin.manifest.capabilities || []).map(cap => `<span class="capability-tag">${cap}</span>`).join('')}
        </div>
        <div class="plugin-actions">
          <button class="btn-toggle ${isEnabled ? 'btn-disable' : 'btn-enable'}" 
                  data-action="${isEnabled ? 'disable' : 'enable'}"
                  data-plugin-id="${plugin.manifest.id}">
            ${isEnabled ? 'Disable' : 'Enable'}
          </button>
          <button class="btn-uninstall" 
                  data-action="uninstall"
                  data-plugin-id="${plugin.manifest.id}">
            Uninstall
          </button>
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    const buttons = this.container.querySelectorAll('.plugin-actions button');
    
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const action = target.dataset.action;
        const pluginId = target.dataset.pluginId;
        
        if (!pluginId || !action) return;
        
        if (action === 'enable') {
          this.props.onEnable(pluginId);
        } else if (action === 'disable') {
          this.props.onDisable(pluginId);
        } else if (action === 'uninstall') {
          if (confirm(`Are you sure you want to uninstall this plugin?`)) {
            this.props.onUninstall(pluginId);
          }
        }
      });
    });
  }

  update(plugins: Plugin[]): void {
    this.props.plugins = plugins;
    this.render();
  }
}

export function createPluginDiscoveryUI(
  containerId: string, 
  props: PluginDiscoveryProps
): PluginDiscoveryUI | null {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return null;
  }
  return new PluginDiscoveryUI(container, props);
}
