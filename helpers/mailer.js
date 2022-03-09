var mg = require("nodemailer-mailgun-transport");
var axios = require("axios");
var nodemailer = require("nodemailer");
var template = require("lodash.template");
var fs = require("fs");
var env = require("../config");
var mailUtils = require("./mailUtils");
var logger = require("./logger")(module);
const Candidate = require("../models/candidate");
const Email = require("../models/email");
const uuid = require("uuid");
const constants = require("../constants/main.js");

// grab current api path to provide in emails links
var API_PATH = process.env.SERVER_API_PATH_FOR_MAILER;
const ADMIN_EMAIL = env.ADMIN_EMAIL;
const EMAIL_URL = env.EMAIL_URL;

ftrOpts = { mailTo: "mailto:info@pumpthq.com" };

// define html templates
var emailTemplate = template(
  fs.readFileSync("static/mail/templs/emailTemplate.html", "utf8")
);
var changePassTemplate = template(
  fs.readFileSync("static/mail/templs/onChangePass.html", "utf8")
);
var resetPassTemplate = template(
  fs.readFileSync("static/mail/templs/onResetPass.html", "utf8")
);

var registerTemplate = template(
  fs.readFileSync("static/mail/templs/onRegister.html", "utf8")
);
var adminUserRegisterTemplate = template(
  fs.readFileSync("static/mail/templs/adminOnUserRegister.html", "utf8")
);

var deactivateTemplate = template(
  emailTemplate({
    ...ftrOpts,
    emailContent: fs.readFileSync(
      "static/mail/templs/onDeactivate.html",
      "utf8"
    )
  })
);
var reactivateTemplate = template(
  emailTemplate({
    ...ftrOpts,
    emailContent: fs.readFileSync(
      "static/mail/templs/onReactivate.html",
      "utf8"
    )
  })
);
var candidateApproveTemplate = template(
  fs.readFileSync("static/mail/templs/onCandidateApprove.html", "utf8")
);
var recruiterApproveTemplate = template(
  fs.readFileSync("static/mail/templs/onRecruiterApprove.html", "utf8")
);
var newPassTemplate = template(
  fs.readFileSync("static/mail/templs/onNewPass.html", "utf8")
);
var matchesTemplate = template(
  fs.readFileSync("static/mail/templs/onMatches.html", "utf8")
);
var rejectTemplate = template(
  fs.readFileSync("static/mail/templs/onReject.html", "utf8")
);
var candidateMatchTemplate = template(
  fs.readFileSync("static/mail/templs/candidateOnMatch.html", "utf8")
);
var adminCandidateIsMatchedTemplate = template(
  fs.readFileSync(
    "static/mail/templs/adminCandidateIsMatchedTemplate.html",
    "utf8"
  )
);

var candidateRejectTemplate = template(
  fs.readFileSync("static/mail/templs/candidateOnReject.html", "utf8")
);

var adminCandidateApprovesMatchTemplate = template(
  fs.readFileSync("static/mail/templs/adminOnMatch.html", "utf8")
);
var adminCandidateBookmarksMatchTemplate = template(
  fs.readFileSync(
    "static/mail/templs/adminCandidateBookmarksMatch.html",
    "utf8"
  )
);
var adminCandidateRejectsMatchTemplate = template(
  fs.readFileSync(
    "static/mail/templs/adminOnCandidateRejectsMatch.html",
    "utf8"
  )
);

var adminRecruiterRejectsMatchTemplate = template(
  fs.readFileSync("static/mail/templs/adminOnReject.html", "utf8")
);
var adminRecruiterApprovesMatchTemplate = template(
  fs.readFileSync("static/mail/templs/adminOnRecruiterApprove.html", "utf8")
);

var candidateJobClosedTemplate = template(
  fs.readFileSync("static/mail/templs/candidateOnJobClose.html", "utf8")
);
var adminJobClosedTemplate = template(
  fs.readFileSync("static/mail/templs/adminOnJobClose.html", "utf8")
);
var adminNewVacancyTemplate = template(
  fs.readFileSync("static/mail/templs/adminOnNewVacancy.html", "utf8")
);
var adminPublishVacancyTemplate = template(
  fs.readFileSync("static/mail/templs/adminOnPublishVacancy.html", "utf8")
);
var adminUpdateVacancyTemplate = template(
  fs.readFileSync("static/mail/templs/adminOnUpdateVacancy.html", "utf8")
);
var partialProfileTemplate = template(
  emailTemplate({
    ...ftrOpts,
    emailContent: fs.readFileSync(
      "static/mail/templs/partialProfile.html",
      "utf8"
    )
  })
);
var oldJobTemplate = template(
  emailTemplate({
    mailTo: "mailto:admin@pumpthq.com",
    emailContent: fs.readFileSync("static/mail/templs/oldJob.html", "utf8")
  })
);
var didYouHireTemplate = template(
  fs.readFileSync("static/mail/templs/didYouHire.html", "utf8")
);

