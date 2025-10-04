# Lost & Found Management System

A full-stack web application for managing lost and found items in universities and colleges. The system enables students to report lost/found items, search for matches using multiple matching algorithms, and allows administrators to manage claims with comprehensive status tracking.

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
- **Authentication**: JWT (python-jose) with role-based access control
- **Password Hashing**: Werkzeug + bcrypt
- **CORS**: flask-cors for frontend integration

### Frontend

- **Framework**: React 19 with Vite
- **UI Library**: Material-UI (MUI) with custom theming
- **HTTP Client**: Axios
- **Routing**: React Router DOM with protected routes
- **Form Management**: Formik + Yup validation
- **State Management**: React Hooks

## Features

### For Students

#### 1. **Report Lost Items**

- Submit detailed item descriptions with enhanced UI
- Optional serial number field for better matching
- Receive unique passkey for each item
- View all your reported lost items with status tracking
- Forms automatically reset after submission

#### 2. **Report Found Items**

- Report items you've found with improved form design
- Enter passkey if found with the item
- Optional serial number field for precise matching
- Auto-matching creates claims instantly

#### 3. **Intelligent Matching System**

- **Serial Number Priority**: Exact serial number matches (highest priority)
- **Passkey Matching**: Exact match between lost and found items
- **Text Search**: MongoDB text search with weighted scoring
- **Smart Suggestions**: Multi-algorithm potential matches

#### 4. **Enhanced Search & Claim**

- Search found items with instant filtering
- **Claimed items automatically hidden** from search results
- Create claims for items that match yours
- **Duplicate claim prevention** - one claim per item per user
- Track claim status (pending, approved, rejected)

#### 5. **Improved User Experience**

- **Status-aware UI**: "View Potential Matches" button hidden for found items
- Enhanced text field styling with Material-UI theming
- Responsive design with improved category dropdowns
- Form validation and error handling

### For Administrators

#### 1. **Advanced Claims Management**

- View all claims across the system
- **Smart claim approval** automatically updates item statuses:
  - Found item status changed to "claimed"
  - Lost item status changed to "found"
- Approve or reject claims with comprehensive tracking
- Enhanced admin-only interface with role-based access

#### 2. **Status Management**

- **Automatic status updates** when claims are approved
- **Filtered searches** exclude claimed items automatically
- Complete claim lifecycle tracking
- Admin dashboard only visible to admin users

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
  serial_number: String (optional, indexed), // NEW: For precise matching
  status: String ("lost" | "found"),         // NEW: Status tracking
  created_at: DateTime,
  updated_at: DateTime                       // NEW: Auto-updated
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
  serial_number: String (optional, indexed), // NEW: For precise matching
  status: String ("unclaimed" | "claimed"),  // NEW: Status tracking
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
  status: String ("pending" | "approved" | "rejected"),
  created_at: DateTime,
  updated_at: DateTime
}
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Lost Items

- `POST /api/lost-items` - Report a lost item (requires auth, supports serialNumber)
- `GET /api/lost-items` - Get current user's lost items with status (requires auth)
- `GET /api/lost-items/search?q=<query>` - Search lost items
- `GET /api/lost-items/<id>/matches` - Get potential matches (requires auth, filters claimed items)

### Found Items

- `POST /api/found-items` - Report a found item (requires auth, supports serialNumber)
- `GET /api/found-items/search?q=<query>` - Search found items (excludes claimed items)

### Claims

- `POST /api/claims` - Create a claim manually (requires auth, prevents duplicates)
- `POST /api/claims/<id>/verify` - Verify a claim (requires auth)

### Admin (requires admin role)

- `GET /api/admin/claims` - Get all claims
- `POST /api/admin/claims/<id>/approve` - **Enhanced**: Approve claim + update item statuses
- `POST /api/admin/claims/<id>/reject` - Reject a claim

### Health

- `GET /api/health` - Health check
- `GET /healthz` - Health check (root)

## Frontend Routes

