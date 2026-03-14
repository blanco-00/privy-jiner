export interface BackupOptions {
    destination: string;
    compress?: boolean;
    includePatterns?: string[];
    excludePatterns?: string[];
}
export interface ExportOptions {
    format: 'json' | 'csv';
    tables?: string[];
    outputPath: string;
}
export interface EncryptionOptions {
    algorithm: 'aes-256-gcm' | 'aes-256-cbc';
    key: string;
}
export declare class DataPrivacyManager {
    private dataDirectory;
    private encryptionKey?;
    constructor(dataDirectory?: string);
    setEncryptionKey(key: string): void;
    encrypt(data: string): string;
    decrypt(encryptedData: string): string;
    encryptFile(inputPath: string, outputPath: string): void;
    decryptFile(inputPath: string, outputPath: string): void;
    backup(options: BackupOptions): Promise<string>;
    restore(backupPath: string, targetDirectory?: string): Promise<void>;
    exportData(options: ExportOptions): Promise<string>;
    verifyNoCloudSync(): {
        passed: boolean;
        issues: string[];
    };
    private copyDirectoryRecursive;
    private globSync;
}
export declare const dataPrivacyManager: DataPrivacyManager;
//# sourceMappingURL=index.d.ts.map