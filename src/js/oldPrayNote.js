let prayBucketIndex = 1
let prayBucketDbId = null
let rightClickNearestTdInnerText

// 헤더 모듈 가져오기
function checkIsLogined() {
    {
        const isLoggedIn = localStorage.getItem('로그인상태')
        document.body.insertAdjacentElement('afterbegin', headerModule(isLoggedIn))
    }
}
document.addEventListener('DOMContentLoaded', checkIsLogined)

// 한번에 여러개의 서버 데이터 가져오기
async function getPrayNoteServerData() {
    const firstPostIt = 1
    const secondPostIt = 2
    const reponses = await Promise.all([getPrayBucketlist(), getGrace(), getPrayDiary(), getPickPosts(firstPostIt), getPickPosts(secondPostIt)])
    const prayBucketlistData = reponses[0]
    const graceList = reponses[1]
    const prayDiaryList = reponses[2]
    const pickPost1 = reponses[3]
    const pickPost2 = reponses[4]
    showPrayBucketlist(prayBucketlistData)
    showGraceList(graceList)
    showPrayDiary(prayDiaryList)
    showPickPosts(pickPost1, pickPost2)
}

// PrayBucketlist 서버 데이터 가져오는 함수
async function getPrayBucketlist() {
    try {
        const data = await fetch('https://backend.closetogod.site/api/prayBucketlist/getBucket',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: localStorage.getItem('유저이름')
                })
            }

        )
        const prayBucketlistData = await data.json()
        return prayBucketlistData
    } catch (error) {
        console.log('기도버킷리스트 로딩 실패 :', error)
    }
}
// 마우스 우클릭해서 기능 (수정, 삭제) 추가하기
const deleteAndEditPrayBucketlist = (prayBucketlistList) => {
    prayBucketlistList.addEventListener('contextmenu', function (e) {
        // 마우스 우클릭 시 클릭된 곳 색깔 입히기
        const rightClickeActive = e.target.parentNode.classList.add('active')
        const prayBucketlistList = document.querySelectorAll('.prayBucketlist-List')
        // 기존에 active 클래스가 있으면 삭제하고 새로운 active 클래스 추가하기
        prayBucketlistList.forEach((element => {
            if (element.classList.contains('active')) {
                element.classList.remove('active')
                e.currentTarget.classList.add('active')
            }
        }))
        // 마우스 우클릭시 기존에 열려있던 input 수정창 사라지게 하기
        const editDetail = document.querySelector('#edit-detail')
        if (editDetail) editDetail.parentNode.innerHTML = rightClickNearestTdInnerText

        const rightClickList = e.target.parentNode.className.split(' ')[1]
        const rightClickNearestTd = e.target
        rightClickNearestTdInnerText = e.target.innerText
        e.preventDefault()
        const rightClickMenu = document.querySelector('.right-click-menu')
        rightClickMenu.innerHTML = `
        <div class='right-click-menu-edit'>수정</div>
        <div class='right-click-menu-delete'>삭제</div>
        `
        document.body.appendChild(rightClickMenu)

        rightClickMenu.style.top = `${e.clientY + scrollY}px`
        rightClickMenu.style.left = `${e.clientX + scrollY}px`
        rightClickMenu.style.display = 'flex'

        const rightClickMenuEdit = document.querySelector('.right-click-menu-edit')
        const rightClickMenuDelete = document.querySelector('.right-click-menu-delete')
        rightClickMenuEdit.style.cursor = 'pointer'
        rightClickMenuDelete.style.cursor = 'pointer'
        // 삭제하기
        rightClickMenuDelete.addEventListener('click', function (e) {
            if(confirm('정말 삭제하시겠습니까?') === false) return
            else{
                fetch('https://backend.closetogod.site/api/prayBucketlist/',
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        _id: rightClickList
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.code == 200) {
                        alert('삭제되었습니다.')
                        location.reload()
                    }
                })
            }
        })

        // 수정하기
        rightClickMenuEdit.addEventListener('click', function (e) {
            rightClickNearestTd.innerHTML = `
            <input id='edit-detail' type='text' value ='${rightClickNearestTdInnerText}'/> 
            `
            const editDetail = document.querySelector('#edit-detail')
            editDetail.style.width = '100%'
            editDetail.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    fetch('https://backend.closetogod.site/api/prayBucketlist/edit',
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                _id: rightClickList,
                                detail: editDetail.value,
                                lastModifiedAt: new Date()
                            })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.code == 200) {
                                alert('수정되었습니다.')
                                location.reload()
                            }
                        })
                }
            })
        })
    })
}



