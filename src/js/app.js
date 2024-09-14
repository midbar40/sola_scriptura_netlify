

// 전역변수
const inputWindow = document.getElementById('serachbible')
const ramdomPargraph = document.querySelector('.random-paragraph')

// 헤더 모듈 가져오기
function checkIsLogined() {
    {
        const isLoggedIn = localStorage.getItem('로그인상태')
        document.body.insertAdjacentElement('afterbegin', indexHeaderModule(isLoggedIn))
    }
}
document.addEventListener('DOMContentLoaded', checkIsLogined)

// 성경 서버데이터 랜덤 가져오기 -> 개선필요, 업로드가 너무 느림 -> 23.11.28 서버에서 랜덤으로 가져오도록 변경함 
async function getBibleRandomData() {
    try {
        const data = await fetch('/.netlify/functions/bibleParagraphs')
        const bibleData = await data.json()
        return bibleData
    } catch (error) {
        console.log(error)
    }
}

// 랜덤 이미지 배경데이터 가져오기 -> 개선필요, 업로드가 너무 느림
async function getImageData() {
    try {
        const data = await fetch(`https://api.unsplash.com/search/photos?query=background img&page=${Math.floor(Math.random() * 150)}&per_page=35&client_id=NNmNL2OOluBZlE9VpvVPQKXW7p0vm0dCkz2n8dFIAUA&;`) // page랜덤설정 총페이지수 334페이지 -> 150으로 축소
        const imgData = await data.json()
        if (imgData.results.length == 0) { // 이미지 없을때 문구 띄워주기
            ramdomPargraph.style.backgroundColor = 'white'
            ramdomPargraph.innerHTML = `<h3>랜덤 성경 구절을 가져오고 있습니다</h3>`
        } else {
            for (let i = 0; i < imgData.results.length; i++) {
                ramdomPargraph.style.backgroundImage = `url(${imgData.results[Math.floor(Math.random() * i)]?.urls.regular})`
            }
        }
    } catch (error) {
        console.log(error)
    }
}

// 성경 랜덤 구절 렌더링
// 배경이미지는 pixabay나 unsplash에서 랜덤으로 떙겨오자, 특정 키워드의 이미지만 떙겨오도록 설정
async function createRandomVerse() {
    const randomData = await getBibleRandomData()
    await getImageData()
    const h3 = document.createElement('h3')
    h3.innerHTML = `${randomData.bibles[0].content}<br><p>${randomData.bibles[0].title}&nbsp${randomData.bibles[0].chapter}장 ${randomData.bibles[0].verse}절</p>`

    ramdomPargraph.appendChild(h3)
}

createRandomVerse()

// 인풋창 입력이벤트 - 검색버튼을 클릭하면 성경읽기 html로 이동하여 검색어와 일치되는 내용을 표시해야한다.

inputWindow.addEventListener('change', async (e) => {
    const searchWord = e.target.value.trim()
    localStorage.setItem("inputWord", searchWord) // 검색어를 로컬스토리지에 저장

    if (searchWord == '') // || !searchWord || !inputWindow.onfocus 이 조건문들은 왜 안되는거지? / 아무것도 입력안하고 클릭시 폼타입이 제출되어버린다, 일단 html requierd로 막는다..
    {
        alert('검색어를 입력해주세요')
    }
})

// 하단 컨텐츠 아이콘 4개 DOM 그리기
const createContensIcons = () => {
    const bibleReading = document.querySelector('.bible-reading')
    const bibleParagraph = document.querySelector('.bible-paragraph')
    const bibleGame = document.querySelector('.bible-game')
    const prayNote = document.querySelector('.pray-note')

    const bibleReadingDiv = document.createElement('div')
    const bibleParagraphDiv = document.createElement('div')
    const bibleGameDiv = document.createElement('div')
    const prayNoteDiv = document.createElement('div')

    bibleReadingDiv.className = 'bible-reading-div'
    bibleParagraphDiv.className = 'bible-paragraph-div'
    bibleGameDiv.className = 'bible-game-div'
    prayNoteDiv.className = 'pray-note-div'

    const bibleReadingH3 = document.createElement('h3')
    const bibleParagraphH3 = document.createElement('h3')
    const bibleGameH3 = document.createElement('h3')
    const prayNoteH3 = document.createElement('h3')

    bibleReadingH3.innerHTML = '성경읽기'
    bibleParagraphH3.innerHTML = '성경구절'
    bibleGameH3.innerHTML = '시편필사'
    prayNoteH3.innerHTML = '기도노트'

    const bibleReadingIcon = document.createElement('img')
    const bibleParagraphIcon = document.createElement('img')
    const bibleGameIcon = document.createElement('img')
    const prayNoteIcon = document.createElement('img')

    bibleReadingIcon.src = '../asssets/imgs/opendbible1.png'
    bibleParagraphIcon.src = '../asssets/imgs/memorization2.png'
    bibleGameIcon.src = '../asssets/imgs/typemachine.png'
    prayNoteIcon.src = '../asssets/imgs/pray.png'


    bibleReading.appendChild(bibleReadingDiv)
    bibleParagraph.appendChild(bibleParagraphDiv)
    bibleGame.appendChild(bibleGameDiv)
    prayNote.appendChild(prayNoteDiv)

    bibleReadingDiv.append(bibleReadingIcon,bibleReadingH3)
    bibleParagraphDiv.append(bibleParagraphIcon, bibleParagraphH3)
    bibleGameDiv.append(bibleGameIcon, bibleGameH3)
    prayNoteDiv.append(prayNoteIcon, prayNoteH3)
}

createContensIcons()

// 모바일 버거버튼 클릭시
document.body.addEventListener('click', function (e) {
    if (e.target.className == 'material-symbols-outlined') {
        const navButtons = document.querySelector('.nav-btns')
        const mobileBackground = document.querySelector('.mobile-background')
        navButtons.classList.toggle('show')
        mobileBackground.classList.toggle('show')
    } 
})
