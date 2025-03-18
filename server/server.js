const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 8080;

// === Config Backend Internal URL ===
const BACKEND_INTERNAL_URL = 'http://smart-view-ums-api-dev:8080'; // Cloud Run service name resolves internally

app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist'))); // Serve Angular

// Proxy login request
app.post('/api/auth/login', async (req, res) => {
  try {
    const response = await axios.post(`${BACKEND_INTERNAL_URL}/auth/login/`, {
      payload: req.body
    });
    res.json(response.data);
  } catch (error) {
    console.error('Proxy login error:', error.message);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Proxy getDevices request
app.post('/api/utilities/devices', async (req, res) => {
  try {
    const token = req.headers['authorization'] || '';
    const response = await axios.post(`${BACKEND_INTERNAL_URL}/utilities/devices/`, 
      { payload: req.body },
      { headers: { Authorization: token } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Proxy devices error:', error.message);
    res.status(500).json({ message: 'Fetching devices failed', error: error.message });
  }
});

// Serve index.html for Angular routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});