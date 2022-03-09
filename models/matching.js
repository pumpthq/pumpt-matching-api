var mongoose = require("mongoose");
var uuid = require("node-uuid");
var Schema = mongoose.Schema;

var status = {
  type: String,
  enum: ["new", "bookmarked", "approved", "rejected"],
  default: "new",
  require: true,
};
var brief = { type: Schema.Types.Mixed };

var MatchingSchema = Schema(
  {
    _id: { type: String, default: uuid.v4 },

    _candidate: { type: String, ref: "candidate", required: true },
    _vacancy: { type: String, ref: "vacancy", required: true },
    _company: { type: String, ref: "company", required: true },

    pdfScore: { type: Number, min: 0, default: 0 },
    score: { type: Number, min: 0, default: 0, require: true },
    breakdown: { type: Object },

    // candidate: Info,
    // vacancy: Info
    candidate: { status, brief },
    vacancy: { status, brief },
    company: { brief },
    viewedByCandidate: { type: Boolean, default: false },
    viewedByCompany: { type: Boolean, default: false },
    viewedByRecruiter: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isCompanyApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

var Matching = mongoose.model("matching", MatchingSchema);

module.exports = Matching;