// 우클릭 메뉴가 떠있는 상태에서 다른 곳을 클릭하면 우클릭 메뉴가 사라지게 하기
const hideRightClickMenu = (e) => {
    e.stopPropagation()
    const rightClickMenu = document.querySelector('.right-click-menu')
    const prayBucketlistList = document.querySelectorAll('.prayBucketlist-List')
    const graceList = document.querySelectorAll('.Prayer-of-thanksList')
    const prayDiaryList = document.querySelectorAll('.prayDiary-List')
    const editDetail = document.querySelector('#edit-detail')

    if (rightClickMenu) {
        rightClickMenu.style.display = 'none'
        rightClickMenu.style.top = null
        rightClickMenu.style.left = null
        if (prayBucketlistList) {
            prayBucketlistList.forEach(element => {
                element.classList.remove('active')
            })
        }
        if (graceList) {
            graceList.forEach(element => {
                element.classList.remove('active')
            })
        }
        if (prayDiaryList) {
            prayDiaryList.forEach(element => {
                element.classList.remove('active')
            })
        }
    }
    // 수정버튼 눌러서 생긴 input창을 제외한 다른 곳을 클릭하면 input창이 사라지게 하기 && 수정창 1개만 열리게해야함
    if (editDetail && e.target.id !== 'edit-detail' && e.target.className !== 'right-click-menu'
        && e.target.className !== 'right-click-menu-edit' && e.target.className !== 'right-click-menu-delete') {
        editDetail.parentNode.innerHTML = rightClickNearestTdInnerText
    }
}

document.body.addEventListener('click', hideRightClickMenu)

// 버킷리스트 화면에 뿌려주는 함수
async function showPrayBucketlist(prayBucketlistData) {
    const prayBucketListTbody = document.querySelector('.prayBucketList-body tbody')
    prayBucketlistData.result?.forEach(element => {
        const prayBucketlistList = document.createElement('tr')
        prayBucketlistList.className = `prayBucketlist-List ${element._id}`
        prayBucketlistList.innerHTML =
            `
                <td><input type="checkbox" class='complete-checkbox'></td>
                <td>${prayBucketIndex}</td>
                <td>${element.detail}</td>
                <td>${transformDate(element.createdAt)}</td>
                <td class='checkedDate'>${element.finishedAt ? transformDate(element.finishedAt): ''}</td>
        `
        prayBucketListTbody.appendChild(prayBucketlistList)
        if(element.isDone) prayBucketlistList.querySelector('.complete-checkbox').checked = true
        prayBucketIndex++
        deleteAndEditPrayBucketlist(prayBucketlistList)
    });
}

document.addEventListener('DOMContentLoaded', getPrayNoteServerData)  // 서버데이터 가져오기


// PrayBucketList 작업
const prayBucketlistForm = document.querySelector('.prayBucketList-input form')
prayBucketlistForm.addEventListener('submit', addPrayBucketlist)

// PrayBucketList 추가
async function addPrayBucketlist(event) {
    event.preventDefault()
    const currentTime = Date.now(); // 현재 시간을 밀리초로 얻기
    const prayBucketListTbody = document.querySelector('.prayBucketList-body tbody')
    const prayBucketlistInput = document.querySelector('.prayBucketList-input input')
    const prayBucketlist = prayBucketlistInput.value
    const prayBucketlistList = document.createElement('tr')

    // 몽고DB에 저장하는 코드 작성
    const saveServer = async (number, detail) => {
        try {
            const response = await fetch('https://backend.closetogod.site/api/prayBucketlist/saveBucket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    number: number,
                    detail: detail,
                    email: localStorage.getItem('유저이름'),
                })
            })
            const result = await response.json()
            prayBucketDbId = result.result._id // 몽고DB에 저장된 기도버킷리스트의 아이디를 전역변수에 저장
            return prayBucketDbId
        }
        catch (err) {
            console.log('기도버킷리스트 등록오류 :', err)
        }
    }
    await saveServer(prayBucketIndex, prayBucketlist) // 서버에 저장하는 함수

    prayBucketlistList.className = `prayBucketlist-List ${prayBucketDbId}`
    prayBucketlistList.innerHTML =
        `
            <td><input type="checkbox" class='complete-checkbox'></td>
            <td>${prayBucketIndex}</td>
            <td>${prayBucketlist}</td>
            <td>${transformDate(currentTime)}</td>
            <td class='checkedDate'></td>
    `


    prayBucketListTbody.appendChild(prayBucketlistList)
    prayBucketlistInput.value = ''

    prayBucketIndex++
    deleteAndEditPrayBucketlist(prayBucketlistList)
}

