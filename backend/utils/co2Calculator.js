const EMISSION_FACTORS = {
  'Car': 0.192,
  'Bike/Motorcycle': 0.103,
  'Bus': 0.105,
  'Train/Metro': 0.041,
  'Carpool': 0.048,
  'Bicycle': 0.0,
  'Walk': 0.0,
};

function calculateCO2(mode, distanceKm) {
  const factor = EMISSION_FACTORS[mode] !== undefined ? EMISSION_FACTORS[mode] : 0;
  return Number((distanceKm * factor).toFixed(3));
}

function getSuggestion(mode, distanceKm) {
  const currentFactor = EMISSION_FACTORS[mode] !== undefined ? EMISSION_FACTORS[mode] : 0;
  
  let suggestedMode = null;
  
  if (distanceKm < 2) {
    suggestedMode = 'Walk';
  } else if (distanceKm >= 2 && distanceKm <= 7) {
    suggestedMode = 'Bicycle';
  } else if (distanceKm > 7 && distanceKm <= 15) {
    suggestedMode = 'Bus/Metro';
  } else if (distanceKm > 15) {
    suggestedMode = 'Carpool';
  }

  if (suggestedMode) {
    let suggestedFactor = 0;
    if (suggestedMode === 'Walk' || suggestedMode === 'Bicycle') {
      suggestedFactor = 0.0;
    } else if (suggestedMode === 'Bus/Metro') {
      suggestedFactor = 0.041; // Train/Metro factor as public transit
    } else if (suggestedMode === 'Carpool') {
      suggestedFactor = 0.048;
    }

    if (suggestedFactor < currentFactor) {
      const co2IfAlternative = distanceKm * suggestedFactor;
      const co2Current = distanceKm * currentFactor;
      const potentialSaved = Number((co2Current - co2IfAlternative).toFixed(3));
      
      return {
        mode: suggestedMode,
        potentialSaved: potentialSaved > 0 ? potentialSaved : 0,
      };
    }
  }

  return {
    mode: null,
    potentialSaved: 0,
  };
}

async function checkAndAwardBadges(userId, totalSaved, totalTripsCount, currentStreak) {
  // Import Badge here to avoid circular imports during startup
  const { Badge } = require('../models');
  
  const existingBadges = await Badge.findAll({ where: { userId } });
  const existingNames = existingBadges.map(b => b.name);
  
  const badgesToAward = [];

  const checkAward = (name, condition) => {
    if (condition && !existingNames.includes(name)) {
      badgesToAward.push(name);
    }
  };

  checkAward('First Commute', totalTripsCount >= 1);
  checkAward('Eco Rookie', totalSaved >= 5);
  checkAward('Carbon Cutter', totalSaved >= 15);
  checkAward('Eco Warrior', totalSaved >= 50);
  checkAward('Consistent Commuter', currentStreak >= 5);
  checkAward('Streak Master', currentStreak >= 10);

  const createdBadges = [];
  for (const name of badgesToAward) {
    const badge = await Badge.create({ userId, name });
    createdBadges.push(badge);
  }

  return createdBadges.map(b => b.name);
}

module.exports = {
  EMISSION_FACTORS,
  calculateCO2,
  getSuggestion,
  checkAndAwardBadges,
};
