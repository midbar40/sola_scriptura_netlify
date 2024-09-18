const express = require('express');
const router = express.Router();
const OtpNumber = require('../src/models/OtpNumber')
const User = require('../src/models/User')
const expressAsyncHandler = require('express-async-handler')

// twilo 연동
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
let countNum = 1  

// otp 생성
router.post('/generateOtp', expressAsyncHandler(async (req, res, next) => {
    try {
        const user = await User.findOne({ mobile: req.body.mobile, name: req.body.name  })
        if (!user) {
            res.json({
                code: 400,
                message: '등록된 사용자가 없습니다.'
            })
        } else {
        async function generateOtp() {
                const code = Math.floor(100000 + Math.random() * 900000).toString(); 
            const otpNumber = new OtpNumber({
                name: req.body.name,
                mobile: req.body.mobile,
                code: code,
                count: countNum
            })
        if (otpNumber && otpNumber.count >= 4) {
            res.json({
                code: 400,
                message: '인증 횟수 초과, 잠시 후 다시 시도해주세요.'
            })
            // 5분 뒤 count 초기화
            setTimeout(() => {
                countNum = 1
            }, 300000)
        }
        if (otpNumber && otpNumber.count <= 3 && user.authCount <= 9) { 
            const issuedOtp = await OtpNumber.find({ mobile: req.body.mobile, name: req.body.name  })
            if(issuedOtp.length > 0) {
              await OtpNumber.deleteMany({ mobile: req.body.mobile, name: req.body.name  })
              console.log('기발행 otp가 삭제되었습니다, 새로운 otp를 생성합니다.')
            } else {
              console.log('기발행 otp가 없습니다, 새로운 otp를 생성합니다.')
            }
            const convertedPhoneNumber = `+82${req.body.mobile.slice(1)}`;
            client.messages
                .create({
                    body: `인증번호는 ${code} 입니다.`,
                    from: process.env.TWILIO_SENDER_PHONE,
                    to: `${convertedPhoneNumber}`
                })
                .then(message => console.log(message.sid));
            user.authCount = user.authCount + 1
            countNum++    
            console.log('유저정보',user)
            
            await otpNumber.save()
            await user.save()

            return res.json({
                code: 200,
                message: 'otp 생성 성공',
                result: otpNumber
            })
        }
        if (user.authCount >= 10) {
            res.json({
                code: 400,
                message: '인증 횟수 초과, 3시간 후 다시 시도해주세요.'
            })
            // 3시간 후 authCount 초기화
            setTimeout(() => {
                console.log('3시간 후 authCount 초기화')
                user.authCount = 0
                user.save()
            }, 60*60*3)
        }
        console.log('otpNumber :', otpNumber)
            }
            generateOtp()
        }
    } catch (error) {
        console.log('otp 재생성 에러 :', err)
        res.json({
            code: 500,
            message: 'otp 재생성 실패',
            err
        })
    }
}))


// otp 확인
router.post('/checkOtp', expressAsyncHandler(async (req, res, next) => {
    console.log('checkOtp 확인', req.body)
    try {
        const authUser = await OtpNumber.findOne({code: req.body.otp, name: req.body.name })
        const user = await User.findOne({ mobile: req.body.mobile, name: req.body.name  })
        console.log('authUser :', authUser)
        if(!authUser){
            res.json({
                code: 400,
                message: '인증번호가 일치하지 않습니다.'
            })
        } else {
            console.log('user :', user)
            res.json({
                code: 200,
                message: 'otp 확인 성공',
                result: user
            })
    }}
    catch (err) {
        console.log('otp 확인 에러 :', err)
        res.json({
            code: 500,
            message: 'otp 확인 실패',
            err
        })
    }
}))
    
    
module.exports = router