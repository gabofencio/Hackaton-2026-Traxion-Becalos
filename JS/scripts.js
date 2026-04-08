const toggleBtn = document.getElementById("searchToggle");
const container = document.querySelector(".search-container");
const input = document.getElementById("searchInput");

// Botón para searchbar
toggleBtn.addEventListener("click", () => {
    container.classList.toggle("active");

    if (container.classList.contains("active")) {
        input.focus();
    }
});

