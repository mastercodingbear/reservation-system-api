import pool from "../config/db";

const seedData = async () => {
  const providers = [
    { name: "Dr. Alice" },
    { name: "Dr. Bob" },
  ];

  const clients = [
    { name: "John Doe", email: "john@henrymeds.com" },
    { name: "Jane Doe", email: "jane@henrymeds.com" },
  ];

  try {
    for (const provider of providers) {
      await pool.query("INSERT INTO providers (name) VALUES ($1)", [
        provider.name,
      ]);
    }

    for (const client of clients) {
      await pool.query("INSERT INTO clients (name, email) VALUES ($1, $2)", [
        client.name,
        client.email,
      ]);
    }

    console.log("Data seeded successfully.");
  } catch (err) {
    console.error("Error seeding data:", err);
  } finally {
    pool.end();
  }
};

seedData();
