# Lost & Found Management System - Complete Implementation

## Project Overview

A full-stack web application for managing lost and found items in universities and colleges. The system enables students to report lost/found items, search for matches using keywords and passkeys, and allows administrators to manage claims and track item retrievals.

## Technology Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: MongoDB with PyMongo
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Werkzeug + bcrypt
- **CORS**: flask-cors for frontend integration

### Frontend
- **Framework**: React 19 with Vite
- **UI Library**: Material-UI (MUI)
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Form Management**: Formik + Yup

## Core Features Implemented

### 1. Authentication & Authorization
- User registration and login with JWT tokens
- Role-based access control (student/admin)
- Token-based API authentication
- Admin-only endpoints with `@admin_required` decorator

### 2. Lost Items Management
- Report lost items with details (title, description, category, location, date)
- Auto-generated unique passkey for each lost item
- View all your reported lost items
- Get potential matches for your lost items

### 3. Found Items Management
- Report found items with optional passkey
- Auto-claim creation when passkey matches a lost item
- Search found items by keywords

### 4. Intelligent Matching System
- **Passkey Matching**: Exact match between lost and found items
- **Keyword Search**: MongoDB text search with weighted fields
  - Title (weight: 10)
  - Description (weight: 5)
  - Category (weight: 3)
  - Location (weight: 2)
- **Match Suggestions**: Combines passkey + keyword search for each lost item

### 5. Claims Management
- Automatic claim creation on passkey match
- Manual claim creation from suggested matches
- Claim statuses: pending, approved, rejected, verified, retrieved

### 6. Admin Features
- View all claims across the system
- Approve or reject claims
- Record item retrievals with notes
- View complete retrieval history
- Track who retrieved items and when

### 7. Search Functionality
- Full-text search across found items
- Full-text search across lost items
- Optional filters: category, location, limit
- Relevance-ranked results

## Database Schema

### Collections

#### students
```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  password: String (hashed),
  role: String ("student" | "admin"),
  created_at: DateTime
}
```

#### lost_items
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  location: String,
  date_lost: DateTime,
  student_id: ObjectId (ref: students),
  passkey: String (unique, indexed),
  status: String ("pending", "claimed", etc.),
  created_at: DateTime
}
```

#### found_items
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  location: String,
  finder_id: ObjectId (ref: students),
  passkey: String (indexed),
  status: String ("unclaimed", "claimed", etc.),
  created_at: DateTime
}
```

#### claims
```javascript
{
  _id: ObjectId,
  lost_item_id: ObjectId (ref: lost_items),
  found_item_id: ObjectId (ref: found_items),
  student_id: ObjectId (ref: students),
  status: String ("pending", "approved", "rejected", "retrieved"),
  created_at: DateTime,
  updated_at: DateTime
}
```

#### retrievals
```javascript
{
  _id: ObjectId,
  claim_id: ObjectId (ref: claims),
  retrieved_by: ObjectId (ref: students, admin),
  notes: String,
  retrieved_at: DateTime
}
```

### Indexes

- `students.email` - Unique index
- `lost_items.passkey` - Index for fast lookup
- `lost_items` - Text index on title, description, category, location (weighted)
- `found_items.passkey` - Index for fast lookup
- `found_items` - Text index on title, description, category, location (weighted)
- `claims.lost_item_id`, `claims.found_item_id`, `claims.student_id` - Indexes
- `retrievals.claim_id` - Index

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Lost Items
- `POST /api/lost-items` - Report a lost item (requires auth)
- `GET /api/lost-items` - Get current user's lost items (requires auth)
- `GET /api/lost-items/search?q=<query>` - Search lost items
- `GET /api/lost-items/<id>/matches` - Get potential matches (requires auth)

### Found Items
- `POST /api/found-items` - Report a found item (requires auth)
- `GET /api/found-items/search?q=<query>` - Search found items

### Claims
- `POST /api/claims` - Create a claim manually (requires auth)
- `POST /api/claims/<id>/verify` - Verify a claim (requires auth)

### Admin (requires admin role)
- `GET /api/admin/claims` - Get all claims
- `POST /api/admin/claims/<id>/approve` - Approve a claim
- `POST /api/admin/claims/<id>/reject` - Reject a claim
- `POST /api/admin/retrievals` - Record item retrieval
- `GET /api/admin/retrievals` - Get retrieval history

### Health
- `GET /api/health` - Health check
- `GET /healthz` - Health check (root)

## Frontend Routes

