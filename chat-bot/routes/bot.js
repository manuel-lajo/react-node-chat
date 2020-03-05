const express = require('express');

const botController = require('../controllers/bot');

const router = express.Router();

router.get('/', botController.getStock);

module.exports = router;
