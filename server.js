const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const CONFIG = {
  JWT_SECRET: 'emon-xiter-super-secret-jwt-key-32-chars-minimum-length-required',
  VALID_CLIENTS: {
    'emon-xiter-bypass': 'emon-xiter-client-secret-2024',
    'your-app-2': 'client-secret-for-app-2',
    'your-app-3': 'client-secret-for-app-3'
  },
  GITHUB_DOWNLOAD_URL: 'https://github.com/emonxxx11/sECTECT-Exe/raw/main/EMON%20XTIER%20BYPASS.exe',
  MAX_DOWNLOADS_PER_HOUR: 10 // Limit downloads per IP
};

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: false, // No CORS for security
  credentials: true
}));

// Rate limiting
const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: CONFIG.MAX_DOWNLOADS_PER_HOUR,
  message: { error: 'Too many download attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Authentication service
class AuthService {
  constructor() {
    this.secretKey = CONFIG.JWT_SECRET;
    this.validClients = CONFIG.VALID_CLIENTS;
  }

  validateClient(clientId, clientSecret) {
    return this.validClients[clientId] === clientSecret;
  }

  generateToken(clientId) {
    const payload = {
      clientId: clientId,
      timestamp: Date.now(),
      exp: Date.now() + (60 * 60 * 1000) // 1 hour expiry
    };
    
    const token = crypto.createHmac('sha256', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return token;
  }

  verifyToken(token, clientId) {
    try {
      // Simple token verification (in production, use proper JWT)
      const expectedToken = this.generateToken(clientId);
      return token === expectedToken;
    } catch (error) {
      return false;
    }
  }
}

const authService = new AuthService();

// Simple GitHub-based file service
class GitHubFileService {
  constructor() {
    this.downloadUrl = CONFIG.GITHUB_DOWNLOAD_URL;
  }
  
  getDownloadUrl() {
    return this.downloadUrl;
  }
  
  async getFileInfo() {
    return {
      url: this.downloadUrl,
      fileName: 'EMON XTIER BYPASS.exe',
      source: 'GitHub',
      timestamp: new Date().toISOString()
    };
  }
}

const githubFileService = new GitHubFileService();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    service: 'Secure File Server'
  });
});

// Authentication endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { clientId, clientSecret } = req.body;
    
    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: 'Client ID and secret required' });
    }
    
    if (!authService.validateClient(clientId, clientSecret)) {
      return res.status(401).json({ error: 'Invalid client credentials' });
    }
    
    const token = authService.generateToken(clientId);
    
    res.json({
      success: true,
      token: token,
      expiresIn: 3600, // 1 hour
      message: 'Authentication successful'
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify authentication
const verifyAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const clientId = req.headers['x-client-id'];
  
  if (!token || !clientId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (!authService.verifyToken(token, clientId)) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  next();
};

// Main download endpoint (now requires authentication)
app.get('/api/download/main-exe', downloadLimiter, verifyAuth, async (req, res) => {
  try {
    console.log('🔥 Serving main executable from GitHub...');
    console.log(`📥 Redirecting to: ${CONFIG.GITHUB_DOWNLOAD_URL}`);
    console.log(`🔐 Authenticated client: ${req.headers['x-client-id']}`);
    
    res.redirect(CONFIG.GITHUB_DOWNLOAD_URL);
  } catch (error) {
    console.error('Error serving main executable:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File info endpoint (requires authentication)
app.get('/api/files/info', verifyAuth, async (req, res) => {
  try {
    const fileInfo = await githubFileService.getFileInfo();
    res.json(fileInfo);
  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Secure server running on port ${PORT}`);
  console.log(`📁 GitHub direct download enabled`);
  console.log(`🔒 Authentication required for downloads`);
  console.log(`⏱️ Rate limiting: ${CONFIG.MAX_DOWNLOADS_PER_HOUR} downloads/hour`);
  console.log(`🌐 Server accessible at: https://svc-vxk0.onrender.com`);
});

module.exports = app;
