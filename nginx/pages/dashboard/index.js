"use strict";
// ====================================================== //
// Events
// ====================================================== //

const toggleEvent = () => {
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
};


const updateUserInfo = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const res = await getData(`/user/${userInfo.userId}`, {}, { accessToken: userInfo.accessToken, refreshToken: userInfo.refreshToken });
    const { koreanDate, koreanTime } = krDateAndTime(res.userInfo.lastScrapingAttemptTime);

    // userInfo를 가져와서 lastScrapingAttemptTime, lastScrapingAttemptResult 랜더링
    document.getElementById("userInfo-lastScrapingAttemptTime").innerHTML = `
        <div>
            <span>업데이트 시간</span>
            <span>
                ${koreanDate}</br>
                ${koreanTime}
            </span>
        </div>
    `;
    document.getElementById("userInfo-lastScrapingAttemptResult").innerHTML = `
        <div>
            <span>업데이트 결과</span>
            <span>${res.userInfo.lastScrapingAttemptResult}</span>
        </div>
    `;
    return res;
};

const updateUserStats = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const res = await getData(`/post/total/${userInfo.userId}`, {}, { accessToken: userInfo.accessToken, refreshToken: userInfo.refreshToken });
    const result = res.result[0];

    // "userInfo-...CountSum" ID를 가진 요소 값 변경
    const totalViewSpan = document.getElementById("userInfo-totalViewCountSum");
    totalViewSpan.innerText = result.totalViewCountSum.toLocaleString();
    const todayViewSpan = document.getElementById("userInfo-todayViewCountSum");
    todayViewSpan.innerText = result.todayViewCountSum.toLocaleString();
    const totalLikeSpan = document.getElementById("userInfo-totalLastLikeCountSum");
    totalLikeSpan.innerText = result.totalLastLikeCountSum.toLocaleString();

    return res;
};

const updatePostList = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const res = await getData(`/post/${userInfo.userId}`, {}, { accessToken: userInfo.accessToken, refreshToken: userInfo.refreshToken });
    const result = res.result;

    let tempInnerHtml = "";
    for (let i = 0; i < result.length; i++) {
        const ele = result[i];
        tempInnerHtml += `
            <li>
                <a href="${ele["url"]}">${ele["title"]}</a>
                <span class="posts-list-today-veiw">
                <img
                    width="24"
                    height="24"
                    src=${(ele["isUp"]) ? "https://img.icons8.com/external-royyan-wijaya-detailed-outline-royyan-wijaya/24/20c997/external-eyes-interface-royyan-wijaya-detailed-outline-royyan-wijaya.png" : "https://img.icons8.com/material-sharp/24/F25081/sleepy-eyes.png"} 
                    alt="sleepy-eyes"
                />
                ${ele["totalViewCount"]}
                </span>
            </li>
        `;
    }

    const loadingImg = document.querySelector(".posts-section img");
    if (loadingImg) {
        loadingImg.remove();
    }
    document.getElementById("posts-list").innerHTML = tempInnerHtml;
    return res;
};


// ====================================================== //
// Main
// ====================================================== //

const init = () => {
    footerLink("section-footer");
    document.getElementById("navbar-toggle").addEventListener("click", toggleEvent);

    // polling event 들 등록하기
    updateUserInfo();
    polling(updateUserInfo, 60000, (res) => { return false });

    updateUserStats();
    polling(updateUserStats, 60000, (res) => { return false });

    updatePostList();
    polling(updateUserStats, 360000, (res) => { return false });

    // mobile toggling 강제
    if (window.matchMedia("(max-width: 600px)").matches) {
        toggleEvent();
    }

};

init();
