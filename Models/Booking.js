const db = require('../config/db');

class Booking {
  static async createBooking(bookingData) {
    const { user_id, name, nama, email, phone_number, check_in, check_out, harga, payment_type, transaction_time } = bookingData;
    const [result] = await db.query(
      `INSERT INTO bookings 
       (user_id, name, nama, email, phone_number, check_in, check_out, harga ,payment_type , transaction_time ) 
       VALUES (?,?, ?, ?, ?, ?, ?, ? , ? , ?)`,
      [user_id, name, nama, email, phone_number, check_in, check_out, harga, payment_type, transaction_time]
    );
    return { id: result.insertId, ...bookingData };
  }

  static async findByUserId(userId) {
    const [rows] = await db.query(`SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
    return rows;
  }
  //
  static async findAll() {
    const [rows] = await db.query(
      `SELECT b.*, u.name as user_name 
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`
    );
    return rows;
  }
  static async delete(id) {
    await db.query('DELETE FROM payments WHERE booking_id = ?', [id]);
    const [result] = await db.query('DELETE FROM bookings WHERE id = ?', [id]);
    return result;
  }
  static async updateStatus(booking_id, status) {
    try {
      const [result] = await db.query(`UPDATE bookings SET status = ? WHERE id = ?`, [status, booking_id]);

      if (result.affectedRows === 0) {
        throw new Error('Booking tidak ditemukan atau sudah diperbarui');
      }

      return { booking_id, status };
    } catch (err) {
      console.error('Database error in updateStatus:', err);
      throw err;
    }
  }

  static async updatePaymentandtime(payment_type, transaction_time, id) {
    const [result] = await db.query('UPDATE bookings SET payment_type = ? , transaction_time = ? WHERE id = ?', [payment_type, transaction_time, id]);
    return { payment_type, transaction_time, id };
  }
  static async createPayments(BookingPayment) {
    const { booking_id, order_id, gross_amount, transaction_status, transaction_id, payment_type, transaction_time } = BookingPayment;
    const [result] = await db.query(`INSERT INTO payments (booking_id, order_id ,gross_amount, transaction_status, transaction_id, payment_type, transaction_time) VALUES (?, ?, ?, ?, ?,?, ?)`, [
      booking_id,
      order_id,
      gross_amount,
      transaction_status,
      transaction_id,
      payment_type,
      transaction_time,
    ]);
    return { id: result.insertId, ...BookingPayment };
  }
  static async updatePayment(payment_type, transaction_time, transaction_status, order_id) {
    const [result] = await db.query(`UPDATE payments SET payment_type = ?, transaction_time = ? , transaction_status = ? WHERE order_id = ?`, [payment_type, transaction_time, transaction_status, order_id]);
    return { payment_type, transaction_time, transaction_status, order_id };
  }
  static async getorder(order_id) {
    const [rows] = await db.query(`SELECT * FROM payments WHERE order_id = ?`, [order_id]);
    return rows;
  }
  static async getUserPayments(userId) {
    const [rows] = await db.query(
      `
 SELECT 
  payments.*, 
  bookings.nama,
  bookings.name,
  bookings.check_in, 
  bookings.check_out 
FROM 
  payments
JOIN 
  bookings ON payments.booking_id = bookings.id
WHERE 
  bookings.user_id = ?
ORDER BY 
  payments.transaction_time DESC

  `,
      [userId]
    );

    return rows;
  }
  static async getAllPayments() {
    const [rows] = await db.query('SELECT * FROM payments');
    return rows;
  }
}

module.exports = Booking;
