# Student Portal Guide - Lost & Found System

## Overview

Every student can create their own account and access a personalized portal to manage lost and found items.

## Getting Started

### 1. Sign Up for an Account

**First-time users:**

1. Visit **http://localhost:5173**
2. You'll see the **Lost & Found Portal** login page
3. Click the **"Sign Up"** tab
4. Fill in the registration form:
   - **Full Name**: Your full name (e.g., "John Smith")
   - **Email**: Your email address (must be unique)
   - **Password**: Choose a secure password (minimum 6 characters)
   - **Confirm Password**: Re-enter your password
5. Click **"Sign Up"** button
6. ✅ You're automatically logged in and redirected to your portal!

**Validation:**
- Email must be valid format
- Password must be at least 6 characters
- Passwords must match
- Email must not already be registered

### 2. Login to Existing Account

**Returning users:**

1. Visit **http://localhost:5173**
2. On the **"Login"** tab (default)
3. Enter your:
   - **Email**
   - **Password**
4. Click **"Login"** button
5. ✅ You're logged in and can access your portal!

## Your Student Portal Features

Once logged in, you have access to your personalized dashboard with these sections:

### Navigation Menu

- **Report Lost** - Report items you've lost
- **Report Found** - Report items you've found
- **Search** - Search all found items
- **Admin** - (Only visible if you're an admin)
- **Logout** - Sign out of your account

---

## Feature 1: Report a Lost Item

**When you've lost something:**

1. Click **"Report Lost"** in the navigation
2. Fill out the form:
   - **Title**: Brief name (e.g., "Blue Backpack")
   - **Description**: Detailed description (e.g., "Blue backpack with laptop inside, has a NASA sticker")
   - **Category**: Select category (e.g., "Bags", "Electronics", "Keys", etc.)
   - **Location**: Where you lost it (e.g., "Library 2nd Floor")
   - **Date Lost**: When you lost it
3. Click **"Submit"**
4. ✅ You'll receive a unique **PASSKEY** (e.g., "aB3xY9zK")
   - **Save this passkey!** Share it with anyone who finds your item
   - If someone reports finding your item with this passkey, you'll be automatically matched

### View Your Lost Items

Scroll down on the "Report Lost" page to see **"Your Lost Items"** section:

- See all items you've reported as lost
- Each item shows:
  - Title
  - Status (pending, claimed, etc.)
  - Passkey
  - **"View Potential Matches"** button

### Check for Matches

For each lost item:

1. Click **"View Potential Matches"**
2. The system shows you:
   - **Exact passkey matches** (highest priority - someone entered your passkey!)
   - **Similar items** based on keywords (title, description, category, location)
3. For each potential match:
   - View item details
   - See who found it
   - Click **"Claim This Item"** to create a claim
4. ✅ Your claim is submitted for review

---

## Feature 2: Report a Found Item

**When you've found something:**

1. Click **"Report Found"** in the navigation
2. Fill out the form:
   - **Title**: Brief name (e.g., "Backpack")
   - **Description**: Detailed description (e.g., "Blue backpack found near study area")
   - **Category**: Select category
   - **Location**: Where you found it (e.g., "Library entrance")
   - **Passkey** (Optional): If the item has a passkey tag/note, enter it here
3. Click **"Submit"**

**What happens next:**

- If you entered a passkey that matches a lost item:
  - ✅ **Automatic match!** A claim is created immediately
  - The person who lost the item will be notified
- If no passkey or no match:
  - Item is added to the found items database
  - Anyone can search and find it
  - The owner can create a claim when they find it

---

## Feature 3: Search for Found Items

**Looking for your lost item in the database:**

1. Click **"Search"** in the navigation
2. Enter keywords in the search box:
   - Item name (e.g., "backpack")
   - Description words (e.g., "blue laptop")
   - Category (e.g., "electronics")
   - Location (e.g., "library")
3. Click **"Search"**
4. View results:
   - All matching found items are displayed
   - Sorted by relevance (best matches first)
   - Each result shows:
     - Title
     - Description
     - Category
     - Location
     - Status
     - Passkey

**Search Tips:**
- Use multiple keywords for better results (e.g., "blue backpack laptop")
- Try different variations (e.g., "bag" vs "backpack")
- Check the location where you lost it
- Look at the passkey - does it match yours?

---

## Feature 4: Claims Process

### Creating a Claim

You can create a claim in two ways:

**Method 1: From Potential Matches**
1. Go to "Report Lost" → Your Lost Items
2. Click "View Potential Matches"
3. Click "Claim This Item" on any match

**Method 2: From Search Results**
1. Search for found items
2. Find your item in the results
3. Note the found item details
4. Contact the finder or admin

### Claim Statuses

Your claims can have these statuses:

- **Pending**: Waiting for admin review
- **Approved**: Admin approved your claim - you can collect the item!
- **Rejected**: Claim was rejected (item doesn't match or already claimed)
- **Verified**: You've verified ownership
- **Retrieved**: You've collected the item

### What to Do After Claim Approval

1. Wait for admin to approve your claim
2. Once approved, you'll be notified
3. Go to the lost & found office
4. Bring your student ID
5. Provide your passkey (if you have one)
6. Admin will verify and hand over your item
7. Admin records the retrieval in the system

---

## Your Personal Dashboard

### Overview of Your Activity

On the **"Report Lost"** page, you can see:

- **All your reported lost items**
  - Current status of each
  - Passkeys for each item
  - Potential matches available

### Privacy & Security

- Your account is protected by password
- Only you can see your lost items
- Your email is kept private
- JWT tokens expire after 24 hours (you'll need to login again)

---

## Common Workflows

### Scenario 1: You Lost Your Phone

1. **Sign up/Login** to your portal
2. Click **"Report Lost"**
3. Fill in:
   - Title: "iPhone 13 Pro"
   - Description: "Black iPhone 13 Pro with cracked screen protector, blue case"
   - Category: "Electronics"
   - Location: "Student Center Cafeteria"
   - Date: Today
4. Submit → Save your passkey: "xY7pQ2mN"
5. Check **"View Potential Matches"** daily
6. If someone reports finding it with your passkey → Auto-matched!
7. If you find it in search results → Create a claim
8. Wait for admin approval
9. Collect your phone from lost & found office

### Scenario 2: You Found Someone's Wallet

1. **Sign up/Login** to your portal
2. Click **"Report Found"**
3. Fill in:
   - Title: "Brown Leather Wallet"
   - Description: "Brown leather wallet with student ID visible"
   - Category: "Wallets"
   - Location: "Library 3rd Floor"
   - Passkey: (Check if there's a passkey note inside - if yes, enter it)
4. Submit
5. If passkey matched → Owner is notified automatically!
6. If no passkey → Owner can find it via search or matches
7. Admin will contact you when owner claims it
8. Hand over the wallet at lost & found office

### Scenario 3: Searching for Your Lost Item

1. **Login** to your portal
2. Click **"Search"**
3. Enter: "blue backpack laptop"
4. Browse results
5. Found it? Note the passkey and details
6. Go to **"Report Lost"** → Your Lost Items
7. Click **"View Potential Matches"** on your lost item
8. If it appears → Click **"Claim This Item"**
9. Wait for admin approval
10. Collect your item!

---

## Tips for Success

### When Reporting Lost Items

✅ **Be specific**: More details = better matches
- Include brand names, colors, unique features
- Mention any identifying marks or damage
- List contents if applicable (e.g., "laptop inside backpack")

✅ **Accurate location**: Where did you last see it?
- Be as specific as possible
- Include building name, floor, room if known

✅ **Save your passkey**: Write it down or save it
- Share it with friends who might find your item
- Include it on a note inside valuable items

### When Reporting Found Items

✅ **Check for passkeys**: Look for notes, tags, or labels
- Inside wallets, bags, phone cases
- Attached to keys
- Written on items

✅ **Detailed description**: Help the owner identify it
- Don't include all identifying details (for security)
- Enough info for owner to recognize it
- Admin can verify additional details

✅ **Bring to lost & found**: Report it online AND physically
- Drop off the item at the lost & found office
- Reference your online report

### When Searching

✅ **Use multiple keywords**: Cast a wide net
- Try different word combinations
- Use synonyms (bag/backpack, phone/mobile)

✅ **Check regularly**: New items are added daily
- Search every day if you lost something valuable
- Check "View Potential Matches" on your lost items

✅ **Be patient**: It may take time for someone to find and report

---

## Frequently Asked Questions

**Q: I forgot my passkey. Can I recover it?**
A: Yes! Login and go to "Report Lost" → "Your Lost Items". Your passkeys are displayed there.

**Q: Can I edit a lost/found item report after submitting?**
A: Currently no. If you need to update details, contact an admin or report a new item.

**Q: How long are items kept in the lost & found?**
A: Check with your institution's policy. Typically 30-90 days.

**Q: What if someone else claims my item?**
A: Admins verify ownership before approving claims. Bring proof of ownership (receipts, photos, unique details).

**Q: Can I report multiple lost items?**
A: Yes! Report each item separately. Each gets its own passkey.

**Q: I found my item elsewhere. How do I cancel my report?**
A: Contact an admin to mark it as found/resolved.

**Q: Is my personal information visible to others?**
A: No. Only admins can see your full details. Other students only see item descriptions.

**Q: How do I become an admin?**
A: Contact your institution's lost & found office. They can grant admin privileges.

---

## Need Help?

- **Technical issues**: Contact your IT support
- **Lost & found questions**: Visit the lost & found office
- **Account problems**: Contact an admin
- **Found an item**: Report it online and bring it to the office

---

## Summary: Your Student Portal at a Glance

| Feature | What You Can Do |
|---------|----------------|
| **Sign Up** | Create your personal account |
| **Login** | Access your portal anytime |
| **Report Lost** | Report items you've lost, get a passkey |
| **Report Found** | Report items you've found, enter passkey if available |
| **Search** | Search all found items by keywords |
| **View Matches** | See potential matches for your lost items |
| **Create Claims** | Claim items that match yours |
| **Track Status** | Monitor your claims and lost items |

Your portal is available 24/7 at **http://localhost:5173** (or your institution's URL).

Happy finding! 🔍✨
