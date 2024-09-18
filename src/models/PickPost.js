const mongoose = require('mongoose')

const { Schema } = mongoose
const { Types: { ObjectId }} = Schema


const PickPostSchema = new Schema({
    author:{
        type: ObjectId,
        required: true,
        ref: 'User',
    },
    label:{
        type: String,
        required: true,
        trim: true,
    },
    text:{
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

const PickPost = mongoose.model('PickPost', PickPostSchema)
module.exports = PickPost