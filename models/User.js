const {Schema, model} = require('mongoose')

const schema = new Schema({
    code: Number,
    type: String,
    year: Number,
    email: String,
    status: String
})

module.exports = model('UserData', schema);