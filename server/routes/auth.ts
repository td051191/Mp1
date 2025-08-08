import { RequestHandler } from "express";
import { db } from "../database/memory-db";
import { LoginRequest, LoginResponse, AuthVerifyResponse } from "@shared/database";

// POST /api/auth/login - Admin login
export const login: RequestHandler = (req, res) => {
  try {
    const { username, password }: LoginRequest = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      } as LoginResponse);
    }

    // Verify credentials
    const user = db.verifyAdminPassword(username, password);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      } as LoginResponse);
    }

    // Create session
    const session = db.createAdminSession(user.id);
    
    // Update last login
    db.updateAdminUserLastLogin(user.id);

    // Set session cookie
    res.cookie('admin_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
      token: session.token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName
      }
    } as LoginResponse);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as LoginResponse);
  }
};

// POST /api/auth/logout - Admin logout
export const logout: RequestHandler = (req, res) => {
  try {
    const token = req.cookies.admin_session || req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      db.deleteAdminSession(token);
    }

    res.clearCookie('admin_session');
    res.json({ success: true, message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/auth/verify - Verify admin session
export const verify: RequestHandler = (req, res) => {
  try {
    const token = req.cookies.admin_session || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.json({
        authenticated: false
      } as AuthVerifyResponse);
    }

    const session = db.getAdminSession(token);
    if (!session) {
      res.clearCookie('admin_session');
      return res.json({
        authenticated: false
      } as AuthVerifyResponse);
    }

    const user = db.getAdminUserById(session.userId);
    if (!user || !user.isActive) {
      db.deleteAdminSession(token);
      res.clearCookie('admin_session');
      return res.json({
        authenticated: false
      } as AuthVerifyResponse);
    }

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName
      }
    } as AuthVerifyResponse);

  } catch (error) {
    console.error('Verify error:', error);
    res.json({
      authenticated: false
    } as AuthVerifyResponse);
  }
};

// Middleware to protect admin routes
export const requireAuth: RequestHandler = (req, res, next) => {
  try {
    const token = req.cookies.admin_session || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const session = db.getAdminSession(token);
    if (!session) {
      res.clearCookie('admin_session');
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const user = db.getAdminUserById(session.userId);
    if (!user || !user.isActive) {
      db.deleteAdminSession(token);
      res.clearCookie('admin_session');
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Add user to request for use in routes
    (req as any).user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
