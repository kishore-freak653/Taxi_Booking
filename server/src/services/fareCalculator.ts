import { prisma } from '../config/database';
import { BusinessLogicError } from '../utils/errors';
import { logger } from '../utils/logger';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface FareCalculationInput {
  pickup: Location;
  dropoff: Location;
  vehicleTypeId: string;
  requestTime?: Date;
}

interface FareCalculationResult {
  distanceKm: number;
  durationMinutes: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  estimatedFare: number;
  breakdown: {
    base: number;
    distance: number;
    time: number;
    surge: number;
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate travel time based on distance
 * Assumes average speed of 30 km/h in city traffic
 */
function estimateDuration(distanceKm: number): number {
  const avgSpeedKmh = 30;
  const hours = distanceKm / avgSpeedKmh;
  const minutes = Math.ceil(hours * 60);
  return minutes;
}

/**
 * Check if surge pricing applies based on time and fare rules
 */
async function getSurgeMultiplier(requestTime: Date): Promise<number> {
  const activeRules = await prisma.fareRule.findMany({
    where: {
      isActive: true,
      ruleType: 'time_of_day',
    },
  });

  const dayOfWeek = requestTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const hour = requestTime.getHours();

  for (const rule of activeRules) {
    const conditions = rule.conditions as any;

    // Check if current day matches
    if (conditions.days && !conditions.days.includes(dayOfWeek)) {
      continue;
    }

    // Check if current hour is in any time range
    if (conditions.hourRanges) {
      const inRange = conditions.hourRanges.some(
        (range: { start: number; end: number }) => hour >= range.start && hour < range.end
      );

      if (inRange) {
        logger.info(`Surge pricing applied: ${rule.name} (${rule.multiplier}x)`);
        return Number(rule.multiplier);
      }
    }
  }

  return 1.0; // No surge
}

/**
 * Main fare calculation function
 * This is the single source of truth for pricing
 */
export async function calculateFare(
  input: FareCalculationInput
): Promise<FareCalculationResult> {
  // Fetch vehicle type pricing
  const vehicleType = await prisma.vehicleType.findUnique({
    where: { id: input.vehicleTypeId, isActive: true },
  });

  if (!vehicleType) {
    throw new BusinessLogicError('Vehicle type not available');
  }

  // Calculate distance and duration
  const distanceKm = calculateDistance(
    input.pickup.lat,
    input.pickup.lng,
    input.dropoff.lat,
    input.dropoff.lng
  );

  if (distanceKm < 0.5) {
    throw new BusinessLogicError('Minimum trip distance is 0.5 km');
  }

  if (distanceKm > 100) {
    throw new BusinessLogicError('Maximum trip distance is 100 km. Please contact support for longer trips.');
  }

  const durationMinutes = estimateDuration(distanceKm);

  // Calculate fare components
  const baseFare = Number(vehicleType.baseFare);
  const distanceFare = distanceKm * Number(vehicleType.perKmRate);
  const timeFare = durationMinutes * Number(vehicleType.perMinuteRate);

  // Check surge pricing
  const requestTime = input.requestTime || new Date();
  const surgeMultiplier = await getSurgeMultiplier(requestTime);

  // Calculate total
  const subtotal = baseFare + distanceFare + timeFare;
  const estimatedFare = Math.round(subtotal * surgeMultiplier);

  const result: FareCalculationResult = {
    distanceKm,
    durationMinutes,
    baseFare,
    distanceFare: Math.round(distanceFare),
    timeFare: Math.round(timeFare),
    surgeMultiplier,
    estimatedFare,
    breakdown: {
      base: baseFare,
      distance: Math.round(distanceFare),
      time: Math.round(timeFare),
      surge: estimatedFare - subtotal,
    },
  };

  logger.info('Fare calculated', {
    vehicleType: vehicleType.name,
    distance: distanceKm,
    fare: estimatedFare,
  });

  return result;
}

/**
 * Generate unique booking reference ID
 * Format: BK-YYYYMMDD-XXXX (e.g., BK-20240322-A1B2)
 */
export function generateReferenceId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${dateStr}-${random}`;
}
