const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RemovedPublicationSchema = new Schema({
    Year: Number,
    Title: String,
    Faculties: String,
    Type: String,
    SubType: String,
    Name: String,
    Details: String,
    ImpactFactor: String,
    Affiliated: String,
    Branch: String
})

const RemovedPublication = mongoose.model('RemovedPublication', RemovedPublicationSchema)

module.exports = RemovedPublication