// PrayBuckelist checkbox 클릭시 체크당시 날짜 출력
function handleCheckboxChange(e) {
    if (e.target.className === 'complete-checkbox') {
        const currentTime = Date.now();
        if (e.target.checked) {
            let getCheckedTime = transformDate(currentTime);
            e.target.closest('tr').querySelector('.checkedDate').innerText = getCheckedTime;

            const clickedDataDbId = e.target.closest('tr').className.split(' ')[1];
            const updatedCheckedDate = async () => {
                const response = await fetch('https://backend.closetogod.site/api/prayBucketlist/checked', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        _id: clickedDataDbId,
                        isDone: true,
                        finishedAt: Date.now()
                    })
                });
                const result = await response.json();
            };
            updatedCheckedDate();
        } else {
            confirm('체크박스를 해제하시겠습니까?') === false ? e.target.checked = true :
            e.target.closest('tr').querySelector('.checkedDate').innerText = '';

            const clickedDataDbId = e.target.closest('tr').className.split(' ')[1];
            const updatedUnCheckedDate = async () => {
                const response = await fetch('https://backend.closetogod.site/api/prayBucketlist/checked', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        _id: clickedDataDbId,
                        isDone: false,
                        finishedAt: null
                    })
                });
                const result = await response.json();
            };
            updatedUnCheckedDate();
        }
    }
}

document.body.removeEventListener('click', handleCheckboxChange);
document.body.addEventListener('click', handleCheckboxChange);



//////////////////////////////////////////////////////////////////////////////////////////////////////////////
let graceIndex = 1
let graceDbId = null

// 감사기도 가져오기
async function getGrace() {
    try {
        const reponse = await fetch('https://backend.closetogod.site/api/grace/getGrace', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: localStorage.getItem('유저이름')
            })
        })
        const result = await reponse.json()
        return result
    } catch (error) {
        console.log('감사기도 조회 실패:', error)
    }
}

// 감사기도 작성하기

async function showGraceList(graceList) {
    const PrayerOfThanksBody = document.querySelector('.Prayer-of-thanks-body tbody')
    graceList.result?.forEach(element => {
        const PrayerOfThanksList = document.createElement('tr')
        PrayerOfThanksList.className = `Prayer-of-thanksList ${element._id}`
        PrayerOfThanksList.innerHTML =
            `
                <td>${graceIndex}</td>
                <td>${element.detail}</td>
                <td>${transformDate(element.createdAt)}</td>
        `
        PrayerOfThanksBody.appendChild(PrayerOfThanksList)
        graceIndex++
        deleteAndEditGraceList(PrayerOfThanksList)
    });
}


// 마우스 우클릭해서 기능 (수정, 삭제) 추가하기
const deleteAndEditGraceList = (PrayerOfThanksList) => {
    PrayerOfThanksList.addEventListener('contextmenu', function (e) {
        // 마우스 우클릭 시 클릭된 곳 색깔 입히기
        const rightClickeActive = e.target.parentNode.classList.add('active')
        const PrayerOfThanksList = document.querySelectorAll('.Prayer-of-thanksList')
        // 기존에 active 클래스가 있으면 삭제하고 새로운 active 클래스 추가하기
        PrayerOfThanksList.forEach((element => {
            if (element.classList.contains('active')) {
                element.classList.remove('active')
                e.currentTarget.classList.add('active')
            }
        }))
        // 마우스 우클릭시 기존에 열려있던 input 수정창 사라지게 하기
        const editDetail = document.querySelector('#edit-detail')
        if (editDetail) editDetail.parentNode.innerHTML = rightClickNearestTdInnerText

        const rightClickList = e.target.parentNode.className.split(' ')[1]
        const rightClickNearestTd = e.target
        rightClickNearestTdInnerText = e.target.innerText
        e.preventDefault()
        const rightClickMenu = document.querySelector('.right-click-menu')
        rightClickMenu.innerHTML = `
        <div class='right-click-menu-edit'>수정</div>
        <div class='right-click-menu-delete'>삭제</div>
        `
        document.body.appendChild(rightClickMenu)

        rightClickMenu.style.top = `${e.clientY + scrollY}px`
        rightClickMenu.style.left = `${e.clientX + scrollX}px`
        rightClickMenu.style.display = 'flex'

        const rightClickMenuEdit = document.querySelector('.right-click-menu-edit')
        const rightClickMenuDelete = document.querySelector('.right-click-menu-delete')
        rightClickMenuEdit.style = 'cursor:pointer'
        rightClickMenuDelete.style = 'cursor:pointer'
        // 삭제하기
        rightClickMenuDelete.addEventListener('click', function (e) {
            if(confirm('정말 삭제하시겠습니까?') === false) return
            else{
                fetch('https://backend.closetogod.site/api/grace/',
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        _id: rightClickList
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.code == 200) {
                        alert('삭제되었습니다.')
                        location.reload()
                    }
                })
            }
        })

        // 수정하기
        rightClickMenuEdit.addEventListener('click', function (e) {
            rightClickNearestTd.innerHTML = `
            <input id='edit-detail' type='text' value ='${rightClickNearestTdInnerText}'/>
            `
            const editDetail = document.querySelector('#edit-detail')
            editDetail.style.width = '100%'
            editDetail.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    fetch('https://backend.closetogod.site/api/grace/edit',
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                _id: rightClickList,
                                detail: editDetail.value,
                                lastModifiedAt: new Date()
                            })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.code == 200) {
                                alert('수정되었습니다.')
                                location.reload()
                            }
                        })
                }
            })
        })

    })
}


