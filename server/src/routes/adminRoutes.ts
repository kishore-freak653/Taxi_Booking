import { Router } from 'express';
import {
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
  updateBookingStatusSchema,
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/status', validate(updateBookingStatusSchema), updateBookingStatus);
router.get('/users', getAllUsers);

export default router;
