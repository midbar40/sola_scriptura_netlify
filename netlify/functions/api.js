const express = require('express')
const serverless = require('serverless-http');
const app = express()
const logger = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const config  = require('./config')
const cookieParser = require('cookie-parser')


// 라우터 임포트
const biblesRouter = require('./bibles')
const usersRouter = require('./users')
const prayBucketlistRouter = require('./prayBucketlist')
const graceRouter = require('./grace')
const prayDiaryRouter = require('./prayDiary')
const pickPostRouter = require('./pickPosts')
const bibleParagraphsRouter = require('./bibleParagraphs')
const sermonRouter = require('./sermon')
const otpRouter = require('./otpNumbers')

// 몽고 DB 연결
mongoose.connect(config.MONGODB_URL)
.then(() => console.log('몽고DB 연결완료'))
.catch((e) => `몽고DB 연결 실패 : ${e}`)

let corsOptions = {
    origin: ['http://127.0.0.1:5500', 'https://closetogod.netlify.app'],
    credentials: true,
}

// 공통 미들웨어
app.use(cors(corsOptions)) // cors 설정, 이걸 계속 빼먹네..
app.use(express.json()) //request body 파싱 
app.use(logger('tiny')) // logger 설정
app.use(cookieParser())

// 라우터 설정
app.use('/api/bible', biblesRouter)
app.use('/api/users', usersRouter)
app.use('/api/prayBucketlist', prayBucketlistRouter)
app.use('/api/grace', graceRouter)
app.use('/api/prayDiary', prayDiaryRouter)
app.use('/api/pickPosts', pickPostRouter)
app.use('/api/bibleParagraphs', bibleParagraphsRouter)
app.use('/api/sermon', sermonRouter)
app.use('/api/otp', otpRouter)

// fallback handler
app.use((req, res, next) => { // 사용자가 요청한 페이지가 없는 경우 에러처리
    res.status(404).send('페이지를 찾을 수 없습니다.')
})
app.use((err, req, res, next) => { // 서버 내부 오류 처리
    console.error(err.stack)
    res.status(500).send('서버에 문제가 발생하였습니다.')
})

const port = process.env.PORT || 8080;
app.listen(port, () => { /* 서버실행 */
    console.log(`Now listening on port ${port}`)
})

module.exports.handler = serverless(app);


