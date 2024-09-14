// 전역변수
const main = document.querySelector('main')
let index = 1

// 헤더 모듈 가져오기
function checkIsLogined() {
    {
        const isLoggedIn = localStorage.getItem('로그인상태')
        document.body.insertAdjacentElement('afterbegin', headerModule(isLoggedIn))
    }
}
document.addEventListener('DOMContentLoaded', checkIsLogined)

// 성경 서버데이터 가져오기
async function getBibleData() {
    try {
        const data = await fetch('https://backend.closetogod.site/api/bible/psalms?title=시편')
        const bibleData = await data.json()
        return bibleData
    } catch (error) {
        console.log(error)
    }
}

//  HTML 뼈대 DOM생성
function createTextField() {

    // 가장 바깥의 div (초기화 대상)
    const typingContent = document.createElement('div')
    typingContent.className = 'bible-content'
    main.appendChild(typingContent)


    // 상단 TITLE
    const bibleTitle = document.createElement('h3')
    bibleTitle.innerHTML = `시편&nbsp${index}편`
    bibleTitle.className = 'bible-title'

    // 본문 FORM & TEXTAREA & BUTTON      
    const form = document.createElement('form')
    form.setAttribute("action", '#')
    form.innerHTML = `
    <div class='textarea-value'></div>  
    <textarea name="textWindow" class="textWindow" spellcheck="false" onselectstart ='return false'></textarea>
    <div class='btn-group'>
    <button class="prev" type="button">이전</button>
    <button class="next" type="button">다음</button>    
    <button class="retry" type="button">다시하기</button>
    </div>    
    `
    typingContent.appendChild(form)

    // 외부 반환을 위한 변수저장
    const textWindow = form.querySelector('.textWindow')
    const prevButton = form.querySelector('.prev')
    const nextButton = form.querySelector('.next')
    const retryButton = form.querySelector('.retry')
    const bibleText = document.createElement('div')
    const inputDiv = document.querySelector('.textarea-value')
    const buttonGroup = document.querySelector('.btn-group')
    bibleText.className = 'bible-Text'

    typingContent.append(bibleTitle, bibleText)

    typingContent.insertAdjacentElement('afterbegin', bibleTitle)
    textWindow.insertAdjacentElement('beforebegin', bibleText)

    // 변수반환    
    return {
        typingContent,
        form,
        bibleTitle,
        textWindow,
        bibleText,
        prevButton,
        nextButton,
        retryButton,
        inputDiv,
        buttonGroup
    }
}

const addLoading = () => {
    const loading = document.createElement('div')

    loading.className = 'loading'
    loading.style.position = 'absolute'
    loading.style.top = '50%'
    loading.style.left = '50%'
    loading.style.transform = 'translate(-50%, -50%)'
    loading.style.textAlign = 'center'
    loading.innerHTML =
        `<div class="loading-text"><img src='../asssets/imgs/loading.gif' width=30%/><h4>LOADING...</h4></div>`

    main.appendChild(loading)

}
const removeLoading = () => {
    const loading = document.querySelector('.loading')
    if (loading) loading.remove()
}

