import { EventEmitter } from 'events';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
    error?: Error;
}
export declare class Logger extends EventEmitter {
    private logDirectory;
    private currentLevel;
    private maxFileSize;
    private maxFiles;
    private currentFile;
    private currentFileSize;
    private writeStream?;
    private levelPriority;
    constructor(options?: {
        directory?: string;
        level?: LogLevel;
        maxFileSize?: number;
        maxFiles?: number;
    });
    private generateFilename;
    private init;
    private openWriteStream;
    private shouldLog;
    private formatEntry;
    private write;
    private checkRotation;
    private rotateLogs;
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, error?: Error, context?: Record<string, unknown>): void;
    setLevel(level: LogLevel): void;
    getLevel(): LogLevel;
    close(): void;
    readLogs(lines?: number): string[];
}
export declare const logger: Logger;
//# sourceMappingURL=index.d.ts.map