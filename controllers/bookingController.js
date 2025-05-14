const Booking = require('../Models/Booking.js');
const path = require('path');
const fs = require('fs');

const bookingController = {
  createBooking: async (req, res) => {
    try {
      // Handle file upload
      if (!req.file) {
        return res.status(400).json({ message: 'Bukti pembayaran wajib diunggah' });
      }

      const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const uploadResponse = await cloudinary.uploader.upload(fileStr, {
        folder: 'bookings',
      });
      const bookingData = {
        user_id: req.user.id,
        nama: req.body.nama,
        email: req.body.email,
        phone_number: req.body.phone_number,
        check_in: req.body.check_in,
        harga: req.body.harga,
        check_out: req.body.check_out,
        payment_proof: uploadResponse.secure_url,
      };

      const booking = await Booking.create(bookingData);
      res.status(201).json(booking);
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
