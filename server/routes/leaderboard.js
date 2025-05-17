const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');


router.get('/overall', leaderboardController.getOverallLeaderboard);


router.get('/category/:category', leaderboardController.getCategoryLeaderboard);

module.exports = router; 