const pdf = require("pdf-extraction");
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const Match = require('../models/matching')

const PDFService = function () { };

PDFService.processPDF = async (candidate, vacancy) => {
  let match = await Match.findOne({ _vacancy: vacancy._id, _candidate: candidate._id });
  const keywordList = Array.from(vacancy.keywords) || [];
  let sanitizedKeywords = keywordList.map(e => e.toLowerCase());
  if(sanitizedKeywords.length < 1){
    match.pdfScore = 0;
    match.save();
    return;
  };

  pdf(candidate.resume).then(function (data) {
    let finalKeywords = new Set();

    // PDF text
    let textSet = new Set(data.text.replace(/'/g, '').split(/[-\s,\n/]+/));
    let textArray = Array.from(textSet);
    let arr = [];

    textArray.map(e => {
      let lastCharacter = e.slice(-1);
      if (!alphabet.includes(e[0])) {
        e = e.slice(1);
      }
      if (lastCharacter === '.') {
        e = e.slice(0, -1);
      }
      arr.push(e.toLowerCase());
    });

    arr.map((e, i) => {
      let twoWords = `${arr[i]} ${arr[i + 1]}`
      if (sanitizedKeywords.includes(e.toLowerCase())) {
        finalKeywords.add(e.toLowerCase());
      }
      if (sanitizedKeywords.includes(twoWords.toLowerCase())) {
        finalKeywords.add(twoWords.toLowerCase());
      }
    });

    let finalScore = (finalKeywords.size / vacancy.keywords.length * 100).toFixed(0)
    match.pdfScore = finalScore;
    match.save();
  }).catch(error => {
    console.error(error);
  });
}

module.exports = PDFService