- `/` - Redirects to `/lost`
- `/login` - Login/Register page
- `/lost` - Report lost items & view matches
- `/found` - Report found items
- `/search` - Search found items
- `/admin` - Admin dashboard

## Key Workflows

### 1. Report Lost Item
1. Student fills out lost item form
2. Backend generates unique passkey
3. Item stored in `lost_items` collection
4. Passkey returned to student

### 2. Report Found Item with Passkey Match
1. Student reports found item with passkey
2. Backend checks if passkey exists in `lost_items`
3. If match found, auto-create claim
4. Notify lost item owner (future: email/push notification)

### 3. Search and Claim
1. Student searches found items by keywords
2. Results ranked by relevance
3. Student can view details and create claim manually

### 4. View Potential Matches
1. Student views their lost item
2. Click "View Potential Matches"
3. System shows:
   - Exact passkey matches (if any)
   - Keyword-based suggestions
4. Student can create claim from any match

### 5. Admin Claim Review
1. Admin views all claims in dashboard
2. Reviews claim details
3. Approves or rejects claim
4. If approved, can record retrieval when student collects item

## Setup Instructions

### Backend Setup

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Set environment variables (PowerShell)
$env:MONGODB_URI = "mongodb://localhost:27017/lostfound"
$env:SECRET_KEY = "your-secret-key-here"
$env:FLASK_DEBUG = "1"

# Run the server
python -m backend.app
```

### Frontend Setup

```bash
# Install dependencies
cd frontend/myapp
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Run dev server
npm run dev
```

### MongoDB Setup

- Install MongoDB Community Edition or use MongoDB Atlas
- Default local URI: `mongodb://localhost:27017/lostfound`
- Indexes are created automatically on app startup

## Security Features

- Password hashing with Werkzeug + bcrypt
- JWT token expiration (24 hours)
- Role-based access control
- CORS protection
- Token validation on every protected route
- Admin endpoints require admin role verification

## Production Deployment

### Backend
1. Set production environment variables
2. Use a production WSGI server (e.g., Gunicorn)
3. Set `FLASK_DEBUG=0`
4. Use strong `SECRET_KEY`
5. Configure MongoDB Atlas or production MongoDB instance

### Frontend
1. Build the React app: `npm run build`
2. Flask will serve the built files from `frontend/myapp/dist/`
3. Or deploy to a CDN/static hosting

## Future Enhancements

- [ ] Real-time notifications (WebSocket/SSE)
- [ ] Image upload for items
- [ ] Email notifications
- [ ] SMS notifications
- [ ] QR code generation for passkeys
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Export reports (CSV/PDF)
- [ ] Multi-language support
- [ ] Fuzzy matching for typos
- [ ] Location-based filtering with maps
- [ ] Item categories with icons
- [ ] User ratings and feedback

## File Structure

```
microproject/
├── backend/
│   ├── __init__.py           # Flask app factory
│   ├── app.py                # Entry point
│   ├── requirements.txt      # Python dependencies
│   ├── README.md             # Backend documentation
│   ├── models/
│   │   └── models.py         # MongoDB models & indexes
│   ├── routes/
│   │   ├── __init__.py
│   │   └── api.py            # API endpoints
│   └── utils/
│       └── auth.py           # Auth decorators & helpers
├── frontend/
│   ├── FRONTEND_GUIDE.md     # Frontend documentation
│   └── myapp/
│       ├── package.json
│       ├── vite.config.js
│       ├── index.html
│       └── src/
│           ├── App.jsx       # Main app with routing
│           ├── main.jsx
│           ├── components/   # React components
│           └── services/
│               └── api.js    # API service layer
└── PROJECT_SUMMARY.md        # This file
```

## Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Report lost item and receive passkey
- [ ] Report found item without passkey
- [ ] Report found item with matching passkey (auto-claim)
- [ ] Search found items by keywords
- [ ] View potential matches for lost item
- [ ] Create claim from suggested match
- [ ] Admin: view all claims
- [ ] Admin: approve/reject claims
- [ ] Admin: record retrieval
- [ ] Admin: view retrieval history

### API Testing with curl

See `backend/README.md` for detailed curl examples for each endpoint.

## Contributors

- Backend: Flask + MongoDB implementation
- Frontend: React + Material-UI implementation
- Database: MongoDB schema design and indexing
- Documentation: Comprehensive guides and API docs

## License

[Specify your license here]

## Support

For issues or questions:
- Check the documentation in `backend/README.md` and `frontend/FRONTEND_GUIDE.md`
- Review the API endpoints and examples
- Ensure MongoDB is running and accessible
- Verify environment variables are set correctly
