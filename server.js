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
  GITHUB_DOWNLOAD_URL: 'https://github.com/emonxxx11/sECTECT-Exe/raw/main/EMON%20XTIER%20BYPASS.exe'
};

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    service: 'Firebase File Server'
  });
});

// Authentication service
class AuthService {
  generateToken(clientId) {
    const payload = {
      clientId: clientId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const token = crypto.createHmac('sha256', CONFIG.JWT_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    return Buffer.from(JSON.stringify(payload)).toString('base64') + '.' + token;
  }

  verifyToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) return null;

      const payload = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      const signature = parts[1];

      const expectedSignature = crypto.createHmac('sha256', CONFIG.JWT_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (signature !== expectedSignature) return null;
      if (payload.exp < Math.floor(Date.now() / 1000)) return null;

      return payload;
    } catch (error) {
      return null;
    }
  }

  validateClient(clientId, clientSecret) {
    return CONFIG.VALID_CLIENTS[clientId] === clientSecret;
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

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { clientId, clientSecret } = req.body;
    
    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: 'Client ID and Client Secret are required' });
    }

    const isValid = authService.validateClient(clientId, clientSecret);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid client credentials' });
    }

    const token = authService.generateToken(clientId);
    
    res.json({
      token,
      expiresIn: 86400, // 24 hours
      tokenType: 'Bearer'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = authService.verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.clientId = decoded.clientId;
  next();
};

// Main download endpoint
app.get('/api/download/main-exe', async (req, res) => {
  try {
    console.log('🔥 Serving main executable from GitHub...');
    
    console.log(`📥 Redirecting to: ${CONFIG.GITHUB_DOWNLOAD_URL}`);
    
    // Redirect to the direct download link
    res.redirect(CONFIG.GITHUB_DOWNLOAD_URL);

  } catch (error) {
    console.error('Error serving main executable:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to detect ZIP files
function isZipFile(buffer) {
  return buffer[0] === 0x50 && buffer[1] === 0x4B;
}

// Upload file endpoint
app.post('/api/files/upload', authenticateToken, async (req, res) => {
  try {
    const { fileName, fileData } = req.body;
    
    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'File name and data are required' });
    }

    const allowedExtensions = ['.exe', '.zip', '.rar'];
    const hasValidExtension = allowedExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
    
    if (!hasValidExtension) {
      return res.status(400).json({ error: 'Only .exe, .zip, and .rar files are allowed' });
    }

    console.log(`Client ${req.clientId} uploading file: ${fileName}`);

    // Decode base64 file data
    const fileBuffer = Buffer.from(fileData, 'base64');
    
    // Encrypt the file
    const encryptedData = fileService.encryptFile(fileBuffer);
    
    // Upload to Firebase Storage
    const file = bucket.file(fileName);
    await file.save(encryptedData);
    
    res.json({
      fileName,
      fileSize: fileBuffer.length,
      uploadedAt: new Date().toISOString(),
      message: 'File uploaded successfully to Firebase Storage'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List files endpoint
app.get('/api/files/list', authenticateToken, async (req, res) => {
  try {
    console.log(`Client ${req.clientId} listing files`);

    const [files] = await bucket.getFiles();
    const fileList = files.map(file => ({
      name: file.name,
      size: file.metadata.size,
      created: file.metadata.timeCreated,
      updated: file.metadata.updated
    }));
    
    res.json({ files: fileList });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Firebase File Server running on port ${PORT}`);
  console.log(`📁 Firebase Storage integration enabled`);
  console.log(`🔒 Security features active`);
  console.log(`🌐 Server accessible at: https://your-app-name.onrender.com`);
});

module.exports = app;
