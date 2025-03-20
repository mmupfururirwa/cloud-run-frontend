const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 8080;
const BACKEND_URL = process.env.BACKEND_URL || 'https://smart-view-ums-api-dev-6bsov2mz7q-ey.a.run.app'; // Update with your backend URL

console.log(`Using Backend URL: ${BACKEND_URL}`);

// === 1. Serve Angular static files ===
const angularDistFolder = path.join(__dirname, '../dist/device-app/browser');
app.use(express.static(angularDistFolder));

// === 2. Proxy API Routes ===
app.use(express.json());

app.post('/api/auth/login', async (req, res) => {
  try {
    console.info('Proxy login body:', req.body);
    const response = await axios.post(`${BACKEND_URL}/auth/login/`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Proxy login error:', error.message);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    console.info('Proxy register body:', req.body);
    const response = await axios.post(`${BACKEND_URL}/auth/register/`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Proxy register error:', error.message);
    console.error('Proxy register message:', error.response.data);
    res.status(500).json({ message: 'Register failed', error: error.message });
  }
});

app.post('/api/wallet/payfast/initiate_payfast_topup', async (req, res) => {
  try {
    console.info('Proxy initiate payfast topup body:', req.body);
    const token = req.headers['authorization'] || '';
    const response = await axios.post(`${BACKEND_URL}/wallet/payfast/initiate_payfast_topup`, req.body,
      { headers: { Authorization: token } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Proxy initiate payfast topup error:', error.message);
    res.status(500).json({ message: 'Initiate payfast topup failed', error: error.message });
  }
});

app.post('/api/wallet/payfast_notify', async (req, res) => {
  try {
    console.info('Proxy payfast notify body:', req.body);
    const response = await axios.post(`${BACKEND_URL}/wallet/payfast_notify`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Proxy payfast notify error:', error.message);
    res.status(500).json({ message: 'Payfast notify failed', error: error.message });
  }
});

app.post('/api/utilities/devices', async (req, res) => {
  try {
    const token = req.headers['authorization'] || '';
    const response = await axios.post(`${BACKEND_URL}/utilities/devices/`, req.body,
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