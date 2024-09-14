const mongoose = require('mongoose')

const { Schema } = mongoose
const { Types: { ObjectId }} = Schema


const SermonSchema = new Schema({
    author:{
        type: ObjectId,
        required: true,
        ref: 'User',
    },
    date: {
        type: Date,
        required: true,
    },
    title:{
        type: String,
        required: true,
        trim: true,
    },
    scripture:{
        type: String,
        required: true,
        trim: true,
    },
    preacher:{
        type: String,
        required: true,
        trim: true,
    },
    content:{
        type: String,
        required: true,
        trim: true,
    },
    takeaway:{
        type: String,
        required: true,
        trim: true,
    },
    createdAt:{
        type: Date,
        default:Date.now,
    },
    lastModifiedAt:{
        type: Date,
        default:Date.now,
    }
})

const Sermon = mongoose.model('Sermon', SermonSchema)
module.exports = Sermon