// PrayerOfThanksList 작업
const PrayerOfThanksListForm = document.querySelector('.Prayer-of-thanks-input form')
PrayerOfThanksListForm.addEventListener('submit', addGraceList)

// PrayerOfThanksList 추가
async function addGraceList(event) {
    event.preventDefault()
    const currentTime = Date.now(); // 현재 시간을 밀리초로 얻기
    const graceListTbody = document.querySelector('.Prayer-of-thanks-body tbody')
    const graceListInput = document.querySelector('.Prayer-of-thanks-input input')
    const graceList = graceListInput.value
    const graceListList = document.createElement('tr')

    // 몽고DB에 저장하는 코드 작성
    const saveServer = async (number, detail) => {
        try {
            const response = await fetch('https://backend.closetogod.site/api/grace/saveGrace', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    number: number,
                    detail: detail,
                    email: localStorage.getItem('유저이름'),
                })
            })
            const result = await response.json()
            graceDbId = result.result._id // 몽고DB에 저장된 감사기도의 아이디를 전역변수에 저장
            return graceDbId
        }
        catch (err) {
            console.log('감사기도 등록오류 :', err)
        }
    }
    await saveServer(graceIndex, graceList) // 서버에 저장하는 함수

    graceListList.className = `Prayer-of-thanksList ${graceDbId}`
    graceListList.innerHTML =
        `
            <td>${graceIndex}</td>
            <td>${graceList}</td>
            <td>${transformDate(currentTime)}</td>
    `


    graceListTbody.appendChild(graceListList)
    graceListInput.value = ''

    graceIndex++
    deleteAndEditGraceList(graceListList)
}


// < 기도일기 >  //

// 기도일기 전역변수
const prayDiaryTitle = document.querySelector('#prayDiary-title')
const prayDiaryContent = document.querySelector('#prayDiary-content')
const prayDiarySaveBtn = document.querySelector('.saveBtn')
const prayDiaryCancelBtn = document.querySelector('.cancelBtn')
let clickedPrayDiaryId = null

// 기도일기 작성(저장)
const savePrayDiary = async () => {
    const saveDiary = await fetch('https://backend.closetogod.site/api/prayDiary/saveDiary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: prayDiaryTitle.value,
            detail: prayDiaryContent.value,
            email: localStorage.getItem('유저이름')
        })
    })
    const result = await saveDiary.json()
    const prayDiaryOutputBodyTbody = document.querySelector('.prayDiary-output-body tbody')
    const prayDiaryTr = document.createElement('tr')
    prayDiaryTr.className = `prayDiary-List ${result.result._id}`

    prayDiaryTr.innerHTML = `
        <td>${transformDate(result.result.createdAt)}</td>
        <td>${result.result.title}</td>
    `
    prayDiaryOutputBodyTbody.appendChild(prayDiaryTr)
    deletePrayDiary(prayDiaryTr)
}

// 기도일기 수정 경고창 보여주기 
const showWarningModal = () => {
    const warningModal = document.createElement('div')
    warningModal.className = 'warning-modal'
    warningModal.innerHTML = `
                <div class='warning-modal-content'>
                <p>작성중인 내용이 있습니다. 정말 취소하시겠습니까?</p>
                <div class='warning-modal-btns'>
                <button class='warning-modal-ok'>확인</button>
                <button class='warning-modal-cancel'>취소</button>
                </div>
                </div>
                `
    warningModal.classList.add('modal-background')
    document.body.style.overflow = 'hidden'
    document.body.appendChild(warningModal)
    const warningModalCancel = document.querySelector('.warning-modal-cancel')
    const warningModalOk = document.querySelector('.warning-modal-ok')
    warningModalCancel.addEventListener('click', function () {
        warningModal.remove()
        document.body.style.overflow = ''

    })
    warningModalOk.addEventListener('click', function () {
        warningModal.remove()
        document.body.style.overflow = ''
    })
}

