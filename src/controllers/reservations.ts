import { Request, Response } from "express";
import pool from "../config/db";
import moment from "moment";

// Create a reservation
export const createReservation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { provider_id, client_id, reservation_date, time_slot } = req.body;

  if (!provider_id || !client_id || !reservation_date || !time_slot) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }

  try {
    const now = moment();
    const reservationTime = moment(`${reservation_date} ${time_slot}`);

    if (reservationTime.diff(now, "hours") < 24) {
      res
        .status(400)
        .json({ message: "Reservations must be made 24 hours in advance." });
      return;
    }

    const expiresAt = now.add(30, "minutes").toDate();

    const existingQuery = `SELECT * FROM reservations WHERE provider_id = $1 AND reservation_date = $2 AND time_slot = $3 AND (is_confirmed = TRUE OR expires_at > NOW())`;
    const existingReservation = await pool.query(existingQuery, [
      provider_id,
      reservation_date,
      time_slot,
    ]);

    if (existingReservation.rows.length > 0) {
      res.status(400).json({
        message: "Time slot already reserved or pending confirmation.",
      });
      return;
    }

    const insertQuery = `
      INSERT INTO reservations (provider_id, client_id, reservation_date, time_slot, expires_at)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(insertQuery, [
      provider_id,
      client_id,
      reservation_date,
      time_slot,
      expiresAt,
    ]);

    res.status(201).json({ message: "Reservation created successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Confirm reservation
export const confirmReservation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const reservationId = req.params.id;

  try {
    const query = `
      UPDATE reservations SET is_confirmed = TRUE WHERE id = $1 AND expires_at > NOW()
    `;
    const result = await pool.query(query, [reservationId]);

    if (result.rowCount === 0) {
      res.status(400).json({ message: "Reservation not found or expired." });
      return;
    }

    res.status(200).json({ message: "Reservation confirmed." });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
