import { Router, Request, Response } from 'express';
import { AuthManager, User } from '../auth/index.js';

export interface AuthRequest extends Request {
  user?: User;
  sessionId?: string;
}

export function createAuthRouter(authManager: AuthManager): Router {
  const router = Router();

  // POST /api/auth/login
  router.post('/login', async (req: AuthRequest, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          error: 'Username and password are required',
        });
        return;
      }

      // Check if login is required
      if (!authManager.isLoginRequired()) {
        // Login not required - return success with local mode token
        res.json({
          success: true,
          token: 'local-mode-session',
          user: { username: 'local-user', id: 'local' },
        });
        return;
      }

      // Verify password
      const isValid = authManager.verifyPassword(username, password);
      if (!isValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid username or password',
        });
        return;
      }

      // Create session
      const sessionId = authManager.createSession(username);
      const user = authManager.getUser(username);

      res.json({
        success: true,
        token: sessionId,
        user: user
          ? { username: user.username, id: user.id }
          : { username, id: '' },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
      });
    }
  });

  // POST /api/auth/skip-login
  router.post('/skip-login', async (_req: AuthRequest, res: Response) => {
    try {
      // Check if login is required
      if (authManager.isLoginRequired()) {
        res.status(403).json({
          success: false,
          error: 'Login is required for this installation',
        });
        return;
      }

      // Allow local mode access
      res.json({
        success: true,
        token: 'local-mode-session',
        user: { username: 'local-user', id: 'local' },
      });
    } catch (error) {
      console.error('Skip login error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to skip login',
      });
    }
  });

  // POST /api/auth/logout
  router.post('/logout', async (req: AuthRequest, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        authManager.destroySession(token);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
      });
    }
  });

  // GET /api/auth/status
  router.get('/status', async (req: AuthRequest, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      let isAuthenticated = false;
      let user = null;

      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const sessionUser = authManager.verifySession(token);
        if (sessionUser) {
          isAuthenticated = true;
          user = { username: sessionUser.username, id: sessionUser.id };
        }
      }

      res.json({
        authenticated: isAuthenticated,
        loginRequired: authManager.isLoginRequired(),
        user,
      });
    } catch (error) {
      console.error('Auth status error:', error);
      res.status(500).json({
        authenticated: false,
        loginRequired: true,
        error: 'Failed to get auth status',
      });
    }
  });

  // POST /api/auth/register (for initial setup)
  router.post('/register', async (req: AuthRequest, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          error: 'Username and password are required',
        });
        return;
      }

      // Check if user already exists
      const existingUser = authManager.getUser(username);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'User already exists',
        });
        return;
      }

      // Create user
      const user = authManager.createUser(username, password);

      res.json({
        success: true,
        user: { username: user.username, id: user.id },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
      });
    }
  });

  // POST /api/auth/setup - Initial setup (create first user and set login requirement)
  router.post('/setup', async (req: AuthRequest, res: Response) => {
    try {
      const { username, password, requireLogin } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          error: 'Username and password are required',
        });
        return;
      }

      // Check if users exist
      const users = authManager.listUsers();
      if (users.length > 0) {
        res.status(409).json({
          success: false,
          error: 'Setup already completed',
        });
        return;
      }

      // Create first user
      const user = authManager.createUser(username, password);

      // Set login requirement if specified
      if (typeof requireLogin === 'boolean') {
        authManager.setRequireLogin(requireLogin);
      }

      res.json({
        success: true,
        user: { username: user.username, id: user.id },
        config: {
          requireLogin: authManager.isLoginRequired(),
        },
      });
    } catch (error) {
      console.error('Setup error:', error);
      res.status(500).json({
        success: false,
        error: 'Setup failed',
      });
    }
  });

  return router;
}
