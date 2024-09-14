const userEmail = document.querySelector('.login-id input')
const userPw = document.querySelector('.login-pw input')
const loginButton = document.querySelector('.submit button')


// 헤더 모듈 가져오기
function checkIsLogined() {
    {
        const isLoggedIn = localStorage.getItem('로그인상태')
        document.body.insertAdjacentElement('afterbegin', headerModule(isLoggedIn))
    }
}
document.addEventListener('DOMContentLoaded', checkIsLogined)

// 성경 서버데이터 가져오기
async function getUserData() {
    const regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;

    if (userEmail.value === '') {
        alert('이메일을 입력해주세요')
        return
    }
    else if (userEmail.value.match(regExp) === null) {
        alert('이메일 형식이 올바르지 않습니다.')
        return
    }
    else if (userPw.value === '') {
        alert('비밀번호를 입력해주세요')
        return
    }
    try {
        const data = await fetch('/.netlify/functions/api/users/login', {
            method: 'POST',
            credentials: 'include', // 브라우저 쿠키탭에 토큰이 저장되기 위해서는 credentials: 'include' 옵션을 추가해줘야 한다.
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: userEmail.value,
                password: userPw.value
            })

        })
        const userData = await data.json()
        if (!userData.token) {
            alert(userData.message)
        }
        else if (userData.token) {
            localStorage.setItem('로그인상태', true)
            localStorage.setItem('유저이름', userData.user)
            window.location.href = 'https://www.closetogod.site/index.html'
            // window.location.href = 'http://127.0.0.1:5500/bible-front/index.html'
            // window.location.href = 'https://midbar40.github.io/bible-front/index.html'
        }
    } catch (error) {
        console.log(error)
    }
}

loginButton.addEventListener('click', getUserData)


// 모바일 버거버튼 클릭시
document.body.addEventListener('click', function (e) {
    if (e.target.className == 'material-symbols-outlined') {
        const navButtons = document.querySelector('.nav-btns')
        const mobileBackground = document.querySelector('.mobile-background')
        navButtons.classList.toggle('show')
        mobileBackground.classList.toggle('show')
    }
})