- `/` - Redirects to `/lost`
- `/login` - Login/Register page
- `/lost` - Report lost items & view matches (status-aware UI)
- `/found` - Report found items
- `/search` - Search found items (excludes claimed)
- `/admin` - **Role-protected**: Admin dashboard (visible only to admins)

## Security & Access Control

### Enhanced Security Features

- Password hashing with Werkzeug + bcrypt
- JWT token expiration (24 hours) with role validation
- **Duplicate claim prevention** at database level
- CORS protection with configurable origins
- Token validation on every protected route
- **Status-based filtering** prevents data leaks

## System Workflows

### Scenario 1: Serial Number Matching (NEW - Highest Priority)

1. Student loses phone with serial "ABC123"
2. Reports lost item including serial number
3. Finder reports found phone with same serial "ABC123"
4. **System prioritizes serial match over all other methods**
5. Auto-creates claim, Admin approves, Items marked found/claimed

### Scenario 2: Enhanced Passkey Workflow

1. Student reports lost item, receives passkey "aB3xY9zK"
2. Finder reports item with passkey
3. System auto-creates claim
4. **Admin approval automatically updates statuses**:
   - Lost item status changes to "found"
   - Found item status changes to "claimed"
5. **Item disappears from search results**

### Scenario 3: Smart Search & Match Prevention

1. Student searches for found items
2. **Claimed items automatically filtered out**
3. Student creates claim for available item
4. **System prevents duplicate claims by same user**
5. Admin processes unique claims efficiently

### Scenario 4: Status-Aware User Experience

1. Student reports lost item (status: "lost")
2. **"View Potential Matches" button visible**
3. Admin approves claim (status becomes: "found")
4. **Button automatically hidden - no more matching needed**

## Advanced Features

```

### Duplicate Prevention System

- **Database-level constraints** prevent duplicate claims
- **Compound indexing** for performance optimization
- **User feedback** with clear error messages
- **Reference tracking** for existing claims

### Status Management

```

Lost Item Lifecycle:
"lost" (claim approved) "found"

Found Item Lifecycle:
"unclaimed" (claim approved) "claimed"

Claim Lifecycle:
"pending" "approved" / "rejected"

````

### Smart Filtering

- **Search results** automatically exclude claimed items
- **Potential matches** filter out unavailable items
- **Database queries** optimized with status conditions
- **UI elements** conditionally rendered based on status

## Creating an Admin User

To access admin features, you need to manually set a user's role to "admin" in MongoDB:

### Using MongoDB Compass (GUI)

1. Download and install MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Navigate to `lostfound` database and then `students` collection
4. Find your user document
5. Edit the document and add/change: `"role": "admin"`
6. Save and refresh the frontend

### Using MongoDB Shell

