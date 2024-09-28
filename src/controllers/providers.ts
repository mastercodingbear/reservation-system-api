import { Request, Response } from "express";

import pool from "../config/db";

// Add availability for a provider
export const addAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { available_date, start_time, end_time } = req.body;
  const providerId = req.params.id;

  if (!available_date || !start_time || !end_time) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }

  try {
    await pool.query(
      `INSERT INTO availabilities (provider_id, available_date, start_time, end_time)
       VALUES ($1, $2, $3, $4)`,
      [providerId, available_date, start_time, end_time]
    );
    res.status(201).json({ message: "Availability added." });
  } catch (err) {
    console.error("Error creating provider:", err);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};
