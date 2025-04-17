const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../config/multer'); // Untuk handle file upload

router.post('/', authMiddleware, upload.single('payment_proof'), bookingController.createBooking);
router.get('/my-bookings', authMiddleware, bookingController.getUserBookings);
router.get('/all', authMiddleware, bookingController.getAllBookings);
router.patch('/:id/status', authMiddleware, bookingController.updateBookingStatus);
router.delete('/:id', authMiddleware, bookingController.deleteBooking);

module.exports = router;
