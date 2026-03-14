import * as path from 'path';
import * as fs from 'fs';
import { EventEmitter } from 'events';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  entry: string;
  dependencies?: Record<string, string>;
  capabilities?: string[];
  database?: {
    mode: 'isolated' | 'shared';
    path?: string;
  };
}

export type PluginStatus = 'loaded' | 'unloaded' | 'error';

export interface Plugin {
  manifest: PluginManifest;
  status: PluginStatus;
  instance?: PluginInstance;
}

export interface PluginInstance {
  onLoad?: () => void | Promise<void>;
  onUnload?: () => void | Promise<void>;
  tools?: Record<string, (...args: unknown[]) => unknown>;
}

export class PluginManager extends EventEmitter {
  private plugins: Map<string, Plugin> = new Map();
  private pluginDirectory: string;
  private loadedModules: Map<string, unknown> = new Map();

  constructor(pluginDirectory?: string) {
    super();
    this.pluginDirectory = pluginDirectory || path.join(process.cwd(), 'plugins');
  }

  setPluginDirectory(dir: string): void {
    this.pluginDirectory = dir;
  }

  async discover(): Promise<PluginManifest[]> {
    const manifests: PluginManifest[] = [];

    if (!fs.existsSync(this.pluginDirectory)) {
      fs.mkdirSync(this.pluginDirectory, { recursive: true });
      return manifests;
    }

    const entries = fs.readdirSync(this.pluginDirectory, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const manifestPath = path.join(this.pluginDirectory, entry.name, 'plugin.json');

      if (fs.existsSync(manifestPath)) {
        try {
          const content = fs.readFileSync(manifestPath, 'utf-8');
          const manifest = JSON.parse(content) as PluginManifest;
          manifests.push(manifest);
        } catch (error) {
          this.emit('error', { plugin: entry.name, error });
        }
      }
    }

    return manifests;
  }

  async load(manifest: PluginManifest): Promise<Plugin> {
    if (this.plugins.has(manifest.id)) {
      return this.plugins.get(manifest.id)!;
    }

    const pluginPath = path.join(this.pluginDirectory, manifest.id, manifest.entry);

    if (!fs.existsSync(pluginPath)) {
      throw new Error(`Plugin entry not found: ${pluginPath}`);
    }

    const plugin: Plugin = {
      manifest,
      status: 'loaded',
    };

    try {
      const module = await import(pluginPath);
      const InstanceClass = module.default || module;
      const instance: PluginInstance = new InstanceClass();

      plugin.instance = instance;

      if (instance.onLoad) {
        await instance.onLoad();
      }

      this.loadedModules.set(manifest.id, module);
      this.plugins.set(manifest.id, plugin);

      this.emit('loaded', plugin);
    } catch (error) {
      plugin.status = 'error';
      this.emit('error', { plugin: manifest.id, error });
      throw error;
    }

    return plugin;
  }

  async unload(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      return false;
    }

