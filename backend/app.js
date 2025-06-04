// app.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Importa tus scrapers
const { scraperFravega } = require('./utils/scraperFravega');
const { scraperBarbieri } = require('./utils/scraperBarbieri');
const { scraperCastillo } = require('./utils/scraperCastillo');
const { scraperOnCity } = require('./utils/scraperOnCity');

const app = express();
const PORT = 3000;

app.use(cors());

// Multer: subir archivos a /uploads
const upload = multer({ dest: 'uploads/' });

// Rutas POST para recibir archivo Excel
app.post('/scraper-fravega', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const data = await scraperFravega(filePath);
    fs.unlinkSync(filePath); // Borrar archivo temporal
    res.json({ status: 'scraping complete', data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.post('/scraper-barbieri', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const data = await scraperBarbieri(filePath);
    fs.unlinkSync(filePath);
    res.json({ status: 'scraping complete', data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.post('/scraper-castillo', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const data = await scraperCastillo(filePath);
    fs.unlinkSync(filePath);
    res.json({ status: 'scraping complete', data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.post('/scraper-oncity', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const data = await scraperOnCity(filePath);
    fs.unlinkSync(filePath);
    res.json({ status: 'scraping complete', data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
