var getDistance = require("../helpers/location").getDistance;
var MATCHING = require("../constants/matching");
var ROLES = require("../constants/roles");
const PDFService = require("../services/pdfService");
// const fileService = require('../services/fileService');
var Candidate = require("../models/candidate");
var Matching = require("../models/matching");
var constants = require("../constants/main");
var Vacancy = require("../models/vacancy");
var Company = require("../models/company");
var async = require("async");
var keyBy = require("lodash.keyby");
var experienceConverter = require("../helpers/yearsExperience").converter;
var getYearsWorked = require("../helpers/yearsExperience").getYearsWorked;
var influence = {
  areaOfExpertise: 20,
  industry: 60,
  companySize: 40,
  yearsOfExperience: 30,
  demonstratedExperience: 30,
  employment: 10,
  valuesAssessment: 5,
  location: 0,
};
const axios = require("axios");

const truncate = (x) => Math.trunc(x * 10) / 10;

// var { MATCHING_SCORE_THRESHOLD } = require('../config')

var MatchingService = function () {};

/**
 * MatchingService.calculateScore - static function for calcuating matching score from candidate, company, and vacancy doc
 *
 * @param  {Object} candidate the candidate being matched
 * @param  {Object} company   the company with vacancy
 * @param  {Object} vacancy   the vacancy being matched
 * @return {int}    score     the matching score
 */
