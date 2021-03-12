
const mongoose = require('mongoose');


const dbSchema = new mongoose.Schema({
	refid: {
		type: Number,
		required: true,
		unique: false
	},

	amount: {
		type: String,
		required: true
	},

	thet: {
		type: String,
		required: true
	},
	status: {
		type: String,
		required: true
	}

})

module.exports = mongoose.model('Send', dbSchema);