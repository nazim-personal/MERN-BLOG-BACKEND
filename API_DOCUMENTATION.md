# API Documentation

## Base URL
```
http://localhost:3018/api
```

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Post Management](#post-management)
4. [Comment Management](#comment-management)
5. [Admin Dashboard](#admin-dashboard)
6. [Rate Limiting](#rate-limiting)
7. [Error Responses](#error-responses)
8. [Social Login](#social-login)
---

## Authentication

### Register User
Create a new user account.

**Endpoint:** `POST /v1/auth/register`
**Rate Limit:** 3 requests per hour per IP
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass@123",
  "name": "John Doe"
}
```

**Success Response (200):**
```json
{
  "message": "User registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "permissions": ["posts:create", "posts:edit:own", "posts:delete:own", "posts:view", "comments:create", "comments:edit:own", "comments:delete:own"],
    "createdAt": "2026-01-13T17:00:00.000Z"
  },
  "success": true
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3018/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass@123",
    "name": "John Doe"
  }'
```

---

### Login
Authenticate and receive access and refresh tokens.

**Endpoint:** `POST /v1/auth/login`
**Rate Limit:** 5 attempts per 15 minutes per IP
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass@123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "permissions": ["posts:create", "posts:edit:own", "posts:delete:own", "posts:view", "comments:create", "comments:edit:own", "comments:delete:own"]
    }
  },
  "success": true
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3018/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass@123"
  }'
```

---

### Get Current User
Retrieve the profile of the currently authenticated user.

**Endpoint:** `GET /v1/auth/me`
**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "message": "User profile retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "permissions": ["posts:create", "posts:edit:own", "posts:delete:own", "posts:view", "comments:create", "comments:edit:own", "comments:delete:own"]
  },
  "success": true
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3018/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"
```

---

### Refresh Token
Get a new access token using a refresh token.

**Endpoint:** `POST /v1/auth/refresh-token`
**Rate Limit:** 10 requests per 15 minutes per IP
**Authentication:** Not required

**Request Body:**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Success Response (200):**
```json
{
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "permissions": ["posts:create", "posts:edit:own", "posts:delete:own", "posts:view", "comments:create", "comments:edit:own", "comments:delete:own"]
    }
  },
  "success": true
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3018/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "a1b2c3d4e5f6..."
  }'
```

---

### Social Login
Authenticate using social providers (Google, Facebook).

#### Google Login
Initiate Google OAuth flow.

**Endpoint:** `GET /v1/auth/google`
**Authentication:** Not required

**Redirects:**
- Redirects to Google's consent screen.
- On success, redirects to `GET /v1/auth/google/callback`.

#### Google Callback
Handle Google OAuth callback.

**Endpoint:** `GET /v1/auth/google/callback`
**Authentication:** Not required (Handled by Passport)

**Success Response:**
- Redirects to the frontend application with tokens in query parameters.
- Example: `http://localhost:3000/dashboard?token=...&refreshToken=...`

#### Facebook Login
Initiate Facebook OAuth flow.

**Endpoint:** `GET /v1/auth/facebook`
**Authentication:** Not required

**Redirects:**
- Redirects to Facebook's consent screen.
- On success, redirects to `GET /v1/auth/facebook/callback`.

#### Facebook Callback
Handle Facebook OAuth callback.

**Endpoint:** `GET /v1/auth/facebook/callback`
**Authentication:** Not required (Handled by Passport)

**Success Response:**
- Redirects to the frontend application with tokens in query parameters.
- Example: `http://localhost:3000/dashboard?accessToken=...&refreshToken=...`

---

### Logout
Invalidate the current session.

**Endpoint:** `POST /v1/auth/logout`
**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully",
  "success": true
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3018/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## User Management

### List Users
Get a paginated list of users (requires `users:view` permission).

**Endpoint:** `GET /v1/auth/users`
**Authentication:** Required
**Required Permission:** `users:view`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (`user`, `admin`)

**Success Response (200):**
```json
{
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "permissions": ["posts:create", "posts:edit:own", "posts:delete:own", "posts:view"],
      "customPermissions": [],
      "createdAt": "2026-01-13T17:00:00.000Z"
    }
  ],
  "success": true
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3018/api/v1/auth/users?page=1&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

---

### Update User Role
Update a user's role (requires `users:manage` permission - ADMIN only).

**Endpoint:** `POST /v1/auth/users/:userId/role`
**Authentication:** Required
**Required Permission:** `users:manage` (ADMIN only)

**Request Body:**
```json
{
  "role": "admin"
}
```

**Success Response (200):**
```json
{
  "message": "User role updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "permissions": ["users:view", "users:manage", "permissons:manage", "posts:create", "posts:edit:own", "posts:delete:own", "posts:view", "posts:manage:all", "comments:create", "comments:edit:own", "comments:delete:own", "comments:manage:all"]
  },
  "success": true
}
```

**cURL Example (Promote user to admin):**
```bash
curl -X POST http://localhost:3018/api/v1/auth/users/507f1f77bcf86cd799439011/role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

