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

## Example endpoints

- `GET /api/health` -> `{ "status": "ok" }`
- `GET /api/hello?name=Alice` -> `{ "message": "Hello, Alice!" }`
- `POST /api/echo` with JSON body -> `{ "received": { ... } }`
