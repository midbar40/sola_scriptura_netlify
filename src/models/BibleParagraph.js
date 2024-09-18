const mongoose = require('mongoose')

const { Schema } = mongoose
const { Types: { ObjectId }} = Schema


const BibleParagraphSchema = new Schema({
    category:{
        type: String,
        required: true,
        trim: true,
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
    }
})

const BibleParagraph = mongoose.model('BibleParagraph', BibleParagraphSchema)
module.exports = BibleParagraph