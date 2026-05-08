const express = require('express');
const { proxyTMDB } = require('../controllers/tmdbController');
const router = express.Router();

router.get(/(.*)/, proxyTMDB);

module.exports = router;
