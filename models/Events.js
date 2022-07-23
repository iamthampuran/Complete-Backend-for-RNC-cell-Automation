const mongoose = require("mongoose");
const Schema = mongoose.Schema

const addESchema = new Schema({

    eventN: String,
	venue:String, 
	org: String, 
	date: String,
    time: String, 
})

const addEvnt = mongoose.model('Event',addESchema)
module.exports = addEvnt