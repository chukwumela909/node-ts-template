import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import mongoose from 'mongoose';
import { Exam, IExam } from '../models/exam.model';
import { Submission, ISubmission } from '../models/submission.model';
import catchAsync from '../utils/catchAsync';

// POST /exams - Create a new exam
export const createExam = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { teacherId, classId, title, description, startsAt, endsAt, questions } = req.body;

    // Validate required fields
    if (!teacherId || !classId || !title || !startsAt || !endsAt || !questions) {
      return next(createError(400, 'Missing required fields: teacherId, classId, title, startsAt, endsAt, questions'));
    }

    // Validate date range
    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    
    if (endDate <= startDate) {
      return next(createError(400, 'End date must be after start date'));
    }

    if (startDate <= new Date()) {
      return next(createError(400, 'Start date must be in the future'));
    }

    // Validate questions format
    if (!Array.isArray(questions) || questions.length === 0) {
      return next(createError(400, 'Questions must be a non-empty array'));
    }

    // Assign sequential IDs to questions
    const processedQuestions = questions.map((q, index) => ({
      id: index + 1,
      text: q.text || q.question, // Support both 'text' and 'question' field names
      options: q.options,
      correctOptionIndex: q.correctOptionIndex
    }));

    const examData = {
      teacherId: Number(teacherId),
      classId: Number(classId),
      title,
      description,
      startsAt: startDate,
      endsAt: endDate,
      questions: processedQuestions
    };

    const newExam = await Exam.create(examData);

    res.status(201).json({
      status: 'success',
      data: {
        examId: newExam._id
      }
    });
  }
);

// GET /exams?classId=123 - List exams by class
export const listExams = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { classId } = req.query;

    if (!classId) {
      return next(createError(400, 'classId query parameter is required'));
    }

    const classIdNum = Number(classId);
    if (!Number.isInteger(classIdNum)) {
      return next(createError(400, 'classId must be a valid integer'));
    }

    const exams = await Exam.find({ classId: classIdNum })
      .select('_id title description startsAt endsAt')
      .sort({ startsAt: 1 });

    // Transform response to match PRD format
    const examList = exams.map(exam => ({
      id: exam._id,
      title: exam.title,
      description: exam.description,
      startsAt: exam.startsAt,
      endsAt: exam.endsAt
    }));

    res.status(200).json({
      status: 'success',
      data: examList
    });
  }
);

// GET /exams/:examId - Get full exam details
export const getExam = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { examId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return next(createError(400, 'Invalid exam ID format'));
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return next(createError(404, 'Exam not found'));
    }

    res.status(200).json({
      status: 'success',
      data: exam
    });
  }
);

// POST /exams/:examId/submit - Submit exam answers
export const submitExam = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { examId } = req.params;
    const { studentId, answers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return next(createError(400, 'Invalid exam ID format'));
    }

    if (!studentId || !answers) {
      return next(createError(400, 'Missing required fields: studentId, answers'));
    }

    const studentIdNum = Number(studentId);
    if (!Number.isInteger(studentIdNum)) {
      return next(createError(400, 'studentId must be a valid integer'));
    }

    // Find the exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return next(createError(404, 'Exam not found'));
    }

    // Check if exam is currently active
    const now = new Date();
    if (now < exam.startsAt) {
      return next(createError(400, 'Exam has not started yet'));
    }
    if (now > exam.endsAt) {
      return next(createError(400, 'Exam has already ended'));
    }

    // Check if student has already submitted
    const existingSubmission = await Submission.findOne({ 
      examId: new mongoose.Types.ObjectId(examId), 
      studentId: studentIdNum 
    });
    
    if (existingSubmission) {
      return next(createError(400, 'Student has already submitted this exam'));
    }

    // Validate answers format
    if (typeof answers !== 'object' || answers === null) {
      return next(createError(400, 'Answers must be an object'));
    }

    // Auto-grade the submission
    let score = 0;
    const processedAnswers: Record<number, number> = {};

    exam.questions.forEach(question => {
      const studentAnswer = answers[question.id];
      if (typeof studentAnswer === 'number' && Number.isInteger(studentAnswer)) {
        processedAnswers[question.id] = studentAnswer;
        if (studentAnswer === question.correctOptionIndex) {
          score++;
        }
      }
    });

    // Create submission
    const submissionData = {
      examId: new mongoose.Types.ObjectId(examId),
      studentId: studentIdNum,
      answers: processedAnswers,
      score
    };

    const submission = await Submission.create(submissionData);

    res.status(201).json({
      status: 'success',
      data: {
        submissionId: submission._id,
        score
      }
    });
  }
);

// GET /exams/:examId/submissions - List all submissions for an exam
export const listSubmissions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { examId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return next(createError(400, 'Invalid exam ID format'));
    }

    // Verify exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return next(createError(404, 'Exam not found'));
    }

    const submissions = await Submission.find({ examId: new mongoose.Types.ObjectId(examId) })
      .sort({ submittedAt: -1 });

    // Transform response to match PRD format
    const submissionList = submissions.map(submission => ({
      id: submission._id,
      studentId: submission.studentId,
      answers: submission.answers,
      score: submission.score,
      submittedAt: submission.submittedAt
    }));

    res.status(200).json({
      status: 'success',
      data: submissionList
    });
  }
);

// PATCH /submissions/:submissionId/score - Update submission score
export const setSubmissionScore = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { submissionId } = req.params;
    const { score } = req.body;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      return next(createError(400, 'Invalid submission ID format'));
    }

    if (typeof score !== 'number' || !Number.isInteger(score) || score < 0) {
      return next(createError(400, 'Score must be a non-negative integer'));
    }

    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      { score },
      { new: true, runValidators: true }
    );

    if (!updatedSubmission) {
      return next(createError(404, 'Submission not found'));
    }

    res.status(200).json({
      status: 'success',
      data: updatedSubmission
    });
  }
);