// 포스트잇 가져오기
const getPickPosts = async(postNum) => {
    try {
        const response = await fetch(`https://backend.closetogod.site/api/pickPosts/post${postNum}`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: localStorage.getItem('유저이름')
            })
        }) 
        const result = await response.json()
        return result
    }
    catch (err) {
        console.log(`포스트잇${postNum} 가져오기 실패 :`, err)
    }
}

// 포스트잇 정보 뿌려주기
const showPickPosts = (firstPost, secondPost) => {
    const scripture1 = document.querySelector('.scripture-1') 
    const scripture2 = document.querySelector('.scripture-2')
    if (firstPost.result.length > 0) {
        scripture1.innerHTML = `<p class='scripture-1-text'>${firstPost.result[0].text || ''}</p>`
    } else {
        scripture1.innerHTML = `<p class='scripture-1-text'></p>`
    }
    if (secondPost.result.length > 0) {
        scripture2.innerHTML = `<p class='scripture-2-text'>${secondPost.result[0].text || ''}</p>`
    } else {
        scripture2.innerHTML = `<p class='scripture-2-text'></p>`
    }
}

// 포스트잇 저장
const saveScripture = async (postNum, pickText) => {
    try {
        const response = await fetch(`https://backend.closetogod.site/api/pickPosts/savePost${postNum}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                label: `post${postNum}`,
                text: pickText.value,
                email: localStorage.getItem('유저이름')
            })
        })
        const result = await response.json()
    }
    catch (err) {
        console.log(`post${postNum} 저장 실패:`, err)
    }
}
// 포스트잇 업데이트
const updateScripture = async (postNum, pickText) => {
    try {
        const response = await fetch(`https://backend.closetogod.site/api/pickPosts/updatePost${postNum}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                label: `post${postNum}`,
                text: pickText.value || '클릭하면 내용을 작성할 수 있습니다',
                email: localStorage.getItem('유저이름')
            })
        })
        const result = await response.json()
    }
    catch (err) {
        console.log(`post${postNum} 업데이트 실패:`, err)
    }
}

