import { Router } from "express";
import { addAvailability } from "../controllers/providers";

const router = Router();

// Provider availability routes
router.post("/providers/:id/availability", addAvailability);

export default router;