MatchingService.calculateScore = function ({ candidate, company, vacancy }) {
  // console.log('candidate data', candidate.resume)

  async function scorePDF() {
    await PDFService.processPDF(candidate, vacancy);
  }

  if (candidate.resume) {
    scorePDF();
  }

  const gradedScore = (list, goal, choice, total) => {
    return truncate(
      Math.pow(0.5, Math.abs(list.indexOf(choice) - list.indexOf(goal))) * total
    );
  };

  // like a gradedScore but reward matches for which the candidate is
  // overqualified
  const yearsOfExperienceScore = (list, goal, choice, total) => {
    if (list.indexOf(choice) - list.indexOf(goal) < -1) {
      return 0;
    }
    switch (list.indexOf(choice) - list.indexOf(goal)) {
      case -1:
        return 0.5 * total;
      case 0:
        return total;
      default:
        return total + total * 0.5;
    }
  };

  var breakdown = {
    expertise: {
      score: 0,
      total: influence.areaOfExpertise * vacancy.industries.length,
    }, // 20 for each in common
    industry: { score: 0, total: influence.industry }, // percentage in common
    size: { score: 0, total: influence.companySize }, // graded proximity
    years: { score: 0, total: influence.yearsOfExperience * 1.5 }, // max of 45 for overqualified candidates, *2 for demonstrating experience
    demonstratedExperience: {
      score: 0,
      total: influence.demonstratedExperience * 1.5,
    },
    employment: {
      score: 0,
      total: influence.employment * vacancy.employment.length,
    }, // 10 for each in common
    values: { score: 0, total: influence.valuesAssessment * 3 }, // 5 for each in common
    message: "",
  };
  /* Eagerly detect critical mismatch and return a score of 0 */

  // mismatch unapproved user
  if (!candidate.user.isApproved) {
    breakdown.message = "Candidate is not approved";
    return { score: 0, breakdown };
  }

  // mismatch compensation: vacancy salary is lower than candidate's current income
  if (
    MATCHING.RECENT_ANNUAL_INCOMES.indexOf(vacancy.salary) <
    MATCHING.RECENT_ANNUAL_INCOMES.indexOf(candidate.recentAnnualIncome)
  ) {
    breakdown.message = "Candidate salary is higher than vacancy";
    return { score: 0, breakdown };
  }

  // don't match if candidate experience is too low
  if (
    MATCHING.EXPERIENCES.indexOf(candidate.recentAreaExperience) -
      MATCHING.EXPERIENCES.indexOf(vacancy.experience) <
    -1
  ) {
    breakdown.message =
      "Candidate doesn't have required number of years of experience";
    return { score: 0, breakdown };
  }

  // don't match if candidate's degree is too low
  if (
    candidate.highestDegree &&
    MATCHING.DEGREES.indexOf(candidate.highestDegree) <
      MATCHING.DEGREES.indexOf(vacancy.degree)
  ) {
    breakdown.message = "Candidate does not meet degree requirement";
    return { score: 0, breakdown };
  }

  // don't match unless fieldOfExpertiseParent matches
  if (
    candidate.recentWorkingAreas &&
    vacancy.industries &&
    candidate.recentWorkingAreas.length > 0 &&
    vacancy.industries.length > 0 &&
    candidate.recentWorkingAreas[0].parent !== vacancy.industries[0].parent
  ) {
    breakdown.message = "Candidate Field of Expertise does not match vacancy";
    return { score: 0, breakdown };
  }

  const validateCoordinates = (coord) => coord && coord.lng && coord.lat;
  const validateManyCoordinates = (locs) =>
    locs &&
    Array.isArray(locs) &&
    locs.map((l) => validateCoordinates(l)).every((l) => l);
  const withinRange = (probe, locs, dist) => {
    return locs.map((l) => getDistance(probe, l)).some((d) => d < dist);
  };
  // don't match if candidate is unwilling to relocate and job is > 75 miles
  // (120,000 meters) away

  const vacancyHasManyLocations = !(
    vacancy.locations.length < 1 || vacancy.locations === undefined
  );
  const vacancy_locations = vacancyHasManyLocations
    ? vacancy.locations
    : [vacancy.locationCoordinates];

  if (
    !candidate.abilityToRelocate &&
    validateCoordinates(candidate.locationCoordinates) &&
    (vacancyHasManyLocations
      ? validateManyCoordinates(vacancy.locations)
      : validateCoordinates(vacancy.locationCoordinates)) &&
    !withinRange(candidate.locationCoordinates, vacancy_locations, 120000)
  ) {
    breakdown.message =
      "Candidate is unable to relocate and job is greater than 75 miles away";
    return { score: 0, breakdown };
  }

  let appropriation = 0;

  // Area of expertise
  const expertiseNumberInCommon = candidate.recentWorkingAreas.filter((cArea) =>
    vacancy.industries.some(
      (ind) => ind.value === cArea.value && ind.parent === cArea.parent
    )
  ).length;
  breakdown.expertise.score =
    influence.areaOfExpertise * expertiseNumberInCommon;
  appropriation += breakdown.expertise.score;

  // Industry
  const industryPercentInCommon =
    candidate.interestWorkingArea.filter((cArea) =>
      company.type.includes(cArea)
    ).length / candidate.interestWorkingArea.length;
  breakdown.industry.score = truncate(
    influence.industry * industryPercentInCommon
  );
  appropriation += breakdown.industry.score;

  // Compensation
  // a null recentAnnualIncome is treated like a 'dont-care'.
  // This can be used for candidates to decline answering.
  /* short circuit makes this redundant
    if (!candidate.recentAnnualIncome
      || MATCHING.RECENT_ANNUAL_INCOMES.indexOf(vacancy.salary) >= MATCHING.RECENT_ANNUAL_INCOMES.indexOf(candidate.recentAnnualIncome)) {
        breakdown.compensation.score = influence.compensation;
        appropriation += breakdown.compensation.score;
    }*/

  // Company size
  if (
    candidate.preferredCompanySize ||
    MATCHING.EMPLOYEES_AMOUNTS.indexOf(candidate.preferredCompanySize) ===
      MATCHING.EMPLOYEES_AMOUNTS.indexOf(company.employeesAmount)
  ) {
    breakdown.size.score = gradedScore(
      MATCHING.EMPLOYEES_AMOUNTS,
      candidate.preferredCompanySize,
      company.employeesAmount,
      influence.companySize
    );
    appropriation += breakdown.size.score;
  }

  // Years of Experience
  // Weighted higher if experience is demonstrated by Work Experience
  // entries
  if (vacancy.experience) {
    breakdown.years.score = yearsOfExperienceScore(
      MATCHING.EXPERIENCES,
      vacancy.experience,
      candidate.recentAreaExperience,
      influence.yearsOfExperience
    );
    appropriation += breakdown.years.score;
  }

  if (candidate.workingExperience) {
    let demonstratedExp = candidate.workingExperience.reduce(
      (runningExperience, entry) => runningExperience + getYearsWorked(entry),
      0
    );
    breakdown.demonstratedExperience.score = yearsOfExperienceScore(
      MATCHING.EXPERIENCES,
      vacancy.experience,
      experienceConverter(demonstratedExp),
      influence.yearsOfExperience
    );
    appropriation += breakdown.demonstratedExperience.score;
  }

  // Employment
  const employmentNumberInCommon = vacancy.employment.filter((ve) =>
    candidate.employments.includes(ve)
  ).length;
  breakdown.employment.score = influence.employment * employmentNumberInCommon;
  appropriation += breakdown.employment.score;

  // Values Assessment
  if ("values" in candidate && "values" in company) {
    candidate.values.forEach(function (assessment) {
      if (company.values.includes(assessment)) {
        breakdown.values.score += influence.valuesAssessment;
      }
    });
  }
  appropriation += breakdown.values.score;

  Object.getOwnPropertyNames(breakdown).forEach((k) => {
    if (typeof breakdown[k] !== "string") {
      breakdown[k] = breakdown[k].score + "/" + breakdown[k].total;
    }
  });

  return { score: appropriation, breakdown };
};

