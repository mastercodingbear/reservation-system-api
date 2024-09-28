import { Request, Response } from "express";
import pool from "../config/db";

// Get available time slots for a provider on a specific date
export const getAvailableSlots = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { provider_id, date } = req.query;

  if (!provider_id || !date) {
    res.status(400).json({ message: "Provider ID and date are required." });
    return;
  }

  try {
    const query = `
      SELECT * FROM availabilities
      WHERE provider_id = $1 AND available_date = $2
      AND NOT EXISTS (
        SELECT 1 FROM reservations
        WHERE reservations.provider_id = availabilities.provider_id
        AND reservations.time_slot = availabilities.start_time
        AND reservations.reservation_date = availabilities.available_date
        AND reservations.is_confirmed = TRUE
      )
    `;
    const result = await pool.query(query, [provider_id, date]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: "No available slots found." });
      return;
    }

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
