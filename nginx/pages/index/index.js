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

        // console.log(res);
        Swal.close();
        // window.location.href = "/dashboard";
        window.location.href = "../dashboard/index.html";
    } catch (error) {
        // console.log(error);
        await Swal.fire({
            title: "로그인 실패",
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
};

init();
