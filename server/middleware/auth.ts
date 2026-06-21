import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Étendre l'interface Request d'Express pour inclure les infos de l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        tenantId: number | null;
        role: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    res.status(401).json({ error: 'Accès refusé. Aucun token fourni.' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'fallback_secret';

  try {
    const decoded = jwt.verify(token, secret) as any;
    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role,
    };
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token invalide ou expiré.' });
    return;
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'SuperAdmin') {
    res.status(403).json({ error: 'Accès refusé. Privilèges insuffisants.' });
    return;
  }
  next();
};
