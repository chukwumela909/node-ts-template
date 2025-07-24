"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Submission = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Submission schema
const submissionSchema = new mongoose_1.Schema({
    examId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    studentId: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: 'Student ID must be an integer'
        }
    },
    answers: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
        validate: {
            validator: function (answers) {
                // Ensure all keys are numbers and all values are non-negative integers
                return Object.keys(answers).every(key => {
                    const questionId = Number(key);
                    const answerIndex = answers[questionId];
                    return Number.isInteger(questionId) &&
                        Number.isInteger(answerIndex) &&
                        answerIndex >= 0;
                });
            },
            message: 'Answers must be a valid mapping of question IDs to option indices'
        }
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'Score must be a non-negative integer'
        }
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});
// Indexes for better query performance
submissionSchema.index({ examId: 1, submittedAt: -1 });
submissionSchema.index({ studentId: 1 });
submissionSchema.index({ examId: 1, studentId: 1 }, { unique: true }); // One submission per student per exam
// Export the model
const Submission = mongoose_1.default.model('Submission', submissionSchema);
exports.Submission = Submission;