// define mailer transport
var Transport = nodemailer.createTransport(
  mg({
    auth: {
      api_key: env.MAILGUN_API_KEY,
      domain: env.MAILGUN_DOMAIN
    }
  })
);

// define abstract mail function
var send = function ({ email, subject, htmlTemplate, templOptions = {}, data, type = "GENERIC_ACTION" }, mailOptions, callback) {
  // Make mailOptions optional
  if (!callback && typeof mailOptions == "function") {
    callback = mailOptions;
  }
  // Make callback optional
  let cb = typeof callback == "function" ? callback : (e, v) => v;

  return mailUtils.userIdFromEmail(email).then(_user =>
    axios
      .post(EMAIL_URL, {
        _user: _user || "02109cb7-eab3-429e-90fa-041e255f8831",
        addressee: email,
        sender:
          mailOptions && mailOptions.sender
            ? mailOptions.sender
            : "info@pumpthq.com",
        subject,
        content: !data && htmlTemplate(templOptions),
        data,
        type,
        ...mailOptions
      },
        {
          auth: {
            username: "API",
            password: env.EMAIL_SECRET
          }
        }
      )
      .catch(err => {
        logger.error(err);
        throw err;
      })
      .then(val => cb(null, val))
      .catch(err => cb(err))
  );
};

var forceSend = function (email, subject, htmlTemplate, templOptions, callback) {
  Transport.sendMail(
    {
      to: email,
      from: "info@pumpthq.com",
      subject: subject,
      html: htmlTemplate(templOptions),
      generateTextFromHTML: true,
      attachments: [
        {
          filename: "logo.png",
          path: "http://pumpthq.com/logo.png",
          cid: "PUMPT_LOGO_EMAIL_V1.0"
        }
      ],
      ...mailOptions
    },
    callback
  );
};

module.exports = exports = {};

exports.onOldOpenJob = function ({ email, id }, { title }, callback) {
  send(
    {
      email,
      subject: "Is your job still open?",
      htmlTemplate: oldJobTemplate,
      templOptions: { jobTitle: title },
      type: constants.EMAIL_TYPE.OLD_JOB
    },
    { replyTo: "admin@pumpthq.com" },
    callback
  );
};
exports.onPartialProfile = function ({ id, email }, callback) {
  send(
    {
      email,
      subject: "Complete your Pumpt profile",
      htmlTemplate: partialProfileTemplate,
      type: constants.EMAIL_TYPE.PROFILE
    },
    callback
  );
};

exports.onCandidateApproveRegister = function (email, callback) {
  send(
    {
      email,
      subject: "Application Status",
      htmlTemplate: candidateApproveTemplate
    },
    callback
  );
};

exports.onRecruiterApproveRegister = function (email, callback) {
  send(
    {
      email,
      subject: "Application Status",
      htmlTemplate: recruiterApproveTemplate
    },
    callback
  );
};

exports.onChangePassword = function (email, password, callback) {
  send(
    {
      email,
      subject: "Change Password Request",
      htmlTemplate: changePassTemplate,
      templOptions: { password: password }
    },
    callback
  );
};

exports.onNewPassword = function (email, password, callback) {
  send(
    {
      email,
      subject: "New Password",
      htmlTemplate: newPassTemplate,
      templOptions: { password: password }
    },
    callback
  );
};

exports.onRejectRegister = function (email, callback) {
  send(
    {
      email,
      subject: "Application Status",
      htmlTemplate: rejectTemplate
    },
    callback
  ).catch(err => {
    logger.error("Error sending application rejection email", err);
  });
};

exports.onResetPassword = function (email, token, callback) {
  send(
    {
      email,
      subject: "Change Password Request",
      htmlTemplate: resetPassTemplate,
      templOptions: { url: API_PATH + "/password/reset/" + token }
    },
    callback
  ).catch(err => {
    logger.error("Error password reset email", err);
  });
};

exports.onRegister = function (user, name, email, token, callback) {
  send(
    {
      email,
      subject: "Email Confirmation",
      htmlTemplate: registerTemplate,
      templOptions: { url: API_PATH + "/users/confirm/" + token }
    },
    callback
  );

  send({
    email: ADMIN_EMAIL,
    subject: `${name} has signed up [New ${user.model}]`,
    htmlTemplate: adminUserRegisterTemplate,
    templOptions: {
      email: user.email,
      type: user.model
    }
  }).catch(err => {
    logger.error("Error sending email on user registration", err);
  });
};