---

### Update User Permissions
Add or remove custom permissions for a user (requires `permissions:manage` permission - ADMIN only).

**Endpoint:** `POST /v1/auth/users/:userId/permissions`
**Authentication:** Required
**Required Permission:** `permissions:manage` (ADMIN only)

**Request Body:**
```json
{
  "action": "add",
  "permissions": ["posts:manage:all"]
}
```

**Success Response (200):**
```json
{
  "message": "User permissions updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "customPermissions": ["posts:manage:all"],
    "rolePermissions": ["posts:create", "posts:edit:own", "posts:delete:own", "posts:view"],
    "effectivePermissions": ["posts:create", "posts:edit:own", "posts:delete:own", "posts:view", "posts:manage:all"]
  },
  "success": true
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3018/api/v1/auth/users/507f1f77bcf86cd799439011/permissions \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add",
    "permissions": ["posts:manage:all"]
  }'
```

---

## Admin Dashboard

### Get Dashboard Statistics
Retrieve overview statistics for the admin dashboard (requires ADMIN role).

**Endpoint:** `GET /api/v1/admin/dashboard`
**Authentication:** Required (Bearer token)
**Required Role:** `admin`

**Success Response (200):**
```json
{
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "users": {
      "total": 150,
      "admins": 5,
      "regularUsers": 145
    },
    "posts": {
      "total": 450,
      "published": 400,
      "draft": 40,
      "archived": 10
    },
    "comments": {
      "total": 1200
    }
  },
  "success": true
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3018/api/v1/admin/dashboard \
  -H "Authorization: Bearer <admin_token>"
```

---

## Post Management

### Create Post
Create a new blog post (requires `posts:create` permission).

**Endpoint:** `POST /v1/posts`
**Authentication:** Required
**Required Permission:** `posts:create`

**Request Body:**
```json
{
  "title": "My First Blog Post",
  "content": "This is the content of my blog post...",
  "status": "draft",
  "tags": ["technology", "coding"]
}
```

**Success Response (201):**
```json
{
  "message": "Post created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "title": "My First Blog Post",
    "content": "This is the content of my blog post...",
    "author": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com"
    },
    "status": "draft",
    "tags": ["technology", "coding"],
    "slug": "my-first-blog-post",
    "createdAt": "2026-01-13T17:30:00.000Z",
    "updatedAt": "2026-01-13T17:30:00.000Z"
  },
  "success": true
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3018/api/v1/posts \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Blog Post",
    "content": "This is the content of my blog post...",
    "status": "draft",
    "tags": ["technology", "coding"]
  }'
```

---

### Update Post
Update an existing post (requires `posts:edit:own` permission or admin role).

**Endpoint:** `PUT /v1/posts/:postId`
**Authentication:** Required
**Required Permission:** `posts:edit:own` (own posts) or `posts:manage:all` (any post)

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "status": "published"
}
```

**Success Response (200):**
```json
{
  "message": "Post updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "title": "Updated Title",
    "content": "Updated content...",
    "author": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com"
    },
    "status": "published",
    "tags": ["technology", "coding"],
    "slug": "my-first-blog-post",
    "createdAt": "2026-01-13T17:30:00.000Z",
    "updatedAt": "2026-01-13T17:35:00.000Z"
  },
  "success": true
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3018/api/v1/posts/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "status": "published"
  }'
