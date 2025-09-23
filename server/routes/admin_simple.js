const express = require('express');
const router = express.Router();

// Simple admin routes - returning mock data for now
// You can connect to MySQL later when needed

// GET /api/admin/pets - Get all pets
router.get('/pets', async (req, res) => {
  res.json({
    success: true,
    pets: [],
    total: 0
  });
});

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  res.json({
    success: true,
    users: [],
    total: 0
  });
});

// GET /api/admin/stray-reports - Get all stray reports
router.get('/stray-reports', async (req, res) => {
  res.json({
    success: true,
    reports: [],
    total: 0
  });
});

// GET /api/admin/stats - Get statistics  
router.get('/stats', async (req, res) => {
  res.json({
    success: true,
    stats: {
      totalPets: 0,
      totalUsers: 0,
      activeReports: 0,
      carnetsDelivered: 0,
      carnetsPending: 0
    }
  });
});

module.exports = router;
