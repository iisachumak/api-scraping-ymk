const express = require('express');
const { scraperFravega } = require('./utils/scraperFravega');
const { scraperBarbieri } = require('./utils/scraperBarbieri');
const { scraperCastillo } = require('./utils/scraperCastillo');
const { scraperOnCity } = require('./utils/scraperOnCity');

const app = express();
const PORT = 3000;

app.get('/scraper-fravega', async (req, res) => {
  try {
    const data = await scraperFravega();
    res.json({ status: 'scraping complete', data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});


app.get('/scraper-barbieri', async (req, res) => {
  try {
    const data = await scraperBarbieri();
    res.json({ status: 'scraping complete', data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});


app.get('/scraper-castillo', async (req, res) => {
  try {
    const data = await scraperCastillo();
    res.json({ status: 'scraping complete', data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/scraper-oncity', async (req, res) => {
  try {
    const data = await scraperOnCity();
    res.json({ status: 'scraping complete', data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