```bash
mongosh
use lostfound
db.students.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
````

**Note**: After changing role, refresh the browser to see admin features!

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

### Manual Testing Checklist

- [x] **Enhanced UI**: Improved text fields and category dropdowns
- [x] **Serial Number System**: Report items with serial numbers for precise matching
- [x] **Role-Based Access**: Admin dashboard only visible to admins
- [x] **Status Management**: Items automatically marked claimed/found when approved
- [x] **Duplicate Prevention**: Users can't claim the same item twice
- [x] **Smart Filtering**: Claimed items hidden from searches and matches
- [x] **Form Reset**: Forms clear after successful submission
- [x] **Status-Aware UI**: Buttons hidden for completed items

### Quick Test Scenarios

#### Test 1: Complete Serial Number Workflow

```powershell
1. Register two accounts (student1, student2)
2. student1: Report lost "iPhone" with serial "ABC123"
3. student2: Report found "iPhone" with serial "ABC123"
4. Verify: Auto-claim created with highest priority
5. Admin: Approve claim
6. Verify: Lost item status="found", Found item status="claimed"
7. Verify: Items disappear from search results
```

#### Test 2: Duplicate Prevention

```powershell
1. Register account and report lost item
2. Find matching found item in search
3. Create claim for the item
4. Try to create second claim for same item
5. Verify: System prevents duplicate with clear error message
```

#### Test 3: Status-Aware UI

```powershell
1. Report lost item - "View Potential Matches" button visible
2. Admin approves a claim for this item
3. Refresh page - Button automatically hidden
4. Verify: Item status shows "found"
```

### Testing Script

```powershell
# Test authentication and basic functionality
python test_auth.py
```

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

### Backend Issues

**Backend won't start**

- Check MongoDB is running: `mongosh` (should connect)
- Check port 5000 is not in use
- Verify environment variables are set
- Check Python dependencies: `pip list`

**Status updates not working**

- Ensure `LostItem.update_status()` method exists
- Check admin role permissions
- Verify claim approval endpoint logic

**Items still showing after being claimed**

- Restart backend to refresh database indexes
- Check MongoDB status filtering in search methods
- Verify claim approval updates item statuses correctly

### Frontend Issues

**Frontend won't start**

- Check Node.js version: `node --version` (should be 18+)
- Delete `node_modules` and run `npm install` again
- Check port 5173 is not in use
- Verify `.env` file exists with correct API URL

**Admin dashboard not visible**

- Verify user role is set to "admin" in database
- Refresh browser after role change
- Check JWT token includes role information
- Verify `authService.isAdmin()` function works

**"View Potential Matches" button issues**

- Check if item status is being returned from API
- Verify conditional rendering logic: `item.status !== "found"`
- Ensure backend returns status field in `/api/lost-items`

### Database Issues

**Can't connect to MongoDB**

- Local: Ensure MongoDB service is running
- Atlas: Check connection string includes username/password
- Check firewall settings

**Search returns claimed items**

- Check database indexes are created properly
- Verify search methods include status filtering
- Restart backend to refresh query logic

**Duplicate claims still possible**

- Check compound index exists: `(found_item_id, student_id)`
- Verify `find_existing_claim()` method works
- Test duplicate prevention endpoint manually

## Recent Updates & Improvements

### v2.1.0 - Enhanced Matching & Status System

- **Serial Number Priority Matching**: Most accurate matching method
- **Comprehensive Status Management**: Smart item lifecycle tracking
- **Duplicate Claim Prevention**: Database-level constraints
- **Smart Filtering**: Claimed items automatically hidden
- **Status-Aware UI**: Conditional button rendering

### v2.0.0 - UI/UX & Access Control Overhaul

- **Enhanced Material-UI Theming**: Professional form styling
- **Role-Based Access Control**: Admin features properly secured
- **Form Improvements**: Auto-reset, better validation, enhanced dropdowns
- **Performance Optimizations**: Database indexing and query optimization

### v1.x.x - Core Functionality

- **Basic Lost & Found System**: Core reporting and matching
- **JWT Authentication**: Secure user management
- **MongoDB Integration**: Scalable data storage
- **React Frontend**: Modern UI framework

## Future Enhancements

### Short Term (Next Release)

- [ ] **Email Notifications**: Notify users of claim status changes
- [ ] **Image Upload**: Add photos to item reports for better identification
- [ ] **Advanced Analytics**: Dashboard with statistics and trends
- [ ] **Mobile Responsive**: Enhanced mobile user experience

### Medium Term

- [ ] **Real-time Notifications**: WebSocket integration for instant updates
- [ ] **QR Code Generation**: Generate QR codes for passkeys
- [ ] **Location Integration**: Map-based location selection
- [ ] **Export Functionality**: CSV/PDF reports for admins

### Long Term

- [ ] **Mobile App**: React Native iOS/Android applications
- [ ] **AI-Powered Matching**: Machine learning for better item matching
- [ ] **Multi-language Support**: Internationalization
- [ ] **Blockchain Integration**: Immutable claim records

**Access your portal**: **http://localhost:5173**  
**API Documentation**: **http://localhost:5000/api/health**  
**Admin Panel**: **http://localhost:5173/admin** (admin role required)
