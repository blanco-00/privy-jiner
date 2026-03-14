import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
export class DataPrivacyManager {
    dataDirectory;
    encryptionKey;
    constructor(dataDirectory) {
        this.dataDirectory = dataDirectory || path.join(os.homedir(), '.privy-jiner', 'data');
    }
    setEncryptionKey(key) {
        this.encryptionKey = crypto.createHash('sha256').update(key).digest();
    }
    encrypt(data) {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not set');
        }
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }
    decrypt(encryptedData) {
        if (!this.encryptionKey) {
            throw new Error('Encryption key not set');
        }
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];
        const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    encryptFile(inputPath, outputPath) {
        const data = fs.readFileSync(inputPath);
        const encrypted = this.encrypt(data.toString('base64'));
        fs.writeFileSync(outputPath, encrypted);
    }
    decryptFile(inputPath, outputPath) {
        const encrypted = fs.readFileSync(inputPath, 'utf-8');
        const decrypted = this.decrypt(encrypted);
        fs.writeFileSync(outputPath, Buffer.from(decrypted, 'base64'));
    }
    async backup(options) {
        const { destination, compress = true, includePatterns, excludePatterns } = options;
        if (!fs.existsSync(this.dataDirectory)) {
            throw new Error(`Data directory does not exist: ${this.dataDirectory}`);
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = compress ? `backup-${timestamp}.tar.gz` : `backup-${timestamp}`;
        const backupPath = path.join(destination, backupName);
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }
        const tempDir = path.join(os.tmpdir(), `privy-jiner-backup-${timestamp}`);
        fs.mkdirSync(tempDir, { recursive: true });
        try {
            if (includePatterns && includePatterns.length > 0) {
                for (const pattern of includePatterns) {
                    const fullPattern = path.join(this.dataDirectory, pattern);
                    const files = this.globSync(fullPattern);
                    for (const file of files) {
                        const relativePath = path.relative(this.dataDirectory, file);
                        const destPath = path.join(tempDir, relativePath);
                        fs.mkdirSync(path.dirname(destPath), { recursive: true });
                        fs.copyFileSync(file, destPath);
                    }
                }
            }
            else {
                this.copyDirectoryRecursive(this.dataDirectory, tempDir, excludePatterns);
            }
            if (compress) {
                execSync(`cd ${tempDir} && tar -czf "${backupPath}" .`, { stdio: 'pipe' });
            }
            else {
                fs.renameSync(tempDir, backupPath);
            }
        }
        finally {
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        }
        return backupPath;
    }
    async restore(backupPath, targetDirectory) {
        const target = targetDirectory || this.dataDirectory;
        if (!fs.existsSync(backupPath)) {
            throw new Error(`Backup file does not exist: ${backupPath}`);
        }
        if (fs.existsSync(target)) {
            const backupDir = `${target}.backup-${Date.now()}`;
            fs.renameSync(target, backupDir);
        }
        fs.mkdirSync(target, { recursive: true });
        if (backupPath.endsWith('.tar.gz') || backupPath.endsWith('.tgz')) {
            execSync(`tar -xzf "${backupPath}" -C "${target}"`, { stdio: 'pipe' });
        }
        else {
            this.copyDirectoryRecursive(backupPath, target);
        }
    }
    async exportData(options) {
        const { format, outputPath, tables } = options;
        const exportData = {};
        const dbPath = path.join(this.dataDirectory, 'core.db');
        if (fs.existsSync(dbPath)) {
            try {
                const Database = require('better-sqlite3');
                const db = new Database(dbPath, { readonly: true });
                const tableNames = tables || db.prepare(`
          SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `).all().map((row) => row.name);
                for (const tableName of tableNames) {
                    try {
                        const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
                        exportData[tableName] = rows;
                    }
                    catch {
                        // Skip if table doesn't exist
                    }
                }
                db.close();
            }
            catch {
                // SQLite not available, skip database export
            }
        }
        let output;
        if (format === 'json') {
            output = JSON.stringify(exportData, null, 2);
        }
        else {
            const csvLines = [];
            for (const [tableName, rows] of Object.entries(exportData)) {
                if (rows.length === 0)
                    continue;
                const headers = Object.keys(rows[0]);
                csvLines.push(`# ${tableName}`);
                csvLines.push(headers.join(','));
                for (const row of rows) {
                    const values = headers.map(h => {
                        const val = row[h];
                        if (val === null || val === undefined)
                            return '';
                        const str = String(val);
                        return str.includes(',') || str.includes('"') || str.includes('\n')
                            ? `"${str.replace(/"/g, '""')}"`
                            : str;
                    });
                    csvLines.push(values.join(','));
                }
                csvLines.push('');
            }
            output = csvLines.join('\n');
        }
        fs.writeFileSync(outputPath, output, 'utf-8');
        return outputPath;
    }
    verifyNoCloudSync() {
        const issues = [];
        const suspiciousPatterns = [
            { path: path.join(this.dataDirectory, '..', 'sync'), pattern: 'sync' },
            { path: path.join(this.dataDirectory, '..', '.dropbox'), pattern: 'dropbox' },
            { path: path.join(this.dataDirectory, '..', '.googledrive'), pattern: 'gdrive' },
            { path: path.join(this.dataDirectory, '..', '.icloud'), pattern: 'icloud' },
            { path: path.join(this.dataDirectory, '..', '.onedrive'), pattern: 'onedrive' },
        ];
        for (const check of suspiciousPatterns) {
            if (fs.existsSync(check.path)) {
                issues.push(`Potential cloud sync directory detected: ${check.path}`);
            }
        }
        const configPath = path.join(os.homedir(), '.privy-jiner', 'config.json');
        if (fs.existsSync(configPath)) {
            try {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                const cloudPatterns = ['dropbox', 'gdrive', 'icloud', 'onedrive', 's3', 'cloudflare'];
                for (const key of Object.keys(config)) {
                    for (const pattern of cloudPatterns) {
                        if (key.toLowerCase().includes(pattern) || (typeof config[key] === 'string' && config[key].toLowerCase().includes(pattern))) {
                            issues.push(`Potential cloud configuration detected: ${key}`);
                        }
                    }
                }
            }
            catch {
                // Ignore config read errors
            }
        }
        return {
            passed: issues.length === 0,
            issues,
        };
    }
    copyDirectoryRecursive(src, dest, excludePatterns) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if (excludePatterns) {
                const relativePath = path.relative(this.dataDirectory, srcPath);
                for (const pattern of excludePatterns) {
                    if (relativePath.match(new RegExp(pattern))) {
                        continue;
                    }
                }
            }
            if (entry.isDirectory()) {
                this.copyDirectoryRecursive(srcPath, destPath, excludePatterns);
            }
            else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
    globSync(pattern) {
        const results = [];
        const baseDir = path.dirname(pattern);
        const filePattern = path.basename(pattern);
        const regexPattern = new RegExp('^' + filePattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
        if (!fs.existsSync(baseDir))
            return results;
        const files = fs.readdirSync(baseDir);
        for (const file of files) {
            if (regexPattern.test(file)) {
                results.push(path.join(baseDir, file));
            }
        }
        return results;
    }
}
export const dataPrivacyManager = new DataPrivacyManager();
//# sourceMappingURL=index.js.map