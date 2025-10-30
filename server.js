const express = require('express');
const app = express();
const cors = require('cors');
const { Pool } = require('pg');

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API endpoint to get list of districts
app.get('/api/districts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM districts');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

// Additional routes for performance etc. can be added similarly...

// Start server on the port Render provides
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
