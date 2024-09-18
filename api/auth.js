const config = require('./config')
const jwt = require('jsonwebtoken')

const generateToken = (user) => { //토큰 생성
    return jwt.sign({
        _id: user._id, // 사용자 정보(json)
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt:user.createdAt,
    },
    config.JWT_SECRET,
    {
        expiresIn: '1d', // 만료기한 (하루)
    })
}

const isAuth = (req, res, next) => { // 권한확인
    const bearerToken = req.headers.authorization // 요청헤더에 저장된 토큰
    if(!bearerToken){
        res.status(401).json({message: 'Token is not supplied'}) // 헤더에 토큰이 없는 경우
    }else{
        const token = bearerToken.slice(7, bearerToken.length) // Bearer 글자는 제거하고 jwt 토큰만 추출
        jwt.verify(token, config.JWT_SECRET, (err, userInfo) => {
            if(err && err.name === 'TokenExpiredError'){ // 토큰만료
                res.status(419).json({ code: 419, message: 'token expired!'})
            }else if(err){
                res.status(401).json({ code: 401, message: 'Invalid Token!'})
            } else {
                req.user = userInfo
                res.status(200).json({ code: 200, message: '유효한 토큰입니다.'})
            }            
        })
    }
}

// const isAdmin = (req, res, next) => { // 관리자 확인
//     if(req.user && req.user.isAdmin){
//         next()
//     }else{
//         res.status(401).json({ code: 401, messgae: 'You are not valid admin user !'})
//     }
// }
module.exports = {
    generateToken,
    isAuth,
    // isAdmin,
}