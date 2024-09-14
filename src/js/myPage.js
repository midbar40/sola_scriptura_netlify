
// 헤더 모듈 가져오기
function checkIsLogined() {
    {
        const isLoggedIn = localStorage.getItem('로그인상태')
        document.body.insertAdjacentElement('afterbegin', headerModule(isLoggedIn))
    }
}
document.addEventListener('DOMContentLoaded', checkIsLogined)

// 유저 정보 가져오기
const getUserData = async () => {
    try {
        const userEmail = localStorage.getItem('유저이름')
        const data = await fetch('/.netlify/functions/api/users/myPage', {
            method: 'POST',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: userEmail,
            })
        })
        const userData = await data.json()
        return userData
    }
    catch (error) {
        console.log('myPage 조회 에러 :', error)

    }
}


// 유저정보 DOM 그리기
const createUserDataDom = async () => {
    const userData = await getUserData()

    const userInfo = userData.userInfo

    const nameSpan = document.createElement('span')
    const emailSpan = document.createElement('span')
    const mobileSpan = document.createElement('span')

    nameSpan.className = 'nameSpan'
    emailSpan.className = 'emailSpan'
    mobileSpan.className = 'mobileSpan'

    nameSpan.innerHTML = `${userInfo[0]}`
    emailSpan.innerHTML = `${userInfo[1]}`
    mobileSpan.innerHTML = `${userInfo[2]}`

    const nameDiv = document.querySelector('.name')
    const emailDiv = document.querySelector('.email')
    const mobileDiv = document.querySelector('.mobile')

    nameDiv.appendChild(nameSpan)
    emailDiv.appendChild(emailSpan)
    mobileDiv.appendChild(mobileSpan)
}
createUserDataDom()

// 회원탈퇴하기
const cancleMembership = async () => {
    const userEmail = localStorage.getItem('유저이름')
    try {
        const data = await fetch('/.netlify/functions/api/users/deleteUser', {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: userEmail
            })
        })
        const userData = await data.json()
        console.log('회원탈퇴 userData:', userData)
    }
    catch (error) {
        console.log('회원탈퇴 에러 :', error)
    }
}

// 비밀번호 변경시 입력란이 입력되어 있을 경우 버튼 활성화
const transFormEditBtn = async () => {
    const myPageSection = document.querySelector('.myPage-section')
    myPageSection.addEventListener('input', function (e) {
        const newPassword = document.querySelector('.newPassword').value
        const newPasswordConfirm = document.querySelector('.newPassword-confirm').value
        if (newPassword !== '' || newPasswordConfirm !== '') {
            const editBtn = document.querySelector('.myPage-btn-edit')
            editBtn.removeAttribute('disabled')
            editBtn.style.backgroundColor = '#0ec972'
        }
        else if (newPassword === '' || newPasswordConfirm === '') {
            const editBtn = document.querySelector('.myPage-btn-edit')
            editBtn.setAttribute('disabled', true)
            editBtn.style.backgroundColor = '#c2c2c2'
        }
    })
}
transFormEditBtn()

// 마이페이지 로그아웃 
const myPageLogout = async () => {
    await fetch('/.netlify/functions/api/users/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            if (!data.token) {
                localStorage.removeItem('로그인상태')
                localStorage.removeItem('유저이름')
                window.location.href = 'https://www.closetogod.site/html/login.html'
            }
        })
}

// 비밀번호 변경 서버요청
const changePw = async () => {
    const userEmail = localStorage.getItem('유저이름')
    const newPassword = document.querySelector('.newPassword').value
    try {
        const data = await fetch('/.netlify/functions/api/users/changeUserInfo', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: userEmail,
                password: newPassword
            })
        })
        const userData = await data.json()
        console.log('비밀번호 변경 userData:', userData)
    }
    catch (error) {
        console.log('비밀번호 변경 에러 :', error)
    }
}

// 모바일 버거버튼 클릭시
document.body.addEventListener('click', function (e) {
    if (e.target.className == 'material-symbols-outlined') {
        const navButtons = document.querySelector('.nav-btns')
        const mobileBackground = document.querySelector('.mobile-background')
        navButtons.classList.toggle('show')
        mobileBackground.classList.toggle('show')
    }
    else if (e.target.className == 'myPage-btn-edit') {
        // 비밀번호 변경, 확인란이 입력되어 있고 일치할 경우
        const newPassword = document.querySelector('.newPassword').value
        const newPasswordConfirm = document.querySelector('.newPassword-confirm').value
        if (newPassword !== newPasswordConfirm) {
            alert('비밀번호가 일치하지 않습니다.')
            return
        }
        else if (newPassword.length < 6 || newPassword.length > 12) {
            alert('비밀번호는 6자리 이상 12자리 이하로 설정해주세요')
            return
        }
        else if (newPassword === newPasswordConfirm) {
            alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.')
            myPageLogout()
            changePw()    
        }
    }
    else if(e.target.className == 'myPage-btn-cancle'){
        window.location.href = 'https://www.closetogod.site/index.html'
    }
    else if (e.target.className == 'myPage-btn-withdraw') {
       // 회원탈퇴
        const reCheck = confirm('정말로 회원탈퇴 하시겠습니까?')
        if(reCheck){
            alert('회원탈퇴가 완료되었습니다.')
            myPageLogout()
            cancleMembership()
        } else {
            return
        }
    }
})


