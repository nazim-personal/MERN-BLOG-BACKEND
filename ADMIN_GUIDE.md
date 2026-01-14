# Admin Guide

This guide provides instructions for administrative tasks including user role management, permission management, and post moderation.

## Table of Contents
1. [Getting Super Admin Access](#getting-super-admin-access)
2. [Managing User Roles](#managing-user-roles)
3. [Managing User Permissions](#managing-user-permissions)
4. [Managing Posts](#managing-posts)
5. [Security Best Practices](#security-best-practices)

---

## Getting Super Admin Access

### Initial Setup

When you first set up the application, you'll need to manually create a super admin user in the database or promote an existing user.

#### Method 1: Direct Database Update (MongoDB)

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/mern-blog-db

# Update an existing user to admin
db.users.updateOne(
  { email: "admin@example.com" },
  {
    $set: {
      role: "admin",
      permissions: [
        "users:view", "users:manage", "permissions:manage",
        "posts:create", "posts:edit:own", "posts:delete:own", "posts:view", "posts:manage:all",
        "comments:create", "comments:edit:own", "comments:delete:own", "comments:manage:all"
      ]
    }
  }
)
```

#### Method 2: Register and Promote via API

1. **Register a new user:**
```bash
curl -X POST http://localhost:3018/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SuperSecure@123",
    "name": "Super Admin"
  }'
```

2. **Manually update in database** (as shown in Method 1)

3. **Login to get access token:**
```bash
curl -X POST http://localhost:3018/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SuperSecure@123"
  }'
```

Save the `accessToken` from the response for subsequent requests.

---

## Managing User Roles

### View All Users

List all users in the system:

```bash
curl -X GET "http://localhost:3018/api/auth/users?page=1&limit=20" \
  -H "Authorization: Bearer <super_admin_token>"
```

### Filter Users by Role

Get all admins:
```bash
curl -X GET "http://localhost:3018/api/auth/users?role=admin" \
  -H "Authorization: Bearer <super_admin_token>"
```

Get all regular users:
```bash
curl -X GET "http://localhost:3018/api/auth/users?role=user" \
  -H "Authorization: Bearer <super_admin_token>"
```

### Promote User to Admin

**Important:** Only admin can update user roles.

```bash
curl -X PUT http://localhost:3018/api/auth/users/<USER_ID>/role \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

**Example:**
```bash
curl -X PUT http://localhost:3018/api/auth/users/507f1f77bcf86cd799439011/role \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

### Demote Admin to User

```bash
curl -X PUT http://localhost:3018/api/auth/users/<USER_ID>/role \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "user"
  }'
```

### Promote User to Super Admin

**Warning:** Use this with extreme caution. Super admins have full system access.

```bash
curl -X PUT http://localhost:3018/api/auth/users/<USER_ID>/role \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

---

## Managing User Permissions

### Understanding Permissions

Users have two types of permissions:
1. **Role Permissions:** Automatically granted based on their role
2. **Custom Permissions:** Additional permissions granted specifically to that user

Effective permissions = Role Permissions + Custom Permissions

### Add Custom Permissions

Grant a regular user the ability to manage all posts:

```bash
curl -X PUT http://localhost:3018/api/auth/users/<USER_ID>/permissions \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add",
    "permissions": ["posts:manage:all"]
  }'
```

Grant multiple permissions:

```bash
curl -X PUT http://localhost:3018/api/auth/users/<USER_ID>/permissions \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add",
    "permissions": ["posts:manage:all", "users:view", "activity:view"]
  }'
```

### Remove Custom Permissions

```bash
curl -X PUT http://localhost:3018/api/auth/users/<USER_ID>/permissions \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "remove",
    "permissions": ["posts:manage:all"]
  }'
```

### Available Permissions

- `profile:view` - View own profile
- `settings:manage` - Manage own settings
- `activity:view` - View activity logs
- `security:manage` - Manage security settings
- `users:view` - View all users
- `users:manage` - Manage user roles
- `permissions:manage` - Manage user permissions
- `posts:create` - Create new posts
- `posts:edit:own` - Edit own posts
- `posts:delete:own` - Delete own posts
- `posts:view` - View posts
- `posts:manage:all` - Manage all posts

---

## Managing Posts

### View All Posts

As an admin, you can view all posts:

```bash
curl -X GET "http://localhost:3018/api/posts?page=1&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

### View Posts by Status

View all draft posts:
```bash
curl -X GET "http://localhost:3018/api/posts?status=draft" \
  -H "Authorization: Bearer <admin_token>"
```

View all published posts:
```bash
curl -X GET "http://localhost:3018/api/posts?status=published" \
  -H "Authorization: Bearer <admin_token>"
```

### Edit Any User's Post

As an admin, you can edit any post:

```bash
curl -X PUT http://localhost:3018/api/posts/<POST_ID> \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated by Admin",
    "status": "published"
  }'
```

### Delete Any User's Post

As an admin, you can delete any post:

```bash
curl -X DELETE http://localhost:3018/api/posts/<POST_ID> \
  -H "Authorization: Bearer <admin_token>"
```

### Moderate Content

Change post status from published to archived:

```bash
curl -X PUT http://localhost:3018/api/posts/<POST_ID> \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "archived"
  }'
