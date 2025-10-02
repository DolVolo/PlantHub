# Firebase Storage Setup Guide

## Required Environment Variables

Make sure you have these in your Vercel Environment Variables:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com  # Optional, auto-generated if not provided
```

## Steps to Enable Firebase Storage

### 1. Enable Firebase Storage in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **plants-2a728**
3. Click **Storage** in the left sidebar
4. Click **Get Started**
5. Choose your storage location (e.g., `asia-southeast1` for Singapore)
6. Click **Done**

### 2. Configure Storage Rules

Go to **Storage > Rules** and use these rules for development:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;  // Anyone can read
      allow write: if request.auth != null;  // Only authenticated users can write
    }
  }
}
```

For production, you can tighten the rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Public read for products folder
    match /products/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Set Storage Bucket in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **PlantHub**
3. Go to **Settings > Environment Variables**
4. Add or update:
   ```
   FIREBASE_STORAGE_BUCKET=plants-2a728.appspot.com
   ```
5. Click **Save**
6. Redeploy your application

### 4. Grant Storage Admin Permission

Make sure your service account has Storage Admin permissions:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: **plants-2a728**
3. Go to **IAM & Admin > IAM**
4. Find your service account email
5. Make sure it has these roles:
   - **Firebase Admin**
   - **Storage Admin** or **Storage Object Admin**

If not, click **Edit** and add the role.

## Testing Upload

After setup, try uploading an image in your dashboard. Check browser console and Vercel logs for detailed error messages.

## Common Issues

### "Bucket not found"
- Make sure Storage is enabled in Firebase Console
- Check that `FIREBASE_STORAGE_BUCKET` is correct

### "Permission denied"
- Check Storage Rules in Firebase Console
- Verify service account has Storage Admin role

### "Invalid credentials"
- Verify all Firebase environment variables in Vercel
- Make sure `FIREBASE_PRIVATE_KEY` includes the full key with `\n` characters

## Check Logs

To see detailed upload logs:
1. Go to Vercel Dashboard > Your Project > Deployments
2. Click on the latest deployment
3. Go to **Functions** tab
4. Click on `/api/upload` function
5. View the logs to see detailed error messages
