const title = document.querySelector(".titre_dataviz");

title.addEventListener("mouseenter", () => {
    title.classList.add("active");
});

title.addEventListener("mouseleave", () => {
    title.classList.remove("active");
    title.style.removeProperty("--x");
    title.style.removeProperty("--y");
});

title.addEventListener("mousemove", (e) => {
    const rect = title.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    title.style.setProperty("--x", `${x}%`);
    title.style.setProperty("--y", `${y}%`);
});