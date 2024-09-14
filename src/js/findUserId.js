
import { createFindUserPwDom} from './findUserPw.js' 

// 아이디 찾기 화면 뿌려주기
export const createFindUserIdDom = () => {
    const main = document.querySelector('main')
        main.innerHTML = ''
        const findUserIdField = document.createElement('div')
        findUserIdField.className = 'findUserIdField'
        findUserIdField.innerHTML = `
                <form class="findUserId-section">
                    <h2>Sola-Scriptura</h2>
                    <div class="name">
                        <h4>이름</h4>
                        <input type="text" class="userName" placeholder="이름을 입력하세요" required />
                    </div>
                    <div class="mobile-section">
                        <h4>휴대폰번호</h4>
                       <div class="mobile-number"> 
                        <input type="mobile" class="userMobile" placeholder="휴대폰번호를 입력해주세요" required />
                        <button type="submit" class='authNumber'>인증번호</button>
                        </div>
                    </div>
                    <div class="findId-btn">
                        <button type="submit" class='findUserIdSubmit' disabled>아이디 찾기</button>
                    </div>
                    <div class="bottom-btns">
                    <a href="./login.html" >로그인하기</a>
                    <a href="#" class="findUserPw">비밀번호찾기</a>
                    <a href="./register.html">회원가입</a>
                  </div>
            </form>
            ` 
        main.appendChild(findUserIdField)
    
}

let otpTimer; // 전역 변수로 선언하여 전체에서 접근 가능하도록 함

// 인증번호 카운트다운
function countDown(timerDisplay) {
     // 인증번호 타이머
     let remainingTime = 5 * 60; // 초 단위로 설정 (5분 = 300초)
    
     let timerInterval; // 타이머 ID를 저장할 변수

     function updateTimer() {
     const minutes = Math.floor(remainingTime / 60);
     const seconds = remainingTime % 60;

     const formattedMinutes = String(minutes).padStart(2, '0');
     const formattedSeconds = String(seconds).padStart(2, '0');

     timerDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;

     if (remainingTime === 0) {
         clearInterval(timerInterval);
         timerDisplay.style.display = 'none'
     } else {
        // timerDisplay.style.display = 'show'
         remainingTime--;
     }
     }
     
     function manageTimer(action) {
         if (action === 'start') {
             // 타이머 시작
             timerInterval = setInterval(updateTimer, 1000);
         } else if (action === 'stop') {
             // 타이머 종료
             clearInterval(timerInterval);
         } else if (action === 'reset') {
             // 타이머 초기화
             if(timerInterval){
                 remainingTime = 5 * 60;
             } else {
                 timerInterval = setInterval(updateTimer, 1000);
             }
         }
         }
     // 타이머 시작
     manageTimer('start');

     // 외부에서 타이머를 제어할 수 있도록 반환
    return {  // return {} 중괄호는 객체 리터럴을 의미한다.
        // 객체 리터럴을 사용하여, 객체를 만들어서(내용물은 함수이므로 메소드) 객체를 반환하는 것이다, key : value 형태로 반환
        stop: () => manageTimer('stop'),
        reset: () => manageTimer('reset')
    };
}


// 인증번호 버튼 클릭시 인증번호 입력창 생성
const createAuthNumberDom = () => {
    const userName = document.querySelector('.userName')
    const userMobile = document.querySelector('.userMobile')
    const userNameValue = userName.value
    const userMobileValue = userMobile.value
        if(userNameValue === '' ){
            alert('이름을 입력해주세요')
            return
        }
        else if (userNameValue.lenth > 1){
            alert('이름을 올바르게 입력해주세요')
            return
        }
        if(userMobileValue === ''){
            alert('휴대폰번호를 입력해주세요')
            return
        }
        else if (userMobileValue.length < 10 || userMobileValue.length > 11) {
            alert('휴대폰번호를 올바르게 입력해주세요')
            return
        }
        return {userNameValue, userMobileValue}
}



