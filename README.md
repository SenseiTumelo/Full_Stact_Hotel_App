# Hotel Booking App

A full-stack hotel booking application. Guests browse accommodation, book rooms and pay online. Admins manage hotels, rooms, photos and reservations.

- **Frontend:** React, TypeScript, Redux Toolkit, React Router, Vite
- **Backend:** Node.js, Express, TypeScript, REST API
- **Database:** PostgreSQL (hosted on Neon in production)
- **Payments:** Stripe (test mode)
- **Authentication:** Google OAuth with a JWT stored in an `httpOnly` cookie
- **Hosting:** Vercel (frontend and API), Vercel Blob (photos), Neon (database)

> Design reference: the Figma file for the Sensei Hotels & Stay. 

---

## Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Project structure](#project-structure)
4. [Getting started](#getting-started)
5. [Environment variables](#environment-variables)
6. [Running the app](#running-the-app)
7. [Making yourself an admin](#making-yourself-an-admin)
8. [API reference](#api-reference)
9. [Database](#database)
10. [How the important parts work](#how-the-important-parts-work)
11. [Security](#security)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)
14. [Roadmap](#roadmap)
15. [Conventions](#conventions)

---

## Features

### Implemented

**Guests**
- Sign in and register with Google (OAuth)
- Browse hotels, with search by city and filters for minimum star rating and maximum price
- Hotel details: photo gallery, facilities, policies, rooms and prices, guest reviews
- Booking flow in four steps: dates and room, guest details, payment, confirmation
- Live availability, calculated per night so overlapping stays are handled correctly
- Pay online by card (Stripe) or choose to pay at the hotel
- My trips: upcoming, past and cancelled bookings, with cancel for unpaid bookings
- Reviews and ratings after check-out (one review per stay, 1 to 5 stars)

**Admins**
- Hotels: create, edit and delete; manage facilities
- Photos: upload and delete (stored in Vercel Blob)
- Room types: capacity, price per night and number of rooms
- Reservations: search and filter, view guest and room details
- Approve, modify and cancel reservations; paid bookings are refunded automatically through Stripe
- Remove reviews (moderation)
desktop)


## Live Demo
https://full-stact-hotel-app.vercel.app/
## Architecture

```
React (browser)  ->  Express API (Node.ts)  ->  PostgreSQL (Neon)
                          |-> Stripe (payments, refunds, webhooks)
                          |-> Vercel Blob (photos)
                          |-> Google (sign in)
```

The backend is layered, and each layer has one job:

```
route  ->  controller  ->  repository  ->  database
(URL)      (request and     (SQL only)
            response)
```

In production the React app forwards `/api/*` requests to the API project (a Vercel rewrite), so the browser only ever talks to one address. This keeps the login cookie first-party.

---

## Project structure

```
Full_Stack_Hotel_App/
├── package.json              # root scripts (run client and server together)
├── client/                   # React app
│   ├── vercel.json           # API proxy, SPA routing, security headers
│   └── src/
│       ├── components/
│       │   ├── ui/           # Button, Text, StarRating, ...
│       │   ├── layout/       # Navbar, Hero, Breadcrumbs, Layout, ProtectedRoute
│       │   ├── hotel/        # HotelCard, SearchBar, ImageGallery, RoomCard
│       │   ├── booking/      # StepIndicator, SummaryCard, CheckoutForm, BookingCard
│       │   ├── review/       # ReviewSection, ReviewList
│       │   └── admin/        # AdminLayout, HotelForm, PhotoManager, RoomManager
│       ├── pages/            # Home, HotelDetailsPage, Booking*, MyTrips, Admin*
│       ├── store/            # Redux store and slices
│       ├── services/         # API calls (axios)
│       ├── types/ utils/ lib/ config.ts
└── server/                   # Express API
    ├── db/
    │   ├── schema.sql
    │   └── migrations/
    └── src/
        ├── app.ts            # app setup, middleware, routes
        ├── server.ts         # starts the HTTP server
        ├── config/           # env, database pool, passport, stripe
        ├── routes/
        ├── controllers/
        ├── repositories/
        ├── middleware/       # auth, upload, rate limiting
        ├── schemas/          # zod validation
        └── utils/
```

---

## Getting started

### Prerequisites

- Node.js 20 or newer and npm
- PostgreSQL 14 or newer (local, or a free Neon database)
- A Google Cloud project with an OAuth client
- A Stripe account in test mode and the Stripe CLI
- A Vercel Blob store (for photo uploads)

### 1. Install

```bash
git clone https://github.com/SenseiTumelo/Full_Stact_Hotel_App.git
cd Full_Stack_Hotel_App

npm install                    # root (concurrently)
npm --prefix server install
npm --prefix client install
```

Or run `npm run install:all`.

### 2. Create the database

```bash
psql -U postgres -c "CREATE DATABASE hotel_app;"
psql -U postgres -d hotel_app -f server/db/schema.sql
```

Then apply each file in `server/db/migrations/` in order (skip any whose changes are already in `schema.sql`):

```bash
psql -U postgres -d hotel_app -f server/db/migrations/002_booking_details.sql
psql -U postgres -d hotel_app -f server/db/migrations/003_payments_index.sql
psql -U postgres -d hotel_app -f server/db/migrations/004_reviews_index.sql
```

Add the facilities list:

```sql
INSERT INTO amenities (name) VALUES
  ('Free Wi-Fi'), ('Breakfast available'), ('Secure parking'), ('24-hour reception')
ON CONFLICT DO NOTHING;
```

### 3. Google OAuth credentials

1. In the Google Cloud Console, create a project and configure the OAuth consent screen (External). Add your own Gmail address as a **test user**.
2. Create an **OAuth client ID** (Web application) with this authorized redirect URI:
   `http://localhost:5001/api/v1/auth/google/callback`
3. Copy the client ID and secret into `server/.env`.

### 4. Stripe

1. Copy your test **publishable** and **secret** keys from the Stripe dashboard.
2. Install the Stripe CLI, run `stripe login`, then forward webhooks to your machine:
   ```bash
   stripe listen --forward-to localhost:5000/api/v1/payments/webhook
   ```
3. Copy the `whsec_...` signing secret it prints into `server/.env`.

---

## Environment variables

Create `server/.env` and `client/.env`. **Never commit these files.**

### `server/.env`

| Variable | Description |
|---|---|
| `PORT` | API port. Default `5000` |
| `DATABASE_URL` | PostgreSQL connection string. In production use the Neon **pooled** string |
| `CLIENT_URL` | Address of the React app, for example `http://localhost:5173` (no trailing slash) |
| `JWT_SECRET` | Random string of at least 32 characters (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `http://localhost:5000/api/v1/auth/google/callback` locally |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token, used to store hotel photos |

The server refuses to start if a required variable is missing, or if `JWT_SECRET` is shorter than 32 characters.

### `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | `http://localhost:5000/api/v1` locally, `/api/v1` in production |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |

Vite only reads `.env` when it starts, so restart the client after changing it.

---

## Running the app

From the project root:

```bash
npm run dev
```

This starts the API (`http://localhost:5000`) and the React app (`http://localhost:5173`) together. Keep `stripe listen` running in a separate terminal when testing payments.

| Script | What it does |
|---|---|
| `npm run dev` | Run client and server together |
| `npm run dev:server` | Run only the API |
| `npm run dev:client` | Run only the React app |
| `npm run install:all` | Install packages in all three folders |
| `npm --prefix client run build` | Type-check and build the client |

---

## Making yourself an admin

Sign in once with Google, then run:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

Sign out and back in. An **Admin** link appears in the navigation bar. Enable 2-step verification on every Google account that has the admin role.

---

## API reference

Base URL: `/api/v1`. Errors are returned as `{ "message": "..." }` with a matching status code (400 invalid input, 401 not signed in, 403 not allowed, 404 not found, 409 conflict, 429 too many requests).

### Public

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/hotels` | List hotels. Query: `city`, `minStars`, `maxPrice` |
| GET | `/hotels/:id` | Hotel details with photos, facilities and room types |
| GET | `/hotels/:id/availability` | Rooms left. Query: `checkIn`, `checkOut` (`YYYY-MM-DD`) |
| GET | `/hotels/:id/reviews` | Average rating and latest reviews |
| GET | `/amenities` | List of facilities |

### Authentication

| Method | Path | Description |
|---|---|---|
| GET | `/auth/google` | Start Google sign in |
| GET | `/auth/google/callback` | Google redirects back here |
| GET | `/auth/me` | Current user (needs sign in) |
| POST | `/auth/logout` | Sign out |

### Signed-in guests

| Method | Path | Description |
|---|---|---|
| POST | `/bookings` | Create a booking |
| GET | `/bookings/me` | My bookings |
| PATCH | `/bookings/:id/cancel` | Cancel my unpaid booking |
| POST | `/payments/intent` | Create a Stripe payment for a booking |
| POST | `/reviews` | Review a finished stay |

### Stripe

| Method | Path | Description |
|---|---|---|
| POST | `/payments/webhook` | Called by Stripe. Verified by signature |

### Admin only

| Method | Path | Description |
|---|---|---|
| POST | `/admin/hotels` | Create a hotel |
| PATCH / DELETE | `/admin/hotels/:id` | Update or delete a hotel |
| POST | `/hotels/:id/images` | Upload a photo (one file per request, up to 4 MB) |
| DELETE | `/admin/hotels/:id/images/:imageId` | Delete a photo |
| POST | `/admin/hotels/:id/room-types` | Add a room type |
| PATCH / DELETE | `/admin/room-types/:id` | Update or delete a room type |
| GET | `/admin/bookings` | List reservations. Query: `status`, `q`, `page` |
| GET / PATCH | `/admin/bookings/:id` | View or modify a reservation |
| POST | `/admin/bookings/:id/approve` | Approve a pending reservation |
| POST | `/admin/bookings/:id/cancel` | Cancel (refunds paid bookings in full) |
| DELETE | `/admin/reviews/:id` | Remove a review |

### Frontend routes

`/`, `/hotels/:id`, `/hotels/:id/book`, `/booking/details`, `/booking/payment`, `/booking/confirmed`, `/my-trips`, `/my-trips/:id/review`, `/login`, `/register`, `/admin/hotels`, `/admin/hotels/new`, `/admin/hotels/:id`, `/admin/reservations`, `/admin/reservations/:id`

---

## Database

Main tables: `users`, `oauth_accounts`, `hotels`, `hotel_images`, `amenities`, `hotel_amenities`, `room_types`, `bookings`, `payments`, `reviews`, `favourites`, `notifications`.

Design choices:
- Normalised: related data lives in its own table and is linked by foreign keys (a hotel has many room types, and a booking belongs to a room type), so nothing is stored twice.
- A booking stores a **snapshot** of its total price, so later price changes never alter existing bookings.
- Dates use `DATE` columns, and are returned as plain `YYYY-MM-DD` text to avoid time zone shifts.
- Money is `NUMERIC(10,2)` and calculated in whole cents in code.
- Users can be soft-deleted (`deleted_at`), which prepares for data deletion requests.
- Indexes cover hotel search, date lookups, payments per booking and newest reviews.

---

## How the important parts work

**Availability.** The room stock minus the busiest night of the requested stay. Counting per night means two bookings that never overlap each other don't block a third guest.

**Preventing double bookings.** Creating a booking runs in a transaction that locks the room type row (`SELECT ... FOR UPDATE`). Two guests booking the last room at the same moment queue up, and the second sees "not enough rooms".

**Prices.** The server calculates every total from the room's price in the database. Prices sent by the browser are never trusted.

**Payments.** The browser asks the API for a Stripe PaymentIntent. The card form is Stripe's own (card numbers never reach this server). Stripe then calls the webhook, and the signature is verified before a payment is marked as paid. Webhook handling is safe to repeat. If a guest cancels while paying, the webhook refunds automatically.

**Cancellations and refunds.** Guests cancel unpaid bookings themselves. Admins cancel any pending or approved booking, and a paid booking is refunded in full first, so a failed refund never leaves a cancelled booking with the money kept.

**Reviews.** Only the guest who booked, only for confirmed stays, and only from the check-out date. The permission check lives inside the `INSERT` statement, and each booking can be reviewed once. Reviewers appear as first name and last initial.

---

## Security

- Google OAuth with a random `state` value checked on return
- Login token in an `httpOnly`, `secure` (in production), `sameSite=lax` cookie, and the user is re-read from the database on every request, so role changes take effect immediately
- Role checks (`requireAuth`, `requireRole`) on the server for every protected route. Hiding pages in React is only convenience
- Input validation with Zod on every write endpoint, and parameterised SQL everywhere (user input never becomes SQL text)
- `helmet` security headers, CORS restricted to the app's own address, and a 100 KB limit on JSON bodies
- Rate limits on login and on every route that changes data (a general limit applies to everything else)
- Uploads: type and size limits, and the file's real content is checked, not what the browser claims
- Secrets only in environment variables, and the server stops at startup if they are missing or weak
- Security headers and a content security policy on the React app (`client/vercel.json`)

Known limits: rate-limit counters live in each serverless instance, so for strict limits add Vercel Firewall rules or a shared store such as Redis. There is no audit log of admin actions yet.

---

## Deployment

The app deploys as two Vercel projects from the same repository, with Neon as the database.

1. **Database (Neon).** Create a project and copy the **direct** connection string (for migrations) and the **pooled** one (for the app). Load the schema with `pg_dump --schema-only` from your local database, then `psql` against the direct string.
2. **Photos (Vercel Blob).** Create a Blob store and connect it to the API project.
3. **API project.** Root directory `server`. Add all variables from the [server table](#serverenv) (with the Neon pooled string for `DATABASE_URL`). Check `https://<api>.vercel.app/api/v1/health`.
4. **Client project.** Root directory `client`. Set `VITE_API_URL=/api/v1` and the Stripe publishable key. In `client/vercel.json`, set the first rewrite's destination to your API address.
5. **Connect the services.**
   - Set `CLIENT_URL` and `GOOGLE_CALLBACK_URL` (`https://<client>/api/v1/auth/google/callback`) on the API project, add that callback to Google's authorized redirect URIs, then redeploy the API.
   - In Stripe, add a webhook endpoint `https://<api>.vercel.app/api/v1/payments/webhook` for `payment_intent.succeeded` and `payment_intent.payment_failed`, and put its signing secret in `STRIPE_WEBHOOK_SECRET`.
6. **Admin.** Sign in once, then promote your account with the SQL in [Making yourself an admin](#making-yourself-an-admin) against the production database.

Before deploying, run `npm --prefix client run build` and `npm --prefix server exec tsc -- --noEmit`, because TypeScript errors fail a Vercel build.

Notes: Vercel functions accept request bodies up to 4.5 MB, so photos upload one at a time. Environment variable changes only apply to new deployments. Use Stripe **test** keys until a full security and policy review is done. Vercel's free Hobby plan is for non-commercial use.

---

## Troubleshooting

| Problem | Likely cause |
|---|---|
| `Cannot GET /api//auth/google` | `VITE_API_URL` is wrong. It must end in `/api/v1` with no trailing slash. Restart the client after editing |
| Hotels don't load | The API isn't running or the URL is wrong. Open `/api/v1/health` directly |
| Signed in, then signed out again | Cookie not kept. Use `localhost` consistently, and check `CLIENT_URL` matches the address in the browser |
| `redirect_uri_mismatch` | The callback in Google Console must match `GOOGLE_CALLBACK_URL` exactly |
| Paid but still unpaid | The webhook didn't arrive. Is `stripe listen` running, and does `STRIPE_WEBHOOK_SECRET` match its secret? |
| Webhook returns 400 | Wrong signing secret, or `express.raw` isn't registered before `express.json()` |
| Admin page redirects home | Your account isn't an admin yet |
| Upload fails with 400 or 413 | Not a real JPG, PNG or WEBP, or larger than 4 MB |
| `Missing environment variable` at startup | Add it to `server/.env` (or the Vercel project settings, then redeploy) |
| Dates show one day early | `types.setTypeParser(1082, ...)` is missing in `server/src/config/db.ts` |
| Build fails on Vercel | Run the two build commands from [Deployment](#deployment) locally and fix the errors |

---

## Roadmap

1. Favourites and share button on hotel cards and the hotel page
2. Hotel map (Leaflet and OpenStreetMap)
3. User profile: edit details, my bookings, favourite hotels, and returning to the page you were on after sign in
4. Notifications: in-app bell and email for booking received, approved, cancelled and refunded
5. Compliance: privacy policy, terms, consent notice, delete my account and download my data (POPIA)
6. Automated tests for bookings, payments and permissions
7. Performance and responsive polish: mobile menu, paginated hotel list, caching
8. Optional: email and password sign up, partial refunds and cancellation policies, audit log, two-month calendar picker

---

## Conventions

Commit messages follow Conventional Commits:

```
feat(api): add GET /api/v1/hotels/:id endpoint
fix(client): keep selected hotel visible while refreshing it
refactor(server): store hotel photos in Vercel Blob
style(client): add booking flow styles
chore: install concurrently
docs: add project README
```

Never commit `.env` files, database dumps or secret keys.

---

## License

Add your license here (for example MIT), plus the author and course or project details.
