## Reservation System API

### Overview

This API allows **providers** to manage their availability and **clients** to book and confirm appointments. It supports 15-minute appointment slots, reservation expiration, and availability checks. The backend is built with **Node.js**, **Express**, and **PostgreSQL**, using **TypeScript** for type safety.

### API Endpoints

| HTTP Method | Endpoint | Description |
|-------------|----------|-------------|
| `POST`      | `/providers/:id/availability` | Add availability for a provider |
| `GET`       | `/available-slots?provider_id={provider_id}&date={date}` | Retrieve available appointment slots for a provider |
| `POST`      | `/reservations` | Reserve an available time slot |
| `POST`      | `/reservations/:id/confirm` | Confirm a reservation |

### Running the Project

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mastercodingbear/reservation-system-api.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Create a PostgreSQL database** and run the migration script:
   ```bash
   psql -U db_user -d db_name -f migrations/create_tables.sql
   ```
4. **Configure environment variables** in a `.env` file:
   ```
   DB_USER=db_user
   DB_PASSWORD=db_password
   DB_NAME=db_name
   DB_HOST=localhost
   DB_PORT=5432
   ```
5. **Run the application**:
   ```bash
   npm start
   ```
6. **Run tests**:
   ```bash
   npm test
   ```

### What Could Be Added with More Time

1. **Authentication**: Implement role-based authentication (e.g. JWT) to differentiate between clients and providers.
2. **Advanced Scheduling**: Add recurring availability for providers and support for buffer times between appointments.
3. **Automated Expiration**: Use a background job (Node Cron) to handle expired reservations instead of dynamic checks.
4. **Enhanced Validation**: Add stricter input validation using libraries like Joi or class-validator.
5. **Logging and Monitoring**: Introduce logging with Winston and error monitoring with Sentry.
