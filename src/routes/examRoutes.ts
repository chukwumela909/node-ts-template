import express from 'express';
import {
  createExam,
  listExams,
  getExam,
  submitExam,
  listSubmissions,
  setSubmissionScore
} from '../controllers/examController';

const router = express.Router();

// Exam routes
router.route('/')
  .get(listExams)     // GET /exams?classId=123
  .post(createExam);  // POST /exams

router.route('/:examId')
  .get(getExam);      // GET /exams/:examId

router.route('/:examId/submit')
  .post(submitExam);  // POST /exams/:examId/submit

router.route('/:examId/submissions')
  .get(listSubmissions); // GET /exams/:examId/submissions

export default router;