// 인증번호 클릭시 인증번호 유저핸드폰으로 전송
const receiveOtp = async (userNameValue, userMobileValue) => {
    const mobileDiv = document.querySelector('.mobile-section');
    const mobileNumber = mobileDiv.querySelector('.mobile-number');
    // 이미 생성된 엘리먼트가 없으면 생성
    let authNumberSection = mobileDiv.querySelector('.authNumber-section');
    let authNumberResend = mobileDiv.querySelector('.resend-section');
    let otpTimerSpan = mobileDiv.querySelector('.timer-display');

    if (!authNumberSection) {
        authNumberSection = document.createElement('div');
        authNumberSection.className = 'authNumber-section';
        authNumberSection.innerHTML = `
            <input type="mobile" class='otpNum' placeholder="인증번호를 입력해주세요" required />
            <button type="submit" class='authNumber-confirm'>확인</button> 
        `;
    }

    if (!authNumberResend) {
        authNumberResend = document.createElement('div');
        authNumberResend.className = 'resend-section';
        authNumberResend.innerHTML = `
            <a href="#" class="authNumber-reSend">인증번호가 오지 않았나요?</a>
        `;
    }

    if (!otpTimerSpan) {
        otpTimerSpan = document.createElement('span');
        otpTimerSpan.className = 'timer-display';
    }

    const receiveOtp = await fetch('/.netlify/functions/api/otp/generateOtp', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: userNameValue,
            mobile: userMobileValue,
        })
    });
    const otpNumber = await receiveOtp.json();

    if (otpNumber.code === 400) {
        alert(otpNumber.message);
    } 
    if (otpNumber.code === 200) {
        if (!mobileDiv.contains(authNumberSection) || !mobileDiv.contains(authNumberResend)) {
            mobileDiv.appendChild(authNumberSection);
            mobileDiv.appendChild(authNumberResend);
            mobileNumber.appendChild(otpTimerSpan);
        }
        // 새로운 타이머 시작
        const timerDisplay = document.querySelector('.timer-display');
        if (otpTimer) {
            otpTimer.reset();
        } else {
            const authNumber = document.querySelector('.authNumber');
            authNumber.style.display = 'none';

            // 타이머가 없으면 생성
            timerDisplay.style.display = 'show';
            otpTimer = countDown(timerDisplay);
        }
        }
}



let userId = null
// 인증번호 서버로 전송
const confirmOtp = async() => {
    const userName = document.querySelector('.userName')
    const userMobile = document.querySelector('.userMobile')
    const otpNumber = document.querySelector('.otpNum')
    try{
        const sendOtpToServer = await fetch('/.netlify/functions/api/otp/checkOtp', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name : userName.value,
                mobile : userMobile.value,
                otp: otpNumber.value
            })
        })
        const otpResult = await sendOtpToServer.json()
        if(otpResult.code === 200){
            alert('인증번호가 확인되었습니다')
            const confrimBtn = document.querySelector('.authNumber-confirm')
            const timerDisplay = document.querySelector('.timer-display')
            const authNumberReSend = document.querySelector('.authNumber-reSend')
            confrimBtn.disabled = true
            timerDisplay.style.display = 'none'
            authNumberReSend.style.display = 'none'
            confrimBtn.innerText = '인증완료'
            const findUserIdSubmit = document.querySelector('.findUserIdSubmit')
            findUserIdSubmit.disabled = false
            userId = otpResult.result.email
             // 타이머 시작
            // manageTimer('stop');
        } else if(otpResult.code === 400){
            alert(otpResult.message)
        }
    }catch{
        alert ('인증번호가 일치하지 않습니다.')
    }
}

function showUserId(userId){
    const main = document.querySelector('main')
    main.innerHTML = `
    <div class="container">
        <div class="findUserIdField">
            <h4>고객님의 아이디는 <span class="userId">${userId}</span> 입니다.</h4>
        </div>
        <div class="bottom-btns">
            <a href="./login.html">로그인하기</a> 
            <a href="#" class="findUserPw">비밀번호찾기</a>
            <a href="./register.html">회원가입</a>
        </div>  
    </div>
    `
    const container = document.querySelector('.container')
    container.style.display = 'flex'
    container.style.flexDirection = 'column'
    const userIdSpan = document.querySelector('.userId')
    userIdSpan.style.backGround = 'yellow'
}


document.body.addEventListener('click', function (e) {
    if (e.target.className == 'authNumber' || e.target.className == 'authNumber-reSend' || e.target.className == 'resend-btn') {
        e.preventDefault()
        const {userNameValue, userMobileValue} = createAuthNumberDom()
        const otpResult = receiveOtp(userNameValue, userMobileValue) // 여기에 인증번호가 오게 하는 함수를 호출해야 한다
    }
    else if(e.target.className == 'authNumber-confirm'){
        e.preventDefault()
        confirmOtp()
    }else if(e.target.className == 'findUserIdSubmit'){
        e.preventDefault()
        showUserId(userId)
    }else if(e.target.className == 'findUserId'){
        e.preventDefault()
        history.pushState(null, null, '?page=findUserId')
        createFindUserIdDom()
    }else if(e.target.className == 'findUserPw'){
        e.preventDefault()
        history.pushState(null, null, '?page=findUserPw')
        createFindUserPwDom()
    }
})


// 새로고침해도 아이디찾기, 비밀번호 찾기 화면 유지해주기
window.onload = function(){
   
const urlParams = new URLSearchParams(window.location.search); // URLSearchParams 객체를 생성, window.location.search는 현재 URL의 query string을 반환
if (urlParams.get('page') === 'findUserId') { // URLSearchParams 객체의 get() 메소드를 사용하여 query string의 특정 파라미터 값을 가져옴, 'page'는 ?page=findUserId에서 page에 해당하는 값
    createFindUserIdDom()
} else if (urlParams.get('page') === 'findUserPw') {
    createFindUserPwDom()
}
}