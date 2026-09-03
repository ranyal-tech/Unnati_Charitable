const express = require('express');
const { getLogDates, getLogByDate } = require('../controllers/logController');

const router = express.Router();

router.get('/', getLogDates);
router.get('/:date', getLogByDate);

module.exports = router;
