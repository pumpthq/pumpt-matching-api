const Matching = require('../models/matching');
const User = require('../models/user');
const Company = require('../models/company');

const userIdFromEmail = async (email) => {
  try {
    // console.log('email', email)
    u = await User.findOne({ email })
    // console.log(u)
    return u._id;
  } catch (err) {
    console.log('error', err)
  }
}

// given a vacancy
// extracts a list of approved or pending candidates and some company data
// ret: {
//    candidates: [{email,name}] of candidates in non-rejected 
//                matches associated with the vacancy
//    title: title of job
//    company: name of company
//    }
const extractOnJobClosed = async (vacancy) => {
  const matches = await Matching.find({
    _vacancy: vacancy._id,
    isApproved: true,
    "vacancy.status": { "$ne": 'rejected' },
    "candidate.status": { "$ne": 'rejected' },
  }).lean().exec()
  const company = await Company.findById(vacancy._company).lean().exec();
  return {
    candidates: matches.map(m => extractFromMatch(m)),
    title: vacancy.title,
    company: company.name,
    reason: vacancy.closeFormResponse,
  };
}

// From match derives candidate {email, name}
const extractFromMatch = (match) => {
  if (typeof match.candidate.brief.user === 'object') {
    return new Promise(resolve => resolve({
      email: match.candidate.brief.user.email,
      name: match.candidate.brief.firstName + ' ' + match.candidate.brief.lastName
    }));
  }
  return User.findById(match.candidate.brief.user)
    .lean().exec().then(u => {
      return {
        name: match.candidate.brief.firstName + ' ' + match.candidate.brief.lastName,
        email: u.email
      }
    });
}

const companyNameFromVacancy = (vacancy) => {
  if (vacancy.company) {
    return new Promise(resolve => resolve(vacancy.company.brief.name))
  }
  return Company.findById(vacancy._company)
    .lean().exec().then(c => {
      return c.name
    });
}



module.exports = {
  extractOnJobClosed,
  extractFromMatch,
  companyNameFromVacancy,
  userIdFromEmail,
}
