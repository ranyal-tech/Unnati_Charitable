const express = require('express');
const {
  createOrder,
  handleWebhook,
  getDonationStatus,
} = require('../controllers/donationController');

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/webhook', handleWebhook);
router.get('/:id/status', getDonationStatus);

module.exports = router;
