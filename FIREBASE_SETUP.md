# Firebase File Server Setup Guide

## 🔥 **Why Firebase is Better:**

- ✅ **Simple Setup** - No complex Google Drive API configuration
- ✅ **Reliable** - Google's infrastructure
- ✅ **Easy File Uploads** - Direct file access
- ✅ **Built-in Security** - Firebase authentication
- ✅ **No Folder Sharing Issues** - Direct file storage

## 🚀 **Step 1: Create Firebase Project**

1. **Go to Firebase Console:** https://console.firebase.google.com/
2. **Click "Create a project"**
3. **Enter project name:** `emon-xiter-server` (or any name)
4. **Enable Google Analytics** (optional)
5. **Click "Create project"**

## 🔧 **Step 2: Enable Firebase Storage**

1. **In your Firebase project dashboard**
2. **Click "Storage" in the left sidebar**
3. **Click "Get started"**
4. **Choose "Start in test mode"** (for now)
5. **Select a location** (choose closest to you)
6. **Click "Done"**

## 🔑 **Step 3: Get Service Account Key**

1. **Go to Project Settings** (gear icon)
2. **Click "Service accounts" tab**
3. **Click "Generate new private key"**
4. **Download the JSON file**
5. **Copy the contents** - you'll need this for server.js

## ⚙️ **Step 4: Configure Server**

Update these values in `server.js`:

```javascript
// Replace with your Firebase project details
const serviceAccount = {
  "type": "service_account",
  "project_id": "your-firebase-project-id", // From Firebase console
  "private_key_id": "your-private-key-id", // From downloaded JSON
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n", // From downloaded JSON
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com", // From downloaded JSON
  // ... other fields from downloaded JSON
};

// Update storage bucket
const bucket = admin.storage().bucket("your-project-id.appspot.com"); // From Firebase console

// Update main file name
const CONFIG = {
  MAIN_FILE_NAME: 'EMON_XTIER_BYPASS.zip' // Your file name
};
```

## 📤 **Step 5: Upload Your File**

1. **Go to Firebase Storage** in your project
2. **Click "Upload file"**
3. **Upload your `EMON_XTIER_BYPASS.zip`** (or .exe)
4. **Note the file name** - update `MAIN_FILE_NAME` in server.js

## 🚀 **Step 6: Deploy to Render**

1. **Push your code to GitHub**
2. **Connect to Render**
3. **Deploy!**

## 🎯 **Step 7: Update Emon Xiter Bypass**

Change the server URL in your Emon Xiter Bypass:
```csharp
private static string serverUrl = "https://your-firebase-server.onrender.com";
```

## ✅ **Benefits of Firebase:**

- **No API complexity** - Just upload files directly
- **No folder sharing** - Files are directly accessible
- **Better performance** - Google's CDN
- **Easier debugging** - Simple file operations
- **More reliable** - Less moving parts

## 🔐 **Security Features:**

- ✅ **File encryption** before storage
- ✅ **JWT authentication** for API access
- ✅ **Firebase security rules** (optional)
- ✅ **Rate limiting** and CORS protection

## 📋 **Quick Test:**

After setup, test your server:
```bash
curl https://your-server.onrender.com/health
curl https://your-server.onrender.com/api/download/main-exe
```

**Firebase is much simpler and more reliable than Google Drive API!** 🎉
