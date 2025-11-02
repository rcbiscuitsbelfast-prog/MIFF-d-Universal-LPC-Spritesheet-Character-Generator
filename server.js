/**
 * LPC Avatar Builder Server
 * Render deployment with persistent disk support
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const morgan = require('morgan');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const config = {
  assetsPath: process.env.ASSETS_PATH || path.join(__dirname, 'assets/lpc'),
  spritesheetsPath: process.env.SPRITESHEETS_PATH || path.join(__dirname, 'spritesheets'),
  uploadsPath: process.env.UPLOADS_PATH || '/opt/render/project/uploads',
  persistentDisk: process.env.PERSISTENT_DISK_PATH || '/opt/render/project/data',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['.png', '.json']
};

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for API access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Logging utility
const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },
  error: (message, error = null) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error ? error.message : null,
      stack: error ? error.stack : null,
      timestamp: new Date().toISOString()
    }));
  },
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  }
};

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {}
  };

  try {
    // Check assets directory
    try {
      await fs.access(config.spritesheetsPath);
      health.checks.assets = 'ok';
    } catch (error) {
      health.checks.assets = 'missing';
      health.status = 'degraded';
    }

    // Check persistent disk
    if (config.persistentDisk) {
      try {
        await fs.access(config.persistentDisk);
        const stats = await fs.stat(config.persistentDisk);
        health.checks.persistentDisk = 'ok';
        health.persistentDiskWritable = stats.isDirectory();
      } catch (error) {
        health.checks.persistentDisk = 'missing';
        health.status = 'degraded';
      }
    }

    // Count available sprites
    try {
      const files = await fs.readdir(config.spritesheetsPath);
      health.checks.spriteCount = files.length;
    } catch (error) {
      health.checks.spriteCount = 0;
    }

    res.json(health);
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Static file serving with fallback
app.use('/spritesheets', express.static(config.spritesheetsPath, {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.use('/modules', express.static(path.join(__dirname, 'modules'), {
  maxAge: '1h',
  etag: true
}));

app.use('/content', express.static(path.join(__dirname, 'content'), {
  maxAge: '1h',
  etag: true
}));

// Serve main application
app.use(express.static(__dirname, {
  index: 'index.html',
  maxAge: '1h'
}));

// API: List available assets
app.get('/api/assets', async (req, res) => {
  try {
    const { category } = req.query;
    const basePath = category 
      ? path.join(config.spritesheetsPath, category)
      : config.spritesheetsPath;

    const files = await fs.readdir(basePath, { withFileTypes: true });
    const assets = files.map(file => ({
      name: file.name,
      type: file.isDirectory() ? 'directory' : 'file',
      path: category ? `${category}/${file.name}` : file.name
    }));

    logger.info('Assets listed', { category, count: assets.length });
    res.json({ assets, category: category || 'root' });
  } catch (error) {
    logger.error('Failed to list assets', error);
    res.status(500).json({ error: 'Failed to list assets' });
  }
});

// API: Get asset categories
app.get('/api/categories', async (req, res) => {
  try {
    const files = await fs.readdir(config.spritesheetsPath, { withFileTypes: true });
    const categories = files
      .filter(file => file.isDirectory())
      .map(dir => dir.name);

    res.json({ categories });
  } catch (error) {
    logger.error('Failed to list categories', error);
    res.status(500).json({ error: 'Failed to list categories' });
  }
});

// API: Get NPC presets
app.get('/api/npcs', async (req, res) => {
  try {
    const npcsPath = path.join(__dirname, 'content', 'npcs');
    const files = await fs.readdir(npcsPath);
    const npcs = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(npcsPath, file), 'utf8');
        npcs.push(JSON.parse(content));
      }
    }

    res.json({ npcs });
  } catch (error) {
    logger.error('Failed to load NPCs', error);
    res.status(500).json({ error: 'Failed to load NPCs' });
  }
});

// API: Save NPC preset
app.post('/api/npcs', async (req, res) => {
  try {
    const npc = req.body;
    if (!npc.name) {
      return res.status(400).json({ error: 'NPC name is required' });
    }

    const filename = npc.name.toLowerCase().replace(/\s+/g, '-') + '.json';
    const filepath = path.join(__dirname, 'content', 'npcs', filename);

    await fs.writeFile(filepath, JSON.stringify(npc, null, 2));
    logger.info('NPC preset saved', { name: npc.name, filename });

    res.json({ success: true, filename });
  } catch (error) {
    logger.error('Failed to save NPC', error);
    res.status(500).json({ error: 'Failed to save NPC' });
  }
});

// Configure multer for file uploads (persistent disk)
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(config.persistentDisk, 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (config.allowedFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file format. Allowed: ${config.allowedFormats.join(', ')}`));
    }
  }
});

// API: Upload contributor asset
app.post('/api/upload', upload.single('asset'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const metadata = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      category: req.body.category || 'user-uploads',
      contributor: req.body.contributor || 'anonymous',
      license: req.body.license || 'CC-BY-SA-3.0'
    };

    // Save metadata
    const metadataPath = path.join(
      config.persistentDisk,
      'uploads',
      req.file.filename + '.meta.json'
    );
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    logger.info('Asset uploaded', metadata);

    res.json({
      success: true,
      file: metadata,
      url: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    logger.error('Upload failed', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// API: List uploaded assets
app.get('/api/uploads', async (req, res) => {
  try {
    const uploadDir = path.join(config.persistentDisk, 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const files = await fs.readdir(uploadDir);
    const uploads = [];

    for (const file of files) {
      if (file.endsWith('.meta.json')) {
        const content = await fs.readFile(path.join(uploadDir, file), 'utf8');
        uploads.push(JSON.parse(content));
      }
    }

    res.json({ uploads });
  } catch (error) {
    logger.error('Failed to list uploads', error);
    res.status(500).json({ error: 'Failed to list uploads' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(config.persistentDisk, 'uploads'), {
  maxAge: '1d'
}));

// API: Character builder endpoint
app.post('/api/build-avatar', async (req, res) => {
  try {
    const config = req.body;
    
    // Validate configuration
    if (!config.body) {
      return res.status(400).json({ error: 'Body configuration required' });
    }

    logger.info('Avatar build requested', { config });

    // Return configuration for client-side rendering
    res.json({
      success: true,
      config,
      message: 'Avatar configuration validated'
    });
  } catch (error) {
    logger.error('Avatar build failed', error);
    res.status(500).json({ error: 'Failed to build avatar' });
  }
});

// Metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString()
    };

    // Count assets
    try {
      const countFiles = async (dir) => {
        let count = 0;
        const files = await fs.readdir(dir, { withFileTypes: true });
        for (const file of files) {
          if (file.isDirectory()) {
            count += await countFiles(path.join(dir, file.name));
          } else if (file.name.endsWith('.png')) {
            count++;
          }
        }
        return count;
      };

      metrics.assetCount = await countFiles(config.spritesheetsPath);
    } catch (error) {
      metrics.assetCount = 0;
    }

    res.json(metrics);
  } catch (error) {
    logger.error('Metrics failed', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info('LPC Avatar Builder server started', {
    port: PORT,
    env: process.env.NODE_ENV || 'production',
    assetsPath: config.assetsPath,
    spritesheetsPath: config.spritesheetsPath,
    persistentDisk: config.persistentDisk
  });
});

module.exports = app;
