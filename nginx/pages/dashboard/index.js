
document.getElementById('navbar-toggle').addEventListener('click', function () {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
});

document.getElementById("section-footer").addEventListener("click", () => {
    window.location.href = "https://velog.io/@qlgks1";
});