const express = require('express');
const router = express.Router();
const { Trip, User } = require('../models');
const auth = require('../middleware/auth');

router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user and all their trips
    const user = await User.findByPk(userId);
    const trips = await Trip.findAll({
      where: { userId },
      order: [['date', 'ASC']], // Oldest to newest for easy parsing
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 1. Basic Stats
    const totalTrips = trips.length;

    // CO2 saved compared to if all trips were by car
    // baseline = distance * 0.192, actual = trip.co2Emitted.
    // Saved = baseline - actual.
    const totalSaved = trips.reduce((acc, t) => {
      const carBaseline = t.distanceKm * 0.192;
      const actualSaved = Math.max(0, carBaseline - t.co2Emitted);
      return acc + actualSaved;
    }, 0);

    // Cumulative CO2 they could have saved from suggestions they didn't take
    const cumulativePotentialSavings = trips.reduce((acc, t) => {
      return acc + (t.potentialCo2Saved || 0);
    }, 0);

    // Weekly emissions (rolling last 7 days including today)
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const weeklyTrips = trips.filter(t => t.date >= sevenDaysAgoStr);
    const totalWeeklyEmitted = weeklyTrips.reduce((acc, t) => acc + t.co2Emitted, 0);

    // 2. Charts: Last 7 and 30 days daily emissions
    // Generate dates helper
    const getDaysArray = (numDays) => {
      const arr = [];
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        arr.push(d.toISOString().split('T')[0]);
      }
      return arr;
    };

    const last7Days = getDaysArray(7);
    const last30Days = getDaysArray(30);

    const mapTripsToDates = (dates) => {
      return dates.map(dateStr => {
        const dayTrips = trips.filter(t => t.date === dateStr);
        const emitted = dayTrips.reduce((acc, t) => acc + t.co2Emitted, 0);
        const saved = dayTrips.reduce((acc, t) => {
          const carBaseline = t.distanceKm * 0.192;
          return acc + Math.max(0, carBaseline - t.co2Emitted);
        }, 0);
        
        // Format date string for chart label (e.g. 'Aug 09')
        const parts = dateStr.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedDate = `${monthNames[parseInt(parts[1], 10) - 1]} ${parts[2]}`;

        return {
          date: dateStr,
          label: formattedDate,
          emitted: Number(emitted.toFixed(2)),
          saved: Number(saved.toFixed(2)),
        };
      });
    };

    const chartData7 = mapTripsToDates(last7Days);
    const chartData30 = mapTripsToDates(last30Days);

    // 3. Transport Mode Breakdown (pie chart data)
    const modeCounts = {};
    trips.forEach(t => {
      modeCounts[t.mode] = (modeCounts[t.mode] || 0) + 1;
    });

    const modeData = Object.keys(modeCounts).map(mode => ({
      name: mode,
      value: modeCounts[mode],
    }));

    // 4. Recent Trips (Last 5 trips, newest first)
    const sortedNewestFirst = [...trips].sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return b.createdAt - a.createdAt;
    });
    const recentTrips = sortedNewestFirst.slice(0, 5);

    // 5. Active Smart Suggestions (top 3 recent high emission trips with recommendations)
    const suggestions = sortedNewestFirst
      .filter(t => t.suggestedAlternative && t.potentialCo2Saved > 0)
      .slice(0, 3)
      .map(t => ({
        tripId: t.id,
        date: t.date,
        mode: t.mode,
        distanceKm: t.distanceKm,
        suggestedAlternative: t.suggestedAlternative,
        potentialCo2Saved: t.potentialCo2Saved,
      }));

    return res.json({
      summary: {
        totalWeeklyEmitted: Number(totalWeeklyEmitted.toFixed(2)),
        totalSaved: Number(totalSaved.toFixed(2)),
        cumulativePotentialSavings: Number(cumulativePotentialSavings.toFixed(2)),
        streakCount: user.streakCount,
        longestStreak: user.longestStreak,
        totalTrips,
      },
      charts: {
        last7Days: chartData7,
        last30Days: chartData30,
      },
      modeBreakdown: modeData,
      recentTrips,
      suggestions,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return res.status(500).json({ error: 'Server error while compiling dashboard statistics' });
  }
});

module.exports = router;
