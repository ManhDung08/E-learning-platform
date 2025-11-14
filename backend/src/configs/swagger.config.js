import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const getSwaggerSpecs = () => {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "E-Learning Platform API",
        version: "1.0.0",
        description: "API documentation for E-Learning Platform",
        contact: {
          name: "API Support",
          email: "dung08122003@gmail.com",
        },
      },
      servers: [
        {
          url: `${process.env.HOST}:${process.env.PORT}/api`,
          description: "Development server",
        },
        {
          url: process.env.PRODUCTION_URL,
          description: "Production server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "access_token",
          },
        },
        schemas: {
          Error: {
            type: "object",
            description: "Error response format",
            properties: {
              success: {
                type: "boolean",
                example: false,
                description: "Always false for error responses",
              },
              message: {
                type: "string",
                example: "Validation error",
                description: "Human-readable error message",
              },
              error: {
                type: "object",
                properties: {
                  code: {
                    type: "string",
                    example: "validation_error",
                    description: "Machine-readable error code",
                  },
                  field: {
                    type: "string",
                    example: "email",
                    description: "Field that caused the error (if applicable)",
                    nullable: true,
                  },
                },
                description: "Additional error details",
              },
            },
            required: ["success", "message"],
          },
          User: {
            type: "object",
            description: "Complete user object with all profile fields",
            properties: {
              id: {
                type: "integer",
                example: 1,
                description: "User ID",
              },
              email: {
                type: "string",
                format: "email",
                example: "user@example.com",
                description: "User's email address",
              },
              username: {
                type: "string",
                example: "john_doe",
                description: "User's username",
              },
              firstName: {
                type: "string",
                nullable: true,
                example: "John",
                description: "User's first name",
              },
              lastName: {
                type: "string",
                nullable: true,
                example: "Doe",
                description: "User's last name",
              },
              gender: {
                type: "string",
                enum: ["male", "female", "other"],
                nullable: true,
                example: "male",
                description: "User's gender",
              },
              dateOfBirth: {
                type: "string",
                format: "date",
                nullable: true,
                example: "1990-01-15",
                description: "User's date of birth",
              },
              phoneNumber: {
                type: "string",
                nullable: true,
                example: "+1234567890",
                description: "User's phone number",
              },
              profileImageUrl: {
                type: "string",
                nullable: true,
                example: "https://example.com/avatar.jpg",
                description: "URL to user's profile image",
              },
              role: {
                type: "string",
                enum: ["student", "instructor", "admin"],
                example: "student",
                description: "User's role in the system",
              },
              emailVerified: {
                type: "boolean",
                example: true,
                description: "Whether the user's email is verified",
              },
              isActive: {
                type: "boolean",
                example: true,
                description: "Whether the user account is active",
              },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2023-01-15T08:30:00Z",
                description: "Account creation timestamp",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                example: "2023-01-15T08:30:00Z",
                description: "Last update timestamp",
              },
            },
            required: [
              "id",
              "email",
              "username",
              "role",
              "emailVerified",
              "isActive",
              "createdAt",
              "updatedAt",
            ],
          },
          LoginRequest: {
            type: "object",
            required: ["username", "password"],
            properties: {
              username: {
                type: "string",
                description: "Username or email",
                example: "john_doe or john@example.com",
              },
              password: {
                type: "string",
                format: "password",
                example: "password123",
              },
            },
          },
          SignupRequest: {
            type: "object",
            required: ["username", "email", "password"],
            properties: {
              username: {
                type: "string",
                minLength: 3,
                maxLength: 30,
                pattern: "^[a-zA-Z0-9_]+$",
                example: "john_doe",
              },
              email: {
                type: "string",
                format: "email",
                example: "john@example.com",
              },
              password: {
                type: "string",
                format: "password",
                minLength: 6,
                example: "password123",
              },
              firstName: {
                type: "string",
                maxLength: 50,
                nullable: true,
                example: "John",
              },
              lastName: {
                type: "string",
                maxLength: 50,
                nullable: true,
                example: "Doe",
              },
              gender: {
                type: "string",
                enum: ["male", "female", "other"],
                nullable: true,
              },
              dateOfBirth: {
                type: "string",
                format: "date",
                nullable: true,
                example: "1990-01-15",
              },
              phoneNumber: {
                type: "string",
                pattern: "^\\+?[0-9]{7,15}$",
                nullable: true,
                example: "+1234567890",
              },
              role: {
                type: "string",
                enum: ["student", "instructor", "admin"],
                default: "student",
                nullable: true,
              },
            },
          },
          AuthResponse: {
            type: "object",
            description: "Authentication response format",
            properties: {
              success: {
                type: "boolean",
                example: true,
                description: "Indicates if the operation was successful"
              },
              message: {
                type: "string",
                example: "Login successful",
                description: "Human-readable success message"
              },
              data: {
                type: "object",
                properties: {
                  userId: {
                    type: "integer",
                    example: 1,
                    description: "User ID (for signup responses)"
                  }
                },
                description: "Additional response data (optional)",
                nullable: true
              }
            },
            required: ["success", "message"]
          },
          UserResponse: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                example: true,
              },
              message: {
                type: "string",
                example: "Profile retrieved successfully",
              },
              data: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                  },
                  username: {
                    type: "string",
                  },
                  profileImageUrl: {
                    type: "string",
                    nullable: true,
                  },
                  firstName: {
                    type: "string",
                    nullable: true,
                  },
                  lastName: {
                    type: "string",
                    nullable: true,
                  },
                  gender: {
                    type: "string",
                    enum: ["male", "female", "other"],
                    nullable: true,
                  },
                  dateOfBirth: {
                    type: "string",
                    format: "date",
                    nullable: true,
                  },
                  phoneNumber: {
                    type: "string",
                    nullable: true,
                  },
                },
              },
            },
          },
          UpdateProfileRequest: {
            type: "object",
            properties: {
              username: {
                type: "string",
                minLength: 3,
                maxLength: 30,
                pattern: "^[a-zA-Z0-9_]+$",
                example: "john_doe",
              },
              firstName: {
                type: "string",
                maxLength: 50,
                nullable: true,
                example: "John",
              },
              lastName: {
                type: "string",
                maxLength: 50,
                nullable: true,
                example: "Doe",
              },
              gender: {
                type: "string",
                enum: ["male", "female", "other"],
                nullable: true,
              },
              dateOfBirth: {
                type: "string",
                format: "date",
                nullable: true,
                example: "1990-01-15",
              },
              phoneNumber: {
                type: "string",
                pattern: "^\\+?[0-9]{7,15}$",
                nullable: true,
                example: "+1234567890",
              },
            },
          },
          ChangePasswordRequest: {
            type: "object",
            required: ["currentPassword", "newPassword"],
            properties: {
              currentPassword: {
                type: "string",
                format: "password",
                minLength: 6,
                example: "currentpass123",
              },
              newPassword: {
                type: "string",
                format: "password",
                minLength: 6,
                example: "newpass123",
              },
            },
          },
          SetPasswordRequest: {
            type: "object",
            required: ["newPassword"],
            properties: {
              newPassword: {
                type: "string",
                format: "password",
                minLength: 6,
                example: "newpass123",
              },
            },
          },
          ForgotPasswordRequest: {
            type: "object",
            required: ["email"],
            properties: {
              email: {
                type: "string",
                format: "email",
                example: "user@example.com",
              },
            },
          },
          ResetPasswordRequest: {
            type: "object",
            required: ["token", "newPassword"],
            properties: {
              token: {
                type: "string",
                example: "reset-token-string",
              },
              newPassword: {
                type: "string",
                format: "password",
                minLength: 6,
                example: "newpassword123",
              },
            },
          },
          ResendVerificationRequest: {
            type: "object",
            required: ["email"],
            properties: {
              email: {
                type: "string",
                format: "email",
                example: "user@example.com",
              },
            },
          },
          SuccessResponse: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                example: true,
              },
              message: {
                type: "string",
                example: "Operation successful",
              },
            },
          },
          MessageResponse: {
            type: "object",
            description: "Simple success response with message",
            properties: {
              success: {
                type: "boolean",
                example: true,
                description: "Indicates if the operation was successful"
              },
              message: {
                type: "string",
                example: "Operation completed successfully",
                description: "Human-readable success message"
              },
            },
            required: ["success", "message"]
          },
          PaginationInfo: {
            type: "object",
            properties: {
              currentPage: {
                type: "integer",
                example: 1,
                description: "Current page number",
              },
              totalPages: {
                type: "integer",
                example: 5,
                description: "Total number of pages",
              },
              totalCount: {
                type: "integer",
                example: 50,
                description: "Total number of items",
              },
              limit: {
                type: "integer",
                example: 10,
                description: "Number of items per page",
              },
              hasNextPage: {
                type: "boolean",
                example: true,
                description: "Whether there is a next page",
              },
              hasPreviousPage: {
                type: "boolean",
                example: false,
                description: "Whether there is a previous page",
              },
            },
          },
          UsersListResponse: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                example: true,
              },
              data: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/UserListItem",
                },
              },
              pagination: {
                $ref: "#/components/schemas/PaginationInfo",
              },
            },
          },
          UserListItem: {
            type: "object",
            description: "User object as returned by the getAllUsers endpoint",
            properties: {
              id: {
                type: "integer",
                example: 1,
                description: "User ID",
              },
              email: {
                type: "string",
                format: "email",
                example: "user@example.com",
                description: "User's email address",
              },
              username: {
                type: "string",
                example: "john_doe",
                description: "User's username",
              },
              firstName: {
                type: "string",
                nullable: true,
                example: "John",
                description: "User's first name",
              },
              lastName: {
                type: "string",
                nullable: true,
                example: "Doe",
                description: "User's last name",
              },
              role: {
                type: "string",
                enum: ["student", "instructor", "admin"],
                example: "student",
                description: "User's role in the system",
              },
              isActive: {
                type: "boolean",
                example: true,
                description: "Whether the user account is active",
              },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2023-01-15T08:30:00Z",
                description: "Account creation timestamp",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                example: "2023-01-15T08:30:00Z",
                description: "Last update timestamp",
              },
            },
            required: [
              "id",
              "email",
              "username",
              "role",
              "isActive",
              "createdAt",
              "updatedAt",
            ],
          },
          UserQueryParams: {
            type: "object",
            properties: {
              page: {
                type: "integer",
                minimum: 1,
                default: 1,
                description: "Page number for pagination",
                example: 1,
              },
              limit: {
                type: "integer",
                minimum: 1,
                maximum: 100,
                default: 10,
                description: "Number of items per page",
                example: 10,
              },
              search: {
                type: "string",
                description:
                  "Search term for filtering users by username, email, firstName, or lastName",
                example: "john",
              },
              role: {
                type: "string",
                enum: ["student", "instructor", "admin"],
                description: "Filter users by role",
                example: "student",
              },
              isActive: {
                type: "boolean",
                description: "Filter users by active status",
                example: true,
              },
            },
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
        {
          cookieAuth: [],
        },
      ],
    },
    apis: ["src/routes/*.js"],
  };

  return swaggerJSDoc(options);
};

export { getSwaggerSpecs, swaggerUi };
