import express from 'express';
import { setSubmissionScore } from '../controllers/examController';

const router = express.Router();

// Submission routes
router.route('/:submissionId/score')
  .patch(setSubmissionScore); // PATCH /submissions/:submissionId/score

export default router;