```

---

### Delete Post
Delete a post (requires `posts:delete:own` permission or admin role).

**Endpoint:** `DELETE /v1/posts/:postId`
**Authentication:** Required
**Required Permission:** `posts:delete:own` (own posts) or `posts:manage:all` (any post)

**Success Response (200):**
```json
{
  "message": "Post deleted successfully",
  "success": true
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3018/api/v1/posts/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <access_token>"
```

---

### Get Single Post
Retrieve a single post by ID.

**Endpoint:** `GET /v1/posts/:postId`
**Authentication:** Not required

**Success Response (200):**
```json
{
  "message": "Post retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "title": "My First Blog Post",
    "content": "This is the content of my blog post...",
    "author": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com"
    },
    "status": "published",
    "tags": ["technology", "coding"],
    "slug": "my-first-blog-post",
    "createdAt": "2026-01-13T17:30:00.000Z",
    "updatedAt": "2026-01-13T17:35:00.000Z"
  },
  "success": true
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3018/api/v1/posts/507f1f77bcf86cd799439012
```

---

### List All Posts
Get a paginated list of posts with optional filters.

**Endpoint:** `GET /v1/posts`
**Authentication:** Not required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (`draft`, `published`, `archived`)
- `tags` (optional): Comma-separated list of tags

**Success Response (200):**
```json
{
  "message": "Posts retrieved successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "My First Blog Post",
      "content": "This is the content of my blog post...",
      "author": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "user@example.com"
      },
      "status": "published",
      "tags": ["technology", "coding"],
      "slug": "my-first-blog-post",
      "createdAt": "2026-01-13T17:30:00.000Z",
      "updatedAt": "2026-01-13T17:35:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "success": true
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3018/api/v1/posts?page=1&limit=10&status=published&tags=technology,coding"
```

---

### List User Posts
Get all posts by a specific user.

**Endpoint:** `GET /v1/posts/user/:userId`
**Authentication:** Not required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status

**Success Response (200):**
```json
{
  "message": "User posts retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  },
  "success": true
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3018/api/v1/posts/user/507f1f77bcf86cd799439011?page=1&limit=10"
```

---

## Comment Management

### Create Comment
Add a new comment to a post (requires `comments:create` permission).

**Endpoint:** `POST /v1/posts/:postId/comments`
**Authentication:** Required
**Required Permission:** `comments:create`

**Request Body:**
```json
{
  "content": "This is a great post!",
  "parentId": "507f1f77bcf86cd799439013"
}
```

**Note**: `parentId` is optional and used for nested comments (replies).

**Success Response (201):**
```json
{
  "message": "Comment created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "content": "This is a great post!",
    "author": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "post": "507f1f77bcf86cd799439012",
    "parentId": "507f1f77bcf86cd799439013",
    "createdAt": "2026-01-13T18:00:00.000Z",
    "updatedAt": "2026-01-13T18:00:00.000Z"
  },
  "success": true
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3018/api/v1/posts/507f1f77bcf86cd799439012/comments \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a great reply!",
    "parentId": "507f1f77bcf86cd799439013"
  }'