MatchingService.setStatus = function (val, { role, uuid }, callback) {
  var prefix;
  if (role == ROLES.CANDIDATE) {
    prefix = "vacancy.status";
  } else if (role == ROLES.RECRUITER) {
    prefix = "candidate.status";
  }
  var loc = prefix; // e.g. vacancy.status.bookmarked
  var doc = { [loc]: val };
  Matching.findByIdAndUpdate(uuid, { $set: doc }, { new: true })
    .lean()
    .exec((err, matching) => {
      if (err) console.error(err);
      callback(err, matching);
    });
};

MatchingService.updateMatches = function (candidates, vacancies, callback) {
  // get companies
  // iterate through candidates and vacancies, slating matches as tasks
  // update the matches
  let tasks = [];
  let finalTasks = [];
  async.waterfall([
    function (cb) {
      Candidate.find({ active: false }).lean().exec(cb);
    },
    function (inactiveCandidates, cb) {
      candidates = candidates.filter(
        (c) => !inactiveCandidates.find((i) => i._id === c._id)
      );
      cb();
    },
    function (cb) {
      Company.find(function (err, docs) {
        let companiesById = keyBy(docs, (o) => o._id);
        cb(err, companiesById);
      });
    },
    function (companiesById, cb) {
      vacancies.forEach((vacancy) => {
        if (
          vacancy.status === constants.VACANCY_STATUS.CLOSED ||
          vacancy.status === constants.VACANCY_STATUS.DRAFT
        ) {
          return;
        }
        let _vacancy = vacancy._id,
          _company = vacancy._company,
          company = companiesById[_company];
        // init matchings candidates data briefs to store on vacancy

        if (!company) {
          console.log(
            `Company could not be found for vacancy with id ${_vacancy}`
          );
          return;
        }

        vacancy.candidates = { briefs: [] };
        vacancy.company = { brief: company.brief };

        candidates.forEach((candidate) => {
          // console.log("Matched candidate: " , candidate)
          let _candidate = candidate._id;

          if (!candidate.user) {
            console.log(
              `User could not be found for candidate with id ${_candidate}`
            );
            return;
          }
          if (!candidate.user.isApproved) {
            // console.log('unapproveed candidate', candidate)
            return;
          }

          // 🌟 generate score for this candidate, vacancy, company combination
          let { score, breakdown } = MatchingService.calculateScore({
            candidate,
            vacancy,
            company,
          });

          // define a function that can be called later to update this matching record with score and up-to-date data briefs
          let subtask = (pcb) => {
            Matching.findOneAndUpdate(
              { _candidate, _vacancy, _company },
              {
                $set: {
                  score,
                  breakdown,
                  "company.brief": company.brief,
                  "vacancy.brief": vacancy.brief,
                  "candidate.brief": Object.assign(
                    {
                      user: candidate.user.brief,
                    },
                    candidate.brief
                  ),
                },
              },
              { upsert: true, setDefaultsOnInsert: true, new: true },
              function (err, doc) {
                if (err) pcb(err);
                // if the score was above the threshold and vacancy is approved, store candidate brief on vacancy record
                // console.log(
                //   `\n-----\nmatch - [${company.name}] ${vacancy.title} -> ${candidate.firstName} ${candidate.lastName} | score=${doc.score} pdf-score=${doc.pdfScore} vacancy.status=${doc.vacancy.status} candidate.status=${doc.candidate.status}\n-----\n`
                // );
                if (doc.isApproved && doc.vacancy.status === "approved") {
                  // vacancy.candidates.briefs.push(candidate.brief)
                  vacancy.candidates.briefs.push(
                    Object.assign({ _id: candidate._id }, candidate.brief)
                  ); //hack _id into brief
                }
                pcb(err, doc);
              }
            );
          };
          tasks.push(subtask);
        });

        // 🍦 update vacancy record with up-to-date data briefs
        finalTasks.push((pcb) => vacancy.save(pcb));
      });

      // finally, run all updates
      async.parallel(tasks, () => cb(null, finalTasks));
    },
    function (finalTasks, cb) {
      // finally, run all updates
      async.parallel(finalTasks, callback);
    },
  ]);
};

