# MERN Blog Backend

A secure, scalable, and production-ready RESTful API backend for a blog application built with Node.js, Express, MongoDB, and TypeScript. Features comprehensive authentication, role-based access control (RBAC), social login, and optimized performance.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Security Features](#-security-features)
- [Performance Optimizations](#-performance-optimizations)
- [Testing](#-testing)
- [Contributing](#-contributing)

---

## ✨ Features

### Authentication & Authorization
- 🔐 **JWT-based Authentication** with access and refresh tokens
- 🔄 **Token Rotation** for enhanced security
- 👤 **Social Login** (Google & Facebook OAuth)
- 🛡️ **Role-Based Access Control (RBAC)** with Admin and User roles
- 🔑 **Session Management** with device tracking
- 🚪 **Logout** with session invalidation

### Blog Management
- 📝 **Post CRUD Operations** (Create, Read, Update, Delete)
- 💬 **Nested Comments** with unlimited depth
- 🏷️ **Tag System** for post categorization
- 📊 **Post Status** (Draft, Published, Archived)
- 🗑️ **Soft Delete** with restore functionality
- 🔍 **Advanced Filtering** by status, tags, and author

### Admin Features
- 📈 **Dashboard Statistics** (users, posts, comments)
- 👥 **User Management** (view, update roles, delete)
- 🔧 **Post Moderation** (approve, reject, delete)
- 📋 **Activity Logging** for audit trails

### Security
- 🛡️ **NoSQL Injection Prevention** (express-mongo-sanitize)
- 🔒 **Security Headers** (Helmet.js)
- 🚦 **Rate Limiting** on authentication endpoints
- ✅ **Input Validation** (Zod schemas)
- 🔐 **Password Hashing** (bcrypt with configurable rounds)
- 🚫 **Production Error Handling** (no stack trace leakage)
- 🔍 **ObjectId Validation** to prevent invalid queries

### Performance
- ⚡ **Optimized MongoDB Queries** (lean(), projection, indexes)
- 📊 **Compound & Partial Indexes** for fast lookups
- 🔄 **Connection Pooling** with optimized settings
- 📄 **Pagination** with max limit enforcement (100)
- 🎯 **Field Projection** to reduce bandwidth

---

## 🛠 Tech Stack

### Core
- **Runtime**: Node.js 20.x
- **Language**: TypeScript 5.x
- **Framework**: Express 5.x
- **Database**: MongoDB 8.x with Mongoose ODM

### Security
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Social Auth**: Passport.js (Google & Facebook strategies)
- **Security Headers**: Helmet
- **Input Sanitization**: express-mongo-sanitize
- **Validation**: Zod

### Development
- **Testing**: Jest with ts-jest
- **Hot Reload**: tsx watch
- **Linting**: TypeScript compiler

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.x or higher ([Download](https://nodejs.org/))
- **npm**: v10.x or higher (comes with Node.js)
- **MongoDB**: v8.x or higher ([Download](https://www.mongodb.com/try/download/community))
  - Or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud database)
- **Git**: For cloning the repository

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mern-blog-backend.git
cd mern-blog-backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Production dependencies (Express, Mongoose, JWT, etc.)
- Development dependencies (TypeScript, Jest, etc.)

### 3. Verify Installation

```bash
npm run build
```

If successful, you should see a `dist` folder created with compiled JavaScript files.

---

## ⚙️ Environment Setup

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit the `.env` file with your configuration:

```bash
# Server Configuration
PORT=3018
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mern-blog-db

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this-in-production
JWT_ACCESS_TTL=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_TTL_MS=604800000

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Security Configuration
BCRYPT_ROUNDS=12

# Rate Limiting Configuration (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration (optional)
REQUEST_LOG=true
LOG_LEVEL=info

# CORS Configuration (optional)
CORS_ORIGIN=http://localhost:3000

# Frontend Configuration (for OAuth redirects)
FRONTEND_URL=http://localhost:3000

# OAuth Configuration (optional - only if using social login)
BASE_URL=http://localhost:3018
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### 3. Environment Variables Explained

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3018 |
| `NODE_ENV` | Environment (development/production) | Yes | development |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_ACCESS_SECRET` | Secret for access tokens | Yes | - |
| `JWT_ACCESS_TTL` | Access token expiry | No | 15m |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Yes | - |
| `JWT_REFRESH_TTL_MS` | Refresh token expiry (ms) | No | 604800000 |
| `SESSION_SECRET` | Session secret | Yes | - |
| `BCRYPT_ROUNDS` | Password hashing rounds | No | 12 |
| `CORS_ORIGIN` | Allowed CORS origin | No | http://localhost:3000 |
| `FRONTEND_URL` | Frontend URL for redirects | No | http://localhost:3000 |

> **⚠️ Security Warning**: Never commit your `.env` file to version control. Always use strong, unique secrets in production.

### 4. Setup MongoDB

#### Option A: Local MongoDB

1. Start MongoDB service:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community

   # Linux (systemd)
   sudo systemctl start mongod

   # Windows
   net start MongoDB
   ```

2. Verify connection:
   ```bash
   mongosh
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mern-blog-db
   ```

### 5. Setup Social Login (Optional)

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3018/api/v1/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

#### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Add redirect URI: `http://localhost:3018/api/v1/auth/facebook/callback`
5. Copy App ID and App Secret to `.env`

---

## 🏃 Running the Application

### Development Mode

Start the server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3018` (or your configured PORT).

### Production Mode

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Health Check

Verify the server is running:

```bash
curl http://localhost:3018/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "uptime": 123.456,
    "timestamp": "2026-01-14T10:00:00.000Z",
    "environment": "development"
  }
}
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:3018/api/v1
```

### Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### API Endpoints Overview

#### Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and invalidate session
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/facebook` - Initiate Facebook OAuth

#### Posts (`/posts`)
- `GET /posts` - List all posts (with pagination)
- `GET /posts/:id` - Get single post
- `POST /posts` - Create new post (authenticated)
- `PUT /posts/:id` - Update post (authenticated, owner/admin)
- `DELETE /posts/:id` - Delete post (authenticated, owner/admin)
- `PATCH /posts/:id/status` - Update post status (admin)

#### Comments (`/comments`)
- `GET /posts/:postId/comments` - List comments for a post
- `POST /posts/:postId/comments` - Create comment (authenticated)
- `PUT /comments/:id` - Update comment (authenticated, owner)
- `DELETE /comments/:id` - Delete comment (authenticated, owner/admin)

#### Admin (`/admin`)
- `GET /admin/dashboard` - Get dashboard statistics (admin)
- `GET /admin/users` - List all users (admin)
- `PATCH /admin/users/:id/role` - Update user role (admin)
- `DELETE /admin/users/:id` - Delete user (admin)

### Request/Response Format

#### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

#### Paginated Response
```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Detailed API Documentation

For complete API documentation with request/response examples, see:
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 📁 Project Structure

```
mern-blog-backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── passport.ts      # Passport OAuth strategies
│   │   ├── roles.ts         # RBAC role definitions
│   │   └── types.ts         # TypeScript type definitions
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── post.controller.ts
│   │   ├── comment.controller.ts
│   │   └── admin.controller.ts
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── post.service.ts
│   │   ├── comment.service.ts
│   │   ├── admin.service.ts
│   │   ├── session.service.ts
│   │   └── activity-log.service.ts
│   ├── repositories/        # Database operations
│   │   ├── user.repository.ts
│   │   ├── post.repository.ts
│   │   ├── comment.repository.ts
│   │   ├── session.repository.ts
│   │   └── activity-log.repository.ts
│   ├── models/              # Mongoose schemas
│   │   ├── user.model.ts
│   │   ├── post.model.ts
│   │   ├── comment.model.ts
│   │   ├── session.model.ts
│   │   └── activity-log.model.ts
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── permission.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── activity-logger.middleware.ts
│   ├── validation/          # Zod validation schemas
│   │   ├── auth.validation.ts
│   │   ├── post.validation.ts
│   │   └── comment.validation.ts
│   ├── utils/               # Utility functions
│   │   ├── logger.ts
│   │   ├── sanitization.util.ts
│   │   └── response.util.ts
│   ├── errors/              # Error handling
│   │   ├── custom-errors.ts
│   │   └── error-handler.ts
│   ├── routes/              # API routes
│   │   ├── auth.routes.ts
│   │   ├── post.routes.ts
│   │   ├── comment.routes.ts
│   │   └── admin.routes.ts
│   ├── index.ts             # Main module
│   └── server.ts            # Application entry point
├── tests/                   # Test files
│   ├── unit/
│   └── integration/
├── dist/                    # Compiled JavaScript (generated)
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

### Architecture Pattern

The application follows a **layered architecture**:

1. **Controllers**: Handle HTTP requests/responses
2. **Services**: Contain business logic
3. **Repositories**: Manage database operations
4. **Models**: Define data schemas
5. **Middlewares**: Process requests before controllers

This separation ensures:
- ✅ Clean code organization
- ✅ Easy testing
- ✅ Maintainability
- ✅ Scalability

---

## 🔒 Security Features

### 1. NoSQL Injection Prevention
- **express-mongo-sanitize** removes `$` and `.` from user input
- Logs all sanitization attempts for monitoring

### 2. Security Headers
- **Helmet.js** sets secure HTTP headers:
  - Content Security Policy (CSP)
  - HTTP Strict Transport Security (HSTS)
  - X-Frame-Options (clickjacking protection)
  - X-Content-Type-Options (MIME sniffing protection)

### 3. Password Security
- Passwords hashed with **bcrypt** (12 rounds by default)
- Strong password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

### 4. Rate Limiting
- Authentication endpoints limited to prevent brute force
- Configurable limits per endpoint

### 5. Input Validation
- **Zod** schemas validate all incoming data
- Type-safe validation with TypeScript

### 6. Production Error Handling
- Stack traces hidden in production
- Sensitive data removed from error responses
- Detailed logging for debugging

### 7. ObjectId Validation
- All MongoDB ObjectIds validated before queries
- Prevents invalid query errors and potential exploits

---

## ⚡ Performance Optimizations

### 1. Database Optimizations

#### Indexes
- **Compound indexes** for multi-field queries
- **Partial indexes** for conditional queries
- **Sparse indexes** for optional fields (social login)

```typescript
// Example: User model indexes
UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ googleId: 1 }, { sparse: true, unique: true });
```

#### Query Optimization
- **lean()** for read-only queries (30-50% faster)
- **Field projection** to reduce bandwidth
- **Pagination** with max limit enforcement (100)

```typescript
// Example: Optimized query
return await PostModel
  .find(query)
  .select('title content author status tags')
  .populate('author', 'name email')
  .lean();
```

### 2. Connection Pooling

```typescript
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### 3. Graceful Shutdown
- Properly closes database connections
- Prevents data corruption
- Handles SIGTERM and SIGINT signals

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/
│   ├── admin.service.test.ts
│   └── ...
└── integration/
    ├── auth.routes.test.ts
    ├── post.routes.test.ts
    └── admin.routes.test.ts
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use meaningful variable/function names
- Add comments for complex logic
- Write tests for new features

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM
- [Passport.js](http://www.passportjs.org/) - Authentication middleware
- [Zod](https://zod.dev/) - Schema validation
- [Helmet](https://helmetjs.github.io/) - Security headers

---

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact via email

---

**Happy Coding! 🚀**