exports.onDeactivate = function (email, callback) {
  send(
    {
      email,
      subject: "Account Deactivated",
      templOptions: deactivateTemplate
    },
    callback
  );
};

exports.onReactivate = function (email, callback) {
  send(
    {
      email,
      subject: "Account Reactivated",
      htmlTemplate: reactivateTemplate
    },
    callback
  );
};

exports.onRecruiterVacanciesMatches = function (data, callback) {
  send(
    {
      email: data.email,
      subject: "Candidate Matches",
      htmlTemplate: matchesTemplate,
      templOptions: data
    },
    callback
  );
};

exports.onAdminApprovesMatch = function (candidate, match, callback) {
  send(
    {
      email: candidate.email,
      subject: "You’ve been matched to a job on Pumpt!",
      htmlTemplate: candidateMatchTemplate,
      templOptions: candidate
    },
    callback
  );

  send({
    email: ADMIN_EMAIL,
    subject: `A candidate has been matched`,
    htmlTemplate: adminCandidateIsMatchedTemplate,
    templOptions: {
      firstName: match.candidate.brief.firstName,
      lastName: match.candidate.brief.lastName,
      title: match.vacancy.brief.title,
      company: match.company.brief.name
    }
  }).catch(err => {
    logger.error("Error sending candidate match email", err);
  });
};

exports.onCandidateBookmarksMatch = function (candidate, match, callback) {
  send({
    email: ADMIN_EMAIL,
    subject: `A candidate has been matched`,
    htmlTemplate: adminCandidateIsMatchedTemplate,
    templOptions: {
      firstName: match.candidate.brief.firstName,
      lastName: match.candidate.brief.lastName,
      title: match.vacancy.brief.title,
      company: match.company.brief.name
    }
  }).catch(err => {
    logger.error("Error sending admin candidate bookmarked match email", err);
  });
};

// Send first contact from recruiter to candidate
//   inform admin
exports.onRecruiterApprovesMatch = function (
  match,
  { to, replyTo, senderName, subject, body },
  callback
) {
  send(
    {
      email: to,
      subject,
      htmlTemplate: () => body
    },
    {
      replyTo,
      sender: `"${senderName}" <info@pumpthq.com>`,
      bcc: ADMIN_EMAIL
    },
    callback
  );

  send({
    email: ADMIN_EMAIL,
    subject: `A recruiter has approved a match`,
    htmlTemplate: adminRecruiterApprovesMatchTemplate,
    templOptions: {
      firstName: match.candidate.brief.firstName,
      lastName: match.candidate.brief.lastName,
      title: match.vacancy.brief.title,
      company: match.company.brief.name
    }
  }).catch(err => {
    logger.error("Error sending recruiter match approval email", err);
  });
};

exports.pendingRecruiterMatch = function (data, callback) {
  send(
    {
      email: data.email,
      subject:
        // prettier-ignore
        `${data.matchedManyCandidates ? 'New candidates have' : 'A new candidate has'} applied to your job posting${data.matchedManyVacancies ? 's' : ''} on Pumpt!`,
      data: data.match,
      type: "PENDING_MATCH_RECRUITER",
      bcc: ADMIN_EMAIL
    },
    callback
  ).catch(err => {
    logger.error("Error sending recruiter match update email", err);
  });
};

exports.pendingCandidateMatch = function (data, callback) {
  send(
    {
      email: data.email,
      // prettier-ignore
      subject: `You have been matched to ${data.hasManyMatches ? 'job postings' : 'a job posting'} on Pumpt!`,
      data: data.match,
      type: "PENDING_MATCH_CANDIDATE",
      bcc: ADMIN_EMAIL
    },
    callback
  ).catch(err => {
    logger.error("Error sending candidate match update email", err);
  });
};

exports.recruiterStatusReport = function (data, callback) {
  send(
    {
      email: data.email,
      sender: `jd@pumpthq.com`,
      subject:
        // prettier-ignore
        `Pumpt Job Report: ${data.company}, ${data.date}`,
      data: { vacancies: data.vacancies },
      type: "STATUS_REPORT_RECRUITER",
      bcc: ADMIN_EMAIL
    },
    callback
  ).catch(err => {
    logger.error("Error sending recruiter status report email", err);
  });
};

exports.onCandidateApprovesMatch = function (data, callback) {
  send(
    {
      email: data.email,
      subject: "Your job posting has been matched to a candidate on Pumpt!",
      data: data.match,
      type: "RECRUITER_RECEIVES_MATCH"
    },
    callback
  );

  // Then notify admin
  send(
    {
      email: ADMIN_EMAIL,
      subject: `${data.firstName} ${data.lastName
        } [Candidate] approved a match with ${data.company}`,
      htmlTemplate: adminCandidateApprovesMatchTemplate,
      templOptions: data
    },
    callback
  ).catch(err => {
    logger.error("Error sending candidate match approval email", err);
  });
};

