import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
export class ConfigManager {
    config;
    configPath;
    encryptionKey;
    constructor(configPath) {
        this.configPath = configPath || path.join(os.homedir(), '.privy-jiner', 'config.json');
        this.config = this.loadConfig();
    }
    get() {
        return { ...this.config };
    }
    set(updates) {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
        return this.config;
    }
    getDeploymentMode() {
        return this.config.deployment.mode;
    }
    setDeploymentMode(mode) {
        this.config.deployment.mode = mode;
        this.saveConfig();
    }
    getDatabase() {
        return { ...this.config.database };
    }
    setDatabase(db) {
        this.config.database = { ...this.config.database, ...db };
        this.saveConfig();
    }
    getAIConfig() {
        if (!this.config.ai)
            return undefined;
        return { ...this.config.ai };
    }
    setAIConfig(ai) {
        this.config.ai = ai;
        this.saveConfig();
    }
    addAIModel(model) {
        if (!this.config.ai) {
            this.config.ai = { models: [] };
        }
        const aiConfig = this.config.ai;
        const existing = aiConfig.models.findIndex(m => m.id === model.id);
        if (existing >= 0) {
            aiConfig.models[existing] = model;
        }
        else {
            aiConfig.models.push(model);
        }
        this.saveConfig();
    }
    removeAIModel(modelId) {
        if (!this.config.ai)
            return false;
        const index = this.config.ai.models.findIndex(m => m.id === modelId);
        if (index >= 0) {
            this.config.ai.models.splice(index, 1);
            this.saveConfig();
            return true;
        }
        return false;
    }
    getDataDirectory() {
        return this.config.dataDirectory;
    }
    setDataDirectory(dir) {
        this.config.dataDirectory = dir;
        this.saveConfig();
    }
    setEncryptionKey(key) {
        this.encryptionKey = crypto.createHash('sha256').update(key).digest();
    }
    encryptValue(value) {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not set');
        }
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
        let encrypted = cipher.update(value, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    decryptValue(encrypted) {
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
    loadConfig() {
        const defaultConfig = {
            deployment: {
                mode: 'standalone',
                port: 3000,
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
            }
            catch {
                return defaultConfig;
            }
        }
        return defaultConfig;
    }
    saveConfig() {
        const dir = path.dirname(this.configPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    }
}
export const configManager = new ConfigManager();
//# sourceMappingURL=index.js.map