MatchingService.updateSome = function (
  industry = null,
  vacancyIds,
  candidateIds,
  callback
) {
  let vacancies, candidates;
  vacancyQuery =
    vacancyIds && vacancyIds.length > 0 ? { _id: { $in: vacancyIds } } : {};
  candidateQuery =
    candidateIds && candidateIds.length > 0
      ? { _id: { $in: candidateIds } }
      : {};
  if (industry) {
    console.log(`Running Matches against ${industry} vacancies`)
    vacancyQuery = {
      ...vacancyQuery,
      industries: { $elemMatch: { parent: industry } },
    };
    candidateQuery = {
      ...candidateQuery,
      recentWorkingAreas: { $elemMatch: { parent: industry } },
    };
  }
  async.waterfall([
    function (cb) {
      Vacancy.find(vacancyQuery, function (err, docs) {
        vacancies = docs;
        cb(err);
      });
    },
    function (cb) {
      Candidate.find(candidateQuery)
        .populate("user")
        .exec(function (err, docs) {
          candidates = docs;
          cb(err);
        });
    },
    function (cb) {
      MatchingService.updateMatches(candidates, vacancies, callback);
    },
  ]);
};

MatchingService.updateAll = function (callback) {
  //1. get all vacancies
  //2. get all candidates
  //3. iterate thru vacancies and candidates, upserting matches
  let vacancies, candidates;
  async.waterfall([
    function (cb) {
      Vacancy.find(function (err, docs) {
        vacancies = docs;
        cb(err);
      });
    },
    function (cb) {
      Candidate.find()
        .populate("user")
        .exec(function (err, docs) {
          candidates = docs;
          cb(err);
        });
    },
    function (cb) {
      // console.log("Candidates for matching: ", candidates)
      MatchingService.updateMatches(candidates, vacancies, callback);
    },
  ]);
};

module.exports = MatchingService;
