// 헤더 모듈 가져오기
function checkIsLogined() {
    {
        const isLoggedIn = localStorage.getItem('로그인상태')
        document.body.insertAdjacentElement('afterbegin', headerModule(isLoggedIn))
    }
}
document.addEventListener('DOMContentLoaded', checkIsLogined)


// 구절 주제 부분
const createSubject = () => {
    const contents = document.querySelector('.contents')
    const subjectDiv = document.createElement('div')
    subjectDiv.className = 'subject'
    subjectDiv.innerHTML = `
    <div class='sub salvation'><h3>구원</h3></div>
    <div class='sub thanks'><h3>감사</h3></div>
    <div class='sub adversity'><h3>고난</h3></div>
    <div class='sub healing'><h3>치유</h3></div>
    <div class='sub courageous'><h3>용기</h3></div>
    `
    contents.appendChild(subjectDiv)
}

createSubject()

// 서버데이터 가져오기
async function getServerData(category) {
    try {
        const response = await fetch(`https://backend.closetogod.site/api/bibleParagraphs/${category}`)
        const data = await response.json()
        return data
    } catch (error) {
        console.log(error)
    }
}

// 화면에 서버데이터 렌더링하기
async function renderData(category) {
    const serverData = await getServerData(category)
    // 화면에 렌더링
    const contents = document.querySelector('.contents')
    const subjectContents = document.createElement('div')
    subjectContents.className = 'subject-contents'
    subjectContents.innerHTML = `
     ${serverData.bibleParagraphs && serverData.bibleParagraphs.map(para =>
        ` <div>
            <h4>${para.title}</h4>
            <p>${para.detail}</p>
        </div>`
    ).join(' ')}
    `
    contents.appendChild(subjectContents)
}

const btns = document.querySelectorAll('.sub');
btns[0].classList.add('btnActive'); // 첫번째 버튼은 처음부터 클릭되어 있도록
// 처음에 성경구절 페이지 들어가면 salvation data가 렌더링 되어야 한다
renderData('salvation')

btns.forEach((btn) => {
    // 클릭시 버튼 스타일 변경
    btn.addEventListener('click', (e) => {
        const category = e.currentTarget.className.split(' ')[1]

        btns.forEach((btn) => {
            if (btn.classList.contains('btnActive')) {
                btn.classList.remove('btnActive');
                const subjectContents = document.querySelector('.subject-contents')
                if (subjectContents) subjectContents.remove()
            }
        });
        e.currentTarget.classList.add('btnActive');
        if (e.currentTarget.classList.contains('btnActive')) {
            // 렌더링된 데이터가 이미 있으면 렌더링하지 않는다
            const subjectContents = document.querySelector('.subject-contents')
            if (!subjectContents) renderData(category)
        }
    });
});


// 모바일 버거버튼 클릭시
document.body.addEventListener('click', function (e) {
    if (e.target.className == 'material-symbols-outlined') {
        const navButtons = document.querySelector('.nav-btns')
        const mobileBackground = document.querySelector('.mobile-background')
        navButtons.classList.toggle('show')
        mobileBackground.classList.toggle('show')
    }
})

