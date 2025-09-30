"""
Quick test script to create a test user and verify authentication
Run this with: python test_auth.py
"""
import requests
import json

API_URL = "http://localhost:5000/api"

def test_register():
    """Register a test user"""
    print("\n=== Testing Registration ===")
    data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "test123"
    }
    
    try:
        response = requests.post(f"{API_URL}/auth/register", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 201:
            print("✅ Registration successful!")
            return response.json().get('token')
        elif response.status_code == 400:
            print("⚠️  User already exists, trying login instead...")
            return None
        else:
            print("❌ Registration failed")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_login():
    """Login with test user"""
    print("\n=== Testing Login ===")
    data = {
        "email": "test@example.com",
        "password": "test123"
    }
    
    try:
        response = requests.post(f"{API_URL}/auth/login", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            return response.json().get('token')
        else:
            print("❌ Login failed")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_protected_route(token):
    """Test accessing a protected route"""
    print("\n=== Testing Protected Route ===")
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{API_URL}/lost-items", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Protected route access successful!")
        else:
            print("❌ Protected route access failed")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("=" * 50)
    print("Lost & Found Authentication Test")
    print("=" * 50)
    print("\nMake sure the backend is running at http://localhost:5000")
    print("Press Ctrl+C to cancel\n")
    
    input("Press Enter to start tests...")
    
    # Try to register
    token = test_register()
    
    # If registration failed (user exists), try login
    if not token:
        token = test_login()
    
    # Test protected route if we have a token
    if token:
        print(f"\n📝 Your JWT Token: {token[:50]}...")
        test_protected_route(token)
    else:
        print("\n❌ Could not get authentication token")
    
    print("\n" + "=" * 50)
    print("Test completed!")
    print("=" * 50)
    print("\nTest credentials:")
    print("  Email: test@example.com")
    print("  Password: test123")
    print("\nUse these to login via the frontend at http://localhost:5173")
