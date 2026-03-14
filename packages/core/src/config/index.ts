import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

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
  auth?: {
    requireLogin: boolean;
    sessionTimeout: number;
  };
  dataDirectory: string;
}

export class ConfigManager {
  private config: Config;
  private configPath: string;
  private encryptionKey?: Buffer;

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(os.homedir(), '.privy-jiner', 'config.json');
    this.config = this.loadConfig();
  }

  get(): Config {
    return { ...this.config };
  }

  set(updates: Partial<Config>): Config {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    return this.config;
  }

  getDeploymentMode(): DeploymentMode {
    return this.config.deployment.mode;
  }

  setDeploymentMode(mode: DeploymentMode): void {
    this.config.deployment.mode = mode;
    this.saveConfig();
  }

  getDatabase(): DatabaseConfig {
    return { ...this.config.database };
  }

  setDatabase(db: Partial<DatabaseConfig>): void {
    this.config.database = { ...this.config.database, ...db };
    this.saveConfig();
  }

  getAIConfig(): AIConfig | undefined {
    if (!this.config.ai) return undefined;
    return { ...this.config.ai };
  }

  setAIConfig(ai: AIConfig): void {
    this.config.ai = ai;
    this.saveConfig();
  }

  addAIModel(model: AIModelConfig): void {
    if (!this.config.ai) {
      this.config.ai = { models: [] };
    }
    const aiConfig = this.config.ai;
    const existing = aiConfig.models.findIndex(m => m.id === model.id);
    if (existing >= 0) {
      aiConfig.models[existing] = model;
    } else {
      aiConfig.models.push(model);
    }
    this.saveConfig();
  }

  removeAIModel(modelId: string): boolean {
    if (!this.config.ai) return false;
    const index = this.config.ai.models.findIndex(m => m.id === modelId);
    if (index >= 0) {
      this.config.ai.models.splice(index, 1);
      this.saveConfig();
      return true;
    }
    return false;
  }

  getDataDirectory(): string {
    return this.config.dataDirectory;
  }

  setDataDirectory(dir: string): void {
    this.config.dataDirectory = dir;
    this.saveConfig();
  }

  setEncryptionKey(key: string): void {
    this.encryptionKey = crypto.createHash('sha256').update(key).digest();
  }

  encryptValue(value: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decryptValue(encrypted: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }
    const parts = encrypted.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private loadConfig(): Config {
    const defaultConfig: Config = {
      deployment: {
        mode: 'standalone',
        port: 3001,
        host: '0.0.0.0',
      },
      database: {
        type: 'sqlite',
        path: path.join(os.homedir(), '.privy-jiner', 'data', 'core.db'),
      },
      logging: {
        level: 'info',
        directory: path.join(os.homedir(), '.privy-jiner', 'logs'),
        maxFileSize: 10 * 1024 * 1024,
        maxFiles: 10,
      },
      i18n: {
        defaultLocale: 'en',
        fallbackLocale: 'en',
      },
      dataDirectory: path.join(os.homedir(), '.privy-jiner', 'data'),
    };

    if (fs.existsSync(this.configPath)) {
      try {
        const loaded = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
        return { ...defaultConfig, ...loaded };
      } catch {
        return defaultConfig;
      }
    }

    return defaultConfig;
  }

  private saveConfig(): void {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }
}

export const configManager = new ConfigManager();
