import mongoose, { Document, Schema, Types } from 'mongoose';

// Interface for individual questions
interface IQuestion {
  id: number;
  text: string;
  options: string[];
  correctOptionIndex: number;   // 0-based
}

// Interface for Exam document
interface IExam extends Document {
  _id: Types.ObjectId;
  teacherId: number;            // from PHP
  classId: number;              // from PHP
  title: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
  questions: IQuestion[];
  createdAt: Date;
}

// Question sub-schema
const questionSchema = new Schema<IQuestion>({
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
      validator: function(arr: string[]) {
        return arr.length >= 2 && arr.length <= 10; // At least 2 options, max 10
      },
      message: 'Questions must have between 2 and 10 options'
    }
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    validate: {
      validator: function(this: IQuestion, index: number) {
        return index >= 0 && index < this.options.length;
      },
      message: 'Correct option index must be valid for the given options'
    }
  }
}, { _id: false });

// Exam schema
const examSchema = new Schema<IExam>({
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
      validator: function(this: IExam, endDate: Date) {
        return endDate > this.startsAt;
      },
      message: 'End date must be after start date'
    }
  },
  questions: {
    type: [questionSchema],
    required: true,
    validate: {
      validator: function(arr: IQuestion[]) {
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
const Exam = mongoose.model<IExam>('Exam', examSchema);

export { IExam, IQuestion, Exam };