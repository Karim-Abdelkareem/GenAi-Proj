# Auth Module

Authentication module with JWT-based authentication, password reset, and user management.

## 📁 Structure

```
src/modules/auth/
├── user.model.js          # User Mongoose model
├── auth.service.js        # Business logic
├── auth.controller.js    # HTTP request handlers
├── auth.routes.js        # Express routes
├── auth.validation.js     # Input validation
└── README.md             # This file
```

## 🚀 Features

- ✅ User registration
- ✅ User login with JWT
- ✅ Password reset via email token
- ✅ Update password
- ✅ Update profile
- ✅ Get current user
- ✅ Deactivate account
- ✅ Logout
- ✅ Role-based access control (user/admin)
- ✅ Password hashing with bcrypt
- ✅ JWT token generation and validation

## 📦 Dependencies

Make sure to install required packages:

```bash
npm install mongoose bcrypt jsonwebtoken express express-async-handler
```

## 🔧 Environment Variables

Add these to your `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
NODE_ENV=development
```

## 📝 API Endpoints

### Public Routes

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
PATCH /api/auth/reset-password/:token
Content-Type: application/json

{
  "password": "newpassword123"
}
```

### Protected Routes (Require Authentication)

All protected routes require `Authorization: Bearer <token>` header or `jwt` cookie.

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Password
```http
PATCH /api/auth/update-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Update Profile
```http
PATCH /api/auth/update-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

#### Deactivate Account
```http
DELETE /api/auth/deactivate
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

## 🔌 Integration

### 1. Add routes to your Express app

```javascript
// app.js or server.js
import express from "express";
import authRoutes from "./src/modules/auth/auth.routes.js";
import { globalErrorHandler } from "./src/middleware/errorHandler.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes
app.use("/api/auth", authRoutes);

// Error handler (must be last)
app.use(globalErrorHandler);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

### 2. Connect to MongoDB

```javascript
import { connectDB } from "./src/config/db.js";

connectDB();
```

### 3. Use authentication middleware

```javascript
import { protect, restrictTo } from "./src/middleware/auth.middleware.js";

// Protect route
router.get("/protected", protect, (req, res) => {
  res.json({ user: req.user });
});

// Restrict to admin
router.delete("/admin-only", protect, restrictTo("admin"), (req, res) => {
  res.json({ message: "Admin only" });
});
```

## 🔐 Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt (cost: 12)
2. **JWT Tokens**: Secure token-based authentication
3. **Password Reset**: Secure token generation with expiration
4. **Password Change Detection**: Tokens invalidated after password change
5. **Account Deactivation**: Users can be deactivated
6. **Role-Based Access**: Admin/user role system

## 📋 User Model Schema

```javascript
{
  name: String,
  email: String (unique, lowercase),
  password: String (hashed, min 8 chars),
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: "user" | "admin",
  active: Boolean,
  document: {
    chunksIds: [String],
    fileName: String,
    fileType: String,
    uploadedAt: Date,
    totalChunks: Number,
    atsScore: Object,
    personalInformation: Object,
    technicalSkills: [String],
    yearsOfExperience: Number,
    education: [Object]
  }
}
```

## 🧪 Example Usage

### Register and Login

```javascript
// Register
const registerResponse = await fetch("http://localhost:3000/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com",
    password: "password123"
  })
});

const { token } = await registerResponse.json();

// Use token for protected routes
const meResponse = await fetch("http://localhost:3000/api/auth/me", {
  headers: {
    "Authorization": `Bearer ${token}`
  }
});
```

## ⚠️ Notes

1. **Email Service**: The `forgotPassword` function currently returns the reset token in development mode. In production, implement an email service to send the token.

2. **Password Reset**: The reset token expires after 10 minutes.

3. **Cookie Security**: In production, ensure `secure: true` for cookies (HTTPS only).

4. **Error Handling**: All errors are handled by the global error handler middleware.

## 🔄 Next Steps

- [ ] Implement email service for password reset
- [ ] Add rate limiting for auth endpoints
- [ ] Add email verification
- [ ] Add 2FA support
- [ ] Add refresh token mechanism

