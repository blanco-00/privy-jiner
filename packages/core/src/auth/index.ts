import * as crypto from 'crypto';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthConfig {
  requireLogin: boolean;
  sessionTimeout: number;
}

const DEFAULT_CONFIG: AuthConfig = {
  requireLogin: false,
  sessionTimeout: 7 * 24 * 60 * 60 * 1000,
};

export class AuthManager {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, { userId: string; expiresAt: Date }> = new Map();
  private config: AuthConfig;

  constructor(config: Partial<AuthConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  }

  createUser(username: string, password: string): User {
    if (this.users.has(username.toLowerCase())) {
      throw new Error('User already exists');
    }

    const salt = this.generateSalt();
    const passwordHash = this.hashPassword(password, salt);

    const user: User = {
      id: crypto.randomUUID(),
      username: username.toLowerCase(),
      passwordHash,
      salt,
      createdAt: new Date(),
    };

    this.users.set(user.username, user);
    return user;
  }

  verifyPassword(username: string, password: string): boolean {
    const user = this.users.get(username.toLowerCase());
    if (!user) return false;

    const hash = this.hashPassword(password, user.salt);
    return hash === user.passwordHash;
  }

  createSession(username: string): string {
    const user = this.users.get(username.toLowerCase());
    if (!user) {
      throw new Error('User not found');
    }

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + this.config.sessionTimeout);

    this.sessions.set(sessionId, { userId: user.id, expiresAt });
    user.lastLogin = new Date();

    return sessionId;
  }

  verifySession(sessionId: string): User | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }

    for (const user of this.users.values()) {
      if (user.id === session.userId) {
        return user;
      }
    }

    return null;
  }

  destroySession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  getUser(username: string): User | undefined {
    return this.users.get(username.toLowerCase());
  }

  getUserById(id: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return undefined;
  }

  isLoginRequired(): boolean {
    return this.config.requireLogin;
  }

  setRequireLogin(required: boolean): void {
    this.config.requireLogin = required;
  }

  deleteUser(username: string): boolean {
    return this.users.delete(username.toLowerCase());
  }

  listUsers(): User[] {
    return Array.from(this.users.values()).map(u => ({
      ...u,
      passwordHash: '***',
      salt: '***',
    }));
  }
}
