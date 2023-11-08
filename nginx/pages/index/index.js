document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var token = document.getElementById('token').value;
    // 여기서 API 요청을 처리하거나, 실제로는 토큰 검증 후 dashboard.html로 리디렉션해야 합니다.
    // 현재는 예시를 위해 바로 리디렉션합니다.
    window.location.href = 'dashboard.html';
});



document.getElementById("login-container-footer").addEventListener("click", () => {
    window.location.href = "https://velog.io/@qlgks1";
});