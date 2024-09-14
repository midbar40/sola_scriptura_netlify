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

// new Date => YY/MM/DD 형식으로 바꾸기
const transformDate = (date) => {
    const currentDate = new Date(date); // 해당 시간을 가진 날짜 객체 생성
    const formattedDate = `${currentDate.getFullYear().toString().slice(2, 4)}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}`;
    return formattedDate
}

// 버킷리스트 초기DOM 렌더링
const createPrayBucketlist = () => {
    const prayWrapper = document.querySelector('.pray-wrapper')
    prayWrapper.innerHTML = `
        <div class="prayBucketList">
        <div class="prayBucketList-body">
        <table>
            <thead>
            <tr>
                <td>순번</td>
                <td>내용</td>
                <td>기도일자</td>
                <td>응답일자</td>
                <td>응답</td>
            </tr>
            </thead>
            <tbody></tbody>
        </table>
        <div class="right-click-menu"></div>
        </div>
        <div class="prayBucketList-input">
        <form>
            <input type="text" placeholder="기도 버킷리스트를 입력하세요, 마우스 우클릭을 통해 수정하거나 삭제할 수 있어요" />
        </form>
        </div>
        `
}

// 첫화면 버킷리스트 서버 데이터 가져오기
async function getPrayNoteServerData() {
    const reponses = await getPrayBucketlist()
    const prayBucketlistData = reponses
    showPrayBucketlist(prayBucketlistData)
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

// 버킷리스트 마우스 우클릭 기능
function addBucketRightClickMenu(e) {
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
    const rightClickNearestTd = e.target.parentNode.children[1]
    const rightClickNearestTdIndex = e.target.parentNode.children[0].innerText
    rightClickNearestTdInnerText = e.target.parentNode.children[1].innerText
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
        if (confirm('정말 삭제하시겠습니까?') === false) return
        else {
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
                        rightClickNearestTd.parentNode.remove()
                        prayBucketlistList.forEach((element => {
                            if (element.children[0].innerText > rightClickNearestTdIndex) {
                                element.children[0].innerText -= 1
                            }
                        }))
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
                            rightClickNearestTd.innerText = editDetail.value;
                        }
                    })
            }
        })
    })
}
// 마우스 우클릭해서 기능 (수정, 삭제) 추가하기
const deleteAndEditPrayBucketlist = (prayBucketlistList) => {
    prayBucketlistList.addEventListener('contextmenu', addBucketRightClickMenu)
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
    createPrayBucketlist()
    submitPrayBucketlist()
    const prayBucketListTbody = document.querySelector('.prayBucketList-body tbody')
    prayBucketlistData.result?.forEach(element => {
        const prayBucketlistList = document.createElement('tr')
        prayBucketlistList.className = `prayBucketlist-List ${element._id}`
        prayBucketlistList.innerHTML =
            `
            <td>${prayBucketIndex}</td>
            <td>${element.detail}</td>
            <td>${transformDate(element.createdAt)}</td>
            <td class='checkedDate'>${element.finishedAt !== null ? transformDate(element.finishedAt) : ''}</td>
            <td><input type="checkbox" class='complete-checkbox'></td>
        `
        prayBucketListTbody.appendChild(prayBucketlistList)
        if (element.isDone) prayBucketlistList.querySelector('.complete-checkbox').checked = true
        prayBucketIndex++
        deleteAndEditPrayBucketlist(prayBucketlistList)
    });
}

document.addEventListener('DOMContentLoaded', getPrayNoteServerData)  // 서버데이터 가져오기


// PrayBucketList 작업
const submitPrayBucketlist = () => {
    const prayBucketlistForm = document.querySelector('.prayBucketList-input form')
    prayBucketlistForm.addEventListener('submit', addPrayBucketlist)
}

