const express = require('express');
const router = express.Router();
const { User, Badge } = require('../models');
const auth = require('../middleware/auth');

// Get profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    console.error('Fetch profile error:', error);
    return res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

// Get badges
router.get('/badges', auth, async (req, res) => {
  try {
    const badges = await Badge.findAll({
      where: { userId: req.user.id },
      order: [['earnedAt', 'DESC']],
    });
    return res.json(badges);
  } catch (error) {
    console.error('Fetch badges error:', error);
    return res.status(500).json({ error: 'Server error while fetching badges' });
  }
});

module.exports = router;