    try {
      if (plugin.instance?.onUnload) {
        await plugin.instance.onUnload();
      }

      this.loadedModules.delete(pluginId);
      plugin.status = 'unloaded';
      this.plugins.delete(pluginId);

      this.emit('unloaded', plugin);
      return true;
    } catch (error) {
      this.emit('error', { plugin: pluginId, error });
      return false;
    }
  }

  getPlugin(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getLoadedPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).filter(p => p.status === 'loaded');
  }

  getPluginTools(pluginId: string): Record<string, (...args: unknown[]) => unknown> | undefined {
    const plugin = this.plugins.get(pluginId);
    return plugin?.instance?.tools;
  }

  getAllTools(): Record<string, (...args: unknown[]) => unknown> {
    const tools: Record<string, (...args: unknown[]) => unknown> = {};

    for (const plugin of this.plugins.values()) {
      if (plugin.instance?.tools) {
        for (const [name, fn] of Object.entries(plugin.instance.tools)) {
          tools[`${plugin.manifest.id}.${name}`] = fn;
        }
      }
    }

    return tools;
  }

  async reload(pluginId: string): Promise<Plugin> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    await this.unload(pluginId);
    return this.load(plugin.manifest);
  }

  composeCapabilities(pluginIds: string[]): string[] {
    const capabilities = new Set<string>();
    for (const id of pluginIds) {
      const plugin = this.plugins.get(id);
      if (plugin?.manifest.capabilities) {
        for (const cap of plugin.manifest.capabilities) {
          capabilities.add(cap);
        }
      }
    }
    return Array.from(capabilities);
  }

  getCapabilityProviders(capability: string): Plugin[] {
    const providers: Plugin[] = [];
    for (const plugin of this.plugins.values()) {
      if (plugin.manifest.capabilities?.includes(capability)) {
        providers.push(plugin);
      }
    }
    return providers;
  }

  subscribeToEvents(pluginId: string, eventName: string, handler: (...args: unknown[]) => void): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }
    this.on(eventName, handler);
    this.emit('subscribed', { pluginId, eventName });
  }

  publishEvent(eventName: string, payload?: unknown): void {
    this.emit(eventName, payload);
  }

  private pluginConfigs: Map<string, Record<string, unknown>> = new Map();

  setPluginConfig(pluginId: string, config: Record<string, unknown>): void {
    this.pluginConfigs.set(pluginId, config);
    this.emit('config_updated', { pluginId, config });
  }

  getPluginConfig(pluginId: string): Record<string, unknown> | undefined {
    return this.pluginConfigs.get(pluginId);
  }

  private isolatePlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;
    
    Object.defineProperty(plugin.instance, 'require', {
      value: () => {
        throw new Error('Module require is restricted in isolated mode');
      },
      writable: false,
    });
    
    this.emit('isolated', { pluginId });
  }

  private isolateTimeout: Map<string, NodeJS.Timeout> = new Map();
  private _memoryLimit = 256 * 1024 * 1024;

  setMemoryLimit(limitMB: number): void {
    this._memoryLimit = limitMB * 1024 * 1024;
  }

  getMemoryLimit(): number {
    return this._memoryLimit;
  }

  private wrapWithErrorHandling(plugin: Plugin): void {
    const originalOnLoad = plugin.instance?.onLoad;
    const originalOnUnload = plugin.instance?.onUnload;

    if (originalOnLoad) {
      plugin.instance!.onLoad = async () => {
        try {
          await originalOnLoad();
        } catch (error) {
          this.emit('plugin_error', { pluginId: plugin.manifest.id, error, phase: 'onLoad' });
          throw error;
        }
      };
    }

    if (originalOnUnload) {
      plugin.instance!.onUnload = async () => {
        try {
          await originalOnUnload();
        } catch (error) {
          this.emit('plugin_error', { pluginId: plugin.manifest.id, error, phase: 'onUnload' });
          throw error;
        }
      };
    }
  }

  async loadWithErrorHandling(manifest: PluginManifest): Promise<Plugin> {
    const plugin = await this.load(manifest);
    this.wrapWithErrorHandling(plugin);
    return plugin;
  }

  terminatePlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    const timeout = this.isolateTimeout.get(pluginId);
    if (timeout) {
      clearTimeout(timeout);
      this.isolateTimeout.delete(pluginId);
    }

    plugin.status = 'error';
    this.emit('terminated', { pluginId });
    return true;
  }

  enableIsolation(pluginId: string): void {
    this.isolatePlugin(pluginId);
  }

  checkVersionCompatibility(pluginVersion: string, requiredVersion: string): boolean {
    const pluginVer = this.parseVersion(pluginVersion);
    const requiredVer = this.parseVersion(requiredVersion);
    
    if (pluginVer.major !== requiredVer.major) {
      return pluginVer.major >= requiredVer.major;
    }
    if (pluginVer.minor !== requiredVer.minor) {
      return pluginVer.minor >= requiredVer.minor;
    }
    return pluginVer.patch >= requiredVer.patch;
  }

  private parseVersion(version: string): { major: number; minor: number; patch: number } {
    const parts = version.replace(/^v/, '').split('.');
    return {
      major: parseInt(parts[0]) || 0,
      minor: parseInt(parts[1]) || 0,
      patch: parseInt(parts[2]) || 0,
    };
  }

  async updatePlugin(pluginId: string): Promise<Plugin> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }
    await this.unload(pluginId);
    return this.load(plugin.manifest);
  }

  getPluginVersion(pluginId: string): string | undefined {
    const plugin = this.plugins.get(pluginId);
    return plugin?.manifest.version;
  }

  async installFromNpm(packageName: string): Promise<PluginManifest> {
    const { execSync } = await import('child_process');
    
    try {
      execSync(`npm install ${packageName}`, { 
        cwd: this.pluginDirectory, 
        stdio: 'pipe' 
      });
      
      const manifests = await this.discover();
      const installed = manifests.find(m => m.id === packageName);
      
      if (!installed) {
        throw new Error(`Plugin ${packageName} installed but manifest not found`);
      }
      
      this.emit('installed', { packageName, manifest: installed });
      return installed;
    } catch (error) {
      this.emit('install_error', { packageName, error });
      throw error;
    }
  }

  async uninstall(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;
    
    await this.unload(pluginId);
    
    const pluginPath = path.join(this.pluginDirectory, pluginId);
    if (fs.existsSync(pluginPath)) {
      fs.rmSync(pluginPath, { recursive: true });
    }
    
    this.emit('uninstalled', { pluginId });
    return true;
  }
}
