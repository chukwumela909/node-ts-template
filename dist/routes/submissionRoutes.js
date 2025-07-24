"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const examController_1 = require("../controllers/examController");
const router = express_1.default.Router();
// Submission routes
router.route('/:submissionId/score')
    .patch(examController_1.setSubmissionScore); // PATCH /submissions/:submissionId/score
exports.default = router;
