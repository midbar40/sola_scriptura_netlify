const mongoose = require('mongoose')

const { Schema } = mongoose
const { Types: { ObjectId }} = Schema

const userSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    mobile:{
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    isAdmin:{
        type: Boolean,
        default:false,
    }, 
    authCount :{
        type: Number,
        default: 0,
    },
    createdAt:{
        type: Date,
        default:Date.now,
    },
    lastModifiedAt:{
        type: Date,
        default:Date.now,
    },
})

const User = mongoose.model('User', userSchema, 'users')
module.exports = User