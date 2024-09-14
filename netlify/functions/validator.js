const { body } = require('express-validator');
const User = require('./src/models/User'); // 사용자 모델 임포트

const isFieldEmpty = (field) => { // Form 필드가 비어있는지 검사
    return body(field)
    .not()
    .isEmpty()
    .withMessage(` ${field} 작성되어야 합니다`)
    .bail() // if email is empty, the following will not be run
    .trim() // 공백제거
}
const validateUserName = () => {
    return isFieldEmpty("name")
    .isLength({ min: 2, max: 20 }) // 2~20자
    .withMessage("이름은 2~20자 사이로 입력해주세요")
}
const validateUserMobile = (mobile) => {
    return isFieldEmpty("mobile")
    .isMobilePhone(mobile, "ko-KR") // 이 함수가 잘 작동하는지 알 수 없음
    .isLength({ min: 10, max: 11 }) // 10~11자
    .withMessage("전화번호는 10~11자 사이로 입력해주세요")
}
const validateUserEmail = () => {
    return isFieldEmpty("email")
    .isEmail() // 이메일 형식에 맞는지 검사
    .withMessage("유효하지 않은 이메일 형식입니다")
    .custom(async (value) => {
        // 이메일 중복 체크
        console.log('벨류 :', value)
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error('이미 가입된 아이디(이메일)입니다');
        }
        return true; // 중복되지 않은 경우에는 true 반환
      });
} 

const validateUserPassword = () => {
    return isFieldEmpty("password")
    .isLength({ min: 6 })
    .withMessage("비밀번호는 6자 이상 입력해주세요")
    .bail()
    .isLength({ max: 12 })
    .withMessage("비밀번호는 12자 이하로 입력해주세요")
    .bail()
    .not()
    .isAlpha()
    .withMessage("비밀번호는 숫자를 포함해야 합니다")
    .matches(/[!@#$%^&*]/)
    .withMessage("비밀번호는 특수문자를 포함해야 합니다")
    .bail()
    // Form 에서 전달된 password 정보가 일치하는지 검사
    // value : password
    // .custom((value, { req }) => req.body.confirmPassword === value)
    // .withMessage("Passwords don't match.")
}

module.exports = {
    validateUserName,
    validateUserMobile,
    validateUserEmail,
    validateUserPassword
}
