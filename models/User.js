const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FeeSchema = new Schema({
    studentnames: String,
    name: String,
    year: Number,
    totalfee: Number,
    from:String,
    type:String
})

const Reinbursement = mongoose.model('Fee Reinbursement',FeeSchema)
module.exports = Reinbursement