```

---

### List Post Comments
Get a paginated list of comments for a specific post.

**Endpoint:** `GET /v1/posts/:postId/comments`
**Authentication:** Not required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `nested` (optional): Set to `true` to get hierarchical comment tree with nested replies (default: false)

**Success Response (200) - Default (flat list):**
```json
{
  "message": "Comments retrieved successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439013",
      "content": "This is a great post!",
      "author": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe"
      },
      "post": "507f1f77bcf86cd799439012",
      "parentId": null,
      "replyCount": 2,
      "createdAt": "2026-01-13T18:00:00.000Z",
      "updatedAt": "2026-01-13T18:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  },
  "success": true
}
```

**Success Response (200) - Nested (hierarchical tree):**
```json
{
  "message": "Comments retrieved successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439013",
      "content": "This is a great post!",
      "author": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe"
      },
      "post": "507f1f77bcf86cd799439012",
      "parentId": null,
      "replyCount": 2,
      "createdAt": "2026-01-13T18:00:00.000Z",
      "updatedAt": "2026-01-13T18:00:00.000Z",
      "replies": [
        {
          "id": "507f1f77bcf86cd799439014",
          "content": "I agree!",
          "author": {
            "id": "507f1f77bcf86cd799439015",
            "name": "Jane Smith"
          },
          "post": "507f1f77bcf86cd799439012",
          "parentId": "507f1f77bcf86cd799439013",
          "replyCount": 1,
          "createdAt": "2026-01-13T18:05:00.000Z",
          "updatedAt": "2026-01-13T18:05:00.000Z",
          "replies": [
            {
              "id": "507f1f77bcf86cd799439016",
              "content": "Me too!",
              "author": {
                "id": "507f1f77bcf86cd799439017",
                "name": "Bob Johnson"
              },
              "post": "507f1f77bcf86cd799439012",
              "parentId": "507f1f77bcf86cd799439014",
              "replyCount": 0,
              "createdAt": "2026-01-13T18:10:00.000Z",
              "updatedAt": "2026-01-13T18:10:00.000Z",
              "replies": []
            }
          ]
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  },
  "success": true
}
```

**cURL Example (flat list):**
```bash
curl -X GET "http://localhost:3018/api/v1/posts/507f1f77bcf86cd799439012/comments?page=1&limit=10"
```

**cURL Example (nested tree):**
```bash
curl -X GET "http://localhost:3018/api/v1/posts/507f1f77bcf86cd799439012/comments?page=1&limit=10&nested=true"
```

---

### Get Comment Replies
Get a paginated list of replies for a specific comment.

**Endpoint:** `GET /v1/comments/:commentId/replies`
**Authentication:** Not required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "message": "Replies retrieved successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439014",
      "content": "I agree!",
      "author": {
        "id": "507f1f77bcf86cd799439015",
        "name": "Jane Smith"
      },
      "post": "507f1f77bcf86cd799439012",
      "parentId": "507f1f77bcf86cd799439013",
      "replyCount": 1,
      "createdAt": "2026-01-13T18:05:00.000Z",
      "updatedAt": "2026-01-13T18:05:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  },
  "success": true
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3018/api/v1/comments/507f1f77bcf86cd799439013/replies?page=1&limit=10"
```

---

### Update Comment
Update an existing comment (requires `comments:edit:own` permission or admin role).

**Endpoint:** `PUT /v1/comments/:commentId`
**Authentication:** Required
**Required Permission:** `comments:edit:own` (own comments) or `comments:manage:all` (any comment)

**Request Body:**
```json
{
  "content": "Updated comment content..."
}
```

**Success Response (200):**
```json
{
  "message": "Comment updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "content": "Updated comment content...",
    "author": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "createdAt": "2026-01-13T18:00:00.000Z",
    "updatedAt": "2026-01-13T18:05:00.000Z"
  },
  "success": true
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3018/api/v1/comments/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated comment content..."
  }'
```

---

### Delete Comment
Delete a comment (requires `comments:delete:own` permission or admin role).

**Endpoint:** `DELETE /v1/comments/:commentId`
**Authentication:** Required
**Required Permission:** `comments:delete:own` (own comments) or `comments:manage:all` (any comment)

**Success Response (200):**
```json
{
  "message": "Comment deleted successfully",
  "success": true
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3018/api/v1/comments/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer <access_token>"
```

---

## Rate Limiting

The API implements rate limiting on authentication endpoints to prevent abuse:

- **Login:** 5 attempts per 15 minutes per IP
- **Register:** 3 attempts per hour per IP
- **Refresh Token:** 10 requests per 15 minutes per IP

When rate limit is exceeded, you'll receive:
```json
{
  "message": "Too many requests from this IP, please try again later",
  "success": false
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Title and content are required",
  "success": false
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid or expired access token",
  "success": false
}
```

### 403 Forbidden
```json
{
  "message": "You do not have permission to edit this post",
  "success": false
}
```

### 404 Not Found
```json
{
  "message": "Post not found",
  "success": false
}
```

---

## Roles and Permissions

### User Roles
1. **USER** (default)
   - Can create, edit, and delete own posts
   - Can create, edit, and delete own comments
   - Can view all published posts

2. **ADMIN**
   - All USER permissions
   - Can view all users
   - Can manage user roles and permissions
   - Can manage ALL posts (edit/delete/restore any post)
   - Can manage ALL comments (delete any comment)

### Permission List
- `users:view` - View all users
- `users:manage` - Manage user roles
- `permissions:manage` - Manage user permissions
- `posts:create` - Create new posts
- `posts:edit:own` - Edit own posts
- `posts:delete:own` - Delete own posts
- `posts:view` - View posts
- `posts:manage:all` - Manage all posts (admin)
- `comments:create` - Create new comments
- `comments:edit:own` - Edit own comments
- `comments:delete:own` - Delete own comments
- `comments:manage:all` - Manage all comments (admin)
