import { Router } from "express";
import { addAvailability } from "../controllers/providers";
import { getAvailableSlots } from "../controllers/availabilities";
import {
  createReservation,
  confirmReservation,
} from "../controllers/reservations";

const router = Router();

// Provider availability routes
router.post("/providers/:id/availability", addAvailability);

// Availability slots routes
router.get("/available-slots", getAvailableSlots);

// Reservation routes
router.post("/reservations", createReservation);
router.post("/reservations/:id/confirm", confirmReservation);

export default router;
