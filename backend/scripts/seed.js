const sequelize = require('../config/db');
const { User, Trip, Badge } = require('../models');
const bcrypt = require('bcryptjs');
const { calculateCO2, getSuggestion } = require('../utils/co2Calculator');

const sampleTrips = [
  { mode: 'Car', distanceKm: 22.5, offsetDays: 20 },
  { mode: 'Bus', distanceKm: 12.0, offsetDays: 19 },
  { mode: 'Bicycle', distanceKm: 5.5, offsetDays: 18 },
  { mode: 'Train/Metro', distanceKm: 18.0, offsetDays: 17 },
  { mode: 'Walk', distanceKm: 1.5, offsetDays: 16 },
  { mode: 'Car', distanceKm: 8.0, offsetDays: 15 },
  { mode: 'Car', distanceKm: 1.2, offsetDays: 14 },
  { mode: 'Carpool', distanceKm: 25.0, offsetDays: 13 },
  { mode: 'Train/Metro', distanceKm: 15.0, offsetDays: 12 },
  { mode: 'Bicycle', distanceKm: 6.0, offsetDays: 11 },
  { mode: 'Bus', distanceKm: 10.5, offsetDays: 10 },
  { mode: 'Car', distanceKm: 3.5, offsetDays: 9 },
  { mode: 'Bicycle', distanceKm: 4.0, offsetDays: 8 },
  { mode: 'Walk', distanceKm: 1.8, offsetDays: 7 },
  { mode: 'Train/Metro', distanceKm: 20.0, offsetDays: 6 },
  { mode: 'Car', distanceKm: 30.0, offsetDays: 5 },
  { mode: 'Bus', distanceKm: 12.0, offsetDays: 4 },
  { mode: 'Bicycle', distanceKm: 5.0, offsetDays: 3 },
  { mode: 'Walk', distanceKm: 1.2, offsetDays: 2 },
  { mode: 'Train/Metro', distanceKm: 15.0, offsetDays: 1 },
  { mode: 'Bicycle', distanceKm: 4.5, offsetDays: 0 },
];

async function seed() {
  try {
    console.log('Starting database seeding...');
    await sequelize.sync({ force: true });
    console.log('Database wiped and re-created.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123', salt);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const user = await User.create({
      name: 'Eco Commuter',
      email: 'demo@carbon.com',
      passwordHash,
      streakCount: 5,
      longestStreak: 8,
      lastLogDate: todayStr,
    });

    console.log('Demo user created.');

    for (const sample of sampleTrips) {
      const tripDate = new Date();
      tripDate.setDate(tripDate.getDate() - sample.offsetDays);
      const dateStr = tripDate.toISOString().split('T')[0];

      const co2Emitted = calculateCO2(sample.mode, sample.distanceKm);
      const suggestion = getSuggestion(sample.mode, sample.distanceKm);

      await Trip.create({
        userId: user.id,
        mode: sample.mode,
        distanceKm: sample.distanceKm,
        co2Emitted,
        suggestedAlternative: suggestion.mode,
        potentialCo2Saved: suggestion.potentialSaved,
        date: dateStr,
        startLocation: 'Home',
        endLocation: sample.mode === 'Walk' || sample.mode === 'Bicycle' ? 'Local Market' : 'Office',
      });
    }

    console.log(`Seeded ${sampleTrips.length} sample trips.`);

    const allTrips = await Trip.findAll({ where: { userId: user.id } });
    const totalTripsCount = allTrips.length;
    const totalSaved = allTrips.reduce((acc, t) => {
      const carBaseline = t.distanceKm * 0.192;
      return acc + Math.max(0, carBaseline - t.co2Emitted);
    }, 0);

    console.log(`Total CO2 saved in seed: ${totalSaved.toFixed(2)} kg`);

    const badgesToAward = ['First Commute', 'Eco Rookie', 'Carbon Cutter', 'Consistent Commuter'];
    for (const name of badgesToAward) {
      await Badge.create({
        userId: user.id,
        name,
        earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      });
    }

    console.log('Badges seeded.');
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
