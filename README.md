# MERN Blog Backend

A production-ready authentication and authorization system with JWT tokens, role-based access control (RBAC), and blog post management.

## Features

✅ **JWT Authentication** - Access and refresh tokens
✅ **Role-Based Access Control** - USER, ADMIN, SUPER_ADMIN roles
✅ **Blog Post Management** - CRUD operations with ownership validation
✅ **Rate Limiting** - Protection against brute force attacks
✅ **Admin Functionality** - User and post management
✅ **Comprehensive Documentation** - API docs and admin guide

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd MERN-BLOG-BACKEND
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and update the values:
```env
PORT=3018
MONGODB_URI=mongodb://localhost:27017/mern-blog-db
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_ACCESS_TTL=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_TTL_MS=604800000
SESSION_SECRET=your-super-secret-session-key
CORS_ORIGIN=http://localhost:3000
```

4. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use your local MongoDB installation
mongod
```

5. **Run the application**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3018`

## Project Structure

```
src/
├── config/          # Configuration files (roles, types)
├── controllers/     # Request handlers
├── middlewares/     # Express middlewares (auth, rate limiting, etc.)
├── models/          # Mongoose schemas
├── repositories/    # Database operations
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── index.ts         # Module initialization
└── server.ts        # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate session

### User Management (Admin)
- `GET /api/auth/users` - List all users
- `PUT /api/auth/users/:userId/role` - Update user role
- `PUT /api/auth/users/:userId/permissions` - Update user permissions

### Blog Posts
- `POST /api/posts` - Create new post
- `GET /api/posts` - List all posts
- `GET /api/posts/:postId` - Get single post
- `PUT /api/posts/:postId` - Update post
- `DELETE /api/posts/:postId` - Delete post
- `GET /api/posts/user/:userId` - List user's posts

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## User Roles

### USER (Default)
- Create, edit, and delete own posts
- View all published posts
- Manage own profile and settings

### ADMIN
- All USER permissions
- Manage ALL posts (edit/delete any post)
- View all users
- Access activity and security logs

### SUPER_ADMIN
- All ADMIN permissions
- Manage user roles
- Manage user permissions

## Admin Setup

### Create First Super Admin

1. Register a user:
```bash
curl -X POST http://localhost:3018/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass@123",
    "name": "Super Admin"
  }'
```

2. Update role in MongoDB:
```bash
mongosh mongodb://localhost:27017/mern-blog-db
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "super_admin" } }
)
```

3. Login to get access token:
```bash
curl -X POST http://localhost:3018/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass@123"
  }'
```

For detailed admin instructions, see [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Short-lived access tokens (15 min) + long-lived refresh tokens (7 days)
- **Rate Limiting**:
  - Login: 5 attempts per 15 minutes
  - Register: 3 attempts per hour
  - Refresh: 10 requests per 15 minutes
- **CORS Protection**: Configurable allowed origins
- **Session Tracking**: Device and IP tracking
- **Permission-Based Authorization**: Fine-grained access control

## Development

### Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm start        # Start production server
npm test         # Run tests (not implemented yet)
```

### Code Style

- TypeScript for type safety
- ESM modules
- Class-based architecture
- Repository pattern for data access
- Service layer for business logic

## Testing

### Manual Testing

Test authentication:
```bash
# Register
curl -X POST http://localhost:3018/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123","name":"Test User"}'

# Login
curl -X POST http://localhost:3018/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123"}'
```

Test post creation:
```bash
curl -X POST http://localhost:3018/api/posts \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Post","content":"Post content here"}'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3018` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/mern-blog-db` |
| `JWT_ACCESS_SECRET` | Secret for access tokens | `access-secret` |
| `JWT_ACCESS_TTL` | Access token expiration | `15m` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | `refresh-secret` |
| `JWT_REFRESH_TTL_MS` | Refresh token expiration (ms) | `604800000` (7 days) |
| `SESSION_SECRET` | Session secret | `session-secret` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference with examples
- [Admin Guide](./ADMIN_GUIDE.md) - Admin functionality and user management
- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Technical implementation details

## Dependencies

### Production
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT implementation
- `bcrypt` - Password hashing
- `cors` - CORS middleware
- `express-rate-limit` - Rate limiting
- `dotenv` - Environment variables
- `class-validator` - Validation decorators
- `class-transformer` - Object transformation

### Development
- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution
- `nodemon` - Development server
- `@types/*` - Type definitions

## License

ISC

## Support

For issues and questions, please create an issue in the repository.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] Audit logging
- [ ] Comment system
- [ ] Post categories
- [ ] Search functionality
- [ ] File upload for images
- [ ] Analytics
- [ ] Unit and integration tests

---

**Built with ❤️ using Node.js, Express, TypeScript, and MongoDB**
