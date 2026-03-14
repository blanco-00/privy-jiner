import * as os from 'os';
import * as fs from 'fs';

export interface DatabaseStats {
  size: number;
  tableCount: number;
  tables: Array<{ name: string; count: number }>;
}

export interface SystemStats {
  cpu: { usage: number; cores: number };
  memory: { total: number; free: number; used: number; percent: number };
  disk: { total: number; free: number; used: number; percent: number };
  uptime: number;
}

export interface APIStats {
  totalRequests: number;
  requestsPerDay: Array<{ date: string; count: number }>;
  avgResponseTime: number;
}

export class MonitoringService {
  private db: any;
  private dbPath: string;

  constructor(db: any, dbPath?: string) {
    this.db = db;
    this.dbPath = dbPath || '';
  }

  getDatabaseStats(): DatabaseStats {
    let size = 0;
    if (this.dbPath && fs.existsSync(this.dbPath)) {
      const stats = fs.statSync(this.dbPath);
      size = stats.size;
    }

    const tables = this.db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all() as Array<{ name: string }>;

    const tableCounts = tables.map(t => {
      const count = (this.db.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get() as any).count;
      return { name: t.name, count };
    });

    return {
      size,
      tableCount: tables.length,
      tables: tableCounts,
    };
  }

  getSystemStats(): SystemStats {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    const cpuUsage = 100 - (100 * totalIdle / totalTick);

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    let diskFree = 0;
    let diskTotal = 0;
    try {
      const stats = fs.statfsSync ? fs.statfsSync(process.cwd()) : { blocksize: 4096, blocks: 100, bfree: 50 };
      diskFree = (stats as any).blocks * (stats as any).bsize;
      diskTotal = (stats as any).blocks * (stats as any).bsize;
    } catch {
      diskTotal = 100 * 1024 * 1024 * 1024;
      diskFree = 50 * 1024 * 1024 * 1024;
    }

    return {
      cpu: {
        usage: Math.round(cpuUsage * 100) / 100,
        cores: cpus.length,
      },
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        percent: Math.round((usedMem / totalMem) * 10000) / 100,
      },
      disk: {
        total: diskTotal,
        free: diskFree,
        used: diskTotal - diskFree,
        percent: Math.round(((diskTotal - diskFree) / diskTotal) * 10000) / 100,
      },
      uptime: os.uptime(),
    };
  }

  recordAPIUsage(endpoint: string, method: string, statusCode: number, responseTime: number): void {
    const id = require('uuid').v4();
    const now = new Date().toISOString();

    try {
      this.db.prepare(`
        INSERT INTO api_usage (id, endpoint, method, status_code, response_time, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, endpoint, method, statusCode, responseTime, now);
    } catch {
      // Table might not exist yet
    }
  }

  getAPIStats(days = 7): APIStats {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString();

    const totalResult = this.db.prepare(`
      SELECT COUNT(*) as count FROM api_usage WHERE created_at >= ?
    `).get(sinceStr) as { count: number };

    const avgResult = this.db.prepare(`
      SELECT COALESCE(AVG(response_time), 0) as avg FROM api_usage WHERE created_at >= ?
    `).get(sinceStr) as { avg: number };

    const perDayResult = this.db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM api_usage 
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all(sinceStr) as Array<{ date: string; count: number }>;

    return {
      totalRequests: totalResult.count,
      requestsPerDay: perDayResult,
      avgResponseTime: Math.round(avgResult.avg),
    };
  }

  getAllStats(): {
    database: DatabaseStats;
    system: SystemStats;
    api: APIStats;
  } {
    return {
      database: this.getDatabaseStats(),
      system: this.getSystemStats(),
      api: this.getAPIStats(),
    };
  }
}
