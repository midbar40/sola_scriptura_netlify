const mongoose = require('mongoose')

const { Schema } = mongoose
const { Types: { ObjectId }} = Schema


const PrayBucketlistSchema = new Schema({
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
    isDone:{
        type: Boolean,
        default:false,    
    },
    createdAt:{
        type: Date,
        default:Date.now,
    },
    lastModifiedAt:{
        type: Date,
        default:Date.now,
    },    
    finishedAt:{
        type: Date,
        default:Date.now,
    }
})

const PrayBucketlist = mongoose.model('PrayBucketlist', PrayBucketlistSchema)
module.exports = PrayBucketlist