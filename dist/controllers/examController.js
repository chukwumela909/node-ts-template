"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSubmissionScore = exports.listSubmissions = exports.submitExam = exports.getExam = exports.listExams = exports.createExam = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = __importDefault(require("mongoose"));
const exam_model_1 = require("../models/exam.model");
const submission_model_1 = require("../models/submission.model");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
// POST /exams - Create a new exam
exports.createExam = (0, catchAsync_1.default)(async (req, res, next) => {
    const { teacherId, classId, title, description, startsAt, endsAt, questions } = req.body;
    // Validate required fields
    if (!teacherId || !classId || !title || !startsAt || !endsAt || !questions) {
        return next((0, http_errors_1.default)(400, 'Missing required fields: teacherId, classId, title, startsAt, endsAt, questions'));
    }
    // Validate date range
    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    if (endDate <= startDate) {
        return next((0, http_errors_1.default)(400, 'End date must be after start date'));
    }
    if (startDate <= new Date()) {
        return next((0, http_errors_1.default)(400, 'Start date must be in the future'));
    }
    // Validate questions format
    if (!Array.isArray(questions) || questions.length === 0) {
        return next((0, http_errors_1.default)(400, 'Questions must be a non-empty array'));
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
    const newExam = await exam_model_1.Exam.create(examData);
    res.status(201).json({
        status: 'success',
        data: {
            examId: newExam._id
        }
    });
});
// GET /exams?classId=123 - List exams by class
exports.listExams = (0, catchAsync_1.default)(async (req, res, next) => {
    const { classId } = req.query;
    if (!classId) {
        return next((0, http_errors_1.default)(400, 'classId query parameter is required'));
    }
    const classIdNum = Number(classId);
    if (!Number.isInteger(classIdNum)) {
        return next((0, http_errors_1.default)(400, 'classId must be a valid integer'));
    }
    const exams = await exam_model_1.Exam.find({ classId: classIdNum })
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
});
// GET /exams/:examId - Get full exam details
exports.getExam = (0, catchAsync_1.default)(async (req, res, next) => {
    const { examId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(examId)) {
        return next((0, http_errors_1.default)(400, 'Invalid exam ID format'));
    }
    const exam = await exam_model_1.Exam.findById(examId);
    if (!exam) {
        return next((0, http_errors_1.default)(404, 'Exam not found'));
    }
    res.status(200).json({
        status: 'success',
        data: exam
    });
});
// POST /exams/:examId/submit - Submit exam answers
exports.submitExam = (0, catchAsync_1.default)(async (req, res, next) => {
    const { examId } = req.params;
    const { studentId, answers } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(examId)) {
        return next((0, http_errors_1.default)(400, 'Invalid exam ID format'));
    }
    if (!studentId || !answers) {
        return next((0, http_errors_1.default)(400, 'Missing required fields: studentId, answers'));
    }
    const studentIdNum = Number(studentId);
    if (!Number.isInteger(studentIdNum)) {
        return next((0, http_errors_1.default)(400, 'studentId must be a valid integer'));
    }
    // Find the exam
    const exam = await exam_model_1.Exam.findById(examId);
    if (!exam) {
        return next((0, http_errors_1.default)(404, 'Exam not found'));
    }
    // Check if exam is currently active
    const now = new Date();
    if (now < exam.startsAt) {
        return next((0, http_errors_1.default)(400, 'Exam has not started yet'));
    }
    if (now > exam.endsAt) {
        return next((0, http_errors_1.default)(400, 'Exam has already ended'));
    }
    // Check if student has already submitted
    const existingSubmission = await submission_model_1.Submission.findOne({
        examId: new mongoose_1.default.Types.ObjectId(examId),
        studentId: studentIdNum
    });
    if (existingSubmission) {
        return next((0, http_errors_1.default)(400, 'Student has already submitted this exam'));
    }
    // Validate answers format
    if (typeof answers !== 'object' || answers === null) {
        return next((0, http_errors_1.default)(400, 'Answers must be an object'));
    }
    // Auto-grade the submission
    let score = 0;
    const processedAnswers = {};
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
        examId: new mongoose_1.default.Types.ObjectId(examId),
        studentId: studentIdNum,
        answers: processedAnswers,
        score
    };
    const submission = await submission_model_1.Submission.create(submissionData);
    res.status(201).json({
        status: 'success',
        data: {
            submissionId: submission._id,
            score
        }
    });
});
// GET /exams/:examId/submissions - List all submissions for an exam
exports.listSubmissions = (0, catchAsync_1.default)(async (req, res, next) => {
    const { examId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(examId)) {
        return next((0, http_errors_1.default)(400, 'Invalid exam ID format'));
    }
    // Verify exam exists
    const exam = await exam_model_1.Exam.findById(examId);
    if (!exam) {
        return next((0, http_errors_1.default)(404, 'Exam not found'));
    }
    const submissions = await submission_model_1.Submission.find({ examId: new mongoose_1.default.Types.ObjectId(examId) })
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
});
// PATCH /submissions/:submissionId/score - Update submission score
exports.setSubmissionScore = (0, catchAsync_1.default)(async (req, res, next) => {
    const { submissionId } = req.params;
    const { score } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(submissionId)) {
        return next((0, http_errors_1.default)(400, 'Invalid submission ID format'));
    }
    if (typeof score !== 'number' || !Number.isInteger(score) || score < 0) {
        return next((0, http_errors_1.default)(400, 'Score must be a non-negative integer'));
    }
    const updatedSubmission = await submission_model_1.Submission.findByIdAndUpdate(submissionId, { score }, { new: true, runValidators: true });
    if (!updatedSubmission) {
        return next((0, http_errors_1.default)(404, 'Submission not found'));
    }
    res.status(200).json({
        status: 'success',
        data: updatedSubmission
    });
});
