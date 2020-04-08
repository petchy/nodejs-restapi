const doscgController = require('../../controllers/apis/doscg');

const express = require('express');
let router = express.Router();
router.use('/doscgs', doscgController);
module.exports = router;
