const express = require('express')
const serverless = require('serverless-http');
const api = express()
const logger = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const config  = require('./config')
const cookieParser = require('cookie-parser')

// 라우터 임포트
const biblesRouter = require('/.netlify/functions/bibles')
const usersRouter = require('/.netlify/functions/./users')
const prayBucketlistRouter = require('/.netlify/functions/./prayBucketlist')
const graceRouter = require('/.netlify/functions/./grace')
const prayDiaryRouter = require('/.netlify/functions/./prayDiary')
const pickPostRouter = require('/.netlify/functions/./pickPosts')
const bibleParagraphsRouter = require('/.netlify/functions/./bibleParagraphs')
const sermonRouter = require('/.netlify/functions/./sermon')
const otpRouter = require('/.netlify/functions/./otpNumbers')

// 몽고 DB 연결
mongoose.connect(config.MONGODB_URL)
.then(() => console.log('몽고DB 연결완료'))
.catch((e) => `몽고DB 연결 실패 : ${e}`)

let corsOptions = {
    origin: ['http://127.0.0.1:5500', 'https://closetogod.netlify.app','https://closetogod.site'],
    credentials: true,
}

// 공통 미들웨어
api.use(cors(corsOptions)) // cors 설정, 이걸 계속 빼먹네..
api.use(express.json()) //request body 파싱 
api.use(logger('tiny')) // logger 설정
api.use(cookieParser())

// 라우터 설정
api.use('/bible', biblesRouter)
api.use('/users', usersRouter)
api.use('/prayBucketlist', prayBucketlistRouter)
api.use('/grace', graceRouter)
api.use('/prayDiary', prayDiaryRouter)
api.use('/pickPosts', pickPostRouter)
api.use('/bibleParagraphs', bibleParagraphsRouter)
api.use('/sermon', sermonRouter)
api.use('/otp', otpRouter)


// // fallback handler
// api.use((req, res, next) => { // 사용자가 요청한 페이지가 없는 경우 에러처리
//         res.status(404).send('페이지를 찾을 수 없습니다, 여기는 들어온다')
//     })
// api.use((err, req, res, next) => { // 서버 내부 오류 처리
//     console.error(err.stack)
//     res.status(500).send('서버에 문제가 발생하였습니다.')
// })



module.exports.handler = serverless(api);


