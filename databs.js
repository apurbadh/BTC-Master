
const mongoose = require('mongoose');


const dbSchema = new mongoose.Schema({
	refid: {
		type: Number,
		required: true,
		unique: true
	},

	btcad: {
		type: String,
		required: true,
		unique: true
	},

	refby: {
		type: String,
		required: true,
	},

	plan: {
		type: String,
		required: true,
		default: "Free"
	},

	accbal: {
		type: String,
		required: true
	},

	days: {
		type: Number,
		required: false
	}

})

module.exports = mongoose.model('User', dbSchema);

