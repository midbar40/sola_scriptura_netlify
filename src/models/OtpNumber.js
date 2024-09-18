const mongoose = require('mongoose')

const { Schema } = mongoose
const { Types: { ObjectId } } = Schema

const otpSchema = new Schema({
name : {
    type: String,
    required : true,
},
mobile : {
    type: String,
    required : true,
},
code :{
    type: Number,
    required : true,
},
count :{
    type: Number,
    required : true,
},
expireAt :{
    type: Date,
    default: Date.now,
    index: {expires: '5m'} // 5분후에 만료
},
createdAt:{
    type: Date,
    default: Date.now,
},
})

const Otp = mongoose.model('Otp', otpSchema, 'otpSchema')
module.exports = Otp

