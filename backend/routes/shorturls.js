const express = require('express');
const router = express.Router();
const ShortUrl = require('../models/ShortUrl');

router.get('/', async (req, res) => {
  try {
    const urls = await ShortUrl.find();
    res.json(urls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { originalUrl } = req.body;
    if (!originalUrl) return res.status(400).json({ message: 'originalUrl is required' });

    const newUrl = await ShortUrl.create({ originalUrl });
    res.status(201).json(newUrl);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
