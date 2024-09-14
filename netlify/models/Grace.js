const mongoose = require('mongoose')

const { Schema } = mongoose
const { Types: { ObjectId }} = Schema


const GraceSchema = new Schema({
    author:{
        type: ObjectId,
        required: true,
        ref: 'User',
    },
    detail:{
        type: String,
        required: true,
        trim: true,
    },
    createdAt:{
        type: Date,
        default:Date.now,
    }
})

const Grace = mongoose.model('Grace', GraceSchema)
module.exports = Grace