exports.onCandidateRejectsMatch = function (data, callback) {
  send(
    {
      email: ADMIN_EMAIL,
      subject: `${data.firstName} ${data.lastName
        } [Candidate] rejected a match with ${data.company}`,
      htmlTemplate: adminCandidateRejectsMatchTemplate,
      templOptions: data
    },
    callback
  ).catch(err => {
    logger.error("Error sending candidate match rejection email", err);
  });
};

exports.onCandidateBookmarksMatch = function (data, callback) {
  send(
    {
      email: ADMIN_EMAIL,
      subject: `${data.firstName} ${data.lastName
        } [Candidate] bookmarked a match with ${data.company}`,
      htmlTemplate: adminCandidateBookmarksMatchTemplate,
      templOptions: data
    },
    callback
  ).catch(err => {
    logger.error("Error sending candidate match bookmark email", err);
  });
};

exports.onRecruiterRejectsMatch = function (data, callback) {
  // takes: {name: "candidate first name", company: "Company Name", title: "Job Title"}
  send(
    {
      email: data.email,
      subject: `Your Application to ${data.title} Position at ${data.company}`,
      htmlTemplate: candidateRejectTemplate,
      templOptions: data
    },
    callback
  );
  // Then notify admin
  send(
    {
      email: ADMIN_EMAIL,
      subject: `${data.company} [Recruiter] rejected a match with ${data.name}`,
      htmlTemplate: adminRecruiterRejectsMatchTemplate,
      templOptions: {
        name: data.name,
        email: data.email,
        title: data.title,
        company: data.company
      }
    },
    callback
  ).catch(err => {
    logger.error("Error sending recruiter match rejection email", err);
  });
};

exports.onJobClosed = function (vacancy, email, callback) {
  send(
    {
      email,
      subject: "Did you make a hire?",
      htmlTemplate: didYouHireTemplate,
      templOptions: { title: vacancy.title }
    },
    { replyTo: "admin@pumpthq.com" },
    callback
  );
  mailUtils
    .extractOnJobClosed(vacancy)
    .then(({ candidates, title, company, reason }) => {
      // Notify pending and approved candidate
      candidates.map(c => {
        c.then(({ name, email }) => {
          send(
            {
              email,
              subject: "Your Matched Job is Now Closed",
              htmlTemplate: candidateJobClosedTemplate,
              templOptions: { name: name, title, company }
            },
            callback
          );
        }).catch(err => {
          logger.error("Error sending email on job close", err);
        });
      });
      // Then notify admin
      send(
        {
          email: ADMIN_EMAIL,
          subject: `${company} closed the vacancy "${title}"`,
          htmlTemplate: adminJobClosedTemplate,
          templOptions: { candidates, title, company, reason }
        },
        callback
      );
    })
    .catch(err => {
      logger.error(
        "Problem extracting candidate emails for job close notice",
        err
      );
      callback(err);
    });
};

exports.onNewVacancy = function ({ vacancy, company }, callback) {
  send(
    {
      email: ADMIN_EMAIL,
      subject: `${company.name} created a new vacancy`,
      htmlTemplate: adminNewVacancyTemplate,
      templOptions: {
        vacancy: JSON.stringify({
          title: vacancy.title,
          location: vacancy.location,
          description: vacancy.description
        })
      }
    },
    callback
  );
};

exports.onJobPublish = function (vacancy, callback) {
  mailUtils
    .companyNameFromVacancy(vacancy)
    .then(company => {
      send(
        {
          email: ADMIN_EMAIL,
          subject: `${company} published a vacancy`,
          htmlTemplate: adminPublishVacancyTemplate,
          templOptions: {
            vacancy: JSON.stringify({
              title: vacancy.title,
              location: vacancy.location,
              description: vacancy.description
            })
          }
        },
        callback
      );
    })
    .catch(err => {
      if (callback && typeof callback == "function") {
        callback(err);
      } else {
        logger.error(err);
      }
    });
};

exports.onJobUpdate = function (vacancy, callback) {
  mailUtils
    .companyNameFromVacancy(vacancy)
    .then(company => {
      send(
        {
          email: ADMIN_EMAIL,
          subject: `${company} updated a vacancy`,
          htmlTemplate: adminUpdateVacancyTemplate,
          templOptions: {
            vacancy: JSON.stringify({
              title: vacancy.title,
              location: vacancy.location,
              description: vacancy.description
            })
          }
        },
        callback
      );
    })
    .catch(err => {
      if (callback && typeof callback == "function") {
        callback(err);
      } else {
        logger.error(err);
      }
    });
};
