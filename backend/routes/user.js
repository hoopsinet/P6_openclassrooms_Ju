const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const regex = require('../middleware/regex')

router.post('/signup', regex, userCtrl.signup);
router.post('/login', userCtrl.login);


module.exports = router;
