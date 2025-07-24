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
exports.Exam = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Question sub-schema
const questionSchema = new mongoose_1.Schema({
    id: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function (arr) {
                return arr.length >= 2 && arr.length <= 10; // At least 2 options, max 10
            },
            message: 'Questions must have between 2 and 10 options'
        }
    },
    correctOptionIndex: {
        type: Number,
        required: true,
        validate: {
            validator: function (index) {
                return index >= 0 && index < this.options.length;
            },
            message: 'Correct option index must be valid for the given options'
        }
    }
}, { _id: false });
// Exam schema
const examSchema = new mongoose_1.Schema({
    teacherId: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: 'Teacher ID must be an integer'
        }
    },
    classId: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: 'Class ID must be an integer'
        }
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    startsAt: {
        type: Date,
        required: true
    },
    endsAt: {
        type: Date,
        required: true,
        validate: {
            validator: function (endDate) {
                return endDate > this.startsAt;
            },
            message: 'End date must be after start date'
        }
    },
    questions: {
        type: [questionSchema],
        required: true,
        validate: {
            validator: function (arr) {
                return arr.length > 0 && arr.length <= 100; // At least 1 question, max 100
            },
            message: 'Exam must have between 1 and 100 questions'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// Indexes for better query performance
examSchema.index({ classId: 1, startsAt: 1 });
examSchema.index({ teacherId: 1 });
examSchema.index({ startsAt: 1, endsAt: 1 });
// Export the model
const Exam = mongoose_1.default.model('Exam', examSchema);
exports.Exam = Exam;