// 클릭이벤트 모음
document.body.addEventListener('click', async function (e) {
    // 기도일기 저장버튼 클릭시
    if (prayDiarySaveBtn && e.target.className == 'saveBtn') {
        if (prayDiaryTitle.value !== '' && prayDiaryContent.value !== '') {
            e.stopPropagation()
            savePrayDiary()
            prayDiaryTitle.value = ''
            prayDiaryContent.value = ''
        }
        else {
            alert('제목과 내용을 입력해주세요')
        }
    }

    // 기도일기 취소버튼 클릭시 
    if (prayDiaryCancelBtn && e.target.className == 'cancelBtn') {
        cancelPrayDiary()
    }
    // 기도일기 output 화면에서 일기 클릭시 input창에 기도일기 내용 보여주기
    if (e.target.parentNode.classList.contains('prayDiary-List')) {
        clickedPrayDiaryId = e.target.parentNode.className.split(' ')[1]
        const diaryData = await showPrayDiaryDetail(clickedPrayDiaryId)
        changeSaveBtnToEdit() // 저장버튼 수정버튼으로 변경
        addNewDiaryBtn() // 새일기 버튼 생성
        changeEditBtnToSave() // 새일기 버튼을 누르면 수정버튼을 저장버튼으로 변경 
        // checkInputValueAndShowWarningModal(diaryData) // 기도일기 다른 일기 클릭하면 경고창 띄우기
    }

    if (e.target.className == 'editBtn') {
        e.stopPropagation()
        await editPrayDiary(clickedPrayDiaryId)
    }

    // 포스트 잇 1 
    if (e.target.className == 'scripture-1' || e.target.className == 'scripture-1-text') {
        e.stopPropagation()
        const postNum = 1
        const serverData = await getPickPosts(postNum)
        const scripture1 = document.querySelector('.scripture-1')
        const scripture1Paragraph = document.querySelector('.scripture-1-text')
        scripture1.innerHTML =
            `
        <textarea id='pickText1' placeholder ='기억하고 싶은 문구를 작성하세요, 최대 65자까지 작성가능합니다' maxlength ='65'>${serverData?.result[0]?.text || ''}</textarea>
        <div class='scripture-1-btns'>
            <button class='scripture-1-saveBtn'>저장</button>
            <button class='scripture-1-cancelBtn'>취소</button>
        </div>
        `
        const pickText = document.querySelector('#pickText1')
        const scripture1SaveBtn = document.querySelector('.scripture-1-saveBtn')
        const scripture1CancelBtn = document.querySelector('.scripture-1-cancelBtn')

        pickText.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                // 화면 변경
                scripture1.innerHTML = `<p class='scripture-1-text'>${pickText.value || serverData?.result[0]?.text || ''}</p>`
                // 서버에 저장
                if(pickText.value == '' ) alert('내용을 입력해주세요')
                    else if (serverData.result.length == 0 && pickText.value !== '') saveScripture(postNum, pickText)
                    else if (serverData.result.length > 0 && pickText.value !== ''){
                        updateScripture(postNum, pickText)
                    }
            }
        })

        // 저장버튼 누르면 서버에 저장
        scripture1SaveBtn.addEventListener('click', function (e) {

            const scripture1Paragraph = document.querySelector('.scripture-1-text')
            // 화면 변경
            scripture1.innerHTML = `<p class='scripture-1-text'>${pickText.value || serverData?.result[0]?.text || ''}</p>`
            // 서버에 저장
            if(pickText.value == '' ) alert('내용을 입력해주세요')
            else if (serverData.result.length == 0 && pickText.value !== '') saveScripture(postNum, pickText)
            else if (serverData.result.length > 0 && pickText.value !== ''){
                updateScripture(postNum, pickText)
            }
        })
        scripture1CancelBtn.addEventListener('click', function (e) {
            scripture1.innerHTML = `<p class='scripture-1-text'>${pickText.value || serverData?.result[0]?.text || ''}</p>` // ${pickText.value} 서버에서 가져온 데이터로 변경
        })
    }
    // 포스트 잇 2
    if (e.target.className == 'scripture-2' || e.target.className == 'scripture-2-text') {
        e.stopPropagation()
       
        const postNum = 2
        const serverData = await getPickPosts(postNum)
        const scripture2 = document.querySelector('.scripture-2')
        const scripture2Paragraph = document.querySelector('.scripture-2-text')
        scripture2.innerHTML =
            `
        <textarea id='pickText2' placeholder ='기억하고 싶은 문구를 작성하세요, 최대 65자까지 작성가능합니다' maxlength ='65'>${serverData?.result[0]?.text || ''}</textarea>
        <div class='scripture-2-btns'>
            <button class='scripture-2-saveBtn'>저장</button>
            <button class='scripture-2-cancelBtn'>취소</button>
        </div>
        `
        const pickText = document.querySelector('#pickText2')
        const scripture2SaveBtn = document.querySelector('.scripture-2-saveBtn')
        const scripture2CancelBtn = document.querySelector('.scripture-2-cancelBtn')
            pickText.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    // 화면 변경
                    scripture2.innerHTML = `<p class='scripture-2-text'>${pickText.value || serverData?.result[0]?.text || ''}</p>`
                    // 서버에 저장
                    if(pickText.value == '' ) alert('내용을 입력해주세요')
                    else if (serverData.result.length == 0 && pickText.value !== '') saveScripture(postNum, pickText)
                    else if (serverData.result.length > 0 && pickText.value !== ''){
                        updateScripture(postNum, pickText)
                    }
                }
            })
        scripture2SaveBtn.addEventListener('click', function (e) {
            // 화면 변경
            scripture2.innerHTML = `<p class='scripture-2-text'>${pickText.value || serverData?.result[0]?.text || ''}</p>`
            // 서버에 저장
            if(pickText.value == '' ) alert('내용을 입력해주세요')
            else if (serverData.result.length == 0 && pickText.value !== '') saveScripture(postNum, pickText)
            else if (serverData.result.length > 0 && pickText.value !== ''){
                updateScripture(postNum, pickText)
            }
        })
        scripture2CancelBtn.addEventListener('click', function (e) {
            scripture2.innerHTML = `<p class='scripture-2-text'>${pickText.value || serverData?.result[0]?.text || ''}</p>` 
        })
    }



    // 모바일 버거버튼 클릭시
    if (e.target.className == 'material-symbols-outlined') {
        const navButtons = document.querySelector('.nav-btns')
        const mobileBackground = document.querySelector('.mobile-background')
        navButtons.classList.toggle('show')
        mobileBackground.classList.toggle('show')
    }
})


