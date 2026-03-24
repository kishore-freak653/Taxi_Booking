import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export const createVehicleTypeSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    baseFare: z.number().positive(),
    perKmRate: z.number().positive(),
    perMinuteRate: z.number().positive(),
    capacity: z.number().int().positive(),
    imageUrl: z.string().url().optional(),
  }),
});

export const updateVehicleTypeSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    baseFare: z.number().positive().optional(),
    perKmRate: z.number().positive().optional(),
    perMinuteRate: z.number().positive().optional(),
    capacity: z.number().int().positive().optional(),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().optional(),
  }),
});

/**
 * Get all vehicle types (active only for customers, all for admins)
 * GET /api/vehicles
 */
export const getAllVehicleTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';

    const vehicleTypes = await prisma.vehicleType.findMany({
      where: isAdmin ? {} : { isActive: true },
      orderBy: { baseFare: 'asc' },
    });

    res.json({
      success: true,
      data: vehicleTypes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vehicle type by ID
 * GET /api/vehicles/:id
 */
export const getVehicleTypeById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const vehicleType = await prisma.vehicleType.findUnique({
      where: { id },
    });

    if (!vehicleType) {
      throw new NotFoundError('Vehicle type');
    }

    res.json({
      success: true,
      data: vehicleType,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create vehicle type (Admin only)
 * POST /api/vehicles
 */
export const createVehicleType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vehicleType = await prisma.vehicleType.create({
      data: req.body,
    });

    res.status(201).json({
      success: true,
      data: vehicleType,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update vehicle type (Admin only)
 * PATCH /api/vehicles/:id
 */
export const updateVehicleType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const vehicleType = await prisma.vehicleType.update({
      where: { id },
      data: req.body,
    });

    res.json({
      success: true,
      data: vehicleType,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete vehicle type (Admin only) - soft delete
 * DELETE /api/vehicles/:id
 */
export const deleteVehicleType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Soft delete by setting isActive to false
    const vehicleType = await prisma.vehicleType.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Vehicle type deactivated',
      data: vehicleType,
    });
  } catch (error) {
    next(error);
  }
};