```

---

## Security Best Practices

### 1. Protect Super Admin Credentials

- Use strong, unique passwords for super admin accounts
- Store credentials in a secure password manager
- Never share super admin credentials
- Regularly rotate passwords

### 2. Limit Super Admin Accounts

- Only create super admin accounts when absolutely necessary
- Regularly audit super admin accounts
- Remove super admin access when no longer needed

### 3. Use Admin Roles Appropriately

- Grant admin role only to trusted users
- Regular users should not have admin privileges
- Review admin actions periodically

### 4. Monitor User Activities

- Regularly check the logs for suspicious activities
- Review user role changes
- Monitor post creation and deletion patterns

### 5. Environment Variables

Ensure these are set securely in production:

```bash
# Strong, random secrets (use a password generator)
JWT_ACCESS_SECRET=<strong-random-secret-64-chars>
JWT_REFRESH_SECRET=<different-strong-random-secret-64-chars>
SESSION_SECRET=<another-strong-random-secret-64-chars>

# Appropriate token expiration
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL_MS=604800000  # 7 days

# Secure MongoDB connection
MONGODB_URI=mongodb://username:password@host:port/database

# CORS - only allow your frontend
CORS_ORIGIN=https://yourdomain.com
```

### 6. Rate Limiting

The API has built-in rate limiting:
- Login: 5 attempts per 15 minutes
- Register: 3 attempts per hour
- Refresh Token: 10 requests per 15 minutes

Monitor rate limit violations in logs.

### 7. Regular Backups

- Backup the MongoDB database regularly
- Test restore procedures
- Keep backups in a secure location

### 8. HTTPS in Production

- Always use HTTPS in production
- Never send tokens over HTTP
- Use a reverse proxy (nginx, Apache) with SSL/TLS

---

## Common Admin Tasks

### Create a New Admin User

```bash
# 1. Register the user
curl -X POST http://localhost:3018/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@example.com",
    "password": "SecurePass@123",
    "name": "New Admin"
  }'

# 2. Get the user ID from the response, then promote to admin
curl -X PUT http://localhost:3018/api/auth/users/<USER_ID>/role \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

### Bulk User Management Script

Create a shell script for common tasks:

```bash
#!/bin/bash

# Configuration
API_URL="http://localhost:3018/api"
SUPER_ADMIN_TOKEN="your-super-admin-token"

# List all users
list_users() {
  curl -X GET "$API_URL/auth/users?limit=100" \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN"
}

# Promote user to admin
promote_to_admin() {
  USER_ID=$1
  curl -X PUT "$API_URL/auth/users/$USER_ID/role" \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"role": "admin"}'
}

# Usage
# ./admin-tasks.sh list
# ./admin-tasks.sh promote <user_id>
```

---

## Troubleshooting

### Can't Update User Roles

**Problem:** Getting "Only admin can update user roles" error

**Solution:** Ensure you're using a super admin token. Verify your role:
```bash
curl -X GET http://localhost:3018/api/auth/profile \
  -H "Authorization: Bearer <your_token>"
```

### Rate Limit Errors

**Problem:** Getting rate limit errors

**Solution:** Wait for the rate limit window to expire, or adjust rate limits in the code if needed for development.

### Token Expired

**Problem:** Getting "Invalid or expired access token" error

**Solution:** Use the refresh token to get a new access token:
```bash
curl -X POST http://localhost:3018/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<your_refresh_token>"}'
```

---

## Quick Reference

### Role Hierarchy
```
admin > ADMIN > USER
```

### Permission Levels
- **USER:** Basic permissions (profile, settings, own posts)
- **ADMIN:** User permissions + view users + manage all posts
- **admin:** Admin permissions + manage roles + manage permissions

### Key Endpoints
- Update role: `PUT /api/auth/users/:userId/role`
- Update permissions: `PUT /api/auth/users/:userId/permissions`
- List users: `GET /api/auth/users`
- Manage posts: `PUT/DELETE /api/posts/:postId`
