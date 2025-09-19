const fs = require('fs').promises;
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

async function ensureLogDir() {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
  } catch (e) {
  }
}

async function appendLog(obj) {
  try {
    await ensureLogDir();
    const entry = { ...obj, timestamp: new Date().toISOString() };
    await fs.appendFile(LOG_FILE, JSON.stringify(entry) + '\n', 'utf8');
  } catch (e) {
  }
}


// Express request logging middleware
 
async function requestLogger(req, res, next) {
  try {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const safeBody = (() => {
      try {
        if (!req.body) return null;
        const b = req.body;
        if (typeof b === 'object') return Object.keys(b).length <= 20 ? b : '[object with keys]';
        return b;
      } catch (e) {
        return null;
      }
    })();

    await appendLog({
      type: 'request',
      method: req.method,
      url: req.originalUrl || req.url,
      ip,
      userAgent: req.get('user-agent') || null,
      body: safeBody
    });
  } catch (e) {
  } finally {
    next();
  }
}


// Generic event logger usable from routes
async function logEvent(eventName, payload = {}) {
  try {
    await appendLog({ type: 'event', event: eventName, payload });
  } catch (e) {
  }
}

module.exports = { requestLogger, logEvent };