const dotenv = require('dotenv')

dotenv.config() // process.env 객체에 환경변수 설정

module.exports = {
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET,
}