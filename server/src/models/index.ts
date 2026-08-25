import mongoose, { Schema, model } from 'mongoose';

const opts = {
  timestamps: true
};

/* =========================
   USER
========================= */

export const User = model(
  'User',
  new Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
      },

      email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true
      },

      passwordHash: {
        type: String,
        required: true
      },

      role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
      }
    },
    opts
  )
);



export const StudentProfile = model(
  'StudentProfile',
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
      },

      dateOfBirth: Date,

      birthTime: String,

      birthPlace: String,

      college: String,

      course: String,

      specialization: String,

      semester: String,

      interests: {
        type: [String],
        default: []
      },

      skills: {
        type: [String],
        default: []
      },

      languages: {
        type: [String],
        default: []
      },

      projects: {
        type: Number,
        min: 0,
        default: 0
      },

      experience: {
        type: Number,
        min: 0,
        default: 0
      },

      preferredCareers: {
        type: [String],
        default: []
      }
    },
    opts
  )
);

/* =========================
   COURSE
========================= */

export const Course = model(
  'Course',
  new Schema(
    {
      name: {
        type: String,
        required: true,
        unique: true,
        trim: true
      },

      specializations: {
        type: [String],
        default: []
      }
    },
    opts
  )
);

/* =========================
   CAREER
========================= */

export const Career = model(
  'Career',
  new Schema(
    {
      name: {
        type: String,
        required: true,
        unique: true,
        trim: true
      },

      description: String,

      requiredSkills: {
        type: [String],
        default: []
      },

      preferredSkills: {
        type: [String],
        default: []
      },

      technicalSkills: {
        type: [String],
        default: []
      },

      softSkills: {
        type: [String],
        default: []
      },

      recommendedCourses: {
        type: [String],
        default: []
      },

      interviewCategories: {
        type: [String],
        default: []
      },

      roadmap: [
        {
          title: String,
          skill: String,
          description: String,
          difficulty: String,
          estimatedTime: String,
          week: Number,
          order: Number
        }
      ]
    },
    opts
  )
);

/* =========================
   SKILL
========================= */

export const Skill = model(
  'Skill',
  new Schema(
    {
      name: {
        type: String,
        required: true,
        unique: true,
        trim: true
      },

      category: String
    },
    opts
  )
);

/* =========================
   QUESTION
========================= */

export const Question = model(
  'Question',
  new Schema(
    {
      career: {
        type: String,
        required: true,
        index: true
      },

      question: {
        type: String,
        required: true
      },

      options: {
        type: [String],
        default: []
      },

      correctAnswer: {
        type: Number,
        required: true
      },

      explanation: String,

      skill: {
        type: String,
        required: true
      },

      category: String,

      difficulty: String,

      marks: {
        type: Number,
        default: 10,
        min: 1
      }
    },
    opts
  )
);

/* =========================
   ASSESSMENT
========================= */

export const Assessment = model(
  'Assessment',
  new Schema(
    {
      career: String,

      questions: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Question'
        }
      ]
    },
    opts
  )
);

export const AssessmentAttempt = model(
  'AssessmentAttempt',
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
      },

      career: String,

      answers: [Number],

      score: Number,

      skillScores: Schema.Types.Mixed
    },
    opts
  )
);

/* =========================
   INTERVIEW
========================= */

export const Interview = model(
  'Interview',
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
      },

      career: String,

      status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
      },

      round: {
        type: String,
        enum: [
          'Technical',
          'Problem Solving',
          'Behavioral',
          'HR'
        ],
        default: 'Technical'
      }
    },
    opts
  )
);

export const InterviewMessage = model(
  'InterviewMessage',
  new Schema(
    {
      interview: {
        type: Schema.Types.ObjectId,
        ref: 'Interview',
        required: true,
        index: true
      },

      role: {
        type: String,
        enum: ['assistant', 'student'],
        required: true
      },

      content: {
        type: String,
        required: true
      }
    },
    opts
  )
);

export const InterviewEvaluation = model(
  'InterviewEvaluation',
  new Schema(
    {
      interview: {
        type: Schema.Types.ObjectId,
        ref: 'Interview',
        required: true,
        unique: true,
        index: true
      },

      technicalScore: Number,

      problemSolvingScore: Number,

      communicationScore: Number,

      relevanceScore: Number,

      overallScore: Number,

      strengths: [String],

      weaknesses: [String],

      feedback: String,

      improvements: [String]
    },
    opts
  )
);

/* =========================
   CAREER MATCH
========================= */

export const CareerMatch = model(
  'CareerMatch',
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
      },

      results: [
        {
          career: String,
          score: Number,
          skillScore: Number,
          assessmentScore: Number,
          interestScore: Number,
          interviewScore: Number,
          experienceScore: Number,
          reason: String
        }
      ]
    },
    opts
  )
);

/* =========================
   ROADMAP
========================= */

export const CareerRoadmap = model(
  'CareerRoadmap',
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },

      career: String
    },
    opts
  )
);

export const RoadmapTask = model(
  'RoadmapTask',
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
      },

      career: String,

      title: String,

      description: String,

      skill: String,

      estimatedTime: String,

      difficulty: String,

      week: Number,

      order: Number,

      completed: {
        type: Boolean,
        default: false
      }
    },
    opts
  )
);

/* =========================
   ASTROLOGY
========================= */

export const AstrologyProfile = model(
  'AstrologyProfile',
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
      },

      zodiac: String
    },
    opts
  )
);

/* =========================
   CAREER SIMULATION
========================= */

export const CareerSimulation = model(
  'CareerSimulation',
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
      },

      career: String,

      currentSkills: Schema.Types.Mixed,

      projectedSkills: Schema.Types.Mixed,

      currentScore: Number,

      projectedScore: Number
    },
    opts
  )
);

export { mongoose };