// PrayBucketList 추가
async function addPrayBucketlist(event) {
    event.preventDefault()
    const currentTime = Date.now(); // 현재 시간을 밀리초로 얻기
    const prayBucketListTbody = document.querySelector('.prayBucketList-body tbody')
    const prayBucketlistInput = document.querySelector('.prayBucketList-input input')
    const prayBucketlist = prayBucketlistInput.value
    const prayBucketlistList = document.createElement('tr')

    // 몽고DB에 저장하는 코드 작성
    const saveServer = async (detail) => {
        try {
            const response = await fetch('https://backend.closetogod.site/api/prayBucketlist/saveBucket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    detail: detail,
                    email: localStorage.getItem('유저이름'),
                    finishedAt: ''
                    ,
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
    await saveServer(prayBucketlist) // 서버에 저장하는 함수

    prayBucketlistList.className = `prayBucketlist-List ${prayBucketDbId}`
    prayBucketlistList.innerHTML =
        `
        <td>${prayBucketIndex}</td>
        <td>${prayBucketlist}</td>
        <td>${transformDate(currentTime)}</td>
        <td class='checkedDate'></td>
        <td><input type="checkbox" class='complete-checkbox'></td>
    `


    prayBucketListTbody.appendChild(prayBucketlistList)
    prayBucketlistInput.value = ''

    prayBucketIndex++
    deleteAndEditPrayBucketlist(prayBucketlistList)
}

// PrayBuckelist checkbox 클릭시 체크당시 날짜 출력
function handleCheckboxChange(e) {
    e.stopPropagation()
    if (e.target.className === 'complete-checkbox' && e.target.checked) {
        const currentTime = Date.now();

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
    } else if (e.target.className === 'complete-checkbox' && !e.target.checked) {

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


document.body.removeEventListener('click', handleCheckboxChange);
document.body.addEventListener('click', handleCheckboxChange);




//  감사기도 초기DOM 렌더링
const createPrayerOfThanks = () => {
    const prayWrapper = document.querySelector('.pray-wrapper')
    prayWrapper.innerHTML = `
    <div class="Prayer-of-thanks">
      <div class="Prayer-of-thanks-body">
        <table>
          <thead>
            <tr>
              <td>순번</td>
              <td>내용</td>
              <td>일자</td>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <div class="right-click-menu"></div>
      <div class="Prayer-of-thanks-input">
        <form>
          <input type="text" placeholder="감사한 일을 기억해보세요, 마우스 우클릭을 통해 수정하거나 삭제할 수 있어요" />
        </form>
      </div>
    </div>
        `
}

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
    createPrayerOfThanks()
    submitGraceList()
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


function addGraceRightClickMenu(e) {
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
    const rightClickNearestTd = e.target.parentNode.children[1]
    const rightClickNearestTdIndex = e.target.parentNode.children[0].innerText

    rightClickNearestTdInnerText = e.target.parentNode.children[1].innerText
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
        if (confirm('정말 삭제하시겠습니까?') === false) return
        else {
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
                        rightClickNearestTd.parentNode.remove()
                        PrayerOfThanksList.forEach((element => {
                            if (element.children[0].innerText > rightClickNearestTdIndex) {
                                element.children[0].innerText -= 1
                            }
                        }))
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
                            rightClickNearestTd.innerText = editDetail.value;
                        }
                    })
            }
        })
    })

}
// 마우스 우클릭해서 기능 (수정, 삭제) 추가하기
const deleteAndEditGraceList = (PrayerOfThanksList) => {
    PrayerOfThanksList.addEventListener('contextmenu', addGraceRightClickMenu)
}




const submitGraceList = () => {
    const PrayerOfThanksListForm = document.querySelector('.Prayer-of-thanks-input form')
    PrayerOfThanksListForm.addEventListener('submit', addGraceList)
}

