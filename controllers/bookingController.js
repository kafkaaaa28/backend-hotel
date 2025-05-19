const Booking = require('../Models/Booking.js');
const db = require('../config/db');
const midtrans = require('midtrans-client');
let snap = new midtrans.Snap({
  isProduction: false,
  serverKey: process.env.SECRET,
  ClientKey: process.env.CLIENT_KEY,
});
const bookingController = {
  createBooking: async (req, res) => {
    try {
      if (!req.body) {
        return res.status(400).json({ error: 'Request body is missing' });
      }

      const { name, nama, email, phone_number, check_in, check_out, harga } = req.body;
      console.log('req.body:', req.body);

      if (!name) {
        return res.status(400).json({ error: 'Room name is required' });
      }

      const bookingData = {
        user_id: req.user?.id,
        name,
        nama,
        email,
        phone_number,
        check_in,
        check_out,
        harga,
      };

      const booking = await Booking.createBooking(bookingData);

      res.status(201).json(booking);
    } catch (err) {
      console.error('❌ Error di createBooking:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  createPayment: async (req, res) => {
    try {
      const { booking_id, name, nama, email, phone_number, harga } = req.body;
      const order_id = `ORDER-${booking_id}-${Date.now()}`;
      let paymentParams = {
        transaction_details: {
          order_id: order_id,
          gross_amount: parseInt(harga),
        },
        item_details: [
          {
            name: name,
            price: parseInt(harga),
            quantity: 1,
          },
        ],
        customer_details: {
          first_name: nama,
          email: email,
          phone: phone_number,
        },
        callbacks: {
          finish: 'https://booking-hotel-woad.vercel.app/my-bookings',
        },
      };

      const transaction = await snap.createTransaction(paymentParams);

      await Booking.createPayments({
        booking_id,
        gross_amount: parseInt(harga),
        transaction_status: 'pending',
        transaction_id: transaction.token,
        order_id: order_id,
      });

      res.status(201).json({
        token: transaction.token,
        redirect_url: transaction.redirect_url,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getUserBookings: async (req, res) => {
    try {
      const bookings = await Booking.findByUserId(req.user.id);
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getAllBookings: async (req, res) => {
    try {
      const bookings = await Booking.findAll();
      res.json({ success: true, data: bookings });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  updateBookingStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || !status) {
        return res.status(400).json({
          success: false,
          message: 'ID booking dan status wajib diisi',
        });
      }

      const validStatuses = ['pending', 'confirmed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status tidak valid. Gunakan: ${validStatuses.join(', ')}`,
        });
      }

      const updatedBooking = await Booking.updateStatus(id, status);
      if (!updatedBooking) {
        return res.status(404).json({
          success: false,
          message: 'Booking tidak ditemukan',
        });
      }
      res.json({
        success: true,
        data: updatedBooking,
      });
    } catch (err) {
      console.error('Error updating status:', err);
      res.status(500).json({ success: false, message: 'Gagal update status' });
    }
  },
  midtransNotification: async (req, res) => {
    try {
      const { payment_type, transaction_time } = req.body;

      const notification = await snap.transaction.notification(req.body);
      const transactionStatus = notification.transaction_status;
      const orderId = notification.order_id;
      const bookingId = orderId.split('-')[1];
      const paymentcheck = await Booking.getorder(orderId);
      if (paymentcheck.length > 0) {
        const updatePayment = await Booking.updatePayment(payment_type, transaction_time, transactionStatus, orderId);
        const updateBooking = await Booking.updateStatus(bookingId, 'confirmed');
        const updatePaymentandTime = await Booking.updatePaymentandtime(payment_type, transaction_time, bookingId);
        res.status(200).json({
          message: 'Payment status and booking status updated successfully',
          success: true,
          data: updatePayment,
          updateBooking,
          updatePaymentandTime,
        });
      } else {
        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
          try {
            const updateBooking = await Booking.updateStatus(bookingId, 'confirmed');

            await Booking.createPayments({
              booking_id: parseInt(bookingId, 10),
              order_id: orderId,
              gross_amount: notification.gross_amount,
              transaction_status: transactionStatus,
              transaction_id: notification.transaction_id,
              payment_type,
              transaction_time,
            });
            await Booking.createBooking({
              payment_type: payment_type,
              transaction_time: transaction_time,
            });
            res.status(200).json({
              message: 'Status updated to confirmed in both tables',
              success: true,
              data: updatePaymentstatus,
              updateBooking,
            });
          } catch (err) {
            console.error('❌ Gagal memproses notifikasi Midtrans:', err);
            res.status(500).json({ message: 'Server error' });
          }
        } else {
          res.status(200).json({ message: 'No action needed for this status' });
        }
      }
    } catch (err) {
      console.error('❌ Error in midtransNotification handler:', err);
      return res.status(500).json({ message: 'Something broke!', error: err.message });
    }
  },
  getUserPayments: async (req, res) => {
    try {
      const get = await Booking.getUserPayments(req.user.id);
      res.json(get);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  getAllPayments: async (req, res) => {
    try {
      const get = await Booking.getAllPayments();
      res.json(get);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  deleteBooking: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID booking tidak valid',
        });
      }

      const result = await Booking.delete(id);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Booking tidak ditemukan',
        });
      }

      res.json({
        success: true,
        message: 'Booking berhasil dihapus',
      });
    } catch (err) {
      console.error('Delete booking error:', err);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus booking',
      });
    }
  },
};

module.exports = bookingController;
