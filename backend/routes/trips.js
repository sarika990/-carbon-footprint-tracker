const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Trip, User } = require('../models');
const auth = require('../middleware/auth');
const { calculateCO2, getSuggestion, checkAndAwardBadges } = require('../utils/co2Calculator');

// Helper to get yesterday's date string
function getYesterdayStr(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// Log a trip
router.post('/', auth, async (req, res) => {
  try {
    const { mode, distanceKm, date, startLocation, endLocation } = req.body;
    const userId = req.user.id;

    if (!mode || !distanceKm || !date) {
      return res.status(400).json({ error: 'Mode, distance and date are required' });
    }

    const dist = parseFloat(distanceKm);
    if (isNaN(dist) || dist <= 0) {
      return res.status(400).json({ error: 'Distance must be a positive number' });
    }

    // Calculate CO2 and alternative suggestion
    const co2Emitted = calculateCO2(mode, dist);
    const suggestion = getSuggestion(mode, dist);

    // Create the trip
    const trip = await Trip.create({
      userId,
      mode,
      distanceKm: dist,
      co2Emitted,
      suggestedAlternative: suggestion.mode,
      potentialCo2Saved: suggestion.potentialSaved,
      date, // YYYY-MM-DD
      startLocation: startLocation || null,
      endLocation: endLocation || null,
    });

    // Update streak logic
    const user = await User.findByPk(userId);
    const todayStr = date; // The date of the logged trip represents the logged day
    const yesterdayStr = getYesterdayStr(todayStr);

    let streakUpdated = false;
    let oldStreak = user.streakCount;

    if (!user.lastLogDate) {
      // First trip logged ever
      user.streakCount = 1;
      user.longestStreak = 1;
      user.lastLogDate = todayStr;
      streakUpdated = true;
    } else if (user.lastLogDate === todayStr) {
      // Already logged a trip today, streak remains the same
      // Just keep user.lastLogDate = todayStr
    } else if (user.lastLogDate === yesterdayStr) {
      // Logged yesterday, increment streak
      user.streakCount += 1;
      if (user.streakCount > user.longestStreak) {
        user.longestStreak = user.streakCount;
      }
      user.lastLogDate = todayStr;
      streakUpdated = true;
    } else {
      // Break in streak, reset to 1 (unless it was a historic log in the past)
      if (new Date(todayStr) > new Date(user.lastLogDate)) {
        user.streakCount = 1;
        user.lastLogDate = todayStr;
        streakUpdated = true;
      }
      // If it's a historic entry before the last log date, don't reset their active current streak
    }

    await user.save();

    // Check for badges
    const allUserTrips = await Trip.findAll({ where: { userId } });
    const totalTripsCount = allUserTrips.length;
    // Calculate total CO2 saved vs solo car
    const totalSaved = allUserTrips.reduce((acc, t) => {
      const carBaseline = t.distanceKm * 0.192;
      const actualSaved = Math.max(0, carBaseline - t.co2Emitted);
      return acc + actualSaved;
    }, 0);

    const newBadges = await checkAndAwardBadges(
      userId,
      totalSaved,
      totalTripsCount,
      user.streakCount
    );

    return res.status(201).json({
      trip,
      newBadges,
      streak: {
        current: user.streakCount,
        longest: user.longestStreak,
        updated: streakUpdated && (user.streakCount !== oldStreak),
      },
    });
  } catch (error) {
    console.error('Create trip error:', error);
    return res.status(500).json({ error: 'Server error while logging trip' });
  }
});

// Get user trips with optional filters
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { mode, startDate, endDate } = req.query;

    const whereClause = { userId };

    if (mode) {
      whereClause.mode = mode;
    }

    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      whereClause.date = {
        [Op.gte]: startDate,
      };
    } else if (endDate) {
      whereClause.date = {
        [Op.lte]: endDate,
      };
    }

    const trips = await Trip.findAll({
      where: whereClause,
      order: [
        ['date', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    return res.json(trips);
  } catch (error) {
    console.error('Fetch trips error:', error);
    return res.status(500).json({ error: 'Server error while fetching trips' });
  }
});

// Delete a trip
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const tripId = req.params.id;

    const trip = await Trip.findOne({ where: { id: tripId, userId } });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    await trip.destroy();
    return res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    return res.status(500).json({ error: 'Server error while deleting trip' });
  }
});

module.exports = router;
