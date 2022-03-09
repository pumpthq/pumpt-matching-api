const Company = require("./models/company");

const convertRecruiters = async function () {
  try {
    const companies = await Company.find({});

    console.log(companies);
    return;
  } catch (error) {
    console.log(error)
  }
};

module.exports = { convertRecruiters };

