import * as path from 'path';
import * as fs from 'fs';
import { EventEmitter } from 'events';
export class PluginManager extends EventEmitter {
    plugins = new Map();
    pluginDirectory;
    loadedModules = new Map();
    constructor(pluginDirectory) {
        super();
        this.pluginDirectory = pluginDirectory || path.join(process.cwd(), 'plugins');
    }
    setPluginDirectory(dir) {
        this.pluginDirectory = dir;
    }
    async discover() {
        const manifests = [];
        if (!fs.existsSync(this.pluginDirectory)) {
            fs.mkdirSync(this.pluginDirectory, { recursive: true });
            return manifests;
        }
        const entries = fs.readdirSync(this.pluginDirectory, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isDirectory())
                continue;
            const manifestPath = path.join(this.pluginDirectory, entry.name, 'plugin.json');
            if (fs.existsSync(manifestPath)) {
                try {
                    const content = fs.readFileSync(manifestPath, 'utf-8');
                    const manifest = JSON.parse(content);
                    manifests.push(manifest);
                }
                catch (error) {
                    this.emit('error', { plugin: entry.name, error });
                }
            }
        }
        return manifests;
    }
    async load(manifest) {
        if (this.plugins.has(manifest.id)) {
            return this.plugins.get(manifest.id);
        }
        const pluginPath = path.join(this.pluginDirectory, manifest.id, manifest.entry);
        if (!fs.existsSync(pluginPath)) {
            throw new Error(`Plugin entry not found: ${pluginPath}`);
        }
        const plugin = {
            manifest,
            status: 'loaded',
        };
        try {
            const module = await import(pluginPath);
            const InstanceClass = module.default || module;
            const instance = new InstanceClass();
            plugin.instance = instance;
            if (instance.onLoad) {
                await instance.onLoad();
            }
            this.loadedModules.set(manifest.id, module);
            this.plugins.set(manifest.id, plugin);
            this.emit('loaded', plugin);
        }
        catch (error) {
            plugin.status = 'error';
            this.emit('error', { plugin: manifest.id, error });
            throw error;
        }
        return plugin;
    }
    async unload(pluginId) {
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
        }
        catch (error) {
            this.emit('error', { plugin: pluginId, error });
            return false;
        }
    }
    getPlugin(id) {
        return this.plugins.get(id);
    }
    getAllPlugins() {
        return Array.from(this.plugins.values());
    }
    getLoadedPlugins() {
        return Array.from(this.plugins.values()).filter(p => p.status === 'loaded');
    }
    getPluginTools(pluginId) {
        const plugin = this.plugins.get(pluginId);
        return plugin?.instance?.tools;
    }
    getAllTools() {
        const tools = {};
        for (const plugin of this.plugins.values()) {
            if (plugin.instance?.tools) {
                for (const [name, fn] of Object.entries(plugin.instance.tools)) {
                    tools[`${plugin.manifest.id}.${name}`] = fn;
                }
            }
        }
        return tools;
    }
    async reload(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            throw new Error(`Plugin ${pluginId} not found`);
        }
        await this.unload(pluginId);
        return this.load(plugin.manifest);
    }
}
//# sourceMappingURL=index.js.map