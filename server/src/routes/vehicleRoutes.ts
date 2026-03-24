import { Router } from 'express';
import {
  getAllVehicleTypes,
  getVehicleTypeById,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
  createVehicleTypeSchema,
  updateVehicleTypeSchema,
} from '../controllers/vehicleController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth to show all vehicles to admins)
router.get('/', optionalAuth, getAllVehicleTypes);
router.get('/:id', getVehicleTypeById);

// Admin only routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createVehicleTypeSchema),
  createVehicleType
);
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateVehicleTypeSchema),
  updateVehicleType
);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteVehicleType);

export default router;
