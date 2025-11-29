const express = require('express');
const { getSupportedLanguages, translate } = require('../controllers/translationController');

const router = express.Router();

router.get('/supported-languages', getSupportedLanguages);
router.post('/translate', translate);

module.exports = router;