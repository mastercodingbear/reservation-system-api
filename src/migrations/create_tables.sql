-- Providers table
CREATE TABLE providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Clients table
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL
);

-- Availabilities table
CREATE TABLE availabilities (
  id SERIAL PRIMARY KEY,
  provider_id INT REFERENCES providers(id),
  available_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
);

-- Reservations table
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  provider_id INT REFERENCES providers(id),
  client_id INT REFERENCES clients(id),
  reservation_date DATE NOT NULL,
  time_slot TIME NOT NULL,
  is_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);
