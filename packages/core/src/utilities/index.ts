import * as fs from 'fs';
import * as path from 'path';

export interface UtilityOptions {
  dataDirectory: string;
  cacheDirectory?: string;
  workspaceDirectory?: string;
}

export interface UtilityResult {
  success: boolean;
  cleaned: number;
  message: string;
}

export interface HealthCheckResult {
  healthy: boolean;
  checks: {
    database: boolean;
    config: boolean;
    logs: boolean;
    backups: boolean;
    diskSpace: boolean;
  };
  details: Record<string, string>;
  warnings: string[];
  errors: string[];
}

export class UtilityManager {
  private options: UtilityOptions;

  constructor(options: UtilityOptions) {
    this.options = options;
  }

  async clearCache(): Promise<UtilityResult> {
    let cleaned = 0;

    try {
      const cacheDirs = [
        this.options.cacheDirectory,
        path.join(this.options.dataDirectory, 'cache'),
        path.join(this.options.dataDirectory, '.cache'),
      ];

      for (const dir of cacheDirs) {
        if (dir && fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              fs.unlinkSync(filePath);
              cleaned++;
            } else if (stats.isDirectory()) {
              fs.rmSync(filePath, { recursive: true });
              cleaned++;
            }
          }
        }
      }

      const buildDirs = ['dist', 'build', '.turbo'];
      for (const dir of buildDirs) {
        const dirPath = path.join(process.cwd(), dir);
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true });
          cleaned++;
        }
      }

      const nodeModulesCache = path.join(process.cwd(), 'node_modules', '.cache');
      if (fs.existsSync(nodeModulesCache)) {
        fs.rmSync(nodeModulesCache, { recursive: true });
        cleaned++;
      }

      return { success: true, cleaned, message: `Cleaned ${cleaned} items from cache` };
    } catch (error) {
      return {
        success: false,
        cleaned,
        message: `Cache cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async cleanupOldVersions(): Promise<UtilityResult> {
    let cleaned = 0;

    try {
      const archiveDir = path.join(this.options.dataDirectory, 'archive');
      if (!fs.existsSync(archiveDir)) {
        return { success: true, cleaned: 0, message: 'No archive directory found' };
      }

      const files = fs.readdirSync(archiveDir);
      const versionPattern = /^v\d+\.\d+\.\d+/;

      for (const file of files) {
        if (versionPattern.test(file)) {
          const filePath = path.join(archiveDir, file);
          const stats = fs.statSync(filePath);
          if (stats.isDirectory()) {
            fs.rmSync(filePath, { recursive: true });
            cleaned++;
          }
        }
      }

      return { success: true, cleaned, message: `Removed ${cleaned} old version directories` };
    } catch (error) {
      return {
        success: false,
        cleaned,
        message: `Version cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async cleanupUnusedFiles(): Promise<UtilityResult> {
    let cleaned = 0;

    try {
      const tempExtensions = ['.tmp', '.temp', '.bak', '.old', '.log'];
      const searchDirs = [
        this.options.workspaceDirectory || this.options.dataDirectory,
        path.join(process.cwd(), 'packages'),
      ];

      for (const searchDir of searchDirs) {
        if (!fs.existsSync(searchDir)) continue;

        const scanDir = (dir: string) => {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              if (entry.name === 'node_modules' || entry.name === '.git') continue;
              scanDir(fullPath);
            } else if (entry.isFile()) {
              const ext = path.extname(entry.name);
              if (tempExtensions.includes(ext)) {
                fs.unlinkSync(fullPath);
                cleaned++;
              }
            }
          }
        };

        scanDir(searchDir);
      }

      return { success: true, cleaned, message: `Removed ${cleaned} unused files` };
    } catch (error) {
      return {
        success: false,
        cleaned,
        message: `Workspace cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async cleanupNodeModules(): Promise<UtilityResult> {
    let cleaned = 0;

    try {
      const packagesDir = path.join(process.cwd(), 'packages');
      if (!fs.existsSync(packagesDir)) {
        return { success: true, cleaned: 0, message: 'No packages directory found' };
      }

      const packages = fs.readdirSync(packagesDir);
      for (const pkg of packages) {
        const nodeModulesPath = path.join(packagesDir, pkg, 'node_modules');
        if (fs.existsSync(nodeModulesPath)) {
          const packageLockPath = path.join(packagesDir, pkg, 'package-lock.json');
          const lockPath = path.join(packagesDir, pkg, 'npm-shrinkwrap.json');

          if (!fs.existsSync(packageLockPath) && !fs.existsSync(lockPath)) {
            fs.rmSync(nodeModulesPath, { recursive: true });
            cleaned++;
          }
        }
      }

      return { success: true, cleaned, message: `Removed node_modules from ${cleaned} packages without lock files` };
    } catch (error) {
      return {
        success: false,
        cleaned,
        message: `Dependency cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async runHealthCheck(): Promise<HealthCheckResult> {
    const result: HealthCheckResult = {
      healthy: true,
      checks: {
        database: false,
        config: false,
        logs: false,
        backups: false,
        diskSpace: false,
      },
      details: {},
      warnings: [],
      errors: [],
    };

    try {
      const dbPath = path.join(this.options.dataDirectory, 'core.db');
      result.checks.database = fs.existsSync(dbPath);
      result.details.database = result.checks.database ? 'Database found' : 'Database not found';

      if (!result.checks.database) {
        result.errors.push('Database file not found');
        result.healthy = false;
      }

      const configPath = path.join(this.options.dataDirectory, '..', 'config.json');
      const configExists = fs.existsSync(configPath);
      result.checks.config = configExists;
      result.details.config = configExists ? 'Config found' : 'Config not found';

      const logDir = path.join(this.options.dataDirectory, '..', 'logs');
      const logExists = fs.existsSync(logDir);
      result.checks.logs = logExists;
      result.details.logs = logExists ? 'Logs directory found' : 'Logs directory not found';

      const backupDir = path.join(this.options.dataDirectory, '..', 'backup');
      const backupExists = fs.existsSync(backupDir);
      result.checks.backups = backupExists;
      result.details.backups = backupExists ? 'Backup directory found' : 'Backup directory not found';

      const diskSpace = await this.checkDiskSpace();
      result.checks.diskSpace = diskSpace.available > 1073741824;
      result.details.diskSpace = `${(diskSpace.available / 1073741824).toFixed(2)} GB available`;

      if (diskSpace.available < 1073741824) {
        result.warnings.push('Less than 1GB disk space available');
        result.healthy = false;
      }

      if (diskSpace.available < 5368709120) {
        result.warnings.push('Less than 5GB disk space available');
      }
    } catch (error) {
      result.errors.push(`Health check error: ${error instanceof Error ? error.message : 'Unknown'}`);
      result.healthy = false;
    }

    return result;
  }

  private async checkDiskSpace(): Promise<{ available: number; total: number }> {
    try {
      const stats = fs.statfsSync ? fs.statfsSync(this.options.dataDirectory) : null;
      if (stats) {
        return { available: stats.bsize * stats.bfree, total: stats.bsize * stats.blocks };
      }
    } catch {
      // Ignore
    }

    return { available: 10 * 1073741824, total: 100 * 1073741824 };
  }
}