// 시편본문가져오기
async function getBibleText() {
    // 반환함수 호출
    const {
        typingContent,
        form,
        bibleTitle,
        textWindow,
        bibleText,
        prevButton,
        nextButton,
        retryButton,
        inputDiv,
        buttonGroup
    } = createTextField()
    
    addLoading()
    const bibleData = await getBibleData()
    const loading = document.querySelector('.loading')
    loading.remove()

    // 시편본문 생성하기
    
    for (let i = 0; i < bibleData.psalms.length - 1; i++) {
        if (bibleData.psalms[i].chapter == index) {
            const biblePargraph = document.createElement('p')
            biblePargraph.innerHTML = ` ${bibleData.psalms[i].verse} ${bibleData.psalms[i].content}`
            bibleText.appendChild(biblePargraph)
        }
    }
    // 시편본문 한글자씩 풀어서 span태그로 감싸주기   
    const bibletextPara = typingContent.querySelectorAll('.bible-Text p')

    for (let i = 0; i < bibletextPara.length; i++) {
        bibletextPara[i].innerHTML = bibletextPara[i].innerText.split('').map(char => char.replace(char, `<span>${char}</span>`)).join('')
    }

    const textSpan = typingContent.querySelectorAll('span')
    // 텍스트 입력창 글자입력 오류검증 기능
    textWindow.addEventListener('input', e => {
        let charIndex = 0
        const inputSpanText = e.target.value
        inputDiv.innerText = inputSpanText
        let typedText = inputSpanText.split('')

        if (typedText.length) { // 글자 타이핑할때 span 숨기기
            textSpan[charIndex]?.classList.add('hide')
        }

        if (textSpan[charIndex]?.innerText === typedText[charIndex]) { // 글자가 일치할 경우
            textSpan[charIndex]?.innerText === typedText[charIndex]
            textSpan[charIndex]?.classList.add('correct')
            textSpan[charIndex]?.classList.remove('incorrect')
            charIndex++
            e.preventDefault()

            if (typedText[textSpan.length - 1]) { //마지막 글자가 뭐든 입력됐을때
                nextButton.click()
            }
        }
        else if (typedText[charIndex] == null) {  // 글자를 지울 때
            textSpan[charIndex]?.classList.remove('correct', 'incorrect', 'hide')
            if (charIndex > 0) { charIndex-- }
        }
        else {   // 글자가 불일치할 경우
            textSpan[charIndex]?.classList.add('incorrect')
            textSpan[charIndex]?.classList.remove('correct', 'hide')
            charIndex++
            if (typedText[textSpan.length - 1]) { //마지막 글자가 뭐든 입력됐을때
                nextButton.click()
            }
        }
    })
    // 본문 클릭시 textarea 커서 활성화
    bibleText.addEventListener('click', (e) => {
        textWindow.focus()
    })

    // 버튼 클릭 
    // 다음버튼
    nextButton.addEventListener('click', async (e) => {
        e.preventDefault()
        const psalmsLastIndex = 150
        if (index < psalmsLastIndex) {
            index++
            main.replaceChildren()
            await getBibleText()
        } else if (index == psalmsLastIndex) {
            alert('마지막 장입니다.')
        }
    })

    // 이전버튼
    prevButton.addEventListener('click', (e) => {
        e.preventDefault()
        if (index > 1) {
            index--
            main.replaceChildren()
            getBibleText()
        }
    })

    // 다시버튼
    retryButton.addEventListener('click', (e) => {
        e.preventDefault()
        // 작성한 내용만 지우기, 커서를 원위치 하는 것을 구현해야함 
        // inputDiv.innerText =''
        // textSpan.forEach(span => span.classList.remove('incorrect'))
        // 일단은 페이지가 새로고침 되는 것으로
        main.replaceChildren()
        getBibleText(index)

    })

    
    // 셀렉트 옵션넣기
    let newArr = []
    for (let i = 0; i < bibleData.psalms.length - 1; i++) {
        newArr.push(bibleData.psalms[i].chapter)
    }
    let chapters = [...new Set(newArr)]

    // 숫자 배열로 변환하여 오름차순 정렬
    chapters = chapters.map(Number).sort((a, b) => a - b)

    chapters.unshift('작성하고 싶은 편수를 선택하세요')

    const select = document.createElement('select')
    form.appendChild(select)

    for (let i = 0; i < chapters.length; i++) {
        const option = document.createElement('option')
        option.text = chapters[i]
        select.append(option)
    }

    select.addEventListener('change', async (e) => {
        index = e.target.value
        main.replaceChildren()
        await getBibleText() // 코드를 업데이트했는데 반영이 안되는것 같다
    })
}
(async () => await getBibleText())()


// 모바일 버거버튼 클릭시
document.body.addEventListener('click', function (e) {
    if (e.target.className == 'material-symbols-outlined') {
        const navButtons = document.querySelector('.nav-btns')
        const mobileBackground = document.querySelector('.mobile-background')
        navButtons.classList.toggle('show')
        mobileBackground.classList.toggle('show')
    }
})


