import request from "supertest";

import app from "../src/app";
import pool from "../src/config/db";

// Before each test, reset the database or set up some mock data
beforeEach(async () => {
  await pool.query(
    "TRUNCATE providers, clients, availabilities, reservations RESTART IDENTITY CASCADE"
  );
  await pool.query(`INSERT INTO providers (name) VALUES ('Dr. Alice')`);
  await pool.query(
    `INSERT INTO clients (name, email) VALUES ('John Doe', 'john@henrymeds.com')`
  );
});

// After all tests are done, close the database connection
afterAll(() => {
  pool.end();
});

// POST /providers/:id/availability
describe("POST /providers/:id/availability", () => {
  it("should add availability for a provider", async () => {
    const res = await request(app).post("/api/providers/1/availability").send({
      available_date: "2024-09-30",
      start_time: "08:00",
      end_time: "12:00",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual("Availability added.");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app).post("/api/providers/1/availability").send({
      available_date: "2024-09-30",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("All fields are required.");
  });
});

// GET /available-slots
describe("GET /available-slots", () => {
  beforeEach(async () => {
    // Seed availability for the provider
    await pool.query(`
      INSERT INTO availabilities (provider_id, available_date, start_time, end_time)
      VALUES (1, '2024-09-30', '08:00', '12:00')
    `);
  });

  it("should retrieve available slots for a provider on a specific date", async () => {
    const res = await request(app).get(
      "/api/available-slots?provider_id=1&date=2024-09-30"
    );
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0); // Should return slots
  });

  it("should return 400 if provider_id or date is missing", async () => {
    const res = await request(app).get("/api/available-slots");
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Provider ID and date are required.");
  });

  it("should return 404 if all slots are reserved", async () => {
    await pool.query(`
      INSERT INTO reservations (provider_id, client_id, reservation_date, time_slot, expires_at)
      VALUES (1, 1, '2024-09-30', '08:00', NOW() + INTERVAL '30 minutes')
    `);
    const res = await request(app).get(
      "/api/available-slots?provider_id=1&date=2024-09-29"
    );
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual("No available slots found.");
  });
});

// POST /reservations
describe("POST /reservations", () => {
  beforeEach(async () => {
    await pool.query(`
      INSERT INTO availabilities (provider_id, available_date, start_time, end_time)
      VALUES (1, '2024-09-30', '08:00', '12:00')
    `);
  });

  it("should create a reservation", async () => {
    const res = await request(app).post("/api/reservations").send({
      provider_id: 1,
      client_id: 1,
      reservation_date: "2024-09-30",
      time_slot: "10:00",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual("Reservation created successfully.");
  });

  it("should return 400 if the time slot is already reserved", async () => {
    await pool.query(`
      INSERT INTO reservations (provider_id, client_id, reservation_date, time_slot, expires_at)
      VALUES (1, 1, '2024-09-30', '08:00', NOW() + INTERVAL '30 minutes')
    `);

    const res = await request(app).post("/api/reservations").send({
      provider_id: 1,
      client_id: 1,
      reservation_date: "2024-09-30",
      time_slot: "08:00",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Time slot already reserved or pending confirmation.");
  });

  it("should return 400 if reservation is made less than 24 hours in advance", async () => {
    const res = await request(app).post("/api/reservations").send({
      provider_id: 1,
      client_id: 1,
      reservation_date: "2023-09-28",
      time_slot: "08:00",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual(
      "Reservations must be made 24 hours in advance."
    );
  });
});

// POST /reservations/:id/confirm
describe("POST /reservations/:id/confirm", () => {
  beforeEach(async () => {
    await pool.query(`
      INSERT INTO reservations (provider_id, client_id, reservation_date, time_slot, expires_at)
      VALUES (1, 1, '2024-09-28', '08:00', NOW() + INTERVAL '30 minutes')
    `);
  });

  it("should confirm a reservation", async () => {
    const res = await request(app).post("/api/reservations/1/confirm");
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Reservation confirmed.");
  });

  it("should return 400 if the reservation has expired", async () => {
    await pool.query(`
      UPDATE reservations SET expires_at = NOW() - INTERVAL '1 hour' WHERE id = 1
    `);
    const res = await request(app).post("/api/reservations/1/confirm");
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Reservation not found or expired.");
  });
});
