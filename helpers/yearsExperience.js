const { EXPERIENCE } = require('../constants/matching');

module.exports = {
  converter: function(years) {
    if (years < 3) {
      return EXPERIENCE.gt0lt2;
    } else if (years < 6) {
      return EXPERIENCE.gt2lt5;
    } else if (years < 11) {
      return EXPERIENCE.gt5lt10;
    } else if (years < 16) {
      return EXPERIENCE.gt10lt15;
    } else {
      return EXPERIENCE.gt15;
    }
  },
  getYearsWorked: function(entry) {
    if (!entry || !entry.startWorkingAt) {
      return 0;
    }
    startYear = parseInt(entry.startWorkingAt.substr(entry.startWorkingAt.length - 4), 10);
    endYear = entry.endWorkingAt ? 
      parseInt(entry.endWorkingAt.substr(entry.startWorkingAt.length - 4), 10)
      :
      (new Date()).getFullYear();
    if (isNaN(startYear) || isNaN(endYear)) {
      return 0;
    }
    return endYear - startYear;
  }
}
