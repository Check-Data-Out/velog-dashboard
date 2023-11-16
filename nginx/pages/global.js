"use strict";

// ====================================================== //
// Global VAR
// ====================================================== //

const DEFAULT_URL = "https://velog-dashboard.kro.kr/api"

// ====================================================== //
// Fetch & Api call wrapper
// ====================================================== //
/**
 * 주어진 엔드포인트에 POST 요청을 보내고 JSON 응답을 반환합니다.
 * 
 * @param {string} endPoint - API 엔드포인트의 경로를 나타내는 문자열입니다. 기본값은 빈 문자열입니다.
 * @param {Object} data - 서버로 전송할 데이터 객체입니다. 기본값은 빈 객체입니다.
 * @param {Object} tokens - 서버로 전송할 토큰 객체입니다. 기본값은 빈 객체입니다.
 * @returns {Promise<Object>} 서버로부터 받은 응답 데이터를 담은 객체를 반환하는 프로미스입니다.
 * @throws {Error} HTTP 응답이 OK가 아닐 경우 에러를 발생시킵니다.
 */
const postData = async (endPoint = "", data = {}, tokens = {}) => {
    const URL = `${DEFAULT_URL}${endPoint}`;
    const headers = {
        "Content-Type": "application/json", // "Content-Type": "application/x-www-form-urlencoded",
        ...(tokens.accessToken && { 'access-token': tokens.accessToken }),
        ...(tokens.refreshToken && { 'refresh-token': tokens.refreshToken }),
    };

    // 옵션 기본 값은 *로 강조
    const res = await fetch(`${URL}`, {
        method: "POST", // *GET, POST, PUT, DELETE 등
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: headers,
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body의 데이터 유형은 반드시 "Content-Type" 헤더와 일치해야 함
    });
    const result = await res.json();
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}, ${JSON.stringify(result, null, 2)}`);
    return result;
};


/**
 * 주어진 엔드포인트와 쿼리 스트링을 사용하여 GET 요청을 보내고 JSON 응답을 반환합니다.
 * 
 * @param {string} endPoint - API 엔드포인트의 경로를 나타내는 문자열입니다. 기본값은 빈 문자열입니다.
 * @param {Object} queryString - GET 요청에 포함할 쿼리 스트링 파라미터들을 담은 객체입니다. 기본값은 빈 객체입니다.
 * @param {Object} tokens - 서버로 전송할 토큰 객체입니다. 기본값은 빈 객체입니다.
 * @returns {Promise<Object>} 서버로부터 받은 응답 데이터를 담은 객체를 반환하는 프로미스입니다.
 * @throws {Error} HTTP 응답이 OK가 아닐 경우 에러를 발생시킵니다.
 */
const getData = async (endPoint = "", queryString = {}, tokens = {}) => {
    // url query string 파싱
    let URL = `${DEFAULT_URL}${endPoint}`;
    if (Object.keys(queryString).length) {
        const params = new URLSearchParams(queryString);
        URL = `${URL}?${params.toString()}`;
    }
    const headers = {
        "Content-Type": "application/json", // "Content-Type": "application/x-www-form-urlencoded",
        ...(tokens.accessToken && { "access-token": tokens.accessToken }),
        ...(tokens.refreshToken && { "refresh-token": tokens.refreshToken }),
    };
    // 옵션 기본 값은 *로 강조
    const res = await fetch(`${URL}`, {
        method: "GET", // *GET, POST, PUT, DELETE 등
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        headers: headers,
    });
    const result = await res.json();
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}, ${JSON.stringify(result, null, 2)}`);
    return result;
};



// ====================================================== //
// Utils
// ====================================================== //

/**
 * 특정 `domId` 에 페이지전환 이벤트 추가 
 * 
 * @param {string} domId 
 */
const footerLink = (domId = "") => {
    document.getElementById(domId).addEventListener("click", () => {
        window.location.href = "https://velog.io/@qlgks1";
    });
};

/**
 * 주어진 함수를 정해진 간격으로 폴링하며, 특정 조건이 충족되면 폴링을 중지합니다.
 * 
 * @param {Function} fn - 폴링할 비동기 함수입니다.
 * @param {number} interval - 폴링 간격(밀리초 단위)입니다.
 * @param {Function} stopCondition - 폴링을 중지할 조건을 결정하는 함수입니다. 이 함수는 폴링 함수의 결과를 매개변수로 받아 boolean 값을 반환해야 합니다.
 * @returns {Function} 폴링을 중지하는 함수를 반환합니다. 이 함수를 호출하면 폴링이 중지됩니다.
 */
const polling = (fn, interval, stopCondition) => {
    let intervalId = setInterval(async () => {
        try {
            const result = await fn();
            console.log('Polling result:', result);
            if (stopCondition(result)) {
                clearInterval(intervalId);
                console.log('Polling stopped.');
            }
        } catch (error) {
            console.error('Polling error:', error);
            clearInterval(intervalId); // 에러 발생 시 폴링 중지
        }
    }, interval);

    return () => {
        clearInterval(intervalId);
        console.log('Polling has been manually stopped.');
    }; // 폴링을 수동으로 중지할 수 있는 함수 반환
};

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

/**
 * 주어진 ISO 8601 형식의 날짜 문자열을 한국 시간대로 변환하여 날짜와 시간을 반환합니다.
 * 
 * @param {string} isoDate - ISO 8601 형식의 날짜 문자열입니다.
 * @returns {Object} 한국 날짜와 시간을 포함하는 객체입니다.
 * @throws {Error} 매개변수가 비어있을 경우 오류를 발생시킵니다.
 */
const krDateAndTime = (isoDate = "") => {
    if (isoDate === "") {
        throw new Error("date can not be empty");
    }
    const inputDate = new Date(isoDate);

    // 날짜와 시간을 분리하여 출력 형식 지정
    const koreanDate = inputDate.toISOString().split('T')[0]; // "년-월-일" 형식
    const koreanTime = inputDate.toTimeString().split(' ')[0]; // "시:분:초" 형식
    return { koreanDate, koreanTime };
};
