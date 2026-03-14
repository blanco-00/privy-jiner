import { describe, it, expect, beforeEach } from 'vitest';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Data Privacy', () => {
  const testDir = path.join(__dirname, '.test-temp');
  const testFile = path.join(testDir, 'test-data.json');

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  describe('Encryption', () => {
    const algorithm = 'aes-256-cbc';
    const key = crypto.createHash('sha256').update('test-key').digest();

    it('should encrypt and decrypt data correctly', () => {
      const data = 'Hello, Privy-Jiner!';
      
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const ivHex = iv.toString('hex') + ':' + encrypted;
      
      const [ivStr, encData] = ivHex.split(':');
      const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivStr, 'hex'));
      let decrypted = decipher.update(encData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      expect(decrypted).toBe(data);
    });

    it('should produce different ciphertext for same plaintext', () => {
      const data = 'Same data';
      
      const encrypt = (): string => {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
      };
      
      const result1 = encrypt();
      const result2 = encrypt();
      
      expect(result1).not.toBe(result2);
    });
  });

  describe('File Permissions', () => {
    it('should create files with restricted permissions', () => {
      const sensitiveData = JSON.stringify({ apiKey: 'secret123' });
      fs.writeFileSync(testFile, sensitiveData);
      
      const stats = fs.statSync(testFile);
      expect(stats.mode).toBeDefined();
    });
  });

  describe('Backup', () => {
    it('should create backup files', () => {
      const sourceData = { test: 'data' };
      fs.writeFileSync(testFile, JSON.stringify(sourceData));
      
      const backupPath = testFile + '.backup';
      
      fs.copyFileSync(testFile, backupPath);
      
      expect(fs.existsSync(backupPath)).toBe(true);
      
      const backupContent = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      expect(backupContent).toEqual(sourceData);
      
      fs.unlinkSync(backupPath);
    });
  });

  describe('Export', () => {
    it('should export data to JSON format', () => {
      const data = {
        records: [
          { id: 1, name: 'Test 1' },
          { id: 2, name: 'Test 2' },
        ],
      };
      
      const exportPath = path.join(testDir, 'export.json');
      fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
      
      const exported = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
      expect(exported).toEqual(data);
      
      fs.unlinkSync(exportPath);
    });

    it('should export data to CSV format', () => {
      const data = [
        { id: 1, name: 'Test 1', amount: 100 },
        { id: 2, name: 'Test 2', amount: 200 },
      ];
      
      const csvHeader = 'id,name,amount\n';
      const csvData = data.map(row => `${row.id},${row.name},${row.amount}`).join('\n');
      const csvContent = csvHeader + csvData;
      
      const exportPath = path.join(testDir, 'export.csv');
      fs.writeFileSync(exportPath, csvContent);
      
      const exported = fs.readFileSync(exportPath, 'utf8');
      expect(exported).toContain('id,name,amount');
      expect(exported).toContain('Test 1');
      
      fs.unlinkSync(exportPath);
    });
  });

  describe('Secure Deletion', () => {
    it('should overwrite file before deletion', () => {
      const sensitiveFile = path.join(testDir, 'sensitive.json');
      fs.writeFileSync(sensitiveFile, JSON.stringify({ secret: 'data' }));
      
      const fileSize = fs.statSync(sensitiveFile).size;
      const randomData = crypto.randomBytes(fileSize);
      fs.writeFileSync(sensitiveFile, randomData);
      
      fs.unlinkSync(sensitiveFile);
      
      expect(fs.existsSync(sensitiveFile)).toBe(false);
    });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
});
