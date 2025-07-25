# Exam Service API Documentation

## Overview
This API provides endpoints for managing multiple-choice exams in a school management system. It handles exam creation, student submissions, auto-grading, and score management.

**Base URL**: `https://examservice-m4bz.onrender.com/api/v1`

**Content-Type**: `application/json`

---

## Table of Contents
1. [Exam Endpoints](#exam-endpoints)
2. [Submission Endpoints](#submission-endpoints)
3. [Data Models](#data-models)
4. [Error Handling](#error-handling)
5. [Examples](#examples)

---

## Exam Endpoints

### 1. Create Exam
Create a new exam with multiple-choice questions.

**Endpoint**: `POST /exams`

**Request Body**:
```json
{
  "teacherId": 101,
  "classId": 123,
  "title": "Mathematics Quiz - Chapter 5",
  "description": "Quiz covering algebraic equations and functions",
  "startsAt": "2025-07-25T09:00:00.000Z",
  "endsAt": "2025-07-25T10:00:00.000Z",
  "questions": [
    {
      "text": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correctOptionIndex": 1
    },
    {
      "text": "What is the square root of 16?",
      "options": ["2", "4", "6", "8"],
      "correctOptionIndex": 1
    }
  ]
}
```

**Response**: `201 Created`
```json
{
  "status": "success",
  "data": {
    "examId": "60f7b3c4e1d4c2a1b8e9f123"
  }
}
```

**Validation Rules**:
- `teacherId`: Required, must be an integer
- `classId`: Required, must be an integer
- `title`: Required, max 200 characters
- `description`: Optional, max 1000 characters
- `startsAt`: Required, must be in the future
- `endsAt`: Required, must be after `startsAt`
- `questions`: Required array, 1-100 questions
- Each question must have 2-10 options
- `correctOptionIndex` must be valid for the given options

---

### 2. List Exams by Class
Retrieve all exams for a specific class.

**Endpoint**: `GET /exams?classId={classId}`

**Query Parameters**:
- `classId` (required): Integer - The class ID to filter exams

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "id": "60f7b3c4e1d4c2a1b8e9f123",
      "title": "Mathematics Quiz - Chapter 5",
      "description": "Quiz covering algebraic equations and functions",
      "startsAt": "2025-07-25T09:00:00.000Z",
      "endsAt": "2025-07-25T10:00:00.000Z"
    },
    {
      "id": "60f7b3c4e1d4c2a1b8e9f124",
      "title": "Science Test - Physics",
      "description": "Test on motion and forces",
      "startsAt": "2025-07-26T14:00:00.000Z",
      "endsAt": "2025-07-26T15:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Full Exam Details
Retrieve complete exam information including all questions and options.

**Endpoint**: `GET /exams/{examId}`

**Path Parameters**:
- `examId` (required): MongoDB ObjectId - The exam identifier

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "_id": "60f7b3c4e1d4c2a1b8e9f123",
    "teacherId": 101,
    "classId": 123,
    "title": "Mathematics Quiz - Chapter 5",
    "description": "Quiz covering algebraic equations and functions",
    "startsAt": "2025-07-25T09:00:00.000Z",
    "endsAt": "2025-07-25T10:00:00.000Z",
    "questions": [
      {
        "id": 1,
        "text": "What is 2 + 2?",
        "options": ["3", "4", "5", "6"],
        "correctOptionIndex": 1
      },
      {
        "id": 2,
        "text": "What is the square root of 16?",
        "options": ["2", "4", "6", "8"],
        "correctOptionIndex": 1
      }
    ],
    "createdAt": "2025-07-24T12:00:00.000Z"
  }
}
```

---

### 4. Submit Exam Answers
Submit student answers for auto-grading.

**Endpoint**: `POST /exams/{examId}/submit`

**Path Parameters**:
- `examId` (required): MongoDB ObjectId - The exam identifier

**Request Body**:
```json
{
  "studentId": 501,
  "answers": {
    "1": 1,
    "2": 1
  }
}
```

**Response**: `201 Created`
```json
{
  "status": "success",
  "data": {
    "submissionId": "60f7b3c4e1d4c2a1b8e9f125",
    "score": 2
  }
}
```

**Business Rules**:
- Exam must be currently active (between `startsAt` and `endsAt`)
- One submission per student per exam
- Auto-grading compares answers against `correctOptionIndex`
- Score equals number of correct answers

---

### 5. List Exam Submissions
Get all submissions for a specific exam.

**Endpoint**: `GET /exams/{examId}/submissions`

**Path Parameters**:
- `examId` (required): MongoDB ObjectId - The exam identifier

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "id": "60f7b3c4e1d4c2a1b8e9f125",
      "studentId": 501,
      "answers": {
        "1": 1,
        "2": 1
      },
      "score": 2,
      "submittedAt": "2025-07-25T09:15:00.000Z"
    },
    {
      "id": "60f7b3c4e1d4c2a1b8e9f126",
      "studentId": 502,
      "answers": {
        "1": 0,
        "2": 1
      },
      "score": 1,
      "submittedAt": "2025-07-25T09:20:00.000Z"
    }
  ]
}
```

---

## Submission Endpoints

### 6. Update Submission Score
Manually override a submission score (teacher function).

**Endpoint**: `PATCH /submissions/{submissionId}/score`

**Path Parameters**:
- `submissionId` (required): MongoDB ObjectId - The submission identifier

**Request Body**:
```json
{
  "score": 1
}
```

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "_id": "60f7b3c4e1d4c2a1b8e9f125",
    "examId": "60f7b3c4e1d4c2a1b8e9f123",
    "studentId": 501,
    "answers": {
      "1": 1,
      "2": 1
    },
    "score": 1,
    "submittedAt": "2025-07-25T09:15:00.000Z"
  }
}
```

**Validation Rules**:
- `score`: Must be a non-negative integer

---

## Data Models

### Exam Model
```typescript
interface IExam {
  _id: ObjectId;
  teacherId: number;
  classId: number;
  title: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
  questions: IQuestion[];
  createdAt: Date;
}
```

### Question Model
```typescript
interface IQuestion {
  id: number;
  text: string;
  options: string[];
  correctOptionIndex: number; // 0-based index
}
```

### Submission Model
```typescript
interface ISubmission {
  _id: ObjectId;
  examId: ObjectId; // Reference to Exam
  studentId: number;
  answers: Record<number, number>; // questionId -> chosenOptionIndex
  score: number;
  submittedAt: Date;
}
```

---

## Error Handling

### HTTP Status Codes
- `200 OK` - Successful GET/PATCH request
- `201 Created` - Successful POST request
- `400 Bad Request` - Invalid input data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format
```json
{
  "status": "error",
  "message": "Detailed error description",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": "Additional error information"
  }
}
```

### Common Error Messages

#### 400 Bad Request
- `"Missing required fields: teacherId, classId, title, startsAt, endsAt, questions"`
- `"End date must be after start date"`
- `"Start date must be in the future"`
- `"classId query parameter is required"`
- `"Invalid exam ID format"`
- `"Student has already submitted this exam"`

#### 404 Not Found
- `"Exam not found"`
- `"Submission not found"`

#### Business Logic Errors
- `"Exam has not started yet"`
- `"Exam has already ended"`
- `"Questions must have between 2 and 10 options"`
- `"Exam must have between 1 and 100 questions"`

---

## Examples

### Complete Example: Creating and Taking an Exam

#### 1. Teacher Creates Exam
```bash
POST /api/v1/exams
Content-Type: application/json

