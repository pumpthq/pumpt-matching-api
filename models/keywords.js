const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KeywordSchema = new Schema({
	keywordList: { type: Array },
}, { timestamps: true });

// KeywordSchema.virtual('brief').get(function() {
// 	const matchedKey = this,
// 	return matchedKey
// })

const Keywords = mongoose.model('keywords', KeywordSchema);

module.exports = Keywords;