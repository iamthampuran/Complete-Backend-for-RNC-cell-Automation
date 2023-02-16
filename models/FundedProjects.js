const mongoose = require('mongoose')
const Schema = mongoose.Schema
const fpSchema = Schema({
    title: String,
	AcademicYear:String,
	agency: String,
	name: String,
	GoP: String,
    amount: Number, 
	dept:String,
	status: String,
	type: String
});

const FundedProjects = mongoose.model('Funded Project',fpSchema)
module.exports = FundedProjects