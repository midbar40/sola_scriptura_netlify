import dotenv from 'dotenv'

dotenv.config() // process.env 객체에 환경변수 설정

export const MONGODB_URL = process.env.MONGODB_URL;
export const JWT_SECRET = process.env.JWT_SECRET;