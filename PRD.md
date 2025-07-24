# Product Requirements Document (PRD)
## Exam Service Microservice

### Overview
This document outlines the requirements for a stand-alone microservice that handles multiple-choice exams for an existing Flutter + PHP school-management platform.

---

## Purpose
Provide a stand-alone micro-service (Node/Express/TypeScript/MongoDB) that handles multiple-choice exams for the existing Flutter + PHP school-management platform. Teachers create exams, students take timed exams, and both parties see scores instantly.

---

## Scope

### In Scope ✅
- Create, list, retrieve exams
- Auto-timed submission with instant auto-grading
- Submission listing & score override

### Out of Scope ❌
- Authentication (handled by main PHP app)
- Essay or open-ended questions
- File attachments

---

## Personas & Needs

| Persona | Need | How Met |
|---------|------|---------|
| **Teacher** | Build MCQ exams, view results instantly | `POST /exams`, `GET /exams/:id/submissions` |
| **Student** | See class exams, take timed test, get score | `GET /exams?classId=...`, `POST /exams/:id/submit` |
| **Parent** | None (view-only via main app) | N/A |

---

## Functional Requirements

### FR-1: Create Exam
- **Description**: Teacher supplies exam details and questions
- **Input**: title, description, classId, teacherId, start/end time, array of MCQ questions with correctOptionIndex
- **Output**: 201 status + examId
- **Endpoint**: `POST /exams`

### FR-2: List Exams by Class
- **Description**: Retrieve exams filtered by class
- **Input**: classId (query parameter)
- **Output**: Minimal array (id, title, description, start/end times)
- **Endpoint**: `GET /exams?classId=123`

### FR-3: Retrieve Full Exam
- **Description**: Get complete exam details including questions and options
- **Input**: examId (path parameter)
- **Output**: Complete exam object with questions and options
- **Endpoint**: `GET /exams/:examId`

### FR-4: Timed Submission
- **Description**: Auto-submission when Flutter timer ends
- **Input**: studentId, answers array
- **Output**: submissionId and calculated score
- **Process**: Server auto-grades against correctOptionIndex
- **Endpoint**: `POST /exams/:examId/submit`

### FR-5: View Submissions
- **Description**: List all submissions for a specific exam
- **Input**: examId (path parameter)
- **Output**: Array of submissions with scores
- **Endpoint**: `GET /exams/:examId/submissions`

### FR-6: Manual Score Override
- **Description**: Allow teachers to manually edit scores
- **Input**: New score value
- **Output**: Updated submission object
- **Endpoint**: `PATCH /submissions/:submissionId/score`

---

## Non-Functional Requirements

### Performance
- **Requirement**: Grade & respond < 200ms for 50 concurrent submissions
- **Rationale**: Ensure responsive user experience during peak exam times

### Availability
- **Requirement**: 99% monthly uptime (Render free tier)
- **Rationale**: Reliable service for educational activities

### Security
- **Requirement**: No auth layer, but only numeric IDs accepted (validated)
- **Rationale**: Authentication handled by main PHP application

### Scalability
- **Requirement**: Stateless API; horizontal scale via Render
- **Rationale**: Handle varying loads during exam periods

### Maintainability
- **Requirement**: Clear separation routes ↔ controllers ↔ models
- **Rationale**: Easy to maintain and extend functionality

---

## Data Model Summary

### Exam Schema
```typescript
{
  _id: ObjectId,
  teacherId: number,
  classId: number,
  title: string,
  description?: string,
  startsAt: Date,
  endsAt: Date,
  questions: [
    {
      id: string,
      question: string,
      options: string[],
      correctOptionIndex: number
    }
  ],
  createdAt: Date
}
```

### Submission Schema
```typescript
{
  _id: ObjectId,
  examId: ObjectId (ref),
  studentId: number,
  answers: {
    [questionId: string]: number // chosen option index
  },
  score: number,
  submittedAt: Date
}
```

---

## API Endpoints & Payloads

| Method | Endpoint | Body / Query | Response |
|--------|----------|--------------|----------|
| **POST** | `/exams` | `{ teacherId, classId, title, description?, startsAt, endsAt, questions }` | `201 { examId }` |
| **GET** | `/exams` | `classId` (query) | `200 [{ id, title, description, startsAt, endsAt }]` |
| **GET** | `/exams/:id` | — | `200` full exam object |
| **POST** | `/exams/:id/submit` | `{ studentId, answers }` | `201 { submissionId, score }` |
| **GET** | `/exams/:id/submissions` | — | `200 [{ id, studentId, answers, score, submittedAt }]` |
| **PATCH** | `/submissions/:id/score` | `{ score }` | `200` updated submission |

---

## User Flows

### Teacher Flow
1. **Create exam** → receive examId
2. **Share exam** (implicit via classId)
3. **Later**: `GET /exams/:id/submissions` → see list with scores

### Student Flow
1. **List exams**: `GET /exams?classId=123` → list of available exams
2. **Open exam** → timer starts in Flutter app
3. **Timer ends** → auto-submit → instant score shown
4. **Score visibility** → also visible in teacher list immediately

---

## Acceptance Criteria

### AC1: Create Exam
- **Given**: Valid exam data is provided
- **When**: `POST /exams` is called
- **Then**: Return 201 status and MongoDB ObjectId

### AC2: List Exams
- **Given**: A classId is provided
- **When**: `GET /exams?classId=X` is called
- **Then**: Return only exams belonging to that class

### AC3: Perfect Score
- **Given**: Student submits all correct answers
- **When**: Submission is auto-graded
- **Then**: Score equals total question count

### AC4: Partial Score
- **Given**: Student submits some wrong answers
- **When**: Submission is auto-graded
- **Then**: Score equals correct answer count

### AC5: Score Override
- **Given**: Teacher provides new score
- **When**: `PATCH /submissions/:id/score` is called
- **Then**: Score is updated and persisted in database

---

## Technical Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Deployment**: Render (free tier)
- **Architecture**: RESTful API, Stateless

---

## Success Metrics
- **Response Time**: < 200ms for grading operations
- **Uptime**: 99% monthly availability
- **Concurrent Users**: Support 50 simultaneous submissions
- **Data Integrity**: 100% accurate auto-grading

---

*Document Version: 1.0*  
*Last Updated: July 24, 2025*