// 기도일기 취소
const cancelPrayDiary = () => {
    if (prayDiaryTitle.value == '' && prayDiaryContent.value == '') return
    else {
        const userResponse = confirm('작성중인 내용이 있습니다. 정말 취소하시겠습니까?')
        if (userResponse) {
            prayDiaryTitle.value = ''
            prayDiaryContent.value = ''
        }
    }
}


// 저장된 기도일기 서버에서 가져오기
const getPrayDiary = async () => {
    const response = await fetch('https://backend.closetogod.site/api/prayDiary/getDiary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: localStorage.getItem('유저이름')
        })
    })
    const result = await response.json()
    return result
}

// 서버에서 가져온 기도일기 output 화면에 보여주기
const showPrayDiary = async (prayDiaryList) => {
    const prayDiaryOutputBodyTbody = document.querySelector('.prayDiary-output-body tbody')
    if (prayDiaryList !== undefined || prayDiaryList !== undefined) {
        prayDiaryList?.result?.forEach(element => {
            const prayDiaryTr = document.createElement('tr')
            prayDiaryTr.className = `prayDiary-List ${element._id}`

            prayDiaryTr.innerHTML = `
          <td>${transformDate(element.createdAt)}</td>
          <td>${element.title}</td>
      `
            prayDiaryOutputBodyTbody.appendChild(prayDiaryTr)
            deletePrayDiary(prayDiaryTr)
        })
    }
}

// new Date => YY/MM/DD 형식으로 바꾸기
const transformDate = (date) => {
    const currentDate = new Date(date); // 해당 시간을 가진 날짜 객체 생성
    const formattedDate = `${currentDate.getFullYear().toString().slice(2, 4)}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}`;
    return formattedDate
}

let previousData = {
    title: '',
    content: ''
}

// 기도일기 OUtput 화면에서 일기 클릭시 input창에 기도일기 내용 보여주기
const showPrayDiaryDetail = async (clickedPrayDiaryId) => {
    const response = await fetch('https://backend.closetogod.site/api/prayDiary/getDiaryDetail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            _id: clickedPrayDiaryId
        })
    })
    const result = await response.json()
    const prayDiaryTitle = document.querySelector('#prayDiary-title')
    const prayDiaryContent = document.querySelector('#prayDiary-content')
    // previousData.title : 이전에 클릭한 일기의 title
    // prayDiaryTitle.value : 현재 input창에서 보여지는 value값
    // result.result.title  : 방금 클릭한 일기의 title 
    // 이전 데이터 : 바꾸자 인풋창 값 : 수정확인 서버에서 가져온 값 : 타이밍문제인가?
    // 수정확인 input창과 수정확인 result.result.title이 비교하는게 조건문이어야 한다.
    // 현재 문제는 result.result.title가 이전데이터가 아닌 클릭한 일기의 title을 가져오는 부분이다.
    // 다른글을 클릭하는 순간 다른글의 result.result.title이 기준이 되어버린다. 현재 글을 value와 result.result를 비교해야한다.
    // 이전글의 title과 content를 저장해놔야하나? 
    // 현재 문제 : 내용을 수정하지 않았는데도 다른 일기를 클릭하면 작성중인 내용이 있습니다, 정말 취소하시겠습니까? 하는 경고창이 나온다.

    if (prayDiaryTitle.value == '' && prayDiaryContent.value == '') {
        prayDiaryTitle.value = result.result.title
        prayDiaryContent.value = result.result.detail
        previousData.title = result.result.title
        previousData.content = result.result.detail
    }
    else if (prayDiaryTitle.value == result.result.title && prayDiaryContent.value == result.result.detail) {
        previousData.title = result.result.title
        previousData.content = result.result.detail
    }
    else if (prayDiaryTitle.value == previousData.title && prayDiaryContent.value == previousData.content) {
        prayDiaryTitle.value = result.result.title
        prayDiaryContent.value = result.result.detail
        previousData.title = result.result.title
        previousData.content = result.result.detail
    }
    else if (prayDiaryTitle.value !== result.result.title || prayDiaryContent.value !== result.result.detail) {
        const userResponse = confirm('작성중인 내용이 있습니다. 정말 취소하시겠습니까?')
        if (userResponse) {
            prayDiaryTitle.value = result.result.title
            prayDiaryContent.value = result.result.detail
            previousData.title = result.result.title
            previousData.content = result.result.detail
        }

    }

    return result
}

