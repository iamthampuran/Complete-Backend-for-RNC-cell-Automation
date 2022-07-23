const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NumSchema = new Schema({
    num: Number
})
const num1 = mongoose.model('number',NumSchema)
module.exports = num1
