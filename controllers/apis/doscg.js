const express = require('express');
const doscgService = require('../../services/doscgs/doscg');
let router = express.Router();

router.get('/', doscgService.getDoscgs);
router.get('/progression', doscgService.getProgression);
router.get('/equation', doscgService.getEquation);
router.get('/bestway', doscgService.getBestway);
router.post('/webhook', doscgService.createReply);

module.exports = router;
