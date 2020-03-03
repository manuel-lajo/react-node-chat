const express = require('express');

const messageController = require('../controllers/messages');

const router = express.Router();

router.get('/', messageController.getMessages);
router.post('/', messageController.postMessage);

module.exports = router;
