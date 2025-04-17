const jwt = require('jsonwebtoken');
const User = require('../Models/User.js');
const bcrypt = require('bcryptjs');

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Pengguna sudah ada' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'user', // Default role
      });

      // Create token
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

      res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'email atau password salah' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'email atau password salah' });
      }

      // Create token
      const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getMe: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      const user = await User.findByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (err) {
      console.error('❌ Error getMe:', err.message);
      res.status(500).json({ message: err.message });
    }
  },
  logout: async (req, res) => {
    try {
      console.log('🔓 Logout request diterima');
      res.status(200).json({ message: 'Logout success' });
    } catch (err) {
      console.error('❌ Logout error:', err.message);
      res.status(500).json({ message: 'Logout failed' });
    }
  },
};

module.exports = authController;
