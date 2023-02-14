const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MailSchema = new Schema({
    email:String,
    password:String,
})

const Mail = mongoose.model('Mail', MailSchema)

module.exports = Mail