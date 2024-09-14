import mongoose from 'mongoose'
import { MONGODB_URL } from './config.mjs'

// 몽고 DB 연결
export const connectDb = async () => {
    try {
        const response = await mongoose.connect(MONGODB_URL)
        if (response.ok) {
            console.log('몽고DB 연결 성공')
        } else {
            console.log('몽고DB 연결 실패')
        }
    } catch (error) {
        console.error('몽고DB 연결 에러')
    }
}

