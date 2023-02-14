const mongoose = require("mongoose");
const Schema = mongoose.Schema

const addESchema = new Schema({

    Event_Name: String,
	Venue:String, 
	Organisation: String, 
	Date: String,
    Time: String,
	Source: String,
	Branch: String
})

const addEvnt = mongoose.model('Event',addESchema)
module.exports = addEvnt