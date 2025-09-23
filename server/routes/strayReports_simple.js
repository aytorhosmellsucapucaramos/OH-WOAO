const express = require('express');
const router = express.Router();

// Simple stray reports routes - returning mock data for now

// GET /api/stray-reports - Get all reports
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [],
    total: 0
  });
});

// GET /api/stray-reports/:id - Get report by ID
router.get('/:id', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Report not found'
  });
});

// POST /api/stray-reports - Create new report
router.post('/', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Report created successfully',
    data: {
      id: 'SR-2024-' + Date.now(),
      ...req.body
    }
  });
});

module.exports = router;
