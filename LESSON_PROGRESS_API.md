# Lesson Progress API Documentation

This document describes all APIs related to tracking user progress for lessons in the learning platform.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Get Lessons with Progress](#1-get-lessons-with-progress)
  - [Get Single Lesson with Progress](#2-get-single-lesson-with-progress)
  - [Update Lesson Progress](#3-update-lesson-progress)
- [Data Models](#data-models)
- [Error Responses](#error-responses)
- [Usage Examples](#usage-examples)

---

## Overview

The Lesson Progress system allows users to track their learning journey through courses. It tracks:

- **Completion status** - Whether a lesson is completed or not
- **Watch time** - Number of seconds watched for video lessons
- **Last access time** - When the user last accessed the lesson

Progress data is automatically included when enrolled students retrieve lessons, and can be updated through a dedicated endpoint.

---

## Authentication

Most progress-related endpoints require authentication:

- **Required for**: Updating progress, viewing personal progress data
- **Optional for**: Retrieving lesson lists (public access allowed for published courses)
- **Method**: Cookie-based authentication (`cookieAuth`)
- **Roles**: `student`, `instructor`, `admin`

---

## API Endpoints

### 1. Get Lessons with Progress

Retrieves all lessons for a specific module with progress data included for enrolled students.

#### Endpoint

```
GET /api/lesson/module/{moduleId}
```

#### Parameters

| Parameter | Type    | Location | Required | Description      |
| --------- | ------- | -------- | -------- | ---------------- |
| moduleId  | integer | path     | Yes      | ID of the module |

#### Authentication

Optional - Progress data only included for authenticated, enrolled students

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Lessons retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Introduction to React",
      "content": "Learn the basics of React...",
      "videoUrl": "https://signed-url-to-video...",
      "durationSeconds": 1200,
      "order": 1,
      "createdAt": "2025-12-01T10:00:00.000Z",
      "updatedAt": "2025-12-01T10:00:00.000Z",
      "progress": {
        "isCompleted": false,
        "lastAccessedAt": "2025-12-20T15:30:00.000Z",
        "watchedSeconds": 450
      },
      "note": {
        "id": 5,
        "content": "Important concepts to review",
        "createdAt": "2025-12-20T15:35:00.000Z",
        "updatedAt": "2025-12-20T15:35:00.000Z"
      }
    },
    {
      "id": 2,
      "title": "React Components",
      "content": "Understanding React components...",
      "videoUrl": "https://signed-url-to-video...",
      "durationSeconds": 1800,
      "order": 2,
      "createdAt": "2025-12-02T10:00:00.000Z",
      "updatedAt": "2025-12-02T10:00:00.000Z",
      "progress": {
        "isCompleted": true,
        "lastAccessedAt": "2025-12-19T14:20:00.000Z",
        "watchedSeconds": 1800
      }
    }
  ]
}
```

#### Response Notes

- `progress` object is **only included** for enrolled students (not for instructors, admins, or public users)
- `progress.watchedSeconds` can be `null` if never tracked
- `progress.lastAccessedAt` can be `null` if lesson never accessed
- `note` object is included if the user has created a note for that lesson
- `videoUrl` is a time-limited signed URL (valid for 1 hour)

#### Error Responses

- **403 Forbidden**: User doesn't have access to unpublished course content
- **404 Not Found**: Module doesn't exist

---

### 2. Get Single Lesson with Progress

Retrieves a specific lesson by ID with progress data included for enrolled students.

#### Endpoint

```
GET /api/lesson/{lessonId}
```

#### Parameters

| Parameter | Type    | Location | Required | Description      |
| --------- | ------- | -------- | -------- | ---------------- |
| lessonId  | integer | path     | Yes      | ID of the lesson |

#### Authentication

Optional - Progress data only included for authenticated, enrolled students

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Lesson retrieved successfully",
  "data": {
    "id": 1,
    "moduleId": 5,
    "title": "Introduction to React",
    "content": "Learn the basics of React framework...",
    "videoUrl": "https://signed-url-to-video...",
    "durationSeconds": 1200,
    "order": 1,
    "createdAt": "2025-12-01T10:00:00.000Z",
    "updatedAt": "2025-12-01T10:00:00.000Z",
    "module": {
      "id": 5,
      "title": "React Fundamentals",
      "courseId": 3,
      "course": {
        "id": 3,
        "title": "Complete React Course",
        "isPublished": true
      }
    },
    "quizzes": [
      {
        "id": 10,
        "title": "React Basics Quiz"
      }
    ],
    "progress": {
      "isCompleted": false,
      "lastAccessedAt": "2025-12-20T15:30:00.000Z",
      "watchedSeconds": 450
    },
    "note": {
      "id": 5,
      "content": "Important concepts to review",
      "createdAt": "2025-12-20T15:35:00.000Z",
      "updatedAt": "2025-12-20T15:35:00.000Z"
    }
  }
}
```

#### Response Notes

- `progress` object is **only included** for enrolled students
- Includes parent module and course information
- Lists associated quizzes
- `note` object included if user has a note for this lesson

#### Error Responses

- **403 Forbidden**: User doesn't have access to unpublished lesson
- **404 Not Found**: Lesson doesn't exist

---

### 3. Update Lesson Progress

Updates the progress tracking for a specific lesson. This is the primary endpoint for tracking user learning progress.

#### Endpoint

```
PATCH /api/lesson/{lessonId}/progress
```

#### Parameters

| Parameter | Type    | Location | Required | Description      |
| --------- | ------- | -------- | -------- | ---------------- |
| lessonId  | integer | path     | Yes      | ID of the lesson |

#### Authentication

**Required** - Must be authenticated as `student`, `instructor`, or `admin`

#### Request Body

```json
{
  "isCompleted": true,
  "watchedSeconds": 1200
}
```

#### Request Body Parameters

| Field          | Type    | Required | Description                                     |
| -------------- | ------- | -------- | ----------------------------------------------- |
| isCompleted    | boolean | No       | Whether the lesson is completed                 |
| watchedSeconds | integer | No       | Number of seconds watched (must be ≥ 0 or null) |

**Notes:**

- Both fields are optional - you can update either or both
- `watchedSeconds` must be a non-negative integer or `null`
- The system automatically updates `lastAccessedAt` to current time on every update

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Lesson progress updated successfully",
  "data": {
    "lessonId": 1,
    "progress": {
      "id": 25,
      "isCompleted": true,
      "lastAccessedAt": "2025-12-23T10:45:30.000Z",
      "watchedSeconds": 1200
    }
  }
}
```

#### Response Notes

- `lastAccessedAt` is automatically set to the current timestamp
- If this is the first progress update for the lesson, a new progress record is created (upsert operation)
- Returns the complete updated progress object

#### Error Responses

- **400 Bad Request**: Invalid parameters (e.g., negative watchedSeconds, invalid boolean)
- **401 Unauthorized**: User not authenticated
- **403 Forbidden**:
  - User not enrolled in the course
  - Course is not published (unless user is instructor/admin)
- **404 Not Found**: Lesson doesn't exist

---

## Data Models

### LessonProgress Schema

```typescript
{
  id: number; // Progress record ID
  isCompleted: boolean; // Completion status
  lastAccessedAt: Date | null; // Last access timestamp
  watchedSeconds: number | null; // Seconds of video watched
}
```

### Lesson with Progress Schema

```typescript
{
  id: number;
  title: string;
  content: string;
  videoUrl: string | null;       // Time-limited signed URL
  durationSeconds: number | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  progress?: {                   // Only for enrolled students
    isCompleted: boolean;
    lastAccessedAt: Date | null;
    watchedSeconds: number | null;
  };
  note?: {                       // If user has a note
    id: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
```

---

## Error Responses

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

| HTTP Status | Error Code                | Description                                         |
| ----------- | ------------------------- | --------------------------------------------------- |
| 400         | `invalid_watched_seconds` | watchedSeconds must be non-negative integer or null |
| 400         | `validation_error`        | Request validation failed                           |
| 401         | `unauthorized`            | Authentication required                             |
| 403         | `progress_access_denied`  | Not enrolled or course not published                |
| 403         | `lesson_access_denied`    | No permission to access lesson                      |
| 404         | `lesson_not_found`        | Lesson doesn't exist                                |
| 404         | `module_not_found`        | Module doesn't exist                                |

---

## Usage Examples

### Example 1: Track Video Progress (Every 10 seconds)

```javascript
// Frontend code to periodically update watch progress
const videoPlayer = document.getElementById("lesson-video");
let lastUpdateTime = 0;

videoPlayer.addEventListener("timeupdate", async () => {
  const currentTime = Math.floor(videoPlayer.currentTime);

  // Update every 10 seconds
  if (currentTime - lastUpdateTime >= 10) {
    await fetch(`/api/lesson/${lessonId}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        watchedSeconds: currentTime,
      }),
    });
    lastUpdateTime = currentTime;
  }
});
```

### Example 2: Mark Lesson as Complete

```javascript
// Mark lesson complete when user clicks "Mark Complete" button
async function markLessonComplete(lessonId) {
  const response = await fetch(`/api/lesson/${lessonId}/progress`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      isCompleted: true,
    }),
  });

  const data = await response.json();
  console.log("Lesson marked complete:", data);
}
```

### Example 3: Fetch Lessons with Progress

```javascript
// Get all lessons in a module with progress data
async function getLessonsWithProgress(moduleId) {
  const response = await fetch(`/api/lesson/module/${moduleId}`, {
    credentials: "include", // Include auth cookie
  });

  const data = await response.json();

  // Filter incomplete lessons
  const incompleteLessons = data.data.filter(
    (lesson) => lesson.progress && !lesson.progress.isCompleted
  );

  console.log("Incomplete lessons:", incompleteLessons.length);
  return data.data;
}
```

### Example 4: Complete Video Watch

```javascript
// When video ends, mark as complete and update watched seconds
videoPlayer.addEventListener("ended", async () => {
  await fetch(`/api/lesson/${lessonId}/progress`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      isCompleted: true,
      watchedSeconds: Math.floor(videoPlayer.duration),
    }),
  });
});
```

### Example 5: Calculate Course Progress

```javascript
// Calculate overall progress percentage for a module
async function calculateModuleProgress(moduleId) {
  const response = await fetch(`/api/lesson/module/${moduleId}`, {
    credentials: "include",
  });

  const data = await response.json();
  const lessons = data.data;

  const completedCount = lessons.filter(
    (lesson) => lesson.progress?.isCompleted
  ).length;

  const progressPercentage = (completedCount / lessons.length) * 100;
  console.log(`Module Progress: ${progressPercentage.toFixed(1)}%`);

  return progressPercentage;
}
```

---

## Business Rules

### Progress Tracking Rules

1. **Enrollment Required**: Users must be enrolled in a course to track progress
2. **Published Courses**: Progress can only be tracked for published courses (unless user is instructor/admin)
3. **Automatic Timestamps**: `lastAccessedAt` is automatically updated on every progress update
4. **Upsert Behavior**: Progress updates create a new record if none exists, or update existing record
5. **Isolated Progress**: Each user's progress is independent and not visible to other students

### Permission Matrix

| User Role               | Get Lessons         | View Own Progress | Update Progress |
| ----------------------- | ------------------- | ----------------- | --------------- |
| Public                  | ✅ (published only) | ❌                | ❌              |
| Student (enrolled)      | ✅                  | ✅                | ✅              |
| Student (not enrolled)  | ✅ (published only) | ❌                | ❌              |
| Instructor (own course) | ✅                  | ❌                | ✅              |
| Admin                   | ✅                  | ❌                | ✅              |

### Video Progress Best Practices

1. **Update Frequency**: Update progress every 5-10 seconds for smooth tracking
2. **Final Update**: Always send final update when video completes
3. **Resume Playback**: Use `watchedSeconds` to resume video from last position
4. **Completion Threshold**: Consider marking complete at 95% watched (not just 100%)

---

## Additional Notes

- Video URLs are signed and expire after 1 hour
- Progress data is stored in the `lessonProgress` database table
- The system uses composite key `userId_lessonId` for progress records
- Instructors and admins don't have their own progress tracked when viewing their courses
- Notes are separate from progress and stored in `lessonNote` table

---

**API Version**: 1.0  
**Last Updated**: December 23, 2025  
**Base URL**: `/api/lesson`
