const mongoose = require('mongoose')
const config = require('./config')


// 몽고 DB 연결
export const connectDb = async () => {
    try {
        const response = await mongoose.connect(config.MONGODB_URL)
        if (response.ok) {
            console.log('몽고DB 연결 성공')
        } else {
            console.log('몽고DB 연결 실패')
        }
    } catch (error) {
        console.error('몽고DB 연결 에러')
    }
}

