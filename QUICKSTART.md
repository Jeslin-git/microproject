# Quick Start Guide - Lost & Found System

Get the Lost & Found Management System running in 5 minutes!

## Prerequisites

- Python 3.8+ installed
- Node.js 18+ and npm installed
- MongoDB installed locally OR MongoDB Atlas account

## Step 1: Install MongoDB (if using local)

### Windows
1. Download MongoDB Community Edition: https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017` by default

### Or use MongoDB Atlas (Cloud)
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and database user
3. Get your connection string

## Step 2: Backend Setup

```powershell
# Navigate to project root
cd c:\Users\jesli\microproject\microproject

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

## Step 3: Frontend Setup

Open a **new terminal** window:

```powershell
# Navigate to frontend
cd c:\Users\jesli\microproject\microproject\frontend\myapp

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Run the frontend
npm run dev
```

Frontend will start at **http://localhost:5173**

## Step 4: Test the Application

1. Open browser to **http://localhost:5173**
2. You'll see the Login/Sign Up portal
3. Click the **"Sign Up"** tab
4. Fill in:
   - Full Name: Your name
   - Email: your-email@example.com
   - Password: (minimum 6 characters)
   - Confirm Password: (same as password)
5. Click "Sign Up" → You'll be logged in automatically
6. Now you can:
   - Report lost items
   - Report found items
   - Search for items
   - View potential matches

## Step 5: Create an Admin User (Optional)

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

Now you can access the Admin Dashboard at **http://localhost:5173/admin**

## Quick Test Workflow

### Test 1: Report Lost Item
1. Go to "Report Lost" tab
2. Fill in:
   - Title: "Blue Backpack"
   - Description: "Blue backpack with laptop inside"
   - Category: "Bags"
   - Location: "Library"
   - Date: Today
3. Submit → You'll get a **passkey** (e.g., "aB3xY9zK")
4. Save this passkey!

### Test 2: Report Found Item with Passkey Match
1. Go to "Report Found" tab
2. Fill in:
   - Title: "Backpack"
   - Description: "Found blue backpack"
   - Category: "Bags"
   - Location: "Library entrance"
   - **Passkey**: Enter the passkey from Test 1
3. Submit → A claim will be auto-created!

### Test 3: Search Found Items
1. Go to "Search" tab
2. Enter: "backpack"
3. Click Search → See results

### Test 4: View Potential Matches
1. Go to "Report Lost" tab
2. Scroll to "Your Lost Items"
3. Click "View Potential Matches" on any item
4. See suggested matches
5. Click "Claim This Item" on any match

### Test 5: Admin Features (if you created an admin user)
1. Go to "Admin" tab
2. View all claims
3. Approve or reject claims
4. Record retrievals

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

### API calls failing
- Check backend is running at http://localhost:5000
- Check browser console for errors
- Verify JWT token in localStorage (F12 → Application → Local Storage)
- Check CORS settings in backend

### Search returns no results
- Ensure MongoDB text indexes are created (happens automatically on startup)
- Check backend logs for index creation warnings
- Try restarting the backend

## Next Steps

- Read `PROJECT_SUMMARY.md` for complete feature overview
- Read `backend/README.md` for API documentation
- Read `frontend/FRONTEND_GUIDE.md` for frontend details
- Explore the code in `backend/` and `frontend/myapp/src/`

## Production Deployment

For production deployment:

1. **Backend**:
   - Set `FLASK_DEBUG=0`
   - Use strong `SECRET_KEY`
   - Use production WSGI server (Gunicorn)
   - Use MongoDB Atlas or production MongoDB

2. **Frontend**:
   - Run `npm run build` in `frontend/myapp/`
   - Flask will serve the built files automatically

3. **Environment**:
   - Set proper CORS origins
   - Use HTTPS
   - Set up proper logging
   - Configure backups for MongoDB

## Support

If you encounter issues:
1. Check the logs (backend terminal and browser console)
2. Review the documentation files
3. Verify all prerequisites are installed
4. Check MongoDB connection
5. Ensure environment variables are set correctly

Happy coding! 🚀
