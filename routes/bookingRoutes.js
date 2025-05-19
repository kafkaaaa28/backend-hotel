const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, bookingController.createBooking);
router.get('/my-bookings', authMiddleware, bookingController.getUserBookings);
router.get('/all', authMiddleware, bookingController.getAllBookings);
router.patch('/:id/status', authMiddleware, bookingController.updateBookingStatus);
router.delete('/:id', authMiddleware, bookingController.deleteBooking);
router.post('/payments', authMiddleware, bookingController.createPayment);
router.post('/midtrans-notification', bookingController.midtransNotification);
router.get('/my-invoice', authMiddleware, bookingController.getUserPayments);
router.get('/all-payments', authMiddleware, bookingController.getAllPayments);

module.exports = router;
