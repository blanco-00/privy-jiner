import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { EventEmitter } from 'events';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

export class Logger extends EventEmitter {
  private logDirectory: string;
  private currentLevel: LogLevel;
  private maxFileSize: number;
  private maxFiles: number;
  private currentFile: string;
  private currentFileSize!: number;
  private writeStream?: fs.WriteStream;
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(options?: {
    directory?: string;
    level?: LogLevel;
    maxFileSize?: number;
    maxFiles?: number;
  }) {
    super();
    this.logDirectory = options?.directory || path.join(os.homedir(), '.privy-jiner', 'logs');
    this.currentLevel = options?.level || 'info';
    this.maxFileSize = options?.maxFileSize || 10 * 1024 * 1024;
    this.maxFiles = options?.maxFiles || 10;
    this.currentFile = this.generateFilename();
    this.init();
  }

  private generateFilename(): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDirectory, `privy-jiner-${date}.log`);
  }

  private init(): void {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
    this.openWriteStream();
  }

  private openWriteStream(): void {
    if (this.writeStream) {
      this.writeStream.end();
    }
    this.writeStream = fs.createWriteStream(this.currentFile, { flags: 'a' });
    this.currentFileSize = fs.existsSync(this.currentFile) 
      ? fs.statSync(this.currentFile).size 
      : 0;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.currentLevel];
  }

  private formatEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    let line = `[${timestamp}] ${level} ${entry.message}`;

    if (entry.context) {
      line += ` ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      line += `\n  Error: ${entry.error.message}\n  Stack: ${entry.error.stack}`;
    }

    return line + '\n';
  }

  private write(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const line = this.formatEntry(entry);

    if (this.writeStream) {
      this.writeStream.write(line);
      this.checkRotation();
    }

    if (entry.level === 'error') {
      this.emit('error', entry);
    }

    this.emit('log', entry);
  }

  private checkRotation(): void {
    if (this.currentFileSize >= this.maxFileSize) {
      this.rotateLogs();
    }
  }

  private rotateLogs(): void {
    if (this.writeStream) {
      this.writeStream.end();
    }

    const files = fs.readdirSync(this.logDirectory)
      .filter(f => f.startsWith('privy-jiner-') && f.endsWith('.log'))
      .map(f => ({
        name: f,
        path: path.join(this.logDirectory, f),
        time: fs.statSync(path.join(this.logDirectory, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    while (files.length >= this.maxFiles) {
      const oldest = files.pop();
      if (oldest) {
        fs.unlinkSync(oldest.path);
      }
    }

    const num = files.length > 0 ? files.length : 0;
    const ext = path.extname(this.currentFile);
    const base = path.basename(this.currentFile, ext);
    this.currentFile = path.join(this.logDirectory, `${base}.${num + 1}${ext}`);
    this.openWriteStream();
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.write({
      timestamp: new Date(),
      level: 'debug',
      message,
      context,
    });
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.write({
      timestamp: new Date(),
      level: 'info',
      message,
      context,
    });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.write({
      timestamp: new Date(),
      level: 'warn',
      message,
      context,
    });
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.write({
      timestamp: new Date(),
      level: 'error',
      message,
      context,
      error,
    });
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  getLevel(): LogLevel {
    return this.currentLevel;
  }

  close(): void {
    if (this.writeStream) {
      this.writeStream.end();
      this.writeStream = undefined;
    }
  }

  readLogs(lines = 100): string[] {
    if (!fs.existsSync(this.currentFile)) {
      return [];
    }
    const content = fs.readFileSync(this.currentFile, 'utf-8');
    const allLines = content.split('\n').filter(l => l.trim());
    return allLines.slice(-lines);
  }
}

export const logger = new Logger();
