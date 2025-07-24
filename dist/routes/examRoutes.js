"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const examController_1 = require("../controllers/examController");
const router = express_1.default.Router();
// Exam routes
router.route('/')
    .get(examController_1.listExams) // GET /exams?classId=123
    .post(examController_1.createExam); // POST /exams
router.route('/:examId')
    .get(examController_1.getExam); // GET /exams/:examId
router.route('/:examId/submit')
    .post(examController_1.submitExam); // POST /exams/:examId/submit
router.route('/:examId/submissions')
    .get(examController_1.listSubmissions); // GET /exams/:examId/submissions
exports.default = router;
