import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { calculateFare, generateReferenceId } from '../services/fareCalculator';
import { NotFoundError, BusinessLogicError } from '../utils/errors';
import { logger } from '../utils/logger';

// Validation schemas
const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().min(1),
});

export const estimateFareSchema = z.object({
  body: z.object({
    pickup: locationSchema,
    dropoff: locationSchema,
    vehicleTypeId: z.string().uuid(),
  }),
});

export const createBookingSchema = z.object({
  body: z.object({
    pickup: locationSchema,
    dropoff: locationSchema,
    vehicleTypeId: z.string().uuid(),
    notes: z.string().optional(),
  }),
});

/**
 * Get fare estimate
 * POST /api/bookings/estimate
 */
export const estimateFare = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { pickup, dropoff, vehicleTypeId } = req.body;

    const fareEstimate = await calculateFare({
      pickup,
      dropoff,
      vehicleTypeId,
    });

    res.json({
      success: true,
      data: fareEstimate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new booking
 * POST /api/bookings
 */
export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new BusinessLogicError('User not authenticated');
    }

    const { pickup, dropoff, vehicleTypeId, notes } = req.body;

    // Calculate fare
    const fareCalculation = await calculateFare({
      pickup,
      dropoff,
      vehicleTypeId,
    });

    // Generate unique reference ID
    const referenceId = generateReferenceId();

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        referenceId,
        userId: req.user.userId,
        vehicleTypeId,
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        distanceKm: fareCalculation.distanceKm,
        durationMinutes: fareCalculation.durationMinutes,
        estimatedFare: fareCalculation.estimatedFare,
        finalFare: fareCalculation.estimatedFare,
        status: 'CONFIRMED',
        notes,
      },
      include: {
        vehicleType: {
          select: {
            name: true,
            capacity: true,
            imageUrl: true,
          },
        },
      },
    });

    logger.info(`Booking created: ${booking.referenceId}`, {
      userId: req.user.userId,
      fare: fareCalculation.estimatedFare,
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's bookings
 * GET /api/bookings
 */
export const getUserBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new BusinessLogicError('User not authenticated');
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        vehicleType: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking by ID
 * GET /api/bookings/:id
 */
export const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new BusinessLogicError('User not authenticated');
    }

    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        vehicleType: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking');
    }

    // Check authorization (users can only see their own bookings, admins can see all)
    if (req.user.role !== 'ADMIN' && booking.userId !== req.user.userId) {
      throw new BusinessLogicError('Unauthorized to view this booking');
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel booking
 * PATCH /api/bookings/:id/cancel
 */
export const cancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new BusinessLogicError('User not authenticated');
    }

    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundError('Booking');
    }

    // Check authorization
    if (booking.userId !== req.user.userId) {
      throw new BusinessLogicError('Unauthorized to cancel this booking');
    }

    // Check if already cancelled or completed
    if (booking.status === 'CANCELLED') {
      throw new BusinessLogicError('Booking is already cancelled');
    }

    if (booking.status === 'COMPLETED') {
      throw new BusinessLogicError('Cannot cancel completed booking');
    }

    // Update status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    logger.info(`Booking cancelled: ${booking.referenceId}`);

    res.json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};
