import { Router } from "express";
import { addAvailability } from "../controllers/providers";
import { getAvailableSlots } from "../controllers/availabilities";

const router = Router();

// Provider availability routes
router.post("/providers/:id/availability", addAvailability);

// Availability slots routes
router.get("/available-slots", getAvailableSlots);

export default router;
