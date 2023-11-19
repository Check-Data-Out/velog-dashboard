"use strict";
// ====================================================== //
// Events
// ====================================================== //

const login = async () => {
    const accessToken = document.getElementById("access-token").value;
    const refreshToken = document.getElementById("refresh-token").value;

    try {
        const res = await postData("/user", { accessToken, refreshToken });
        localStorage.setItem("userInfo", JSON.stringify(res.user));
        Swal.close();
        window.location.href = "/dashboard";
    } catch (error) {
        await Swal.fire({
            title: "로그인 실패",
            text: `${error.message}, 만료된 토큰 이슈가 계속 발생하면 오른쪽 하단을 통해 바로 문의 주세요 도와드릴게요!!`,
            icon: "error",
            confirmButtonText: "OK",
            background: "#242424", // 혹은 다크 테마에 맞는 색상으로 설정
            color: "#fff", // 텍스트 색상을 흰색으로 설정
        });
    }
};


const sampleLogin = async () => {
    try {
        const res = await postData("/user/sample");
        localStorage.setItem("userInfo", JSON.stringify(res.user));
        Swal.close();
        window.location.href = "/dashboard";
    } catch (error) {
        await Swal.fire({
            title: "sample 로그인 실패",
            text: error.message,
            icon: "error",
            confirmButtonText: "OK",
            background: "#242424", // 혹은 다크 테마에 맞는 색상으로 설정
            color: "#fff", // 텍스트 색상을 흰색으로 설정
        });
    }
};


// ====================================================== //
// Main
// ====================================================== //

const init = () => {
    footerLink("login-container-footer");
    document.getElementById("login-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        showSpinner();
        await login();
    });

    document.getElementById("sample-login-btn").addEventListener("click", async (event) => {
        event.preventDefault();
        showSpinner();
        await sampleLogin();
    });
};

init();
