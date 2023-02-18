const mongoose = require('mongoose')            //mongoose schema for email sender
const Schema = mongoose.Schema

const MailSchema = new Schema({
    email:String,
    password:String,  
    admin_Mail:String
                              
})

const Mail = mongoose.model('Mail', MailSchema)

module.exports = Mail