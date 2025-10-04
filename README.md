# Lost & Found Management System

A full-stack web application for managing lost and found items in universities and colleges. The system enables students to report lost/found items, search for matches using keywords and passkeys, and allows administrators to manage claims and track item retrievals.

## Quick Start

Get the system running in 5 minutes!

### Prerequisites

- Python 3.8+ installed
- Node.js 18+ and npm installed
- MongoDB installed locally OR MongoDB Atlas account

### Installation & Setup

#### 1. MongoDB Setup

**Option A: Local MongoDB**

1. Download MongoDB Community Edition: https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017` by default

**Option B: MongoDB Atlas (Cloud)**

1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and database user
3. Get your connection string

#### 2. Backend Setup

```powershell
# Navigate to project root
cd c:\Users\joelj\microproject\microproject

# Create virtual environment (optional but recommended)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r backend/requirements.txt

# Set environment variables (PowerShell)
$env:MONGODB_URI = "mongodb://localhost:27017/lostfound"  # or your Atlas URI
$env:SECRET_KEY = "dev-secret-key-change-in-production"
$env:FLASK_DEBUG = "1"
$env:PORT = "5000"

# Run the backend
python -m backend.app
```

Backend will start at **http://localhost:5000**

#### 3. Frontend Setup

Open a **new terminal** window:

```powershell
# Navigate to frontend
cd c:\Users\joelj\microproject\microproject\frontend\myapp

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Run the frontend
npm run dev
```

Frontend will start at **http://localhost:5173**

#### 4. Test the Application

1. Open browser to **http://localhost:5173**
2. Click **"Sign Up"** tab and create an account
3. Start reporting lost/found items!

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

## Features

### For Students

#### 1. **Report Lost Items**

- Submit detailed item descriptions
- Receive unique passkey for each item
- View all your reported lost items
- Check potential matches automatically

#### 2. **Report Found Items**

- Report items you've found
- Enter passkey if found with the item
- Auto-matching creates claims instantly

#### 3. **Smart Matching System**

- **Passkey Matching**: Exact match between lost and found items
- **Keyword Search**: MongoDB text search with weighted fields
- **Match Suggestions**: View potential matches for your lost items

#### 4. **Search & Claim**

- Search all found items by keywords
- Create claims for items that match yours
- Track claim status (pending, approved, rejected, retrieved)

### For Administrators

#### 1. **Claims Management**

- View all claims across the system
- Approve or reject claims
- Verify ownership details

#### 2. **Retrieval Tracking**

- Record item retrievals with notes
- Track who retrieved items and when
- Complete retrieval history

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
  status: String,
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
  status: String,
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

## Creating an Admin User

To access admin features, you need to manually set a user's role to "admin" in MongoDB:

### Using MongoDB Compass (GUI)

1. Download and install MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Navigate to `lostfound` database → `students` collection
4. Find your user document
5. Edit the document and add/change: `"role": "admin"`
6. Save

### Using MongoDB Shell

```bash
mongosh
use lostfound
db.students.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Common Workflows

### Scenario 1: Student Lost Their Phone

1. Student reports lost item with details
2. Receives passkey (e.g., "aB3xY9zK")
3. Someone finds the phone and reports it with the passkey
4. System auto-creates a claim
5. Admin reviews and approves the claim
6. Student collects phone from lost & found office

### Scenario 2: Found Item Without Passkey

1. Finder reports found item (no passkey)
2. Owner searches found items by keywords
3. Owner creates claim for matching item
4. Admin verifies ownership and approves claim
5. Owner collects item

### Scenario 3: Using Potential Matches

1. Student reports lost item
2. Later checks "View Potential Matches"
3. System shows keyword-based suggestions
4. Student creates claim for matching item
5. Admin processes the claim

## Security Features

- Password hashing with Werkzeug + bcrypt
- JWT token expiration (24 hours)
- Role-based access control
- CORS protection
- Token validation on every protected route
- Admin endpoints require admin role verification

## Project Structure

```
microproject/
├── README.md                 # This file
├── test_auth.py             # Authentication testing script
├── backend/
│   ├── __init__.py          # Flask app factory
│   ├── app.py               # Entry point
│   ├── requirements.txt     # Python dependencies
│   ├── README.md            # Backend documentation
│   ├── models/
│   │   └── models.py        # MongoDB models & indexes
│   ├── routes/
│   │   ├── __init__.py
│   │   └── api.py           # API endpoints
│   └── utils/
│       └── auth.py          # Auth decorators & helpers
└── frontend/
    ├── README.md    # Frontend documentation
    └── myapp/
        ├── package.json
        ├── vite.config.js
        ├── index.html
        └── src/
            ├── App.jsx      # Main app with routing
            ├── main.jsx
            ├── components/  # React components
            └── services/
                └── api.js   # API service layer
```

## Testing

### Quick Test

1. **Create account**: Sign up at http://localhost:5173
2. **Report lost item**: Get a passkey
3. **Report found item**: Use the passkey from step 2
4. **Check auto-claim**: Should create a claim automatically
5. **Admin review**: Set your role to admin and approve the claim

### Testing Script

```powershell
# Test authentication
python test_auth.py
```

This creates a test user and verifies login functionality.

## Production Deployment

### Backend

1. Set `FLASK_DEBUG=0`
2. Use strong `SECRET_KEY`
3. Use production WSGI server (Gunicorn)
4. Use MongoDB Atlas or production MongoDB instance

### Frontend

1. Build the React app: `npm run build`
2. Flask will serve the built files from `frontend/myapp/dist/`
3. Or deploy to a CDN/static hosting

### Environment Variables

```bash
MONGODB_URI=your-production-mongodb-uri
SECRET_KEY=your-strong-secret-key
FLASK_DEBUG=0
PORT=5000
FRONTEND_ORIGIN=https://your-domain.com
```

## Troubleshooting

### Backend won't start

- Check MongoDB is running: `mongosh` (should connect)
- Check port 5000 is not in use
- Verify environment variables are set
- Check Python dependencies: `pip list`

### Frontend won't start

- Check Node.js version: `node --version` (should be 18+)
- Delete `node_modules` and run `npm install` again
- Check port 5173 is not in use
- Verify `.env` file exists with correct API URL

### Can't connect to MongoDB

- Local: Ensure MongoDB service is running
- Atlas: Check connection string includes username/password
- Check firewall settings

### Login Issues

#### Creating a proper test user:

```powershell
python test_auth.py
```

#### Manual verification:

```powershell
# Test backend health
curl http://localhost:5000/healthz

# Test login
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123"}'
```

### API calls failing

- Check backend is running at http://localhost:5000
- Check browser console for errors
- Verify JWT token in localStorage (F12 → Application → Local Storage)
- Check CORS settings in backend

### Search returns no results

- Ensure MongoDB text indexes are created (happens automatically on startup)
- Check backend logs for index creation warnings
- Try restarting the backend

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

## Manual Testing Checklist

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Specify your license here]

## Support

For issues or questions:

- Check this README for common solutions
- Review the API endpoints and examples
- Ensure MongoDB is running and accessible
- Verify environment variables are set correctly
- Check browser console and backend logs for errors

## Getting Started Tips

### For Students

**Be specific** when reporting items - more details = better matches  
 **Save your passkey** - write it down or screenshot it  
 **Check regularly** - new items are added daily  
 **Use multiple keywords** when searching

### For Admins

**Verify ownership** before approving claims  
 **Add detailed notes** when recording retrievals  
 **Check passkeys** when students collect items  
 **Review claims regularly** to reduce wait times

---

**Happy finding!**

Access your portal at: **http://localhost:5173**