// PrayerOfThanksList 추가
async function addGraceList(event) {
    event.preventDefault()
    const currentTime = Date.now(); // 현재 시간을 밀리초로 얻기
    const graceListTbody = document.querySelector('.Prayer-of-thanks-body tbody')
    const graceListInput = document.querySelector('.Prayer-of-thanks-input input')
    const graceList = graceListInput.value
    const graceListList = document.createElement('tr')

    // 몽고DB에 저장하는 코드 작성
    const saveServer = async (detail) => {
        try {
            const response = await fetch('https://backend.closetogod.site/api/grace/saveGrace', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
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
    await saveServer(graceList) // 서버에 저장하는 함수

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
let clickedPrayDiaryId = null


// 기도일기 초기DOM 렌더링
const createPrayDiary = () => {
    const prayWrapper = document.querySelector('.pray-wrapper')
    prayWrapper.innerHTML = `
    <div class="prayDiary">
    <div class="prayDiary-input">
      <form>
        <input type="text" name="prayDiary-title" id="prayDiary-title" placeholder="오늘의 기도일기 제목" />
        <textarea name="prayDiary-content" id="prayDiary-content" cols="30" rows="10"
          placeholder="이곳에 기도일기를 적어보세요.
오늘 하루 하나님께서 나에게 어떻게 역사하셨는지를 기억해보세요.

오른쪽에 일기가 저장되고, 
저장된 일기는 마우스 우클릭을 통해 삭제할 수 있어요.
"></textarea>
        <div class="btn-group">
          <button type="button" class="saveBtn">저장</button>
          <button type="button" class="cancelBtn">취소</button>
        </div>
      </form>
    </div>
    <div class="prayDiary-output">
        <div class="prayDiary-output-body">
          <table>
            <tr>
              <td>일자</td>
              <td>제목</td>
            </tr>
          </table>
        </div>
        <div class="right-click-menu"></div>
      </div>
  </div>
        `
}

// 기도일기 작성(저장)
const savePrayDiary = async () => {
    const prayDiaryTitle = document.querySelector('#prayDiary-title')
    const prayDiaryContent = document.querySelector('#prayDiary-content')
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


// 기도일기 취소
const cancelPrayDiary = () => {
    const prayDiaryTitle = document.querySelector('#prayDiary-title')
    const prayDiaryContent = document.querySelector('#prayDiary-content')
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
    if (prayDiaryList !== undefined) {
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
    const prayDiaryTitle = document.querySelector('#prayDiary-title')
    const prayDiaryContent = document.querySelector('#prayDiary-content')
    const prayDiaryEditBtn = document.querySelector('.editBtn')

    if (document.querySelector('.saveBtn')) return
    else {
        prayNewDiary.addEventListener('click', function (e) {
            e.preventDefault()
            prayDiaryTitle.value = ''
            prayDiaryContent.value = ''
            prayDiaryEditBtn.innerText = '저장'
            prayDiaryEditBtn.className = 'saveBtn'
        })
    }
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
    alert('수정되었습니다.')
}

// 기도일기 마우스 우클릭 기능
function ActiveDiaryRightClick(e) {
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
    const prayDiaryTitle = document.querySelector('#prayDiary-title')
    const prayDiaryContent = document.querySelector('#prayDiary-content')
    const rightClickNearestTd = e.target
    rightClickMenuDelete.addEventListener('click', async function (e) {
        if (confirm('정말 삭제하시겠습니까?') === false) return
        else {
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
                        rightClickNearestTd.parentNode.remove()
                        prayDiaryTitle.value = ''
                        prayDiaryContent.value = ''

                    }
                })
        }
    })
}
// 마우스 우클릭시 기도일기 삭제하기
const deletePrayDiary = (prayDiaryList) => {
    prayDiaryList.addEventListener('contextmenu', ActiveDiaryRightClick)
}


// 포스트잇 초기화면 렌더링
const createPostIt = () => {
    const prayWrapper = document.querySelector('.pray-wrapper')
    prayWrapper.innerHTML = `
    <div class="scripture-board">
    <div class="scripture">
      <div class="scripture-1"></div>
      <div class="scripture-2"></div>
      <div class="scripture-3"></div>
    </div>
    <div class="sermon">
        <div class="sermon-input">
            <form>
                <label for="sermon-datepicker"><span>날짜</span> 
                    <input type="date" id="sermon-datepicker" name="sermon-datepicker">
                </label>
                <label for="sermon-title"><span>제목</span> 
                    <input type="text" id='sermon-title' name="sermon-title" placeholder="제목을 입력하세요" />
                </label>
                <label for="sermon-scripture"><span>본문</span>
                    <input type="text" id='sermon-scripture' name="sermon-scripture" placeholder="본문을 입력하세요" />
                </label>
                <label for="sermon-preacher"><span>설교자</span>
                    <input type="text" id='sermon-preacher' name="sermon-preacher" placeholder="설교자를 입력하세요" />
                </label>
                <label for="sermon-content">내용</label>
                <textarea id='sermon-content' name="sermon-content" placeholder="설교내용을 입력하세요"></textarea>
                <label for="sermon-takeaway">깨달은점</label>
                <textarea id='sermon-takeaway' name="sermon-takeaway" placeholder="무엇을 깨닫게 되었나요"></textarea>
            <div class="sermon-btns">
                <button class="sermon-saveBtn">저장</button>
                <button class="sermon-cancelBtn">취소</button>
                </form>
            </div>     
        </div>    
            <div class="sermon-output">
                <div class="sermon-output-body">
                    <table>
                        <thead>
                            <tr>
                                <td>날짜</td>
                                <td>제목</td>
                                <td>본문</td>
                                <td>설교자</td>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div class="right-click-menu"></div>
        </div>
    </div>
    `
}


// 포스트잇 가져오기
const getPickPosts = async (postNum) => {
    try {
        const response = await fetch(`https://backend.closetogod.site/api/pickPosts/post${postNum}`, {
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
const showPickPosts = (firstPost, secondPost, thirdPost) => {
    const scripture1 = document.querySelector('.scripture-1')
    const scripture2 = document.querySelector('.scripture-2')
    const scripture3 = document.querySelector('.scripture-3')
    if (firstPost?.result.length > 0) {
        scripture1.innerHTML = `<p class='scripture-1-text'>${firstPost.result[0].text || ''}</p>`
    } else {
        scripture1.innerHTML = `<p class='scripture-1-text'></p>`
    }
    if (secondPost?.result.length > 0) {
        scripture2.innerHTML = `<p class='scripture-2-text'>${secondPost.result[0].text || ''}</p>`
    } else {
        scripture2.innerHTML = `<p class='scripture-2-text'></p>`
    }
    if (thirdPost?.result.length > 0) {
        scripture3.innerHTML = `<p class='scripture-2-text'>${thirdPost.result[0].text || ''}</p>`
    } else {
        scripture3.innerHTML = `<p class='scripture-2-text'></p>`
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

const getPostItData = async () => {
    const post1 = await getPickPosts(1)
    const post2 = await getPickPosts(2)
    const post3 = await getPickPosts(3)
    return [post1, post2, post3]
}

// < 설교노트Sermon > //

// 설교노트 전역변수
let clickedSermonId = null

// 설교노트 작성(저장)
const saveSermon = async () => {
    const sermonDate = document.querySelector('#sermon-datepicker')
    const sermonTitle = document.querySelector('#sermon-title')
    const sermonScripture = document.querySelector('#sermon-scripture')
    const sermonPreacher = document.querySelector('#sermon-preacher')
    const sermonContent = document.querySelector('#sermon-content')
    const sermonTakeaway = document.querySelector('#sermon-takeaway')
    const saveSermon = await fetch('https://backend.closetogod.site/api/sermon/saveSermon', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            date: sermonDate.value,
            title: sermonTitle.value,
            scripture: sermonScripture.value,
            preacher: sermonPreacher.value,
            content: sermonContent.value,
            takeaway: sermonTakeaway.value,
            email: localStorage.getItem('유저이름')
        })
    })
    const result = await saveSermon.json()

    const sermonOutputBodyTbody = document.querySelector('.sermon-output-body tbody')
    const sermonTr = document.createElement('tr')
    sermonTr.className = `sermon-list ${result.result._id}`

    sermonTr.innerHTML = `
        <td>${transformDate(result.result.date)}</td>
        <td>${result.result.title}</td>
        <td>${result.result.scripture}</td>
        <td>${result.result.preacher}</td>
    `
    sermonOutputBodyTbody.appendChild(sermonTr)
    deleteSermon(sermonTr)
}


// 설교노트 취소
const cancelSermon = () => {
    const sermonDate = document.querySelector('#sermon-datepicker')
    const sermonTitle = document.querySelector('#sermon-title')
    const sermonScripture = document.querySelector('#sermon-scripture')
    const sermonPreacher = document.querySelector('#sermon-preacher')
    const sermonContent = document.querySelector('#sermon-content')
    const sermonTakeaway = document.querySelector('#sermon-takeaway')

    if (sermonDate.value !== ''
        && sermonTitle.value !== ''
        && sermonScripture.value !== ''
        && sermonPreacher.value !== ''
        && sermonContent.value !== ''
        && sermonTakeaway.value !== ''
    ) return
    else {
        const userResponse = confirm('작성중인 내용이 있습니다. 정말 취소하시겠습니까?')
        if (userResponse) {
            sermonDate.value = ''
            sermonTitle.value = ''
            sermonScripture.value = ''
            sermonPreacher.value = ''
            sermonContent.value = ''
            sermonTakeaway.value = ''
        }
    }
}


// 저장된 설교노트 서버에서 가져오기
const getSermon = async () => {
    const response = await fetch('https://backend.closetogod.site/api/sermon/getSermon', {
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

// 서버에서 가져온 설교노트 output 화면에 보여주기
const showSermon = async (sermonList) => {
    const sermonOutputBodyTbody = document.querySelector('.sermon-output-body tbody')
    if (sermonList !== undefined) {
        sermonList?.result?.forEach(element => {
            const sermonTr = document.createElement('tr')
            sermonTr.className = `sermon-list ${element._id}`
            sermonTr.style.cursor = 'pointer'
            sermonTr.innerHTML = `
          <td>${transformDate(element.createdAt)}</td>
          <td>${element.title}</td>
          <td>${element.scripture}</td>
          <td>${element.preacher}</td>
      `
            sermonOutputBodyTbody.appendChild(sermonTr)
            deleteSermon(sermonTr)
        })
    }
}

let previousSermonData = {
    date: '',
    title: '',
    content: '',
    scripture: '',
    preacher: '',
    takeaway: ''
}

// transformDateForSermon
const transformDateForSermon = (day) => {
    const date = new Date(day);
    const formattedDate = date.toISOString().substring(0, 10);
    return formattedDate
}

// 설교노트 Output 화면에서 설교 클릭시 input창에 설교노트 내용 보여주기
const showSermonDetail = async (clickedSermonId) => {
    const response = await fetch('https://backend.closetogod.site/api/sermon/getSermonDetail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            _id: clickedSermonId
        })
    })
    const result = await response.json()
    const sermonDate = document.querySelector('#sermon-datepicker')
    const sermonTitle = document.querySelector('#sermon-title')
    const sermonScripture = document.querySelector('#sermon-scripture')
    const sermonPreacher = document.querySelector('#sermon-preacher')
    const sermonContent = document.querySelector('#sermon-content')
    const sermonTakeaway = document.querySelector('#sermon-takeaway')

    if ( // input창에 아무것도 없을 때 서버에서 가져온 값(클릭된 글의 Data)을 보여준다
        sermonDate.value == '' &&
        sermonTitle.value == '' &&
        sermonScripture.value == '' &&
        sermonPreacher.value == '' &&
        sermonContent.value == '' &&
        sermonTakeaway.value == ''
    ) {
        sermonDate.value = transformDateForSermon(result.result.date)
        sermonTitle.value = result.result.title
        sermonScripture.value = result.result.scripture
        sermonPreacher.value = result.result.preacher
        sermonContent.value = result.result.content
        sermonTakeaway.value = result.result.takeaway
        previousSermonData.date = transformDateForSermon(result.result.date)
        previousSermonData.title = result.result.title
        previousSermonData.content = result.result.content
        previousSermonData.scripture = result.result.scripture
        previousSermonData.preacher = result.result.preacher
        previousSermonData.takeaway = result.result.takeaway
    }
    else if ( // input창 값과 서버에서 가져온 값(클릭된 글의 Data)이 같을 때, 같은글을 클릭했을 때네?
        sermonDate.value == transformDateForSermon(result.result.date) &&
        sermonTitle.value == result.result.title &&
        sermonScripture.value == result.result.scripture &&
        sermonPreacher.value == result.result.preacher &&
        sermonContent.value == result.result.content &&
        sermonTakeaway.value == result.result.takeaway
    ) {
        previousSermonData.date = transformDateForSermon(result.result.date)
        previousSermonData.title = result.result.title
        previousSermonData.content = result.result.content
        previousSermonData.scripture = result.result.scripture
        previousSermonData.preacher = result.result.preacher
        previousSermonData.takeaway = result.result.takeaway
    }
    else if ( // input창 값과 이전에 가져온 값이 같을 때, 이 코드가 없으면 다른글을 클릭할때마다 confrim창이 뜬다
        sermonDate.value == previousSermonData.date &&
        sermonTitle.value == previousSermonData.title &&
        sermonScripture.value == previousSermonData.scripture &&
        sermonPreacher.value == previousSermonData.preacher &&
        sermonContent.value == previousSermonData.content &&
        sermonTakeaway.value == previousSermonData.takeaway
    ) {
        sermonDate.value = transformDateForSermon(result.result.date)
        sermonTitle.value = result.result.title
        sermonScripture.value = result.result.scripture
        sermonPreacher.value = result.result.preacher
        sermonContent.value = result.result.content
        sermonTakeaway.value = result.result.takeaway
        previousSermonData.date = transformDateForSermon(result.result.date)
        previousSermonData.title = result.result.title
        previousSermonData.content = result.result.content
        previousSermonData.scripture = result.result.scripture
        previousSermonData.preacher = result.result.preacher
        previousSermonData.takeaway = result.result.takeaway
    }
    else if ( // 
        sermonDate.value !== previousSermonData.date ||
        sermonTitle.value !== result.result.title ||
        sermonScripture.value !== result.result.scripture ||
        sermonPreacher.value !== result.result.preacher ||
        sermonContent.value !== result.result.content ||
        sermonTakeaway.value !== result.result.takeaway
    ) {
        const userResponse = confirm('작성중인 내용이 있습니다. 정말 취소하시겠습니까?')
        if (userResponse) {
            sermonDate.value = transformDateForSermon(result.result.date)
            sermonTitle.value = result.result.title
            sermonScripture.value = result.result.scripture
            sermonPreacher.value = result.result.preacher
            sermonContent.value = result.result.content
            sermonTakeaway.value = result.result.takeaway
            previousSermonData.date = transformDateForSermon(result.result.date)
            previousSermonData.title = result.result.title
            previousSermonData.content = result.result.content
            previousSermonData.scripture = result.result.scripture
            previousSermonData.preacher = result.result.preacher
            previousSermonData.takeaway = result.result.takeaway
        }
    }
    return result
}

// 설교노트 OUtput 화면에서 일기 클릭시, 저장버튼 수정버튼으로 변경
const changeSermonSaveBtnToEdit = (clicked) => {
    if (document.querySelector('.sermon-editBtn')) return
    const sermonSaveBtn = document.querySelector('.sermon-saveBtn')
    sermonSaveBtn.innerText = '수정'
    sermonSaveBtn.className = 'sermon-editBtn'
}

// 설교노트 OUtput 화면에서 일기 클릭시, 새설교 버튼 생성
const addNewSermonBtn = () => {
    const buttonGroup = document.querySelector('.sermon-btns')
    const newSermon = document.createElement('button')
    newSermon.innerText = '새설교'
    newSermon.className = 'newSermon'
    if (buttonGroup.children.length == 2) buttonGroup.insertAdjacentElement('afterbegin', newSermon)
}

// 새일기 버튼을 누르면 수정버튼을 저장버튼으로 변경
const changeSermonEditBtnToSave = () => {
    const newSermonBtn = document.querySelector('.newSermon')
    const sermonDate = document.querySelector('#sermon-datepicker')
    const sermonTitle = document.querySelector('#sermon-title')
    const sermonScripture = document.querySelector('#sermon-scripture')
    const sermonPreacher = document.querySelector('#sermon-preacher')
    const sermonContent = document.querySelector('#sermon-content')
    const sermonTakeaway = document.querySelector('#sermon-takeaway')
    const newSermonEditBtn = document.querySelector('.sermon-editBtn')

    if (document.querySelector('.sermon-saveBtn')) return
    else {
        newSermonBtn.addEventListener('click', function (e) {
            e.preventDefault()
            sermonDate.value = ''
            sermonTitle.value = ''
            sermonScripture.value = ''
            sermonPreacher.value = ''
            sermonContent.value = ''
            sermonTakeaway.value = ''
            newSermonEditBtn.innerText = '저장'
            newSermonEditBtn.className = 'sermon-saveBtn'
        })
    }
}

// 수정버튼 클릭시 기도일기 수정하기
const editSermon = async (clickedSermonId) => {
    const sermonDate = document.querySelector('#sermon-datepicker')
    const sermonTitle = document.querySelector('#sermon-title')
    const sermonScripture = document.querySelector('#sermon-scripture')
    const sermonPreacher = document.querySelector('#sermon-preacher')
    const sermonContent = document.querySelector('#sermon-content')
    const sermonTakeaway = document.querySelector('#sermon-takeaway')
    const response = await fetch('https://backend.closetogod.site/api/sermon/editSermon', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            _id: clickedSermonId,
            date: sermonDate.value,
            title: sermonTitle.value,
            scripture: sermonScripture.value,
            preacher: sermonPreacher.value,
            content: sermonContent.value,
            takeaway: sermonTakeaway.value,
            lastModifiedAt: new Date()
        })
    })
    const result = await response.json()

    sermonDate.value = transformDateForSermon(result.result.date)
    sermonTitle.value = result.result.title
    sermonScripture.value = result.result.scripture
    sermonPreacher.value = result.result.preacher
    sermonContent.value = result.result.content
    sermonTakeaway.value = result.result.takeaway


    // 수정버튼 누르면 output 화면에 수정된 내용 보여주기
    const sermonList = document.querySelectorAll('.sermon-list')
    sermonList.forEach(element => {
        if (element.className.split(' ')[1] == clickedSermonId) {
            element.querySelector('td:nth-child(1)').innerText = transformDate(result.result.date)
            element.querySelector('td:nth-child(2)').innerText = result.result.title
            element.querySelector('td:nth-child(3)').innerText = result.result.scripture
            element.querySelector('td:nth-child(4)').innerText = result.result.preacher
        }
    })
    alert('수정되었습니다.')
}

// 설교 마우스 우클릭기능
function activeSermonRightClick(e) {
    // 마우스 우클릭 시 클릭된 곳 색깔 입히기
    const rightClickeActive = e.target.parentNode.classList.add('active')
    const sermonLists = document.querySelectorAll('.sermon-list')
    // 기존에 active 클래스가 있으면 삭제하고 새로운 active 클래스 추가하기
    sermonLists.forEach((element => {
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
    const sermonDate = document.querySelector('#sermon-datepicker')
    const sermonTitle = document.querySelector('#sermon-title')
    const sermonScripture = document.querySelector('#sermon-scripture')
    const sermonPreacher = document.querySelector('#sermon-preacher')
    const sermonContent = document.querySelector('#sermon-content')
    const sermonTakeaway = document.querySelector('#sermon-takeaway')

    const rightClickNearestTd = e.target
    rightClickMenuDelete.addEventListener('click', async function (e) {
        if (confirm('정말 삭제하시겠습니까?') === false) return
        else {
            await fetch('https://backend.closetogod.site/api/sermon/deleteSermon',
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
                        rightClickNearestTd.parentNode.remove()
                        sermonDate.value = ''
                        sermonTitle.value = ''
                        sermonScripture.value = ''
                        sermonPreacher.value = ''
                        sermonContent.value = ''
                        sermonTakeaway.value = ''
                    }
                })
        }
    })
}
const deleteSermon = (sermonList) => {
    sermonList.addEventListener('contextmenu', activeSermonRightClick)
}


// < 스프링 배경 > //
// 스프링 배경만들기
const createSpringBackground = () => {
    const springBackground = document.createElement('div')
    const springBackgroundImg = document.createElement('img')
    springBackground.className = 'spring-background'
    springBackgroundImg.src = '../asssets/imgs/spring1.png'
    springBackgroundImg.className = 'spring-background-img'
    document.body.appendChild(springBackground)
    springBackground.appendChild(springBackgroundImg)
}
createSpringBackground()

// 북마크 만들기
const createBookmark = () => {
    const bookmark1 = document.createElement('div')
    bookmark1.innerHTML = `<h4 class='prayBucketTitle'>버킷리스트</h4>`
    bookmark1.className = 'bookmark1'
    document.body.appendChild(bookmark1)

    const bookmark2 = document.createElement('div')
    bookmark2.innerHTML = `<h4 class='prayOfThanksTitle'>감사기도</h4>`
    bookmark2.className = 'bookmark2'
    document.body.appendChild(bookmark2)

    const bookmark3 = document.createElement('div')
    bookmark3.innerHTML = `<h4 class='prayDiaryTitle'>기도일기</h4>`
    bookmark3.className = 'bookmark3'
    document.body.appendChild(bookmark3)

    const bookmark4 = document.createElement('div')
    bookmark4.innerHTML = `<h4 class='postIt'>설교노트</h4>`
    bookmark4.className = 'bookmark4'
    document.body.appendChild(bookmark4)
}
createBookmark()

// 기도일기 클릭이벤트
async function prayDirayClickEvent(e) {
    // 기도일기
    const prayDiaryTitle = document.querySelector('#prayDiary-title')
    const prayDiaryContent = document.querySelector('#prayDiary-content')
    const prayDiarySaveBtn = document.querySelector('.saveBtn')
    const prayDiaryCancelBtn = document.querySelector('.cancelBtn')

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
}

// 설교노트 클릭이벤트
async function sermonClickEvent(e) {
    // 설교노트
    const sermonDate = document.querySelector('#sermon-datepicker')
    const sermonTitle = document.querySelector('#sermon-title')
    const sermonScripture = document.querySelector('#sermon-scripture')
    const sermonPreacher = document.querySelector('#sermon-preacher')
    const sermonContent = document.querySelector('#sermon-content')
    const sermonTakeaway = document.querySelector('#sermon-takeaway')
    const sermonSaveBtn = document.querySelector('.sermon-saveBtn')
    const sermonCancelBtn = document.querySelector('.sermon-cancelBtn')

    // 설교노트 저장버튼 클릭시
    if (sermonSaveBtn && e.target.className == 'sermon-saveBtn') {
        e.stopPropagation()
        e.preventDefault()
        if (sermonDate.value !== ''
            && sermonTitle.value !== ''
            && sermonScripture.value !== ''
            && sermonPreacher.value !== ''
            && sermonContent.value !== ''
            && sermonTakeaway.value !== ''
        ) {
            saveSermon()
            sermonDate.value = ''
            sermonTitle.value = ''
            sermonScripture.value = ''
            sermonPreacher.value = ''
            sermonContent.value = ''
            sermonTakeaway.value = ''
        }
        else {
            alert('모든 빈칸을 입력해주세요')
        }
    }

    // 설교노트 취소버튼 클릭시 
    if (sermonCancelBtn && e.target.className == 'sermon-cancelBtn') {
        e.preventDefault()
        cancelSermon()
    }
    // 설교노트 output 화면에서 설교 클릭시 input창에 기도일기 내용 보여주기
    if (e.target.parentNode.classList.contains('sermon-list')) {
        clickedSermonId = e.target.parentNode.className.split(' ')[1]
        const sermonData = await showSermonDetail(clickedSermonId)
        changeSermonSaveBtnToEdit() // 저장버튼 수정버튼으로 변경
        addNewSermonBtn() // 새일기 버튼 생성
        changeSermonEditBtnToSave() // 새일기 버튼을 누르면 수정버튼을 저장버튼으로 변경 
        // checkInputValueAndShowWarningModal(diaryData) // 기도일기 다른 일기 클릭하면 경고창 띄우기
    }

    if (e.target.className == 'sermon-editBtn') {
        e.stopPropagation()
        e.preventDefault()
        await editSermon(clickedSermonId)
    }
}

// 포스트잇 클릭이벤트
async function postItClickEvent(e) {
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
                if (pickText.value == '') alert('내용을 입력해주세요')
                else if (serverData.result.length == 0 && pickText.value !== '') saveScripture(postNum, pickText)
                else if (serverData.result.length > 0 && pickText.value !== '') {
                    updateScripture(postNum, pickText)
                }
            }
        })

        // 저장버튼 누르면 서버에 저장
        scripture1SaveBtn.addEventListener('click', async function (e) {

            const scripture1Paragraph = document.querySelector('.scripture-1-text')
            // 화면 변경
            scripture1.innerHTML = `<p class='scripture-1-text'>${pickText.value || serverData?.result[0]?.text || ''}</p>`
            // 서버에 저장
            if (pickText.value == '') alert('내용을 입력해주세요')
            else if (serverData.result.length == 0 && pickText.value !== '') saveScripture(postNum, pickText)
            else if (serverData.result.length > 0 && pickText.value !== '') {
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
                if (pickText.value == '') alert('내용을 입력해주세요')
                else if (serverData.result.length == 0 && pickText.value !== '') saveScripture(postNum, pickText)
                else if (serverData.result.length > 0 && pickText.value !== '') {
                    updateScripture(postNum, pickText)
                }
            }
        })
        scripture2SaveBtn.addEventListener('click', function (e) {
            // 화면 변경
            scripture2.innerHTML = `<p class='scripture-2-text'>${pickText.value || serverData?.result[0]?.text || ''}</p>`
            // 서버에 저장
            if (pickText.value == '') alert('내용을 입력해주세요')
            else if (serverData.result.length == 0 && pickText.value !== '') saveScripture(postNum, pickText)
            else if (serverData.result.length > 0 && pickText.value !== '') {
                updateScripture(postNum, pickText)
            }
        })
        scripture2CancelBtn.addEventListener('click', function (e) {
            scripture2.innerHTML = `<p class='scripture-2-text'>${pickText.value || serverData?.result[0]?.text || ''}</p>`
        })
    }

    // 포스트 잇 3
    if (e.target.className == 'scripture-3' || e.target.className == 'scripture-3-text') {
        e.stopPropagation()

        const postNum = 3
        const serverData = await getPickPosts(postNum)
        const scripture3 = document.querySelector('.scripture-3')
        const scripture3Paragraph = document.querySelector('.scripture-3-text')
        scripture3.innerHTML =
            `
    <textarea id='pickText3' placeholder ='기억하고 싶은 문구를 작성하세요, 최대 65자까지 작성가능합니다' maxlength ='65'>${serverData?.result[0]?.text || ''}</textarea>
    <div class='scripture-3-btns'>
        <button class='scripture-3-saveBtn'>저장</button>
        <button class='scripture-3-cancelBtn'>취소</button>
    </div>
    `
        const pickText = document.querySelector('#pickText3')
        const scripture3SaveBtn = document.querySelector('.scripture-3-saveBtn')
        const scripture3CancelBtn = document.querySelector('.scripture-3-cancelBtn')
        pickText.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                // 화면 변경
                scripture3.innerHTML = `<p class='scripture-3-text'>${pickText.value || serverData?.result[0]?.text || ''}</p>`
                // 서버에 저장
                if (pickText.value == '') alert('내용을 입력해주세요')
                else if (serverData.result.length == 0 && pickText.value !== '') saveScripture(postNum, pickText)
                else if (serverData.result.length > 0 && pickText.value !== '') {
                    updateScripture(postNum, pickText)
                }
            }
        })
        scripture3SaveBtn.addEventListener('click', function (e) {
            // 화면 변경
            scripture3.innerHTML = `<p class='scripture-2-text'>${pickText.value || serverData?.result[0]?.text || ''}</p>`
            // 서버에 저장
            if (pickText.value == '') alert('내용을 입력해주세요')
            else if (serverData.result.length == 0 && pickText.value !== '') saveScripture(postNum, pickText)
            else if (serverData.result.length > 0 && pickText.value !== '') {
                updateScripture(postNum, pickText)
            }
        })
        scripture3CancelBtn.addEventListener('click', function (e) {
            scripture3.innerHTML = `<p class='scripture-3-text'>${pickText.value || serverData?.result[0]?.text || ''}</p>`
        })
    }
}

