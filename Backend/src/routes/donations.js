const express = require('express');

const {
  createOrder,
  handleWebhook,
  getDonationStatus,
  verifyDonation,
} = require('../controllers/donationController');

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/webhook', handleWebhook);
router.post('/:id/verify', verifyDonation);
router.get('/:id/status', getDonationStatus);

module.exports = router;
