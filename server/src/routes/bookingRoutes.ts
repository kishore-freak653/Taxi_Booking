import { Router } from 'express';
import {
  estimateFare,
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  estimateFareSchema,
  createBookingSchema,
} from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public route for fare estimation
router.post('/estimate', validate(estimateFareSchema), estimateFare);

// Protected routes (require authentication)
router.use(authenticate);
router.post('/', validate(createBookingSchema), createBooking);
router.get('/', getUserBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);

export default router;