// 기도일기 OUtput 화면에서 일기 클릭시, 저장버튼 수정버튼으로 변경
const changeSaveBtnToEdit = (clicked) => {
    if (document.querySelector('.editBtn')) return
    const prayDiarySaveBtn = document.querySelector('.saveBtn')
    prayDiarySaveBtn.innerText = '수정'
    prayDiarySaveBtn.className = 'editBtn'
    prayDiarySaveBtn.style.cursor = 'pointer'
    prayDiarySaveBtn.style.backgroundColor = 'rgb(27, 161, 117)'
    prayDiarySaveBtn.style.color = 'white'
}

// 기도일기 OUtput 화면에서 일기 클릭시, 새일기 버튼 생성
const addNewDiaryBtn = () => {
    const buttonGroup = document.querySelector('.btn-group')
    const prayNewDiary = document.createElement('button')
    prayNewDiary.innerText = '새일기'
    prayNewDiary.className = 'newDiary'
    prayNewDiary.style.cursor = 'pointer'
    prayNewDiary.style.backgroundColor = 'skyblue'
    prayNewDiary.style.color = 'white'
    if (buttonGroup.children.length == 2) buttonGroup.insertAdjacentElement('afterbegin', prayNewDiary)
}

// 새일기 버튼을 누르면 수정버튼을 저장버튼으로 변경
const changeEditBtnToSave = () => {
    const prayNewDiary = document.querySelector('.newDiary')
    if (document.querySelector('.saveBtn')) return
    prayNewDiary.addEventListener('click', function (e) {
        e.preventDefault()
        prayDiaryTitle.value = ''
        prayDiaryContent.value = ''
        prayDiarySaveBtn.innerText = '저장'
        prayDiarySaveBtn.className = 'saveBtn'
    })
}

// 수정버튼 클릭시 기도일기 수정하기
const editPrayDiary = async (clickedPrayDiaryId) => {
    const prayDiaryTitle = document.querySelector('#prayDiary-title')
    const prayDiaryContent = document.querySelector('#prayDiary-content')

    const response = await fetch('https://backend.closetogod.site/api/prayDiary/editDiary', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            _id: clickedPrayDiaryId,
            title: prayDiaryTitle.value,
            detail: prayDiaryContent.value,
            lastModifiedAt: new Date()
        })
    })
    const result = await response.json()
    prayDiaryTitle.value = result.result.title
    prayDiaryContent.value = result.result.detail
    previousData.title = result.result.title
    previousData.content = result.result.detail

    // 수정버튼 누르면 output 화면에 수정된 내용 보여주기
    const prayDiaryList = document.querySelectorAll('.prayDiary-List')
    prayDiaryList.forEach(element => {
        if (element.className.split(' ')[1] == clickedPrayDiaryId) {
            element.querySelector('td:nth-child(1)').innerText = transformDate(result.result.lastModifiedAt)
            element.querySelector('td:nth-child(2)').innerText = result.result.title
        }
    })
    // alert('수정되었습니다.')
}

// 
const deletePrayDiary = (prayDiaryList) => {
    prayDiaryList.addEventListener('contextmenu', function (e) {
        // 마우스 우클릭 시 클릭된 곳 색깔 입히기
        const rightClickeActive = e.target.parentNode.classList.add('active')
        const prayDiaryLists = document.querySelectorAll('.prayDiary-List')
        // 기존에 active 클래스가 있으면 삭제하고 새로운 active 클래스 추가하기
        prayDiaryLists.forEach((element => {
            if (element.classList.contains('active')) {
                element.classList.remove('active')
                e.currentTarget.classList.add('active')
            }
        }))
        // 마우스 우클릭시 기존에 열려있던 input 수정창 사라지게 하기


        const rightClickList = e.target.parentNode.className.split(' ')[1]
        e.preventDefault()
        const rightClickMenu = document.querySelector('.right-click-menu')
        rightClickMenu.innerHTML = `
        <div class='right-click-menu-delete'>삭제</div>
        `
        document.body.appendChild(rightClickMenu)

        rightClickMenu.style.top = `${e.clientY + scrollY}px`
        rightClickMenu.style.left = `${e.clientX + screenX}px`
        rightClickMenu.style.display = 'flex'

        const rightClickMenuDelete = document.querySelector('.right-click-menu-delete')
        rightClickMenuDelete.style.cursor = 'pointer'
        // 삭제하기
        rightClickMenuDelete.addEventListener('click', async function (e) {
            if(confirm('정말 삭제하시겠습니까?') === false) return
            else{
                await fetch('https://backend.closetogod.site/api/prayDiary/deleteDiary',
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        _id: rightClickList
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.code == 200) {
                        alert('삭제되었습니다.')
                        location.reload()
                    }
                })
            }
        })
    })
}


