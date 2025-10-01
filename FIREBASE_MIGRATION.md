# Firebase Migration Guide

## Overview
This guide will help you migrate PlantHub from in-memory storage to Firebase (Firestore + Authentication).

---

## Step 1: Firebase Console Setup

### 1.1 Enable Firebase Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one)
3. Navigate to **Authentication** → **Get Started**
4. Enable **Email/Password** sign-in method
   - Click "Add new provider"
   - Select "Email/Password"
   - Toggle "Enable"
   - **Important:** Also toggle "Email link (passwordless sign-in)" if you want that feature
   - Click "Save"

### 1.2 Enable Firestore Database
1. In Firebase Console, navigate to **Firestore Database**
2. Click **Create Database**
3. Choose **Start in production mode** (we'll add security rules later)
4. Select your preferred location (e.g., `asia-southeast1` for Thailand)
5. Click **Enable**

### 1.3 Get Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the **Web** icon (`</>`) to add a web app
4. Register app name: `PlantHub`
5. Copy the `firebaseConfig` object values

---

## Step 2: Update Environment Variables

### 2.1 Local Development (`.env.local`)
Add these Firebase variables to your `.env.local`:

```bash
# Firebase Client Config (Public - safe to expose in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin SDK (Server-side only - KEEP SECRET)
# Method 1: Service Account JSON (recommended for local dev)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"..."}'

# Method 2: Individual fields (recommended for Vercel)
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 2.2 Get Service Account Key
1. Firebase Console → **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file
4. **Option A (Local):** Copy entire JSON content as single-line string into `FIREBASE_SERVICE_ACCOUNT_KEY`
5. **Option B (Vercel):** Extract these fields separately:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters!)

### 2.3 Vercel Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your PlantHub project
3. Go to **Settings** → **Environment Variables**
4. Add all the variables from Step 2.1
5. Make sure `NEXT_PUBLIC_*` variables are available for **Production**, **Preview**, and **Development**
6. Admin SDK variables should be **Production** and **Preview** only (not exposed to client)

---

## Step 3: Firestore Security Rules

Before going live, add these security rules in Firebase Console:

### Navigate to Firestore → Rules tab

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Products collection - public read, seller write
    match /products/{productId} {
      allow read: if true; // Public can browse
      allow create: if isSignedIn() && 
                       request.auth.token.role == 'seller' &&
                       request.resource.data.sellerId == request.auth.uid;
      allow update, delete: if isSignedIn() && 
                               resource.data.sellerId == request.auth.uid;
    }
    
    // Users collection - owner read/write only
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Orders collection - buyer read/write own orders
    match /orders/{orderId} {
      allow read, write: if isSignedIn() && 
                            resource.data.buyerId == request.auth.uid;
    }
    
    // Admin access (add admin email check if needed)
    match /{document=**} {
      allow read, write: if false; // Deny all by default
    }
  }
}
```

**Publish the rules** after pasting.

---

## Step 4: Seed Initial Data (Optional)

After migration code is deployed, you can seed products:

```bash
# Local development
curl -X POST http://localhost:3000/api/products/seed

# Production
curl -X POST https://plant-hub-1kbf.vercel.app/api/products/seed
```

---

## Step 5: Testing Checklist

- [ ] User registration creates Firebase Auth account
- [ ] Login works with Firebase Auth
- [ ] User profile stored in Firestore `/users/{uid}`
- [ ] Password reset email sent via Firebase Auth
- [ ] Products display from Firestore
- [ ] Sellers can add/edit/delete their products
- [ ] Products persist after server restart
- [ ] Check Firebase Console to see users in Authentication tab
- [ ] Check Firestore to see documents in collections

---

## Step 6: View Users in Firebase Console

### Method 1: Authentication Tab (Recommended)
1. Go to Firebase Console
2. Click **Authentication** → **Users** tab
3. You'll see a table with:
   - User identifier (email)
   - Provider (Email/Password)
   - Created date
   - Last sign-in
   - User UID

### Method 2: Firestore Tab (Extended Profile)
1. Go to **Firestore Database**
2. Navigate to `users` collection
3. Click any document (each UID is a user)
4. You'll see custom fields:
   - `email`
   - `name`
   - `role` (buyer/seller)
   - `createdAt`

---

## Rollback Plan

If something breaks, you can temporarily revert:

1. Comment out Firebase imports in API routes
2. Uncomment the old in-memory logic
3. Redeploy
4. Debug offline, then re-migrate

---

## Common Issues

### "Missing permissions" error
- Check Firestore security rules are published
- Verify user is signed in (check `request.auth`)

### "Invalid service account" error
- Verify `FIREBASE_PRIVATE_KEY` has correct `\n` characters
- Ensure JSON is valid (use a JSON validator)

### Users not appearing in Firebase Auth
- Check API route is calling `createUserWithEmailAndPassword`
- Verify Firebase Auth is enabled in console

### Email verification not working
- Firebase Auth email templates can be customized in Console → Authentication → Templates

---

## Next Steps After Migration

1. **Enable email verification** (optional)
2. **Add user roles** via Custom Claims (for seller/buyer distinction)
3. **Implement real-time updates** with Firestore listeners
4. **Add Firebase Storage** for product image uploads
5. **Set up Firebase Functions** for backend logic (e.g., order processing)

---

**Ready to migrate?** The code changes are being implemented now. Once deployed, follow the steps above to complete the Firebase setup.
