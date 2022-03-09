const matching = require("../constants/matching");
const constants = require("../constants/main");
const mongoose = require("mongoose");
const uuid = require("node-uuid");

const Schema = mongoose.Schema;

const CandidateSchema = Schema(
  {
    _id: { type: String, default: uuid.v4 },
    user: { type: String, ref: "user", required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    active: { type: Boolean, default: true },
    employments: [
      { type: String, inclusion: matching.EMPLOYMENTS, default: [] },
    ],

    // CURRENT_INDUSTRIES enums (1 page on onboarding)
    interestWorkingArea: { type: [String], required: true },

    // CURRENT_JOBS (3 page on onboarding)
    recentJob: { type: String, required: true },

    // CURRENT_EXPERIENCE enums (2 page on onboarding)
    recentWorkingAreas: {
      type: [
        {
          _id: { type: String, default: uuid.v4 },
          parent: String,
          value: String,
        },
      ],
      required: true,
    },

    // VALUE_ASSESSMENTS enums (new page)
    values: [{ type: String, enum: matching.VALUE_ASSESSMENTS, default: [] }],
    recentAreaExperience: {
      type: String,
      required: true,
      enum: matching.EXPERIENCES,
    },

    // PREFERRED_COPMANY_SIZE enums (page in onboarding)
    preferredCompanySize: {
      type: String,
      required: true,
      enum: matching.PREFERRED_COMPANY_SIZES,
    },
    recentAnnualIncome: {
      type: String,
      required: false,
      enum: matching.RECENT_ANNUAL_INCOMES.concat(null),
    },
    avatar: { type: String, default: constants.DEFAULT_USER_AVATAR },
    skills: [{ type: String }],
    resume: { type: String },
    resumeName: { type: String },
    workingExperience: [
      {
        _id: { type: String, default: uuid.v4 },
        companyName: { type: String },
        position: { type: String },
        location: { type: String },
        duty: { type: String },
        startWorkingAt: { type: String },
        endWorkingAt: { type: String },
        isCurrentJob: { type: Boolean },
        default: [],
      },
    ],
    interests: [
      {
        _id: { type: String, default: uuid.v4 },
        image: { type: String },
        description: { type: String },
      },
    ],
    highestDegree: {
      type: String,
      enum: matching.DEGREES,
    },
    education: [
      {
        _id: { type: String, default: uuid.v4 },
        schoolName: { type: String },
        specialty: { type: String },
        startStudyAt: { type: String },
        endStudyAt: { type: String },
        isCurrentSchool: { type: Boolean },
        degree: {
          type: String,
          enum: matching.DEGREES,
          default: matching.DEGREE.BACHELORS,
        },
      },
    ],
    location: { type: String, required: true },
    locationCoordinates: { lat: { type: String }, lng: { type: String } },
    abilityToRelocate: { type: Boolean, default: false },
    socialMedia: {
      linkedInUrl: { type: String },
      twitterAcc: { type: String },
      faceBookUrl: { type: String },
    },
    isFilled: { type: Boolean, default: false },
    fillSteps: [{ type: String, enum: constants.CANDIDATE_FILL_STEPS }],
    fillProgress: { type: Number, min: 0, max: 100, default: 0 },
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true }, timestamps: true }
);

CandidateSchema.virtual("brief").get(function () {
  const {
    avatar,
    location,
    firstName,
    lastName,
    recentWorkingAreas,
    socialMedia,
    resume,
    abilityToRelocate
  } = this;
  return {
    avatar,
    location,
    firstName,
    lastName,
    recentWorkingAreas,
    socialMedia,
    resume,
    abilityToRelocate
  };
});

const Candidate = mongoose.model("candidate", CandidateSchema);

module.exports = Candidate;
