const mongoose = require('mongoose')
const Schema = mongoose.Schema
const fpSchema = Schema({
    title: String,
	year:Number,
	agency: String,
	name: String,
	GoP: String,
    amount: Number, 
	dept:String
});

const FundedProjects = mongoose.model('Funded Project',fpSchema)
module.exports = FundedProjects