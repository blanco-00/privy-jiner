import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { Database } from 'better-sqlite3';

export interface CleanupOptions {
  dataDirectory: string;
  logDirectory: string;
  backupDirectory: string;
  taskArchiveDirectory?: string;
}

export interface CleanupResult {
  deleted: number;
  archived: number;
  compressed: number;
  errors: string[];
}

export class CleanupManager {
  private options: CleanupOptions;
  private db: Database | null = null;

  constructor(options: CleanupOptions) {
    this.options = options;
  }

  setDatabase(db: Database): void {
    this.db = db;
  }

  async cleanupExpiredTasks(expireDays = 30, archiveDays = 7): Promise<CleanupResult> {
    const result: CleanupResult = { deleted: 0, archived: 0, compressed: 0, errors: [] };

    if (!this.db) {
      result.errors.push('Database not set');
      return result;
    }

    try {
      const now = new Date();
      const archiveCutoff = new Date(now.getTime() - archiveDays * 24 * 60 * 60 * 1000);
      const expireCutoff = new Date(now.getTime() - expireDays * 24 * 60 * 60 * 1000);

      const archiveDir = this.options.taskArchiveDirectory || path.join(this.options.dataDirectory, 'archive', 'tasks');
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }

      const expiredTasks = this.db.prepare(`
        SELECT id, title, content, created_at, updated_at
        FROM tasks
        WHERE updated_at < ?
      `).all(archiveCutoff.toISOString()) as Array<{ id: string; title: string; content: string; created_at: string; updated_at: string }>;

      for (const task of expiredTasks) {
        const month = new Date(task.updated_at).toISOString().slice(0, 7);
        const archiveFile = path.join(archiveDir, `tasks-${month}.md`);

        const taskContent = `- [ ] ${task.title}\n  - Created: ${task.created_at}\n  - Updated: ${task.updated_at}\n  - Content: ${task.content || 'N/A'}\n\n`;

        fs.appendFileSync(archiveFile, taskContent);
        result.archived++;
      }

      this.db.prepare('DELETE FROM tasks WHERE updated_at < ?').run(expireCutoff.toISOString());
      result.deleted = expiredTasks.length;
    } catch (error) {
      result.errors.push(`Task cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  async cleanupStuckTasks(timeoutMinutes = 30): Promise<CleanupResult> {
    const result: CleanupResult = { deleted: 0, archived: 0, compressed: 0, errors: [] };

    if (!this.db) {
      result.errors.push('Database not set');
      return result;
    }

    try {
      const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000).toISOString();

      const stuckCount = this.db.prepare(`
        UPDATE tasks
        SET status = 'pending', updated_at = ?
        WHERE status = 'running' AND updated_at < ?
      `).run(new Date().toISOString(), cutoff).changes;

      result.deleted = stuckCount;
    } catch (error) {
      result.errors.push(`Stuck task cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  async cleanupExpiredSessions(expireDays = 7): Promise<CleanupResult> {
    const result: CleanupResult = { deleted: 0, archived: 0, compressed: 0, errors: [] };

    if (!this.db) {
      result.errors.push('Database not set');
      return result;
    }

    try {
      const cutoff = new Date(Date.now() - expireDays * 24 * 60 * 60 * 1000).toISOString();

      const deleted = this.db.prepare('DELETE FROM sessions WHERE expires_at IS NOT NULL AND expires_at < ?').run(cutoff).changes;

      result.deleted = deleted;
    } catch (error) {
      result.errors.push(`Session cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  async cleanupOldLogs(retainDays = 28): Promise<CleanupResult> {
    const result: CleanupResult = { deleted: 0, archived: 0, compressed: 0, errors: [] };

    try {
      const cutoff = Date.now() - retainDays * 24 * 60 * 60 * 1000;
      const archiveDir = path.join(this.options.logDirectory, 'archive');

      if (!fs.existsSync(this.options.logDirectory)) {
        return result;
      }

      const files = fs.readdirSync(this.options.logDirectory);
      const archiveFiles: string[] = [];

      for (const file of files) {
        if (!file.startsWith('privy-jiner-') || !file.endsWith('.log')) {
          continue;
        }

        const filePath = path.join(this.options.logDirectory, file);
        const stats = fs.statSync(filePath);

        if (stats.mtimeMs < cutoff) {
          if (!fs.existsSync(archiveDir)) {
            fs.mkdirSync(archiveDir, { recursive: true });
          }

          const archivePath = path.join(archiveDir, file);
          fs.renameSync(filePath, archivePath);
          archiveFiles.push(archivePath);
          result.archived++;
        }
      }

      for (const archiveFile of archiveFiles) {
        try {
          const fileContent = fs.readFileSync(archiveFile);
          const gzipped = zlib.gzipSync(fileContent);

          if (gzipped.length < fileContent.length) {
            fs.writeFileSync(archiveFile + '.gz', gzipped);
            fs.unlinkSync(archiveFile);
            result.compressed++;
          }
        } catch {
          // Continue without compression
        }
      }
    } catch (error) {
      result.errors.push(`Log cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  async cleanupBackups(_retentionDays = 7, deleteDays = 30): Promise<CleanupResult> {
    const result: CleanupResult = { deleted: 0, archived: 0, compressed: 0, errors: [] };

    try {
      if (!fs.existsSync(this.options.backupDirectory)) {
        return result;
      }

      const cutoff = Date.now() - deleteDays * 24 * 60 * 60 * 1000;
      const archiveCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

      const files = fs.readdirSync(this.options.backupDirectory);

      for (const file of files) {
        const filePath = path.join(this.options.backupDirectory, file);
        const stats = fs.statSync(filePath);

        if (stats.mtimeMs < cutoff) {
          fs.unlinkSync(filePath);
          result.deleted++;
        } else if (stats.mtimeMs < archiveCutoff && !file.endsWith('.gz')) {
          const gzPath = filePath + '.gz';
          const fileContent = fs.readFileSync(filePath);
          fs.writeFileSync(gzPath, fileContent);
          fs.unlinkSync(filePath);
          result.compressed++;
        }
      }
    } catch (error) {
      result.errors.push(`Backup cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  checkConfigFileSize(configPath: string, maxSizeMB = 10): { warning: boolean; sizeMB: number; message?: string } {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    try {
      if (!fs.existsSync(configPath)) {
        return { warning: false, sizeMB: 0 };
      }

      const stats = fs.statSync(configPath);
      const sizeMB = stats.size / (1024 * 1024);

      if (stats.size > maxSizeBytes) {
        return {
          warning: true,
          sizeMB,
          message: `Config file size (${sizeMB.toFixed(2)} MB) exceeds recommended limit of ${maxSizeMB} MB`
        };
      }

      return { warning: false, sizeMB };
    } catch (error) {
      return { warning: false, sizeMB: 0, message: `Error checking config: ${error instanceof Error ? error.message : 'Unknown'}` };
    }
  }

  async runFullCleanup(): Promise<CleanupResult> {
    const result: CleanupResult = {
      deleted: 0,
      archived: 0,
      compressed: 0,
      errors: []
    };

    const taskResult = await this.cleanupExpiredTasks();
    result.deleted += taskResult.deleted;
    result.archived += taskResult.archived;
    result.errors.push(...taskResult.errors);

    const stuckResult = await this.cleanupStuckTasks();
    result.deleted += stuckResult.deleted;
    result.errors.push(...stuckResult.errors);

    const sessionResult = await this.cleanupExpiredSessions();
    result.deleted += sessionResult.deleted;
    result.errors.push(...sessionResult.errors);

    const logResult = await this.cleanupOldLogs();
    result.deleted += logResult.deleted;
    result.archived += logResult.archived;
    result.compressed += logResult.compressed;
    result.errors.push(...logResult.errors);

    const backupResult = await this.cleanupBackups();
    result.deleted += backupResult.deleted;
    result.compressed += backupResult.compressed;
    result.errors.push(...backupResult.errors);

    return result;
  }
}
