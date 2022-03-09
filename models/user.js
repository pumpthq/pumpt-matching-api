var crypter = require('../helpers/crypter');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uuid = require('node-uuid');
var ROLES = require('../constants/roles')

var UserSchema = Schema({
    _id: { type: String, default: uuid.v4 },
    email: { type: String, required: true, unique: true },
    model: { type: String, required: true },
    role: { type: Number, default: 0, access: 'private' },
    password: { type: String, required: true, set: crypter, access: 'private' },
    isApproved: { type: Boolean, default: false },
    isRejected: { type: Boolean, default: false },
    isConfirmed: { type: Boolean, default: false },
    isFinished: { type: Boolean, default: false },
    visitedAt: { type: Date, default: () => new Date() },
    registerAt: { type: Date, default: () => new Date() },
    restorePassToken: { type: String, default: null, access: 'private' },
    confirmEmailToken: { type: String, default: null, access: 'private' },

    _candidate: { type: String, ref: 'candidate' },
    _recruiter: { type: String, ref: 'recruiter' },
    _company: { type: String, ref: 'company' },

    // for authentication with linked in and grab data
    linkedInData: {}
}, { timestamps: true });

UserSchema.virtual("profile").get(function () {
    return {
        email: this.email
        , isCandidate: this.role === ROLES.CANDIDATE
        , isRecruiter: this.role === ROLES.RECRUITER
        , isNotApproved: !this.isApproved
        , isFinished: this.isFinished
    }
})

UserSchema.virtual('brief').get(function () {
    const { email, isApproved } = this;
    return { email, isApproved }
})

var User = mongoose.model('user', UserSchema);

module.exports = User;
