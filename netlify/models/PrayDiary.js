const mongoose = require('mongoose')

const { Schema } = mongoose
const { Types: { ObjectId }} = Schema


const PrayDiarySchema = new Schema({
    author:{
        type: ObjectId,
        required: true,
        ref: 'User',
    },
    title:{
        type: String,
        required: true,
        trim: true,
    },
    detail:{
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

const PrayDiary = mongoose.model('PrayDiary', PrayDiarySchema)
module.exports = PrayDiary