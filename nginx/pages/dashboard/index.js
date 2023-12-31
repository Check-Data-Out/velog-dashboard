"use strict";
// ====================================================== //
// Functions
// ====================================================== //
// daily total view 통계 데이터 Chart.js로 그래프 그리기
const drawDailyTotalViewChart = async (data, domId) => {
    // Chart.js에 넘겨줄 데이터 형식으로 변환
    const labels = data.map(item => item._id.date.split("T")[0]);
    const viewData = data.map(item => item.totalViewCountPerDay);

    // 차트 생성
    const ctx = document.getElementById(domId).getContext("2d");
    return new Chart(ctx, {
        type: "line", // 라인 차트 사용
        data: {
            labels: labels, // x축 데이터
            datasets: [{
                label: "View Count",
                data: viewData, // 조회수 데이터
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: "time",
                    adapters: {
                        date: {
                            lib: luxon // 여기서 Luxon 어댑터를 사용하도록 지정
                        }
                    },
                    time: {
                        unit: "day",
                        displayFormats: {
                            day: "yyyy-MM-dd"
                        }
                    },
                    title: {
                        display: true,
                        text: "Date"
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};


// post 통계 데이터 Chart.js로 그래프 그리기
const drawPostChart = async (data, uuid) => {
    // Chart.js에 넘겨줄 데이터 형식으로 변환
    const labels = data.map(item => item.date.split("T")[0]);
    const viewData = data.map(item => item.viewCount);
    const likeData = data.map(item => item.likeCount);

    // 차트 생성
    const ctx = document.getElementById(uuid).getContext("2d");
    return new Chart(ctx, {
        type: "line", // 라인 차트 사용
        data: {
            labels: labels, // x축 데이터
            datasets: [{
                label: "View Count",
                data: viewData, // 조회수 데이터
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1
            }, {
                label: "Like Count",
                data: likeData, // 좋아요 수 데이터
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: "time",
                    adapters: {
                        date: {
                            lib: luxon // 여기서 Luxon 어댑터를 사용하도록 지정
                        }
                    },
                    time: {
                        unit: "day",
                        displayFormats: {
                            day: "yyyy-MM-dd"
                        }
                    },
                    title: {
                        display: true,
                        text: "Date"
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};


// 그려진 chart에 날짜 필터링해서 다시 랜더링하기
const drawFilteredChart = (chart, data, startDateValue, endDateValue, graphType = "") => {
    // 날짜 값이 없으면 업데이트하지 않습니다.
    if (!startDateValue || !endDateValue) return;

    // 데이터 필터링
    const startDate = new Date(startDateValue); // ex) "2023-11-01"
    const endDate = new Date(endDateValue); // ex) "2023-11-02"
    endDate.setDate(endDate.getDate() + 1); // endDate를 다음 날 자정으로 설정


    // graphType 값이 비어있으면 post graph
    if (graphType === "") {
        const filteredData = data.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate < endDate;
        });
        chart.data.labels = filteredData.map(item => item.date.split("T")[0]);
        const filteredviewData = filteredData.map(item => item.viewCount);
        const filteredlikeData = filteredData.map(item => item.likeCount);
        chart.data.datasets = [{
            label: "View Count",
            data: filteredviewData, // 조회수 데이터
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1
        }, {
            label: "Like Count",
            data: filteredlikeData, // 좋아요 수 데이터
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1
        }];
        chart.update();
    }
    // graphType 값이 dailyTotalView
    else if (graphType === "dailyTotalView") {
        const filteredData = data.filter(item => {
            const itemDate = new Date(item._id.date);
            return itemDate >= startDate && itemDate < endDate;
        });
        chart.data.labels = filteredData.map(item => item._id.date.split("T")[0]);
        const filteredviewData = filteredData.map(item => item.totalViewCountPerDay);
        chart.data.datasets = [{
            label: "View Count",
            data: filteredviewData, // 조회수 데이터
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1
        }];
        chart.update();
    }
};


// ====================================================== //
// Events
// ====================================================== //

// 로그인 여부 체크 이후, 안되어있으면 index page로
const loginChkModal = () => {
    Swal.fire({
        title: `
            <div id="notiModal">
                <img src="../imgs/favicon.png" width="40px" alt="" />
                <div>
                    <span>Velog Dashboard</span>
                    <p>(BETA v0.1)</p>
                </div>
            </div>
        `,
        html: `
            로그인이 필요한 페이지 입니다, 로그인 페이지로 돌아갑니다.
            상세한 사항은 <b id="notiModalGithub"> github </b>와 <b id="notiModalVelog"> velog </b>를 참고해 주세요!
        `,
        confirmButtonText: "OK",
        showCloseButton: true,
        showCancelButton: true,
        background: "#242424", // 혹은 다크 테마에 맞는 색상으로 설정
        color: "#fff", // 텍스트 색상을 흰색으로 설정
        confirmButtonColor: "#20C997",
    }).then((result) => {
        window.location.href = "/index";
    });
};

/**
 * 최초의 1회 한해서 공지성 정보 modal 띄우기
 * @returns null
 */
const notiModal = async () => {
    Swal.fire({
        title: `
            <div id="notiModal">
                <img src="../imgs/favicon.png" width="40px" alt="" />
                <div>
                    <span>Velog Dashboard</span>
                    <p>(BETA v0.1)</p>
                </div>
            </div>
        `,
        html: `
            <ol>
                <li>velog api 기능 개선으로 인해 데이터 <b>신규 데이터 수집은 멈춘 상태</b> 입니다. (23/11/22 ~)</li>
                <li>기존에 사용하시던 분들은 저장된 데이터까지만 확인 가능합니다. 추후 일정 및 관련사항은 velog를 통해 전달드리겠습니다 :)</li>
            </ol>
            상세한 사항은 <b id="notiModalGithub"> github </b>와 <b id="notiModalVelog"> velog </b>를 참고해 주세요!
        `,
        confirmButtonText: "OK",
        showCloseButton: true,
        showCancelButton: true,
        background: "#242424", // 혹은 다크 테마에 맞는 색상으로 설정
        color: "#fff", // 텍스트 색상을 흰색으로 설정
        confirmButtonColor: "#20C997",
    }).then((result) => {
        localStorage.setItem("isNotiChecked", true);
    });

    // const isNotiChecked = localStorage.getItem("isNotiChecked");
    // if (isNotiChecked === true || isNotiChecked) {
    //     return;
    // }

    // Swal.fire({
    //     title: `
    //         <div id="notiModal">
    //             <img src="../imgs/favicon.png" width="40px" alt="" />
    //             <div>
    //                 <span>Velog Dashboard</span>
    //                 <p>(BETA v0.1)</p>
    //             </div>
    //         </div>
    //     `,
    //     html: `
    //         <ol>
    //             <li>15분 주기로 데이터를 업데이트 합니다! </br>아무것도 안보이면 기다려주세요 :)</li>
    //             <li>모바일에서는 그래프가 보기어렵습니다!</li>
    //             <li>Total View 를 한 번 눌러봐주세요!!</li>
    //             <li>
    //                 <img width="20" height="20" src="https://img.icons8.com/material-sharp/24/F25081/sleepy-eyes.png" alt="sleepy-eyes" /> 은 전날 대비 하락,
    //                 <img width="20" height="20" src="https://img.icons8.com/external-royyan-wijaya-detailed-outline-royyan-wijaya/24/20c997/external-eyes-interface-royyan-wijaya-detailed-outline-royyan-wijaya.png" alt="sleepy-eyes" />은 전날 대비 상승 중이라는 의미입니다.
    //             </li>
    //             <li>
    //             <img width="20" height="20" src="https://img.icons8.com/windows/32/20c997/thumb-up.png" alt="thumb-up"/> 는 총 좋아요수의 수 입니다.
    //             </li>
    //             <li>"그래프" 버튼으로 각 post의 상세 트래픽 그래프를 봐주세요!</li>
    //         </ol>
    //         상세한 사항은 <b id="notiModalGithub"> github </b>와 <b id="notiModalVelog"> velog </b>를 참고해 주세요!
    //     `,
    //     confirmButtonText: "OK",
    //     showCloseButton: true,
    //     showCancelButton: true,
    //     background: "#242424", // 혹은 다크 테마에 맞는 색상으로 설정
    //     color: "#fff", // 텍스트 색상을 흰색으로 설정
    //     confirmButtonColor: "#20C997",
    // }).then((result) => {
    //     localStorage.setItem("isNotiChecked", true);
    // });
    footerLink("notiModalVelog");
    footerLink("notiModalGithub", "https://github.com/Check-Data-Out/velog-dashboard");
}


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

    // 저장된 로컬스토리지도 업데이트 (토큰 리프레싱때문)
    localStorage.setItem("userInfo", JSON.stringify(res.userInfo));
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

    // 그래프를 하나라도 보고 있다면, re-rendering하지 않는 방향으로
    if (document.querySelector("#posts-list canvas")) {
        return;
    }


    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const { sortBy, order } = JSON.parse(localStorage.getItem("postsSort"));
    const res = await getData(`/post/${userInfo.userId}`, { sortBy, order }, { accessToken: userInfo.accessToken, refreshToken: userInfo.refreshToken });
    const result = res.result;

    let tempInnerHtml = "";
    for (let i = 0; i < result.length; i++) {
        const ele = result[i];
        tempInnerHtml += `
            <li>
                <a href="${ele["url"]}">
                    ${ele["title"]}
                </a>
                <span class="posts-list-today-veiw">
                    <span class="posts-list-graph hvr-fade" data-post-uuid="${ele["uuid"]}" onclick="updatePostListGraph(event)">
                    </span>
                    ${ele["totalViewCount"]} / ${ele["lastViewCount"]}&nbsp;
                    <img
                        width="24"
                        height="24"
                        src=${(ele["isUp"]) ? "https://img.icons8.com/external-royyan-wijaya-detailed-outline-royyan-wijaya/24/20c997/external-eyes-interface-royyan-wijaya-detailed-outline-royyan-wijaya.png" : "https://img.icons8.com/material-sharp/24/F25081/sleepy-eyes.png"} 
                        alt="sleepy-eyes"
                    />
                    <img width="24" height="24" src="https://img.icons8.com/windows/32/20c997/thumb-up.png" alt="thumb-up"/>
                    ${ele["totalLikeCount"]}
                </span>
            </li>
            <div id="post-graph-div-${ele["uuid"]}" class="posts-list-graph-content"></div>
        `;
    }

    const loadingImg = document.querySelector(".posts-section img");
    if (loadingImg) {
        loadingImg.remove();
    }
    document.getElementById("posts-list").innerHTML = tempInnerHtml;
    document.querySelector("section.posts-section > h2").innerHTML = `
        List Of [ ${result.length} ] Posts<br />
        <span>(total / today / likes)</span>
    `;
    return res;
};


// updatePostList 랜더링된 span.posts-list-graph 에 할당된 이벤트
// uuid 값으로 해당 post stats를 모두 가져와 시계열 데이터를 그래프로 시각화 - https://www.chartjs.org/
const updatePostListGraph = async (event) => {

    const graphPostSpan = event.target;
    graphPostSpan.classList.toggle("graph-active");
    const uuid = graphPostSpan.getAttribute("data-post-uuid");

    // 이미 그래프가 존재하면 삭제
    const graphWrapper = document.getElementById(`post-graph-div-${uuid}`);
    if (document.getElementById(uuid)) {
        graphWrapper.innerHTML = "";
        graphWrapper.classList.toggle("fade-in")
        return;
    }

    // 그래프에 필요한 데이터 가져오기
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const res = await getData(`/post`, { uuid }, { accessToken: userInfo.accessToken, refreshToken: userInfo.refreshToken });
    const data = res.result?.stats;
    if (!data) {
        return;
    }

    // 그래프 랜더링
    graphWrapper.innerHTML = `
        <div class="post-graph-div-date">
            <!-- 시작 날짜 선택기 -->
            <label for="${uuid}-startDate">시작 날짜:</label>
            <input type="date" id="${uuid}-startDate">
            
            <!-- 종료 날짜 선택기 -->
            <label for="${uuid}-endDate">종료 날짜:</label>
            <input type="date" id="${uuid}-endDate">

            <button id="${uuid}-post-graph-update-btn" class="post-graph-div-btn">refresh</button>
        </div>
        <canvas id="${uuid}" width="400" height="200"></canvas>
    `;
    const chart = await drawPostChart(data, uuid); // 랜더링된 char object
    graphWrapper.classList.toggle("fade-in");


    // 동적으로 이벤트 바인딩, chart object때문
    document.getElementById(`${uuid}-post-graph-update-btn`).addEventListener("click", (event) => {
        event.preventDefault();
        const startDateValue = document.getElementById(`${uuid}-startDate`).value;
        const endDateValue = document.getElementById(`${uuid}-endDate`).value;
        drawFilteredChart(chart, data, startDateValue, endDateValue);
    });
};

// stats-total-view (total View Div)에 할당될 이벤트
// #stats-section-total-graph 채우기
const totalViewGraph = async (event) => {
    const graphWrapper = document.querySelector("section.stats-section-total-graph-wrapper");
    graphWrapper.classList.toggle("hide");
    graphWrapper.classList.toggle("slide-up");

    // 이미 그래프가 존재하면 삭제
    if (graphWrapper.querySelector("canvas")) {
        graphWrapper.innerHTML = "";
        return;
    }

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const res = await getData(`/post/daily/${userInfo.userId}`, {}, { accessToken: userInfo.accessToken, refreshToken: userInfo.refreshToken });
    const data = res.result;
    if (!data) {
        return;
    }

    // 그래프 랜더링
    graphWrapper.innerHTML = `
        <div class="post-graph-div-date">
            <!-- 시작 날짜 선택기 -->
            <label for="stats-section-total-graph-startDate">시작 날짜:</label>
            <input type="date" id="stats-section-total-graph-startDate">
            
            <!-- 종료 날짜 선택기 -->
            <label for="stats-section-total-graph-endDate">종료 날짜:</label>
            <input type="date" id="stats-section-total-graph-endDate">

            <button id="stats-section-total-graph-update-btn" class="post-graph-div-btn">refresh</button>
        </div>
        <canvas id="stats-section-total-graph"></canvas>
    `;
    const chart = await drawDailyTotalViewChart(data, "stats-section-total-graph"); // 랜더링된 char object
    // 동적으로 이벤트 바인딩, chart object때문
    document.getElementById(`stats-section-total-graph-update-btn`).addEventListener("click", (event) => {
        event.preventDefault();
        const startDateValue = document.getElementById(`stats-section-total-graph-startDate`).value;
        const endDateValue = document.getElementById(`stats-section-total-graph-endDate`).value;
        drawFilteredChart(chart, data, startDateValue, endDateValue, "dailyTotalView");
    });

};


// updatePostList 에 sortBy(title, totalViewCount, lastViewCount) / order(desc, asc) 추가
const setPostSorting = (event) => {
    // 현재 버튼의 정렬 설정을 가져옵니다.
    const button = event.target;
    const sortBy = button.getAttribute("data-sortBy");

    // 로컬 스토리지에서 이전 정렬 설정을 가져옵니다.
    const currentSort = JSON.parse(localStorage.getItem("postsSort")) || {};

    // 클릭된 버튼의 정렬이 이전에 선택한 정렬과 같고, 
    // 정렬 순서가 "asc"이면 "desc"로, 그렇지 않으면 "asc"로 토글합니다.
    const newOrder = currentSort.sortBy === sortBy && currentSort.order === "asc" ? "desc" : "asc";

    // 로컬 스토리지에 새 정렬 설정을 저장합니다.
    localStorage.setItem("postsSort", JSON.stringify({ sortBy: sortBy, order: newOrder }));
    updatePostList();
};


// ====================================================== //
// Main
// ====================================================== //

const init = () => {

    // mobile nav toggling 강제
    if (window.matchMedia("(max-width: 600px)").matches) {
        toggleEvent();
    }

    // login check
    if (isLocalItemEmpty("userInfo")) {
        loginChkModal();
        return;
    }

    notiModal(); // notimodal
    footerLink("section-footer"); // footer 에 href event
    document.getElementById("navbar-toggle").addEventListener("click", toggleEvent); // 네비게이션바 토글링
    document.querySelector("div.stats-total-view").addEventListener("click", totalViewGraph); // daily total view 그래프 추가

    // ============================ //
    // polling event 들 등록하기
    // ============================ //
    updateUserInfo();
    polling(updateUserInfo, 30000, (res) => { return false });

    updateUserStats();
    polling(updateUserStats, 60000, (res) => { return false });

    // post sorting default value
    localStorage.setItem("postsSort", JSON.stringify({ sortBy: "", order: "" }));
    updatePostList();
    polling(updatePostList, 360000, (res) => { return false }); // post 전체 polling은 조금 더 고려해보자, (그래프 때문에)

    // ============================ //
    // post sotring button init
    // ============================ //
    const buttons = document.querySelectorAll("button[data-sortby]");
    buttons.forEach(button => {
        button.addEventListener("click", (event) => { setPostSorting(event); });
    });
};

init();
