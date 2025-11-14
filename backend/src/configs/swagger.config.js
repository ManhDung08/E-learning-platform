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
          url: `${process.env.HOST}:${process.env.PORT}`,
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
            properties: {
              success: {
                type: "boolean",
                example: false,
              },
              message: {
                type: "string",
                example: "Error message",
              },
              error: {
                type: "object",
              },
            },
          },
          User: {
            type: "object",
            properties: {
              id: {
                type: "integer",
                example: 1,
              },
              email: {
                type: "string",
                format: "email",
              },
              username: {
                type: "string",
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
              profileImageUrl: {
                type: "string",
                nullable: true,
              },
              role: {
                type: "string",
                enum: ["student", "instructor", "admin"],
                default: "student",
              },
              emailVerified: {
                type: "boolean",
                default: false,
              },
              isActive: {
                type: "boolean",
                default: true,
              },
              createdAt: {
                type: "string",
                format: "date-time",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
              },
            },
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
            properties: {
              message: {
                type: "string",
                example: "Login successful",
              },
              userId: {
                type: "integer",
                example: 1,
              },
            },
          },
          UserResponse: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                example: true,
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
            properties: {
              message: {
                type: "string",
                example: "Operation completed successfully",
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
    apis: ["./src/routes/*.js"],
  };

  return swaggerJSDoc(options);
};

export { getSwaggerSpecs, swaggerUi };
