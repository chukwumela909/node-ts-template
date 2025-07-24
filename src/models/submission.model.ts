import mongoose, { Document, Schema, Types } from 'mongoose';

// Interface for Submission document
interface ISubmission extends Document {
  _id: Types.ObjectId;
  examId: Types.ObjectId;       // ref → Exam
  studentId: number;            // from PHP
  answers: Record<number, number>; // question id → chosen index
  score: number;                // auto-computed
  submittedAt: Date;
}

// Submission schema
const submissionSchema = new Schema<ISubmission>({
  examId: {
    type: Schema.Types.ObjectId,
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
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function(answers: Record<number, number>) {
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
const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);

export { ISubmission, Submission };