# Frontend Guide - Lost & Found Management System

## Overview

React + Vite frontend with Material-UI components for the Lost & Found Management System.

## Features

### For Students

1. **Authentication**
   - Login/Register with email and password
   - JWT token-based authentication

2. **Report Lost Items**
   - Fill out a form with item details (title, description, category, location, date)
   - Receive a unique passkey for the item
   - View all your reported lost items

3. **Report Found Items**
   - Submit found item details
   - Optionally enter a passkey if you found one with the item
   - Auto-matching: if passkey matches a lost item, a claim is created automatically

4. **Search Found Items**
   - Keyword search across all found items
   - Search by title, description, category, or location
   - Filter results by category and location

5. **View Potential Matches**
   - For each lost item, view suggested matches from found items
   - Matches are based on:
     - Exact passkey match (highest priority)
     - Keyword similarity (title, description, category, location)
   - Create a claim directly from a suggested match

### For Admins

1. **Claims Management**
   - View all pending, approved, rejected, and retrieved claims
   - Approve or reject claims
   - Record item retrievals with notes

2. **Retrieval History**
   - View complete history of all retrieved items
   - Track who retrieved items and when
   - View admin notes for each retrieval

## Project Structure

```
frontend/myapp/src/
├── components/
│   ├── Login.jsx              # Login/Register form
│   ├── LostItemForm.jsx       # Report lost item form
│   ├── FoundItemForm.jsx      # Report found item form
│   ├── ItemCard.jsx           # Display item details
│   ├── SearchFoundItems.jsx   # Search interface for found items
│   ├── ItemMatches.jsx        # Show potential matches for a lost item
│   └── AdminDashboard.jsx     # Admin panel for claims & retrievals
├── services/
│   └── api.js                 # API service layer (axios)
├── App.jsx                    # Main app with routing
├── App.css
├── index.css
└── main.jsx                   # Entry point
```

## Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
cd frontend/myapp
npm install
```

### Environment Variables

Create a `.env` file in `frontend/myapp/`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Development

Start the Vite dev server:

```bash
npm run dev
```

The app will run at `http://localhost:5173` by default.

### Production Build

```bash
npm run build
```

This creates an optimized build in `frontend/myapp/dist/`. The Flask backend will serve this automatically if the directory exists.

## Routes

- `/` - Redirects to `/lost`
- `/login` - Login/Register page
- `/lost` - Report lost items and view your lost items with potential matches
- `/found` - Report found items
- `/search` - Search all found items by keywords
- `/admin` - Admin dashboard (requires admin role)

## API Integration

The frontend communicates with the Flask backend via the `api.js` service layer:

### Auth Service

- `authService.register(userData)` - Register new user
- `authService.login(credentials)` - Login and store JWT
- `authService.logout()` - Clear JWT from localStorage

### Items Service

- `itemsService.reportLost(itemData)` - Report a lost item
- `itemsService.getLostItems()` - Get current user's lost items
- `itemsService.reportFound(itemData)` - Report a found item
- `itemsService.searchFoundItems(query, filters)` - Search found items
- `itemsService.searchLostItems(query, filters)` - Search lost items
- `itemsService.getMatches(lostItemId)` - Get potential matches for a lost item
- `itemsService.createClaim(lostItemId, foundItemId)` - Create a claim
- `itemsService.verifyClaim(claimId)` - Verify a claim

### Admin Service

- `adminService.getClaims()` - Get all claims
- `adminService.approveClaim(claimId)` - Approve a claim
- `adminService.rejectClaim(claimId)` - Reject a claim
- `adminService.createRetrieval(claimId, notes)` - Record item retrieval
- `adminService.getRetrievals()` - Get retrieval history

## Key Components

### SearchFoundItems

Allows users to search for found items using keywords. Results are displayed as cards with item details, category, location, status, and passkey.

### ItemMatches

Shows potential matches for a specific lost item. Users can:
- See exact passkey matches (if any)
- See keyword-based suggestions
- Create a claim directly from a match

### AdminDashboard

Two-tab interface:
1. **Claims Management**: View, approve, reject, and record retrievals for claims
2. **Retrieval History**: View complete history of all retrieved items

## Styling

- Material-UI (MUI) for components
- Custom theme with primary color `#1976d2` and secondary `#dc004e`
- Responsive design with Grid layout
- Icons from `@mui/icons-material`

## Authentication Flow

1. User logs in via `/login`
2. JWT token is stored in `localStorage`
3. Axios interceptor automatically adds `Authorization: Bearer <token>` to all requests
4. Protected routes redirect to `/login` if not authenticated
5. Admin routes check role on backend (403 if not admin)

## Tips for Development

- The backend must be running at `http://localhost:5000` (or your configured `VITE_API_URL`)
- MongoDB must be running and configured
- Use browser DevTools Network tab to debug API calls
- Check browser console for errors
- Admin features require a user with `role: "admin"` in the database

## Future Enhancements

- Real-time notifications when a match is found
- Image upload for items
- Advanced filters (date range, multiple categories)
- Email notifications
- Mobile app version
- QR code generation for passkeys
