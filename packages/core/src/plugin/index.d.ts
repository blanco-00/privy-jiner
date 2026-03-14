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
export declare class PluginManager extends EventEmitter {
    private plugins;
    private pluginDirectory;
    private loadedModules;
    constructor(pluginDirectory?: string);
    setPluginDirectory(dir: string): void;
    discover(): Promise<PluginManifest[]>;
    load(manifest: PluginManifest): Promise<Plugin>;
    unload(pluginId: string): Promise<boolean>;
    getPlugin(id: string): Plugin | undefined;
    getAllPlugins(): Plugin[];
    getLoadedPlugins(): Plugin[];
    getPluginTools(pluginId: string): Record<string, (...args: unknown[]) => unknown> | undefined;
    getAllTools(): Record<string, (...args: unknown[]) => unknown>;
    reload(pluginId: string): Promise<Plugin>;
}
//# sourceMappingURL=index.d.ts.map