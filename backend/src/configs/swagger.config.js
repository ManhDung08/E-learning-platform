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
                description: "Indicates if the operation was successful",
              },
              message: {
                type: "string",
                example: "Login successful",
                description: "Human-readable success message",
              },
              data: {
                type: "object",
                properties: {
                  userId: {
                    type: "integer",
                    example: 1,
                    description: "User ID (for signup responses)",
                  },
                },
                description: "Additional response data (optional)",
                nullable: true,
              },
            },
            required: ["success", "message"],
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
                description: "Indicates if the operation was successful",
              },
              message: {
                type: "string",
                example: "Operation completed successfully",
                description: "Human-readable success message",
              },
            },
            required: ["success", "message"],
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
          Course: {
            type: "object",
            description: "Course object with complete information",
            properties: {
              id: {
                type: "integer",
                example: 1,
                description: "Course ID",
              },
              title: {
                type: "string",
                example: "Introduction to Web Development",
                description: "Course title",
              },
              slug: {
                type: "string",
                example: "introduction-to-web-development",
                description: "Course URL slug",
              },
              description: {
                type: "string",
                example: "Learn the fundamentals of web development",
                description: "Course description",
              },
              image: {
                type: "string",
                nullable: true,
                example: "https://example.com/course-image.jpg",
                description: "Course thumbnail image URL",
              },
              priceVND: {
                type: "integer",
                example: 500000,
                description: "Course price in Vietnamese Dong",
              },
              isPublished: {
                type: "boolean",
                example: true,
                description: "Whether the course is published",
              },
              instructorId: {
                type: "integer",
                example: 2,
                description: "ID of the course instructor",
              },
              enrollmentCount: {
                type: "integer",
                example: 150,
                description: "Number of enrolled students",
              },
              averageRating: {
                type: "string",
                example: "4.5",
                description: "Average course rating",
              },
              totalLessons: {
                type: "integer",
                example: 25,
                description: "Total number of lessons",
              },
              totalDuration: {
                type: "integer",
                example: 7200,
                description: "Total course duration in seconds",
              },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2023-01-15T08:30:00Z",
                description: "Course creation timestamp",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                example: "2023-01-15T08:30:00Z",
                description: "Last update timestamp",
              },
              instructor: {
                type: "object",
                description: "Course instructor information",
                properties: {
                  id: {
                    type: "integer",
                    example: 2,
                  },
                  username: {
                    type: "string",
                    example: "instructor_john",
                  },
                  firstName: {
                    type: "string",
                    nullable: true,
                    example: "John",
                  },
                  lastName: {
                    type: "string",
                    nullable: true,
                    example: "Smith",
                  },
                  profileImageUrl: {
                    type: "string",
                    nullable: true,
                    example: "https://example.com/instructor-avatar.jpg",
                  },
                },
              },
              modules: {
                type: "array",
                description: "Course modules with lessons",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "integer",
                      example: 1,
                    },
                    title: {
                      type: "string",
                      example: "Getting Started",
                    },
                    order: {
                      type: "integer",
                      example: 1,
                    },
                    lessons: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "integer",
                            example: 1,
                          },
                          title: {
                            type: "string",
                            example: "Course Introduction",
                          },
                          durationSeconds: {
                            type: "integer",
                            nullable: true,
                            example: 300,
                          },
                          order: {
                            type: "integer",
                            example: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            required: [
              "id",
              "title",
              "slug",
              "description",
              "priceVND",
              "isPublished",
              "instructorId",
              "createdAt",
              "updatedAt",
            ],
          },
          CreateCourseRequest: {
            type: "object",
            required: ["title", "description", "priceVND"],
            properties: {
              title: {
                type: "string",
                minLength: 3,
                maxLength: 200,
                example: "Introduction to Web Development",
                description: "Course title",
              },
              description: {
                type: "string",
                minLength: 10,
                maxLength: 2000,
                example:
                  "Learn the fundamentals of web development including HTML, CSS, and JavaScript",
                description: "Course description",
              },
              priceVND: {
                type: "integer",
                minimum: 0,
                maximum: 1000000000,
                example: 500000,
                description:
                  "Course price in Vietnamese Dong (e.g., 500000 = 500,000 VND)",
              },
              image: {
                type: "string",
                nullable: true,
                format: "uri",
                example: "https://example.com/course-thumbnail.jpg",
                description: "Course thumbnail image URL",
              },
            },
          },
          UpdateCourseRequest: {
            type: "object",
            properties: {
              title: {
                type: "string",
                minLength: 3,
                maxLength: 200,
                example: "Advanced Web Development",
                description: "Course title",
              },
              description: {
                type: "string",
                minLength: 10,
                maxLength: 2000,
                example: "Advanced concepts in web development",
                description: "Course description",
              },
              priceVND: {
                type: "integer",
                minimum: 0,
                maximum: 1000000000,
                example: 750000,
                description: "Course price in Vietnamese Dong",
              },
              image: {
                type: "string",
                nullable: true,
                format: "uri",
                example: "https://example.com/new-course-image.jpg",
                description: "Course thumbnail image URL",
              },
              isPublished: {
                type: "boolean",
                example: true,
                description: "Whether to publish the course",
              },
            },
          },
          CourseResponse: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                example: true,
              },
              message: {
                type: "string",
                example: "Course retrieved successfully",
              },
              data: {
                $ref: "#/components/schemas/Course",
              },
            },
            required: ["success", "message", "data"],
          },
          CoursesResponse: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                example: true,
              },
              message: {
                type: "string",
                example: "Courses retrieved successfully",
              },
              data: {
                type: "object",
                properties: {
                  courses: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Course",
                    },
                  },
                  pagination: {
                    $ref: "#/components/schemas/PaginationInfo",
                  },
                },
              },
            },
            required: ["success", "message", "data"],
          },
          Enrollment: {
            type: "object",
            description: "Course enrollment information",
            properties: {
              id: {
                type: "integer",
                example: 1,
                description: "Enrollment ID",
              },
              userId: {
                type: "integer",
                example: 5,
                description: "Student ID",
              },
              courseId: {
                type: "integer",
                example: 3,
                description: "Course ID",
              },
              enrolledAt: {
                type: "string",
                format: "date-time",
                example: "2023-01-15T08:30:00Z",
                description: "Enrollment timestamp",
              },
              course: {
                type: "object",
                description: "Basic course information",
                properties: {
                  id: {
                    type: "integer",
                    example: 3,
                  },
                  title: {
                    type: "string",
                    example: "JavaScript Fundamentals",
                  },
                  description: {
                    type: "string",
                    example: "Learn JavaScript basics",
                  },
                  image: {
                    type: "string",
                    nullable: true,
                    example: "https://example.com/js-course.jpg",
                  },
                  progress: {
                    type: "integer",
                    example: 45,
                    description: "Course completion percentage",
                  },
                  totalLessons: {
                    type: "integer",
                    example: 20,
                    description: "Total number of lessons",
                  },
                  completedLessons: {
                    type: "integer",
                    example: 9,
                    description: "Number of completed lessons",
                  },
                },
              },
            },
          },
          EnrollmentResponse: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                example: true,
              },
              message: {
                type: "string",
                example: "Successfully enrolled in course",
              },
              data: {
                $ref: "#/components/schemas/Enrollment",
              },
            },
            required: ["success", "message", "data"],
          },
          EnrollmentsResponse: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                example: true,
              },
              message: {
                type: "string",
                example: "User enrollments retrieved successfully",
              },
              data: {
                type: "object",
                properties: {
                  enrollments: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Enrollment",
                    },
                  },
                  pagination: {
                    $ref: "#/components/schemas/PaginationInfo",
                  },
                },
              },
            },
            required: ["success", "message", "data"],
          },
          // Module Schemas
          Module: {
            type: "object",
            description: "Module information",
            properties: {
              id: {
                type: "integer",
                example: 1,
                description: "Module ID",
              },
              courseId: {
                type: "integer",
                example: 1,
                description: "Course ID",
              },
              title: {
                type: "string",
                example: "Introduction to JavaScript",
                description: "Module title",
              },
              order: {
                type: "integer",
                example: 1,
                description: "Module order within course",
              },
            },
            required: ["id", "courseId", "title", "order"],
          },
          ModuleWithLessons: {
            type: "object",
            description: "Module with lessons and statistics",
            allOf: [
              {
                $ref: "#/components/schemas/Module",
              },
              {
                type: "object",
                properties: {
                  lessons: {
                    type: "array",
                    description: "Module lessons",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "integer",
                          example: 1,
                        },
                        title: {
                          type: "string",
                          example: "Variables and Data Types",
                        },
                        durationSeconds: {
                          type: "integer",
                          nullable: true,
                          example: 600,
                          description: "Lesson duration in seconds",
                        },
                        order: {
                          type: "integer",
                          example: 1,
                        },
                        lessonProgress: {
                          type: "array",
                          description: "Progress for enrolled users only",
                          items: {
                            type: "object",
                            properties: {
                              isCompleted: {
                                type: "boolean",
                                example: false,
                              },
                              lastAccessedAt: {
                                type: "string",
                                format: "date-time",
                                nullable: true,
                              },
                              watchedSeconds: {
                                type: "integer",
                                nullable: true,
                                example: 300,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  totalLessons: {
                    type: "integer",
                    example: 5,
                    description: "Total number of lessons in module",
                  },
                  totalDuration: {
                    type: "integer",
                    example: 3000,
                    description: "Total duration in seconds",
                  },
                  course: {
                    type: "object",
                    description: "Basic course information",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1,
                      },
                      title: {
                        type: "string",
                        example: "JavaScript Fundamentals",
                      },
                      instructorId: {
                        type: "integer",
                        example: 2,
                      },
                    },
                  },
                },
              },
            ],
          },
          CreateModuleRequest: {
            type: "object",
            description: "Request body for creating a module",
            properties: {
              title: {
                type: "string",
                minLength: 3,
                maxLength: 100,
                example: "Introduction to JavaScript",
                description: "Module title",
              },
              order: {
                type: "integer",
                minimum: 1,
                example: 1,
                description:
                  "Module order (optional - auto-assigned if not provided)",
              },
            },
            required: ["title"],
          },
          UpdateModuleRequest: {
            type: "object",
            description: "Request body for updating a module",
            properties: {
              title: {
                type: "string",
                minLength: 3,
                maxLength: 100,
                example: "Advanced JavaScript Concepts",
                description: "Module title",
              },
              order: {
                type: "integer",
                minimum: 1,
                example: 2,
                description: "Module order within course",
              },
            },
          },
          ReorderModulesRequest: {
            type: "object",
            description: "Request body for reordering modules",
            properties: {
              moduleOrders: {
                type: "array",
                description: "Array of module IDs with their new orders",
                items: {
                  type: "object",
                  properties: {
                    moduleId: {
                      type: "integer",
                      example: 1,
                      description: "Module ID",
                    },
                    order: {
                      type: "integer",
                      example: 1,
                      description: "New order position",
                    },
                  },
                  required: ["moduleId", "order"],
                },
                example: [
                  { moduleId: 1, order: 2 },
                  { moduleId: 2, order: 1 },
                ],
              },
            },
            required: ["moduleOrders"],
          },
          // Lesson Schemas
          Lesson: {
            type: "object",
            description: "Lesson information",
            properties: {
              id: {
                type: "integer",
                example: 1,
                description: "Lesson ID",
              },
              moduleId: {
                type: "integer",
                example: 1,
                description: "Module ID",
              },
              title: {
                type: "string",
                example: "Introduction to Variables",
                description: "Lesson title",
              },
              content: {
                type: "string",
                example: "In this lesson, we'll learn about variables...",
                description: "Lesson content",
              },
              videoKey: {
                type: "string",
                nullable: true,
                example: "lessons/course1/module1/lesson1.mp4",
                description: "Video file key in storage",
              },
              durationSeconds: {
                type: "integer",
                nullable: true,
                example: 600,
                description: "Lesson duration in seconds",
              },
              order: {
                type: "integer",
                example: 1,
                description: "Lesson order within module",
              },
              createdAt: {
                type: "string",
                format: "date-time",
                description: "Creation timestamp",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                description: "Last update timestamp",
              },
            },
          },
          LessonProgress: {
            type: "object",
            description: "Student lesson progress",
            properties: {
              id: {
                type: "integer",
                example: 1,
                description: "Progress record ID",
              },
              isCompleted: {
                type: "boolean",
                example: true,
                description: "Whether lesson is completed",
              },
              lastAccessedAt: {
                type: "string",
                format: "date-time",
                nullable: true,
                description: "Last access timestamp",
              },
              watchedSeconds: {
                type: "integer",
                nullable: true,
                example: 450,
                description: "Seconds watched of video content",
              },
            },
          },
          LessonWithProgress: {
            allOf: [
              {
                $ref: "#/components/schemas/Lesson",
              },
              {
                type: "object",
                properties: {
                  module: {
                    type: "object",
                    description: "Module and course context",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1,
                      },
                      title: {
                        type: "string",
                        example: "JavaScript Basics",
                      },
                      courseId: {
                        type: "integer",
                        example: 1,
                      },
                      course: {
                        type: "object",
                        properties: {
                          id: {
                            type: "integer",
                            example: 1,
                          },
                          title: {
                            type: "string",
                            example: "Complete JavaScript Course",
                          },
                          isPublished: {
                            type: "boolean",
                            example: true,
                          },
                        },
                      },
                    },
                  },
                  quizzes: {
                    type: "array",
                    description: "Associated quizzes",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "integer",
                          example: 1,
                        },
                        title: {
                          type: "string",
                          example: "Variables Quiz",
                        },
                      },
                    },
                  },
                  progress: {
                    $ref: "#/components/schemas/LessonProgress",
                    description:
                      "Student progress (only for enrolled students)",
                  },
                },
              },
            ],
          },
          CreateLessonRequest: {
            type: "object",
            description: "Request body for creating a lesson",
            properties: {
              title: {
                type: "string",
                minLength: 3,
                maxLength: 200,
                example: "Introduction to Variables",
                description: "Lesson title",
              },
              content: {
                type: "string",
                minLength: 10,
                example:
                  "In this lesson, we will explore the concept of variables...",
                description: "Lesson content",
              },
              videoKey: {
                type: "string",
                example: "lessons/course1/module1/lesson1.mp4",
                description: "Video file key in storage (optional)",
              },
              durationSeconds: {
                type: "integer",
                minimum: 0,
                example: 600,
                description: "Lesson duration in seconds (optional)",
              },
              order: {
                type: "integer",
                minimum: 1,
                example: 1,
                description:
                  "Lesson order (optional - auto-assigned if not provided)",
              },
            },
            required: ["title", "content"],
          },
          UpdateLessonRequest: {
            type: "object",
            description: "Request body for updating a lesson",
            properties: {
              title: {
                type: "string",
                minLength: 3,
                maxLength: 200,
                example: "Advanced Variables",
                description: "Lesson title",
              },
              content: {
                type: "string",
                minLength: 10,
                example:
                  "In this updated lesson, we will dive deeper into variables...",
                description: "Lesson content",
              },
              videoKey: {
                type: "string",
                nullable: true,
                example: "lessons/course1/module1/lesson1_updated.mp4",
                description: "Video file key in storage",
              },
              durationSeconds: {
                type: "integer",
                minimum: 0,
                nullable: true,
                example: 720,
                description: "Lesson duration in seconds",
              },
              order: {
                type: "integer",
                minimum: 1,
                example: 2,
                description: "Lesson order within module",
              },
            },
          },
          ReorderLessonsRequest: {
            type: "object",
            description: "Request body for reordering lessons",
            properties: {
              lessonOrders: {
                type: "array",
                description: "Array of lesson IDs with their new orders",
                items: {
                  type: "object",
                  properties: {
                    lessonId: {
                      type: "integer",
                      example: 1,
                      description: "Lesson ID",
                    },
                    order: {
                      type: "integer",
                      example: 1,
                      description: "New order position",
                    },
                  },
                  required: ["lessonId", "order"],
                },
                example: [
                  { lessonId: 1, order: 2 },
                  { lessonId: 2, order: 1 },
                ],
              },
            },
            required: ["lessonOrders"],
          },
          UpdateLessonProgressRequest: {
            type: "object",
            description: "Request body for updating lesson progress",
            properties: {
              isCompleted: {
                type: "boolean",
                example: true,
                description: "Whether the lesson is completed",
              },
              watchedSeconds: {
                type: "integer",
                minimum: 0,
                example: 450,
                description: "Number of seconds watched",
              },
            },
          },
          Quiz: {
            type: "object",
            description: "Quiz object with basic information",
            properties: {
              id: {
                type: "integer",
                example: 1,
                description: "Quiz ID",
              },
              title: {
                type: "string",
                example: "JavaScript Basics Quiz",
                description: "Quiz title",
              },
              questionCount: {
                type: "integer",
                example: 5,
                description: "Number of questions in the quiz",
              },
              lastAttempt: {
                type: "object",
                nullable: true,
                description: "User's last attempt (if any)",
                properties: {
                  id: {
                    type: "integer",
                    example: 1,
                    description: "Attempt ID",
                  },
                  score: {
                    type: "number",
                    format: "float",
                    example: 85.5,
                    nullable: true,
                    description: "Score percentage (null if not completed)",
                  },
                  completedAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                    example: "2023-12-01T10:30:00Z",
                    description: "Completion timestamp (null if not completed)",
                  },
                  startedAt: {
                    type: "string",
                    format: "date-time",
                    example: "2023-12-01T10:15:00Z",
                    description: "Start timestamp",
                  },
                },
              },
            },
            required: ["id", "title", "questionCount"],
          },
          QuizQuestion: {
            type: "object",
            description: "Quiz question with options",
            properties: {
              id: {
                type: "integer",
                example: 1,
                description: "Question ID",
              },
              questionText: {
                type: "string",
                example:
                  "What is the correct way to declare a variable in JavaScript?",
                description: "Question text",
              },
              options: {
                type: "array",
                items: {
                  type: "string",
                },
                example: [
                  "var x = 5",
                  "let x = 5",
                  "const x = 5",
                  "All of the above",
                ],
                description: "Answer options",
              },
              correctOption: {
                type: "string",
                example: "All of the above",
                description:
                  "Correct answer (only visible to instructors and admins)",
              },
            },
            required: ["id", "questionText", "options"],
          },
          QuizDetail: {
            type: "object",
            description: "Complete quiz with questions and metadata",
            properties: {
              id: {
                type: "integer",
                example: 1,
                description: "Quiz ID",
              },
              title: {
                type: "string",
                example: "JavaScript Basics Quiz",
                description: "Quiz title",
              },
              lesson: {
                type: "object",
                description: "Lesson information",
                properties: {
                  id: {
                    type: "integer",
                    example: 1,
                    description: "Lesson ID",
                  },
                  title: {
                    type: "string",
                    example: "JavaScript Variables",
                    description: "Lesson title",
                  },
                  module: {
                    type: "object",
                    description: "Module information",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1,
                        description: "Module ID",
                      },
                      title: {
                        type: "string",
                        example: "Introduction to JavaScript",
                        description: "Module title",
                      },
                      courseId: {
                        type: "integer",
                        example: 1,
                        description: "Course ID",
                      },
                      course: {
                        type: "object",
                        description: "Course information",
                        properties: {
                          id: {
                            type: "integer",
                            example: 1,
                            description: "Course ID",
                          },
                          title: {
                            type: "string",
                            example: "Complete JavaScript Course",
                            description: "Course title",
                          },
                          isPublished: {
                            type: "boolean",
                            example: true,
                            description: "Course publication status",
                          },
                        },
                        required: ["id", "title", "isPublished"],
                      },
                    },
                    required: ["id", "title", "courseId", "course"],
                  },
                },
                required: ["id", "title", "module"],
              },
              questions: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/QuizQuestion",
                },
                description: "Quiz questions",
              },
              userAttempts: {
                type: "array",
                description: "User's previous attempts (if authenticated)",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "integer",
                      example: 1,
                      description: "Attempt ID",
                    },
                    score: {
                      type: "number",
                      format: "float",
                      example: 85.5,
                      nullable: true,
                      description: "Score percentage",
                    },
                    completedAt: {
                      type: "string",
                      format: "date-time",
                      nullable: true,
                      example: "2023-12-01T10:30:00Z",
                      description: "Completion timestamp",
                    },
                    startedAt: {
                      type: "string",
                      format: "date-time",
                      example: "2023-12-01T10:15:00Z",
                      description: "Start timestamp",
                    },
                  },
                  required: ["id", "startedAt"],
                },
              },
            },
            required: ["id", "title", "lesson", "questions"],
          },
          QuizAttempt: {
            type: "object",
            description: "Quiz attempt with result",
            properties: {
              id: {
                type: "integer",
                example: 1,
                description: "Attempt ID",
              },
              userId: {
                type: "integer",
                example: 123,
                description: "User ID",
              },
              quizId: {
                type: "integer",
                example: 1,
                description: "Quiz ID",
              },
              score: {
                type: "number",
                format: "float",
                example: 85.5,
                nullable: true,
                description: "Score percentage (null if not completed)",
              },
              startedAt: {
                type: "string",
                format: "date-time",
                example: "2023-12-01T10:15:00Z",
                description: "Start timestamp",
              },
              completedAt: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: "2023-12-01T10:30:00Z",
                description: "Completion timestamp",
              },
              quiz: {
                type: "object",
                description: "Quiz information",
                properties: {
                  id: {
                    type: "integer",
                    example: 1,
                    description: "Quiz ID",
                  },
                  title: {
                    type: "string",
                    example: "JavaScript Basics Quiz",
                    description: "Quiz title",
                  },
                  lesson: {
                    type: "object",
                    description: "Lesson information",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1,
                        description: "Lesson ID",
                      },
                      title: {
                        type: "string",
                        example: "JavaScript Variables",
                        description: "Lesson title",
                      },
                    },
                    required: ["id", "title"],
                  },
                },
                required: ["id", "title"],
              },
              user: {
                type: "object",
                description: "User information (for instructor/admin views)",
                properties: {
                  id: {
                    type: "integer",
                    example: 123,
                    description: "User ID",
                  },
                  username: {
                    type: "string",
                    example: "john_doe",
                    description: "Username",
                  },
                  firstName: {
                    type: "string",
                    example: "John",
                    description: "First name",
                  },
                  lastName: {
                    type: "string",
                    example: "Doe",
                    description: "Last name",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    example: "john@example.com",
                    description: "Email address",
                  },
                },
                required: ["id", "username"],
              },
            },
            required: ["id", "userId", "quizId", "startedAt"],
          },
          QuizzesResponse: {
            type: "object",
            description: "Response containing list of quizzes",
            properties: {
              success: {
                type: "boolean",
                example: true,
                description: "Success status",
              },
              message: {
                type: "string",
                example: "Quizzes retrieved successfully",
                description: "Response message",
              },
              data: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Quiz",
                },
                description: "List of quizzes",
              },
            },
            required: ["success", "message", "data"],
          },
          QuizDetailResponse: {
            type: "object",
            description: "Response containing quiz details",
            properties: {
              success: {
                type: "boolean",
                example: true,
                description: "Success status",
              },
              message: {
                type: "string",
                example: "Quiz retrieved successfully",
                description: "Response message",
              },
              data: {
                $ref: "#/components/schemas/QuizDetail",
              },
            },
            required: ["success", "message", "data"],
          },
          QuizResponse: {
            type: "object",
            description: "Response containing quiz information",
            properties: {
              success: {
                type: "boolean",
                example: true,
                description: "Success status",
              },
              message: {
                type: "string",
                example: "Quiz created successfully",
                description: "Response message",
              },
              data: {
                $ref: "#/components/schemas/QuizDetail",
              },
            },
            required: ["success", "message", "data"],
          },
          QuizAttemptResponse: {
            type: "object",
            description: "Response when starting a quiz attempt",
            properties: {
              success: {
                type: "boolean",
                example: true,
                description: "Success status",
              },
              message: {
                type: "string",
                example: "Quiz attempt started successfully",
                description: "Response message",
              },
              data: {
                type: "object",
                properties: {
                  attemptId: {
                    type: "integer",
                    example: 1,
                    description: "Attempt ID",
                  },
                  quiz: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1,
                        description: "Quiz ID",
                      },
                      title: {
                        type: "string",
                        example: "JavaScript Basics Quiz",
                        description: "Quiz title",
                      },
                      questions: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: {
                              type: "integer",
                              example: 1,
                              description: "Question ID",
                            },
                            questionText: {
                              type: "string",
                              example:
                                "What is the correct way to declare a variable in JavaScript?",
                              description: "Question text",
                            },
                            options: {
                              type: "array",
                              items: {
                                type: "string",
                              },
                              example: [
                                "var x = 5",
                                "let x = 5",
                                "const x = 5",
                                "All of the above",
                              ],
                              description: "Answer options",
                            },
                          },
                          required: ["id", "questionText", "options"],
                        },
                        description: "Quiz questions (without correct answers)",
                      },
                    },
                    required: ["id", "title", "questions"],
                  },
                  startedAt: {
                    type: "string",
                    format: "date-time",
                    example: "2023-12-01T10:15:00Z",
                    description: "Start timestamp",
                  },
                },
                required: ["attemptId", "quiz", "startedAt"],
              },
            },
            required: ["success", "message", "data"],
          },
          QuizSubmissionResponse: {
            type: "object",
            description: "Response after submitting a quiz",
            properties: {
              success: {
                type: "boolean",
                example: true,
                description: "Success status",
              },
              message: {
                type: "string",
                example: "Quiz attempt submitted successfully",
                description: "Response message",
              },
              data: {
                type: "object",
                properties: {
                  id: {
                    type: "integer",
                    example: 1,
                    description: "Attempt ID",
                  },
                  score: {
                    type: "number",
                    format: "float",
                    example: 85.5,
                    description: "Score percentage",
                  },
                  correctAnswers: {
                    type: "integer",
                    example: 4,
                    description: "Number of correct answers",
                  },
                  totalQuestions: {
                    type: "integer",
                    example: 5,
                    description: "Total number of questions",
                  },
                  completedAt: {
                    type: "string",
                    format: "date-time",
                    example: "2023-12-01T10:30:00Z",
                    description: "Completion timestamp",
                  },
                  quiz: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        example: 1,
                        description: "Quiz ID",
                      },
                      title: {
                        type: "string",
                        example: "JavaScript Basics Quiz",
                        description: "Quiz title",
                      },
                      lesson: {
                        type: "object",
                        properties: {
                          id: {
                            type: "integer",
                            example: 1,
                            description: "Lesson ID",
                          },
                          title: {
                            type: "string",
                            example: "JavaScript Variables",
                            description: "Lesson title",
                          },
                        },
                        required: ["id", "title"],
                      },
                    },
                    required: ["id", "title", "lesson"],
                  },
                },
                required: [
                  "id",
                  "score",
                  "correctAnswers",
                  "totalQuestions",
                  "completedAt",
                  "quiz",
                ],
              },
            },
            required: ["success", "message", "data"],
          },
          QuizAttemptsResponse: {
            type: "object",
            description: "Response containing paginated quiz attempts",
            properties: {
              success: {
                type: "boolean",
                example: true,
                description: "Success status",
              },
              message: {
                type: "string",
                example: "Quiz attempts retrieved successfully",
                description: "Response message",
              },
              data: {
                type: "object",
                properties: {
                  attempts: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/QuizAttempt",
                    },
                    description: "List of quiz attempts",
                  },
                  pagination: {
                    $ref: "#/components/schemas/Pagination",
                  },
                },
                required: ["attempts", "pagination"],
              },
            },
            required: ["success", "message", "data"],
          },
          QuizAttemptDetailResponse: {
            type: "object",
            description: "Response containing quiz attempt details",
            properties: {
              success: {
                type: "boolean",
                example: true,
                description: "Success status",
              },
              message: {
                type: "string",
                example: "Quiz attempt retrieved successfully",
                description: "Response message",
              },
              data: {
                $ref: "#/components/schemas/QuizAttempt",
              },
            },
            required: ["success", "message", "data"],
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
