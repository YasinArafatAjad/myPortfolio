# Portfolio Website Setup Instructions

## 1. Firebase Setup

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and create a new project
3. Enable Google Analytics (optional)

### Enable Authentication
1. In Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password" authentication
3. Disable "Email link (passwordless sign-in)" unless needed

### Setup Firestore Database
1. Go to Firestore Database → Create database
2. Start in "test mode" for now (we'll add security rules later)
3. Choose a location close to your users

### Get Firebase Configuration
1. Go to Project settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon to add a web app
4. Register app with a nickname
5. Copy the config values to your `.env` file

## 2. Firestore Security Rules

Add these security rules in Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Settings document (public read, admin write)
    match /settings/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == "admin@yourdomain.com";
    }
    
    // Projects (public read for published, admin write)
    match /projects/{document} {
      allow read: if resource.data.published == true || (request.auth != null && request.auth.token.email == "admin@yourdomain.com");
      allow write: if request.auth != null && request.auth.token.email == "admin@yourdomain.com";
    }
    
    // Messages (admin only)
    match /messages/{document} {
      allow read, write: if request.auth != null && request.auth.token.email == "admin@yourdomain.com";
      allow create: if true; // Allow anyone to create messages
    }
    
    // Reviews (public read for approved, admin write)
    match /reviews/{document} {
      allow read: if resource.data.approved == true || (request.auth != null && request.auth.token.email == "admin@yourdomain.com");
      allow write: if request.auth != null && request.auth.token.email == "admin@yourdomain.com";
      allow create: if true; // Allow anyone to create reviews
    }
    
    // Notifications (admin only)
    match /notifications/{document} {
      allow read, write: if request.auth != null && request.auth.token.email == "admin@yourdomain.com";
    }
  }
}
```

## 3. Cloudinary Setup (Optional - for image uploads)

1. Create account at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard to get your credentials
3. Create an unsigned upload preset:
   - Go to Settings → Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Set "Signing Mode" to "Unsigned"
   - Name it (e.g., "portfolio_uploads")
   - Save and copy the preset name

## 4. Initial Data Setup

### Create Initial Settings Document
1. Go to Firestore → Data
2. Create collection "settings"
3. Create document with ID "site"
4. Add these fields:
   ```json
   {
     "siteName": "Your Portfolio",
     "siteDescription": "Professional portfolio showcasing my work",
     "siteKeywords": "portfolio, developer, web development",
     "contactEmail": "your@email.com",
     "socialLinks": {
       "github": "https://github.com/yourusername",
       "linkedin": "https://linkedin.com/in/yourusername"
     },
     "seoSettings": {
       "twitterCard": "summary_large_image"
     }
   }
   ```

## 5. Admin Account Setup

1. Start the development server: `npm run dev`
2. Go to `/login` in your browser
3. Use the admin email from your `.env` file
4. Create your admin account (first time setup)

## 6. Development Server

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 7. Troubleshooting

### Common Issues:

1. **Firebase Config Error**: Check all environment variables are set correctly
2. **Firestore Permission Denied**: Update security rules and check admin email
3. **Image Upload Fails**: Configure Cloudinary credentials and upload preset
4. **Admin Login Fails**: Ensure VITE_ADMIN_EMAIL matches the email you're using

### Environment Variables Checklist:
- [ ] VITE_FIREBASE_API_KEY
- [ ] VITE_FIREBASE_AUTH_DOMAIN
- [ ] VITE_FIREBASE_PROJECT_ID
- [ ] VITE_FIREBASE_STORAGE_BUCKET
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
- [ ] VITE_FIREBASE_APP_ID
- [ ] VITE_ADMIN_EMAIL
- [ ] VITE_CLOUDINARY_CLOUD_NAME (optional)
- [ ] VITE_CLOUDINARY_UPLOAD_PRESET (optional)

## 8. Deployment

For deployment, you can use:
- **Vercel**: Just connect your GitHub repo
- **Netlify**: Drag and drop the `dist` folder after `npm run build`
- **Firebase Hosting**: Use `firebase deploy`

Make sure to set environment variables in your deployment platform!