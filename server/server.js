const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 8080;
const BACKEND_URL = process.env.BACKEND_URL || 'http://smart-view-ums-api-dev:8080'; // Local test

console.log(`Using Backend URL: ${BACKEND_URL}`);

// === 1. Serve Angular static files ===
const angularDistFolder = path.join(__dirname, '../dist/device-app/browser');
app.use(express.static(angularDistFolder));

// === 2. Proxy API Routes ===
app.use(express.json());

app.post('/api/auth/login', async (req, res) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/login/`, {
      payload: req.body
    });
    res.json(response.data);
  } catch (error) {
    console.error('Proxy login error:', error.message);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.post('/api/auth/devices', async (req, res) => {
  try {
    const token = req.headers['authorization'] || '';
    const response = await axios.post(`${BACKEND_URL}/utilities/devices/`, 
      { payload: req.body },
      { headers: { Authorization: token } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Proxy devices error:', error.message);
    res.status(500).json({ message: 'Fetching devices failed', error: error.message });
  }
});

// === 3. Serve Angular index.html ===
app.get('*', (req, res) => {
  res.sendFile(path.join(angularDistFolder, 'index.html'));
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`Proxy + Angular running at http://localhost:${PORT}`);
});