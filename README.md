# Firebase File Server

A simple and reliable file server using Firebase Storage for .exe distribution.

## 🚀 **Quick Start**

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com/
   - Create new project
   - Enable Storage

2. **Get Service Account Key:**
   - Project Settings → Service Accounts
   - Generate new private key
   - Download JSON file

3. **Configure Server:**
   - Update `serviceAccount` in server.js
   - Update `storageBucket` with your project ID
   - Set `MAIN_FILE_NAME` to your file name

4. **Upload Your File:**
   - Go to Firebase Storage
   - Upload your .exe or .zip file
   - Note the file name

5. **Deploy:**
   - Push to GitHub
   - Deploy on Render

## 🔥 **Why Firebase?**

- ✅ **Simple** - No complex API setup
- ✅ **Reliable** - Google's infrastructure  
- ✅ **Fast** - Global CDN
- ✅ **Secure** - Built-in authentication
- ✅ **Easy** - Direct file access

## 📡 **API Endpoints**

- `GET /health` - Health check
- `GET /api/download/main-exe` - Download main executable
- `POST /api/auth/login` - Authenticate client
- `POST /api/files/upload` - Upload file (authenticated)
- `GET /api/files/list` - List files (authenticated)

## 🔐 **Security**

- File encryption before storage
- JWT token authentication
- Rate limiting and CORS protection
- Firebase security rules

## 🎯 **Compatible with Emon Xiter Bypass**

Just update the server URL in your Emon Xiter Bypass:
```csharp
private static string serverUrl = "https://your-firebase-server.onrender.com";
```

**Firebase is much simpler than Google Drive API!** 🎉
