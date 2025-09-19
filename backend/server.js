const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const geoip = require('geoip-lite');

const { requestLogger, logEvent } = require('./middleware/logger');
const shorturlsRouter = require('./routes/shorturls');
const logsRouter = require('./routes/logs');
const ShortUrl = require('./models/ShortUrl');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urlshort';

mongoose.connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true }).catch(() => { });

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(requestLogger);

app.use('/shorturls', shorturlsRouter);
app.use('/logs', logsRouter);

app.get('/:shortcode', async (req, res) => {
  try {
    const shortcode = req.params.shortcode;
    const doc = await ShortUrl.findOne({ shortcode });
    if (!doc) return res.status(404).send('Not Found');

    if (new Date() > doc.expiresAt) {
      return res.status(410).send('Link expired');
    }

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const cleanIp = ip.replace(/^::ffff:/, '');
    const referrer = req.get('referer') || null;
    const geo = geoip.lookup(cleanIp);
    const country = geo ? geo.country : null;

    doc.clicks.push({ timestamp: new Date(), referrer, ip: cleanIp, country });
    await doc.save();

    await logEvent('redirect', { shortcode, ip: cleanIp, referrer, country });
    return res.redirect(doc.originalUrl);
  } catch (err) {
    return res.status(500).send('Server Error');
  }
});

app.listen(PORT);
