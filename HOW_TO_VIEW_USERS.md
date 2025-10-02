# Quick Reference: How to View Users in Firebase

## After a user registers on your site

### Method 1: Firebase Authentication Tab (Primary)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Authentication** in left sidebar
4. Click **Users** tab

You'll see a table with:
- ✉️ **Identifier** (email address)
- 🔑 **Providers** (Email/Password)
- 📅 **Created** (timestamp)
- 🕒 **Signed In** (last login time)
- 🆔 **User UID** (unique ID)

**Screenshot location in console:**
```
🏠 Project Overview
├── 🔥 Firestore Database
├── 🔐 Authentication  ← Click here
│   ├── Users          ← Then click here
│   ├── Sign-in method
│   └── Templates
```

---

### Method 2: Firestore Database (Extended Profile)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** in left sidebar
4. Click **Data** tab
5. You'll see collections listed, click `users`
6. Each document represents a user (document ID = User UID)

Inside each user document you'll see:
```json
{
  "id": "xyzABC123...",
  "email": "buyer@example.com",
  "name": "John Doe",
  "role": "buyer",
  "createdAt": "2025-10-01T10:30:00.000Z",
  "updatedAt": "2025-10-01T10:30:00.000Z"
}
```

**Screenshot location in console:**
```
🏠 Project Overview
├── 🔥 Firestore Database  ← Click here
│   ├── Data               ← Then click here
│   │   └── 📁 users       ← Expand this collection
│   │       ├── 📄 user-uid-1
│   │       ├── 📄 user-uid-2
│   │       └── ...
│   ├── Rules
│   └── Indexes
```

---

## Current Production Site

🌐 **URL:** https://plant-hub-1kbf.vercel.app/

### To test user registration:

1. Visit: https://plant-hub-1kbf.vercel.app/register
2. Fill in:
   - Name
   - Email
   - Password (min 8 characters)
   - Choose role: **Buyer** or **Seller**
3. Click "สร้างบัญชี" (Create Account)
4. Wait 2-3 seconds
5. Go to Firebase Console → Authentication → Users
6. You should see the new user in the list!

---

## Troubleshooting

### "User not appearing in Firebase Console"

**Check 1:** Environment variables set in Vercel?
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Verify `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is set
- Verify `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` are set

**Check 2:** Firebase Authentication enabled?
- Firebase Console → Authentication → Sign-in method
- Email/Password should be **Enabled**

**Check 3:** Check browser console for errors
- Open DevTools (F12)
- Try registering again
- Look for red error messages

**Check 4:** Check Vercel deployment logs
- Vercel Dashboard → Your Project → Deployments
- Click latest deployment → Functions tab
- Look for API route logs (`/api/auth/register`)

---

## Alternative: Query via Firebase Admin SDK (for developers)

If you have Node.js and service account key:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// List all users
admin.auth().listUsers()
  .then((result) => {
    result.users.forEach((user) => {
      console.log(user.email, user.uid);
    });
  });
```

---

## Summary

**Easiest way:** Go to Firebase Console → Authentication → Users

**Most detailed:** Go to Firebase Console → Firestore → users collection

**Live site:** https://plant-hub-1kbf.vercel.app/

After registering, users appear in both locations within seconds!