{
  "teacherId": 101,
  "classId": 123,
  "title": "Math Quiz",
  "startsAt": "2025-07-25T09:00:00.000Z",
  "endsAt": "2025-07-25T10:00:00.000Z",
  "questions": [
    {
      "text": "What is 5 × 3?",
      "options": ["10", "15", "20", "25"],
      "correctOptionIndex": 1
    }
  ]
}
```

#### 2. Student Lists Available Exams
```bash
GET /api/v1/exams?classId=123
```

#### 3. Student Gets Exam Details
```bash
GET /api/v1/exams/60f7b3c4e1d4c2a1b8e9f123
```

#### 4. Student Submits Answers
```bash
POST /api/v1/exams/60f7b3c4e1d4c2a1b8e9f123/submit
Content-Type: application/json

{
  "studentId": 501,
  "answers": {
    "1": 1
  }
}
```

#### 5. Teacher Views All Submissions
```bash
GET /api/v1/exams/60f7b3c4e1d4c2a1b8e9f123/submissions
```

#### 6. Teacher Adjusts Score (Optional)
```bash
PATCH /api/v1/submissions/60f7b3c4e1d4c2a1b8e9f125/score
Content-Type: application/json

{
  "score": 0
}
```

---

## Rate Limiting
- Rate limiting is applied to all endpoints
- Limits are configured server-side
- Rate limit headers are included in responses:
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Limit`
  - `X-RateLimit-Reset`

---

## Notes
- All timestamps are in ISO 8601 format (UTC)
- Question IDs are auto-assigned sequentially starting from 1
- Authentication is handled by the main PHP application
- All numeric IDs (teacherId, classId, studentId) must be integers
- MongoDB ObjectIds are 24-character hexadecimal strings

---

*Last Updated: July 24, 2025*
