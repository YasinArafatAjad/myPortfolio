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

## 3. EmailJS Setup (for Email Notifications)

### Create EmailJS Account
1. Go to [EmailJS](https://www.emailjs.com/) and create a free account
2. Create a new email service (Gmail, Outlook, etc.)
3. Create an email template for contact form notifications

### Email Service Setup
1. In EmailJS Dashboard → Email Services → Add New Service
2. Choose your email provider (Gmail recommended)
3. Follow the setup instructions to connect your email account

### Email Template Setup
1. Go to Email Templates → Create New Template
2. Use this template for contact form notifications:

**Template ID**: `contact_form_notification`

**Subject**: `New Contact Form Submission: {{subject}}`

**Content**:
```html
<h2>New Contact Form Submission</h2>

<p><strong>From:</strong> {{from_name}} ({{from_email}})</p>
<p><strong>Subject:</strong> {{subject}}</p>
<p><strong>Date:</strong> {{submission_date}}</p>

<h3>Message:</h3>
<div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #007bff;">
  {{message}}
</div>

<hr>
<p><strong>Quick Reply:</strong> <a href="mailto:{{reply_to}}?subject=Re: {{subject}}">Reply to {{from_name}}</a></p>

<p><em>This message was sent from your portfolio contact form.</em></p>
```

### Optional: Auto-Reply Template
Create a second template for auto-replies to users:

**Template ID**: `contact_form_autoreply`

**Subject**: `Thank you for your message - {{from_name}}`

**Content**:
```html
<h2>Thank you for your message!</h2>

<p>Hi {{to_name}},</p>

<p>Thank you for reaching out through my portfolio contact form. I've received your message and will get back to you as soon as possible, usually within 24 hours.</p>

<h3>Your Message:</h3>
<div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #007bff;">
  <p><strong>Subject:</strong> {{original_subject}}</p>
  <p><strong>Message:</strong> {{original_message}}</p>
</div>

<p>Best regards,<br>
Your Name</p>

<p><em>This is an automated response. Please do not reply to this email.</em></p>
```

### Get EmailJS Configuration
1. Go to EmailJS Dashboard → Integration
2. Copy your Public Key
3. Note your Service ID and Template ID(s)
4. Add these to your `.env` file

## 4. Cloudinary Setup (Optional - for image uploads)

1. Create account at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard to get your credentials
3. Create an unsigned upload preset:
   - Go to Settings → Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Set "Signing Mode" to "Unsigned"
   - Name it (e.g., "portfolio_uploads")
   - Save and copy the preset name

## 5. Environment Variables Setup

Create a `.env` file in your project root with these variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Admin Configuration
VITE_ADMIN_EMAIL=admin@yourdomain.com

# EmailJS Configuration (for contact form email notifications)
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=contact_form_notification
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID=contact_form_autoreply

# Cloudinary Configuration (optional)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=portfolio_uploads
```

## 6. Initial Data Setup

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

## 7. Admin Account Setup

1. Start the development server: `npm run dev`
2. Go to `/login` in your browser
3. Use the admin email from your `.env` file
4. Create your admin account (first time setup)

## 8. Development Server

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 9. Email Notification Testing

1. Fill out the contact form on your website
2. Check your admin dashboard for the message
3. Check your email inbox for the notification
4. If using auto-reply, check that the sender receives a confirmation

## 10. Troubleshooting

### Common Issues:

1. **Firebase Config Error**: Check all environment variables are set correctly
2. **Firestore Permission Denied**: Update security rules and check admin email
3. **EmailJS Not Working**: 
   - Verify all EmailJS environment variables
   - Check EmailJS service and template configuration
   - Ensure your email service is properly connected
   - Check browser console for EmailJS errors
4. **Admin Login Fails**: Ensure VITE_ADMIN_EMAIL matches the email you're using

### Environment Variables Checklist:
- [ ] VITE_FIREBASE_API_KEY
- [ ] VITE_FIREBASE_AUTH_DOMAIN
- [ ] VITE_FIREBASE_PROJECT_ID
- [ ] VITE_FIREBASE_STORAGE_BUCKET
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
- [ ] VITE_FIREBASE_APP_ID
- [ ] VITE_ADMIN_EMAIL
- [ ] VITE_EMAILJS_SERVICE_ID
- [ ] VITE_EMAILJS_TEMPLATE_ID
- [ ] VITE_EMAILJS_PUBLIC_KEY
- [ ] VITE_CLOUDINARY_CLOUD_NAME (optional)
- [ ] VITE_CLOUDINARY_UPLOAD_PRESET (optional)

### EmailJS Troubleshooting:
- Verify your email service is active in EmailJS dashboard
- Check that your email template variables match the ones used in the code
- Ensure your EmailJS public key is correct
- Test your EmailJS configuration using their test feature
- Check browser network tab for failed requests

## 11. Deployment

For deployment, you can use:
- **Vercel**: Just connect your GitHub repo
- **Netlify**: Drag and drop the `dist` folder after `npm run build`
- **Firebase Hosting**: Use `firebase deploy`

Make sure to set environment variables in your deployment platform!

## 12. Email Notification Features

With EmailJS configured, you'll get:
- ✅ Instant email notifications when someone submits the contact form
- ✅ All form details including name, email, subject, and message
- ✅ Quick reply links in the notification email
- ✅ Optional auto-reply confirmation to the sender
- ✅ No server required - works entirely from the frontend
- ✅ Free tier supports up to 200 emails per month

The system will gracefully handle cases where EmailJS is not configured - messages will still be saved to your admin dashboard.