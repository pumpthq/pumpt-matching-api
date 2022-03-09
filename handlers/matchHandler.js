var MatchingService = require("../services/matchService");
var sanitizeHtml = require("sanitize-html");
var Candidate = require("../models/candidate");
var Vacancy = require("../models/vacancy");
var User = require("../models/user");
var Recruiter = require("../models/recruiter");
var Matching = require("../models/matching");
// var logger = require('../helpers/logger')(module);
// var mailer = require('../helpers/mailer');

// var async = require('async');
var ROLES = require("../constants/roles");
// var { MATCHING_SCORE_THRESHOLD } = require('../config')
var { VACANCY_STATUS } = require("../constants/main");

module.exports = function () {
  //polyfill support for all users
  this.matches = function (req, res, next) {
    var user = req.user;

    if (user.role == ROLES.CANDIDATE) {
      this.matchesCandidate(req, res, next);
    } else if (user.role == ROLE.RECRUITER) {
      this.matchesVacancy(req, res, next);
    }
  };

  // get all matching docs with score above threshold for vacancy and approved candidate that have been approved by candidate
  this.matchesVacancy = function (req, res, next) {
    var _vacancy = req.params.uuid;

    // first get all deactivated candidates,
    // filter these out from returned matches.
    Candidate.find({ active: false })
      .lean()
      .exec()
      .then((candidates) => {
        Matching.find({
          _vacancy,
          "vacancy.status": "approved",
          isApproved: true,
          "candidate.brief.user.isApproved": true,
        })
          .lean()
          .exec(function (err, matchings) {
            let filteredMatchings = matchings.filter(
              (m) => !candidates.find((c) => c._id === m._candidate)
            );
            res.status(200).send(filteredMatchings);
          });
      });
  };

  // get all matching docs with score above threshold for user/candidate
  this.matchesCandidate = function (req, res, next) {
    var { _candidate } = req.user;
    Matching.find({
      _candidate,
      "vacancy.brief.status": VACANCY_STATUS.OPENED,
      isApproved: true,
    })
      .lean()
      .exec(function (err, matchings) {
        res.status(200).send(matchings);
      });
  };

  this.bookmark = (req, res, next) => {
    var role = req.user.role;
    var uuid = req.params.uuid;

    MatchingService.setStatus("bookmarked", { uuid, role }, (err, matching) => {
      if (err) return res.status(404).send();

      // if (role === ROLES.RECRUITER) {
      //   //TODO
      // } else if (role === ROLES.CANDIDATE) {
      //   mailer.onCandidateBookmarksMatch(
      //     {
      //       ...matching.candidate.brief.user,
      //       firstName: matching.candidate.brief.firstName,
      //       lastName: matching.candidate.brief.lastName,
      //       title: matching.vacancy.brief.title,
      //       company: matching.company.brief.name,
      //       match: matching,
      //     }, logger.errorOrInfo);
      // }
      res.status(200).send({ _id: matching._id });
    });
  };

  this.connect = (req, res, next) => {
    var role = req.user.role;
    var uuid = req.params.uuid;

    MatchingService.setStatus("approved", { uuid, role }, (err, matching) => {
      if (err) return res.status(404).send();
      return res.status(200).send({ _id: matching._id });
      // if (role === ROLES.RECRUITER) {
      //   let recruiterMessage = req.body.email;
      //   let recruiterInfo = {};
      //   let candidateEmail;

      //   Recruiter.findOne({ company: matching._company }).exec()
      //     .then((recruiter) => {
      //       return User.findOne({ _recruiter: recruiter.id })
      //         .populate("_recruiter").exec()
      //     }).then(u => {
      //       recruiterInfo.email = u.email;
      //       recruiterInfo.name = u._recruiter.fullName;
      //       recruiterInfo.company = matching.company.brief.name;
      //     }).then(() => {
      //       return User.findOne({ _candidate: matching._candidate }).exec().then(u => {
      //         candidateEmail = u.email;
      //       })
      //     }).then(() => {
      //       mailer.onRecruiterApprovesMatch(matching, {
      //         to: candidateEmail,
      //         replyTo: recruiterInfo.email,
      //         senderName: `${recruiterInfo.name} at ${recruiterInfo.company}`,
      //         subject: recruiterMessage.subject,
      //         body: sanitizeHtml(recruiterMessage.body).replace(/\n/g, '<br/>'),
      //       }, logger.errorOrInfo);
      //       res.status(200).send();
      //     })
      // }
    });
  };

  this.approve = (req, res, next) => {
    var role = req.user.role;
    var uuid = req.params.uuid;

    MatchingService.setStatus("approved", { uuid, role }, (err, matching) => {
      if (err) return res.status(404).send();
      if (role === ROLES.CANDIDATE) {
        Vacancy.findOne({ _id: matching._vacancy })
          .populate("recruiter")
          .lean()
          .exec()
          .then((v) => {
            User.findOne({ _id: v.recruiter.user })
              .lean()
              .exec((err, user) => {
                if (err) return res.status(500).send();
                // logger.info("about to send candidate an email")
                // mailer.onCandidateApprovesMatch(
                //   {
                //     ...user,
                //     firstName: matching.candidate.brief.firstName,
                //     lastName: matching.candidate.brief.lastName,
                //     title: v.title,
                //     company: matching.company.brief.name,
                //     match: matching,
                //   }, logger.errorOrInfo);
                res.status(200).send();
              });
          })
          .catch((e) => {
            logger.error(e);
            res.status(500).send();
          });
      }
    });
  };

  this.restore = (req, res, next) => {
    var role = req.user.role;
    var uuid = req.params.uuid;

    MatchingService.setStatus("new", { uuid, role }, (err, matching) => {
      if (err) return res.status(404).send();
      res.status(200).send();
    });
  };

  this.reject = (req, res, next) => {
    var role = req.user.role;
    var uuid = req.params.uuid;

    MatchingService.setStatus("rejected", { uuid, role }, (err, matching) => {
      if (err) return res.status(404).send();

      // if (role === ROLES.RECRUITER) {
      //   mailer.onRecruiterRejectsMatch(
      //     {
      //       ...matching.candidate.brief.user,
      //       name: matching.candidate.brief.firstName + ' ' + matching.candidate.brief.lastName,
      //       title: matching.vacancy.brief.title,
      //       company: matching.company.brief.name
      //     }, logger.errorOrInfo);
      // } else if (role === ROLES.CANDIDATE) {
      //   mailer.onCandidateRejectsMatch(
      //     {
      //       ...matching.candidate.brief.user,
      //       firstName: matching.candidate.brief.firstName,
      //       lastName: matching.candidate.brief.lastName,
      //       title: matching.vacancy.brief.title,
      //       company: matching.company.brief.name,
      //       match: matching,
      //     }, logger.errorOrInfo);
      // }
      res.status(200).send();
    });
  };

  this.updateMatches = function (req, res, next) {
    //explicitly blocking caching for this request
    //https://stackoverflow.com/questions/40277314/prevent-getting-json-response-from-cache-in-express-js
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

    if (MatchingService.isUpdating) {
      //if matches is currently updating
      //respond with unavailability status
      res.sendStatus(503);
    } else {
      //otherwise start update it
      // logger.info('Updating matches, this may take a moment...')

      MatchingService.isUpdating = true;
      if (req.body && req.body.industry) {
        console.log("candidate ids: ", req.body.candidateIds);
        console.log("vacancy ids: ", req.body.vacancyIds);
        console.log(req.body);
        console.log("Updating Some Matches");
        MatchingService.updateSome(
          req.body.industry,
          req.body.vacancyIds,
          req.body.candidateIds,
          function (err, matchings) {
            if (err) console.error(err);
            MatchingService.isUpdating = false;
            //cache matching records?
          }
        );
      } else {
        MatchingService.updateAll(function (err, matchings) {
          console.log("UPdating all matches");
          if (err) console.error(err);
          MatchingService.isUpdating = false;
          //cache matching records?
        });
      }
      res.sendStatus(200);
    }
  };
};
