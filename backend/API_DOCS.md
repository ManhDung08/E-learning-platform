# E-Learning Platform API Documentation

## Overview

This is the backend API for the E-Learning Platform, providing authentication, user management, and OAuth2 integration capabilities.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- AWS S3 (for file uploads)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env`)
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

Once the server is running, you can access the interactive API documentation at:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **API Info**: `http://localhost:3000/api`

## Authentication

The API supports multiple authentication methods:

### 1. JWT Token (Bearer)

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### 2. Cookie Authentication

The API automatically sets HTTP-only cookies upon successful login.

### 3. OAuth2 (Google)

Use the `/api/oauth2/google` endpoint to initiate Google OAuth2 flow.

## API Endpoints

### Authentication (`/api/auth`)

- `POST /login` - User login
- `POST /signup` - User registration
- `GET /verify-email` - Email verification
- `POST /resend-verification` - Resend verification email
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /logout` - User logout

### User Management (`/api/users`)

- `GET /me` - Get current user profile
- `PUT /update-profile` - Update user profile
- `POST /upload-avatar` - Upload user avatar
- `DELETE /delete-avatar` - Delete user avatar
- `PUT /change-password` - Change password
- `PUT /set-password` - Set password (for OAuth users)

#### Admin Only Endpoints

- `GET /` - Get all users with pagination, filtering, and search
  - Query parameters:
    - `page` (integer, default: 1) - Page number for pagination
    - `limit` (integer, default: 10, max: 100) - Number of users per page
    - `search` (string) - Search term for username, email, firstName, or lastName
    - `role` (string) - Filter by user role (student, instructor, admin)
    - `isActive` (boolean) - Filter by active status
- `GET /:id` - Get user by ID
- `POST /` - Create new user
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user

### OAuth2 (`/api/oauth2`)

- `GET /google` - Initiate Google OAuth2
- `GET /callback/google` - Google OAuth2 callback

## Error Handling

The API uses standard HTTP status codes and returns consistent response formats:

**Success Response Format:**
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data (optional)
  }
}
```

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "error_code",
    "field": "field_name" // Optional
  }
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

## Data Models

### User Schema

```json
{
  "id": "integer",
  "email": "string",
  "username": "string", 
  "firstName": "string|null",
  "lastName": "string|null",
  "gender": "string|null",
  "dateOfBirth": "date|null",
  "phoneNumber": "string|null",
  "profileImageUrl": "string|null",
  "role": "string",
  "emailVerified": "boolean",
  "isActive": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Pagination Response

For endpoints that support pagination (like `GET /api/users`), the response includes pagination metadata:

```json
{
  "success": true,
  "data": [
    // Array of items (e.g., users)
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "limit": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Pagination Fields

- `currentPage` - Current page number
- `totalPages` - Total number of pages available
- `totalCount` - Total number of items across all pages
- `limit` - Number of items per page
- `hasNextPage` - Boolean indicating if there's a next page
- `hasPreviousPage` - Boolean indicating if there's a previous page

## File Uploads

The API supports file uploads for user avatars. Files are uploaded to AWS S3 and the URLs are stored in the database.

### Supported Image Formats

- JPEG
- PNG
- WebP
- GIF

### File Size Limits

- Maximum file size: 5MB
- Recommended dimensions: 400x400px

## Rate Limiting

Rate limiting is implemented to prevent abuse:

- 100 requests per minute per IP for general endpoints
- 5 requests per minute per IP for authentication endpoints

## Security Features

- Password hashing with bcrypt
- JWT tokens with expiration
- HTTP-only cookies
- CORS configuration
- Input validation and sanitization
- SQL injection prevention with Prisma ORM
- XSS protection

## Development

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
HOST=http://localhost
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/elearning"

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-email-password

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket

# OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Database Schema

The application uses Prisma ORM with PostgreSQL. The main entities are:

- Users (with profiles and authentication data)
- Email verification tokens
- Password reset tokens

### Testing

Run tests with:

```bash
npm test
```

### Deployment

For production deployment:

1. Set up production environment variables
2. Build the application if needed
3. Run database migrations
4. Start the server with PM2 or similar process manager

## Support

For API support or questions:

- Email: support@elearning.com
- Documentation: `/api-docs`

## Version History

- **v1.0.0** - Initial release with authentication and user management
