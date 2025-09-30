# Flask Backend (for Vite React frontend)

This is a minimal Flask backend set up to work smoothly with a Vite React frontend.

- API mounted under `/api/*`
- CORS enabled for Vite dev server (default origin: `http://localhost:5173`)
- In production, if `frontend/dist` exists, Flask serves the static build

## Quickstart (Windows PowerShell)

1. Create and activate a virtual environment (optional but recommended):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r backend/requirements.txt
```

3. Run the server:

```powershell
python -m backend.app
```

The server will start at `http://localhost:5000` by default.

## Environment variables

- `PORT`: Port for Flask (default `5000`)
- `FLASK_DEBUG`: Set to `1` to enable debug mode (default `1`)
- `FRONTEND_ORIGIN`: Allowed origin for CORS (default `http://localhost:5173`)

PowerShell example:

```powershell
$env:FRONTEND_ORIGIN = "http://localhost:5173"
$env:FLASK_DEBUG = "1"
$env:PORT = "5000"
python -m backend.app
```

CMD example:

```cmd
set FRONTEND_ORIGIN=http://localhost:5173
set FLASK_DEBUG=1
set PORT=5000
python -m backend.app
```

## Development with Vite (recommended)

- Start Flask: `python -m backend.app`
- Start Vite in `frontend/`: `npm run dev`

Your React app (Vite) will run on `http://localhost:5173` and call the Flask API at `http://localhost:5000/api/*`.

## Production build

1. Build the React app:

```bash
# from the frontend/ directory
npm run build
```

This creates `frontend/dist`. If that directory exists, Flask will serve it at `/` and fall back to `index.html` for SPA routes.

2. Run Flask normally:

```powershell
python -m backend.app
```

## MongoDB setup

You can use a local MongoDB server or MongoDB Atlas.

- Local (Windows):
  - Install MongoDB Community Edition: https://www.mongodb.com/try/download/community
  - Start the MongoDB service from Services or run `mongod`.
  - Default URI: `mongodb://localhost:27017/lostfound`

- Atlas (cloud):
  - Create a free cluster and a database user.
  - Get your connection string and set it as `MONGODB_URI`.

### Automatic indexes

On startup, the app creates the necessary indexes:

- `students`: unique index on `email`.
- `lost_items`: index on `passkey` and a text index over `title`, `description`, `category`, `location` (weighted).
- `found_items`: index on `passkey` and a text index over `title`, `description`, `category`, `location` (weighted).
- `claims`: indexes on `lost_item_id`, `found_item_id`, `student_id`.

If an index already exists, MongoDB will re-use it.

## Authentication

Most data endpoints require a Bearer token. Obtain a token by registering or logging in.

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","name":"Alice","password":"secret"}'

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret"}'
```

Use the returned JWT as `Authorization: Bearer <token>`.

## Core flows

### Report a lost item

```bash
curl -X POST http://localhost:5000/api/lost-items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Blue Backpack",
    "description": "Blue backpack with laptop stickers",
    "category": "Bags",
    "location": "Library",
    "date_lost": "2025-09-30T10:00:00"
  }'
```

The response includes a generated `passkey` for the lost item.

### Report a found item

```bash
curl -X POST http://localhost:5000/api/found-items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Backpack",
    "description": "Blue, with laptop stickers",
    "category": "Bags",
    "location": "Library entrance"
  }'
```

If the `passkey` matches a lost item, the backend automatically creates a `Claim`.

## Search endpoints

- `GET /api/found-items/search?q=<query>&category=<optional>&location=<optional>&limit=20`
- `GET /api/lost-items/search?q=<query>&category=<optional>&location=<optional>&limit=20`

Examples:

```bash
curl "http://localhost:5000/api/found-items/search?q=blue+backpack"
curl "http://localhost:5000/api/lost-items/search?q=laptop+bag&location=Library"
```

## Match suggestions

Suggest potential found matches for a given lost item (uses passkey exact match + keyword search):

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/lost-items/<lost_id>/matches"
```

## Claims

- Verify a claim:

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/claims/<claim_id>/verify
```

- Create a claim manually from IDs:

```bash
curl -X POST http://localhost:5000/api/claims \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lost_item_id":"<lostId>","found_item_id":"<foundId>"}'
```

## Admin features

Admin users have additional endpoints for managing claims and tracking retrievals.

### Creating an admin user

When registering, you can optionally specify `role: "admin"` in the database directly, or modify the `Student.create()` call to accept a role parameter.

### Admin endpoints

- **Get all claims** (admin only):

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:5000/api/admin/claims
```

- **Approve a claim** (admin only):

```bash
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:5000/api/admin/claims/<claim_id>/approve
```

- **Reject a claim** (admin only):

```bash
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:5000/api/admin/claims/<claim_id>/reject
```

- **Record item retrieval** (admin only):

```bash
curl -X POST http://localhost:5000/api/admin/retrievals \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"claim_id":"<claimId>","notes":"Student verified ID and collected item"}'
```

- **Get retrieval history** (admin only):

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:5000/api/admin/retrievals
```

## Example endpoints

- `GET /api/health` -> `{ "status": "ok" }`
- `GET /api/hello?name=Alice` -> `{ "message": "Hello, Alice!" }`
- `POST /api/echo` with JSON body -> `{ "received": { ... } }`