// 클릭이벤트 전역변수
let diaryClikEvent = false
let sermonClikEvent = false
let postItClikEvent = false



// 기도일기 클릭이벤트 실행
const activePrayDirayClickEvent = (e) => {
    document.body.addEventListener('click', prayDirayClickEvent)
    diaryClikEvent = true
}

// 기도일기 클릭이벤트 제거
const deactivePrayDirayClickEvent = (e) => {
    document.body.removeEventListener('click', prayDirayClickEvent)
    diaryClikEvent = false
}

// 설교노트 클릭이벤트 실행
const activeSermonClickEvent = (e) => {
    document.body.addEventListener('click', sermonClickEvent)
    sermonClikEvent = true
}

// 설교노트 클릭이벤트 제거
const deactiveSermonClickEvent = (e) => {
    document.body.removeEventListener('click', sermonClickEvent)
    sermonClikEvent = false
}

// 포스트잇 클릭이벤트 실행
const activePostItClickEvent = (e) => {
    document.body.addEventListener('click', postItClickEvent)
    postItClikEvent = true
}

// 포스트잇 클릭이벤트 제거
const deactivePostItClickEvent = (e) => {
    document.body.removeEventListener('click', postItClickEvent)
    postItClikEvent = false
}



// 북마크, 모바일 클릭이벤트 
document.body.addEventListener('click', async function (e) {
    const rightClickMenu = document.querySelector('.right-click-menu')
    // 북마크 클릭시
    if (e.target.className == 'prayBucketTitle') {
        const prayWrapper = document.querySelector('.pray-wrapper')
        const prayBucketList = document.querySelector('.prayBucketList')
        if (!prayBucketList) {
            prayWrapper.innerHTML = ''
            prayBucketIndex = 1
            createPrayBucketlist()
            getPrayBucketlist()
                .then(data => {
                    showPrayBucketlist(data)
                    if (rightClickMenu) rightClickMenu?.remove()
                })
        }
        deactivePostItClickEvent(e)
        deactiveSermonClickEvent(e)
        deactivePrayDirayClickEvent(e)
    }
    else if (e.target.className == 'prayOfThanksTitle') {
        const prayWrapper = document.querySelector('.pray-wrapper')
        const prayerOfThanks = document.querySelector('.Prayer-of-thanks')
        if (!prayerOfThanks) {
            prayWrapper.innerHTML = ''
            graceIndex = 1
            createPrayBucketlist()
            getGrace()
                .then(data => {
                    showGraceList(data)
                    if (rightClickMenu) rightClickMenu?.remove()
                })
        }
        deactivePostItClickEvent(e)
        deactiveSermonClickEvent(e)
        deactivePrayDirayClickEvent(e)
    }
    else if (e.target.className == 'prayDiaryTitle') {
        const prayWrapper = document.querySelector('.pray-wrapper')
        const prayDiary = document.querySelector('.prayDiary')
        if (!prayDiary) {
            prayWrapper.innerHTML = ''
            createPrayDiary()
            getPrayDiary()
                .then(data => {
                    showPrayDiary(data)
                    if (rightClickMenu) rightClickMenu?.remove()
                })
        }
        activePrayDirayClickEvent(e)
        deactivePostItClickEvent(e)
        deactiveSermonClickEvent(e)
    }
    else if (e.target.className == 'postIt') {
        const prayWrapper = document.querySelector('.pray-wrapper')
        const postIt = document.querySelector('.scripture-board')
        if (!postIt) {
            prayWrapper.innerHTML = ''
            createPostIt()
            getPostItData()
                .then(data => {
                    const [post1, post2, post3] = data
                    showPickPosts(post1, post2, post3)
                })
            getSermon()
                .then(data => {
                    showSermon(data)
                    if (rightClickMenu) rightClickMenu?.remove()
                })
        }
        activePostItClickEvent(e)
        activeSermonClickEvent(e)
        deactivePrayDirayClickEvent(e)
    }

    // 모바일 버거버튼 클릭시
    if (e.target.className == 'material-symbols-outlined') {
        const navButtons = document.querySelector('.nav-btns')
        const mobileBackground = document.querySelector('.mobile-background')
        navButtons.classList.toggle('show')
        mobileBackground.classList.toggle('show')
    }
})


