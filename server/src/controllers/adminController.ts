import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  }),
});

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard
 */
export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get total bookings
    const totalBookings = await prisma.booking.count();

    // Get bookings by status
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get total revenue (sum of final fares for confirmed/completed bookings)
    const revenueData = await prisma.booking.aggregate({
      where: {
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
      },
      _sum: {
        finalFare: true,
      },
    });

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        vehicleType: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get active users count
    const activeUsers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
      },
    });

    // Get vehicle type usage
    const vehicleUsage = await prisma.booking.groupBy({
      by: ['vehicleTypeId'],
      _count: true,
      orderBy: {
        _count: {
          vehicleTypeId: 'desc',
        },
      },
    });

    const vehicleUsageWithNames = await Promise.all(
      vehicleUsage.map(async (usage) => {
        const vehicle = await prisma.vehicleType.findUnique({
          where: { id: usage.vehicleTypeId },
          select: { name: true },
        });
        return {
          vehicleType: vehicle?.name || 'Unknown',
          count: usage._count,
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalBookings,
        bookingsByStatus: bookingsByStatus.map((item) => ({
          status: item.status,
          count: item._count,
        })),
        totalRevenue: Number(revenueData._sum.finalFare) || 0,
        activeUsers,
        recentBookings,
        vehicleUsage: vehicleUsageWithNames,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings with filters
 * GET /api/admin/bookings
 */
export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
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
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update booking status
 * PATCH /api/admin/bookings/:id/status
 */
export const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundError('Booking');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        vehicleType: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users
 * GET /api/admin/users
 */
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (role && typeof role === 'string') {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              bookings: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
