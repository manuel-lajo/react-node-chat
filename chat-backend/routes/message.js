const express = require('express');

const messageController = require('../controllers/messages');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', isAuth, messageController.getMessages);
router.post('/', isAuth, messageController.postMessage);

module.exports = router;
