export type DeploymentMode = 'standalone' | 'plugin';
export interface DatabaseConfig {
    type: 'sqlite' | 'mysql' | 'postgresql';
    path?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
}
export interface LoggingConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    directory: string;
    maxFileSize?: number;
    maxFiles?: number;
}
export interface AIConfig {
    models: AIModelConfig[];
    defaultModelId?: string;
    tokenLimit?: number;
    tokenAlertThreshold?: number;
}
export interface AIModelConfig {
    id: string;
    provider: 'openai' | 'claude' | 'other';
    name: string;
    apiKey?: string;
    baseUrl?: string;
    model: string;
}
export interface Config {
    deployment: {
        mode: DeploymentMode;
        port?: number;
        host?: string;
    };
    database: DatabaseConfig;
    logging: LoggingConfig;
    ai?: AIConfig;
    i18n: {
        defaultLocale: string;
        fallbackLocale: string;
    };
    dataDirectory: string;
}
export declare class ConfigManager {
    private config;
    private configPath;
    private encryptionKey?;
    constructor(configPath?: string);
    get(): Config;
    set(updates: Partial<Config>): Config;
    getDeploymentMode(): DeploymentMode;
    setDeploymentMode(mode: DeploymentMode): void;
    getDatabase(): DatabaseConfig;
    setDatabase(db: Partial<DatabaseConfig>): void;
    getAIConfig(): AIConfig | undefined;
    setAIConfig(ai: AIConfig): void;
    addAIModel(model: AIModelConfig): void;
    removeAIModel(modelId: string): boolean;
    getDataDirectory(): string;
    setDataDirectory(dir: string): void;
    setEncryptionKey(key: string): void;
    encryptValue(value: string): string;
    decryptValue(encrypted: string): string;
    private loadConfig;
    private saveConfig;
}
export declare const configManager: ConfigManager;
//# sourceMappingURL=index.d.ts.map