const mongoose = require('mongoose');
const shortid = require('shortid');

const shortUrlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortcode: { type: String, required: true, default: shortid.generate },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 2*24*60*60*1000) }, 
  clicks: [
    {
      timestamp: { type: Date, default: Date.now },
      referrer: String,
      ip: String,
      country: String
    }
  ]
});

module.exports = mongoose.model('ShortUrl', shortUrlSchema);
