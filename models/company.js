var matching = require("../constants/matching");
var constants = require("../constants/main");
var mongoose = require("mongoose");
var uuid = require("node-uuid");
var Schema = mongoose.Schema;

var CompanySchema = new Schema(
  {
    _id: { type: String, default: uuid.v4 },
    name: { type: String, required: true, unique: true },
    type: { type: [String], required: true },
    foundDate: { type: String, required: true },
    employeesAmount: {
      type: String,
      required: true,
      enum: matching.EMPLOYEES_AMOUNTS,
    },
    recruiter: { type: String, ref: "recruiter", required: true },
    recruiters: [{ type: String, ref: 'Recruiter', default: [] }],

    headquartersLocation: { type: String, required: true },
    headquartersCoordinates: { lat: { type: String }, lng: { type: String } },

    values: [{ type: String, enum: matching.VALUE_ASSESSMENTS, default: [] }],

    socialMedia: {
      websiteUrl: { type: String, required: true },
      linkedInUrl: { type: String /*, required: true*/ },
      twitterAcc: { type: String /*, required: true*/ },
      facebookUrl: { type: String /*, required: true*/ },
    },

    // optional fields
    locationOffices: [
      {
        location: { type: String },
      },
    ],

    logo: { type: String }, //, default: constants.DEFAULT_COMPANY_LOGO},
    background: { type: String }, //, default: constants.DEFAULT_COMPANY_LOGO},

    images: [{ type: String }],

    description: { type: String },
    quoteOrMotto: { type: String, default: "" },
    registerAt: { type: Date, default: () => new Date() },
    isPremium: { type: Boolean, default: false },

    isFilled: { type: Boolean, default: false },
    fillSteps: [{ type: String, enum: constants.COMPANY_FILL_STEPS }],
    fillProgress: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

CompanySchema.virtual("brief").get(function () {
  var {
    name,
    type,
    foundDate,
    logo,
    background,
    headquartersLocation,
    socialMedia,
  } = this;
  return {
    name,
    type,
    foundDate,
    logo,
    background,
    headquartersLocation,
    socialMedia,
  };
});

var Company = mongoose.model("company", CompanySchema);

module.exports = Company;
