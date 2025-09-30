# Troubleshooting Guide - Lost & Found System

## Login Issues

### Problem: "Cannot login with existing credentials"

**Symptoms:**
- You have a user in the MongoDB `students` collection
- Login form shows error or doesn't work
- Backend returns 401 Unauthorized

**Common Causes & Solutions:**

#### 1. Password Hash Mismatch

**Issue**: If you manually created a user in MongoDB, the password might not be properly hashed.

**Solution**: Always create users through the registration endpoint or use proper password hashing.

**To create a test user properly:**

```bash
# Option A: Use the test script
python test_auth.py

# Option B: Use curl to register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Then login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

#### 2. Backend Not Running

**Check if backend is running:**

```powershell
# Test health endpoint
curl http://localhost:5000/healthz
# Should return: {"status":"ok"}

# Or in browser, visit:
http://localhost:5000/healthz
```

**If not running, start it:**

```powershell
cd c:\Users\jesli\microproject\microproject
$env:MONGODB_URI = "mongodb://localhost:27017/lostfound"
$env:SECRET_KEY = "your-secret-key"
python -m backend.app
```

#### 3. MongoDB Not Running

**Check MongoDB:**

```powershell
# Try connecting with mongosh
mongosh

# If it fails, start MongoDB service:
# Windows: Services → MongoDB → Start
# Or run: net start MongoDB
```

#### 4. CORS Issues

**Symptoms**: Browser console shows CORS errors

**Check**: Backend should show:
```
CORS enabled for: http://localhost:5173
```

**Fix**: Ensure `FRONTEND_ORIGIN` env var is set correctly:

```powershell
$env:FRONTEND_ORIGIN = "http://localhost:5173"
```

#### 5. Wrong API URL

**Check frontend .env file:**

```
# frontend/myapp/.env
VITE_API_URL=http://localhost:5000/api
```

**Restart frontend after changing .env:**

```powershell
# Stop frontend (Ctrl+C)
npm run dev
```

---

## Step-by-Step Login Debugging

### Step 1: Verify Backend is Running

```powershell
curl http://localhost:5000/api/health
```

Expected: `{"status":"ok"}`

### Step 2: Check MongoDB Connection

```powershell
mongosh
use lostfound
db.students.find()
```

You should see your students collection.

### Step 3: Create a Fresh Test User

**Using the test script:**

```powershell
cd c:\Users\jesli\microproject\microproject
python test_auth.py
```

This will:
- Create user: test@example.com / test123
- Test login
- Verify token works

### Step 4: Test Login via curl

```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"test123\"}'
```

Expected response:
```json
{"token":"eyJ0eXAiOiJKV1QiLCJhbGc..."}
```

If you get `401 Unauthorized`:
- Password is wrong
- User doesn't exist
- Password not properly hashed

### Step 5: Test Frontend Login

1. Open browser to http://localhost:5173
2. Open DevTools (F12) → Console tab
3. Click "Login" tab
4. Enter:
   - Email: test@example.com
   - Password: test123
5. Click "Login"
6. Check Console for errors

**Common Console Errors:**

- `Network Error`: Backend not running
- `CORS Error`: CORS not configured
- `401 Unauthorized`: Wrong credentials
- `404 Not Found`: Wrong API URL

---

## Creating Test Users Manually in MongoDB

**⚠️ NOT RECOMMENDED** - Use registration endpoint instead!

If you must create a user manually:

```javascript
// In mongosh
use lostfound

// Generate password hash (you need Python for this)
// In Python:
// from werkzeug.security import generate_password_hash
// print(generate_password_hash("test123"))

db.students.insertOne({
  email: "test@example.com",
  name: "Test User",
  password: "scrypt:32768:8:1$...", // Use actual hash from above
  role: "student",
  created_at: new Date()
})
```

**Better approach**: Use the registration endpoint!

---

## Quick Test Checklist

- [ ] MongoDB is running (`mongosh` connects)
- [ ] Backend is running (http://localhost:5000/healthz works)
- [ ] Frontend is running (http://localhost:5173 loads)
- [ ] `.env` file exists in `frontend/myapp/` with correct API URL
- [ ] Test user created via registration endpoint
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows API calls to http://localhost:5000/api/auth/login

---

## Still Not Working?

### Check Backend Logs

Look at the terminal where backend is running. You should see:

```
POST /api/auth/login - 200 OK
```

If you see `401` or `500`, there's an issue.

### Check Browser Network Tab

1. Open DevTools (F12) → Network tab
2. Try to login
3. Look for request to `/api/auth/login`
4. Click on it → Check:
   - **Request Headers**: Should have `Content-Type: application/json`
   - **Request Payload**: Should show `{"email":"...","password":"..."}`
   - **Response**: Check status code and response body

### Enable Debug Mode

**Backend:**

```powershell
$env:FLASK_DEBUG = "1"
python -m backend.app
```

This will show detailed error messages.

### Check Password Hashing

**Test if password hashing works:**

```python
# In Python console
from werkzeug.security import generate_password_hash, check_password_hash

# Create hash
hash = generate_password_hash("test123")
print(hash)

# Verify password
print(check_password_hash(hash, "test123"))  # Should print True
print(check_password_hash(hash, "wrong"))     # Should print False
```

---

## Common Error Messages

### "Invalid credentials"

- **Cause**: Email or password is wrong
- **Fix**: 
  1. Verify email exists: `db.students.findOne({email: "test@example.com"})`
  2. Create new user via registration
  3. Use exact email and password

### "Email already registered"

- **Cause**: Trying to register with existing email
- **Fix**: Use login instead, or use different email

### "Token is missing"

- **Cause**: Accessing protected route without token
- **Fix**: Login first to get token

### "Token has expired"

- **Cause**: JWT token expired (24 hours)
- **Fix**: Login again to get new token

### "CORS policy error"

- **Cause**: Frontend origin not allowed
- **Fix**: Set `FRONTEND_ORIGIN` env var and restart backend

---

## Working Test Credentials

After running `python test_auth.py`, use these:

```
Email: test@example.com
Password: test123
```

These credentials are created with proper password hashing and will work for login.

---

## Need More Help?

1. **Check all logs**: Backend terminal, browser console, network tab
2. **Verify services**: MongoDB, Backend, Frontend all running
3. **Test with curl**: Verify backend works independently
4. **Clear browser cache**: Sometimes helps with CORS issues
5. **Restart everything**: MongoDB → Backend → Frontend

If still stuck, share:
- Backend logs
- Browser console errors
- Network tab screenshot
- MongoDB connection status
