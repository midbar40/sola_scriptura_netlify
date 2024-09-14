
export const redirectPage = () => {
    const isLoggedIn = localStorage.getItem('로그인상태')
    if(!isLoggedIn) {    
      alert("로그인이 필요한 서비스입니다.");
      location.href = "./html/login.html";
  }
    else{location.href = "./html/prayNote.html";}
  };

export function indexHeaderModule(isLoggedIn) {

    const header = document.createElement('header');
    const nav = document.createElement('nav');
    if (isLoggedIn) {

        nav.innerHTML =
            `
        <h1><a href="../index.html">Sola Scriptura</a></h1>
        <div class="nav-btns">
          <div class="menu-btn">
          <a href="./html/readbible.html">성경읽기</a>
          <a href="./html/bibleParagraph.html">성경구절</a>
          <a href="./html/game.html">시편필사</a>
          <a href="#" onclick="redirectPage()">기도노트</a>
          </div>
          <div class="login-btn">
            <a id='mypage' href="./html/myPage.html">내 정보</a>
            <a id='logout-link' href="#">로그아웃</a>
          </div>
        </div>
        <span class="material-symbols-outlined"> menu </span>
        `
        header.appendChild(nav)
        document.addEventListener('click', function (e) {
            if (e.target.id === 'logout-link') {
                logout(e)
            }
        })
    } else if (isLoggedIn === null || isLoggedIn === undefined) {
        nav.innerHTML =
            `
          <h1><a href="../index.html">Sola Scriptura</a></h1>
          <div class="nav-btns">
            <div class="menu-btn">
              <a href="./html/readbible.html">성경읽기</a>
              <a href="./html/bibleParagraph.html">성경구절</a>
              <a href="./html/game.html">시편필사</a>
              <a href="#" onclick="redirectPage()">기도노트</a>
              </div>
            <div class="login-btn">
              <a href="./html/login.html">로그인</a>
              <a href="./html/register.html">회원가입</a>
            </div>
          </div>
          <span class="material-symbols-outlined"> menu </span>
        `
        header.appendChild(nav)
        if (document.querySelector('.login-btn')) {
            document.querySelector('.login-btn').addEventListener('click', () => {
                window.location.href = 'https://www.closetogod.site/bible-front/html/login.html'
                // window.location.href = 'https://midbar40.github.io/bible-front/html/login.html'
            })
        }
        // document.addEventListener('click', function (e) {
        //     if (e.target.innerText === '기도노트') {
        //         alert('로그인이 필요한 서비스입니다.')
        //     }
        // })
    }
    return header
}

export async function logout(e) {
    if (e.target.innerText == '로그아웃') {
        // await fetch('https://port-0-bible-server-32updzt2alphmfpdy.sel5.cloudtype.app/api/users/logout', {
        await fetch('https://backend.closetogod.site/api/users/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            }
        })
            .then(res => res.json())
            .then(data => {
                if (!data.token) {
                    localStorage.removeItem('로그인상태')
                    localStorage.removeItem('유저이름')
                    window.location.href = 'https://www.closetogod.site/index.html'
                    // window.location.href = 'http://127.0.0.1:5500/bible-front/index.html'

                }
            })
    }
}


// 모듈을 사용하지 않는 일반적인 <script> 태그 방식에서는 import 문을 사용할 수 없습니다.
// 전역 스코프에 indexHeaderModule 함수를 추가
window.indexHeaderModule = indexHeaderModule; 
