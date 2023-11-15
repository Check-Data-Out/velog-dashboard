const DEFAULT_URL = "http://localhost:3000/api"

const postData = async (endPoint = "", data = {}) => {

    const URL = `${DEFAULT_URL}${endPoint}`;

    // 옵션 기본 값은 *로 강조
    const res = await fetch(`${URL}`, {
        method: "POST", // *GET, POST, PUT, DELETE 등
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body의 데이터 유형은 반드시 "Content-Type" 헤더와 일치해야 함
    });
    const result = await res.json();
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}, ${JSON.stringify(result, null, 2)}`);
    return result;
};


const getData = async (endPoint = "", queryString = {}) => {

    // url query string 파싱
    let URL = `${DEFAULT_URL}${endPoint}`;
    if (queryString) {
        const params = new URLSearchParams(queryString);
        URL = `${URL}?${params.toString()}`;
    }

    // 옵션 기본 값은 *로 강조
    const res = await fetch(`${URL}`, {
        method: "GET", // *GET, POST, PUT, DELETE 등
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
};



// ====================================================== //
// Utils
// ====================================================== //

// https://sweetalert2.github.io 필수
// 스피너 띄우기
const showSpinner = () => {
    Swal.fire({
        title: "Loading...",
        text: "Please wait...",
        background: '#242424', // 혹은 다크 테마에 맞는 색상으로 설정
        color: '#fff', // 텍스트 색상을 흰색으로 설정
        didOpen: () => {
            Swal.showLoading() // 이 메서드로 로딩 스피너를 보여줍니다.
        },
        showConfirmButton: false, // 확인 버튼 숨기기
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false
    });
};

// 어딘가에서 스피너를 닫을 때
// Swal.close();
