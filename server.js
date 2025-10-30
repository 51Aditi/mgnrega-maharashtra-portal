const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mgnrega_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
});

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/districts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM districts ORDER BY district_name');
    res.json({ districts: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

app.get('/api/performance/:districtId/current', async (req, res) => {
  try {
    const { districtId } = req.params;
    const query = `
      SELECT mp.*, d.district_name 
      FROM mgnrega_performance mp
      JOIN districts d ON mp.district_id = d.district_id
      WHERE mp.district_id = $1
      ORDER BY mp.year DESC, mp.month DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [districtId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/api/performance/:districtId/history', async (req, res) => {
  try {
    const { districtId } = req.params;
    const months = parseInt(req.query.months) || 6;
    const query = `
      SELECT mp.*, d.district_name 
      FROM mgnrega_performance mp
      JOIN districts d ON mp.district_id = d.district_id
      WHERE mp.district_id = $1
      ORDER BY mp.year DESC, mp.month DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [districtId, months]);
    res.json({ history: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.get('/api/performance/compare', async (req, res) => {
  try {
    const districtIds = req.query.districts?.split(',').map(id => parseInt(id));
    if (!districtIds || districtIds.length === 0) {
      return res.status(400).json({ error: 'Please provide district IDs' });
    }
    const query = `
      SELECT mp.*, d.district_name 
      FROM mgnrega_performance mp
      JOIN districts d ON mp.district_id = d.district_id
      WHERE mp.district_id = ANY($1::int[])
    `;
    const result = await pool.query(query, [districtIds]);
    res.json({ comparison: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to compare' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
