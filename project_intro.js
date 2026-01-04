document.addEventListener("DOMContentLoaded", () => {

    // Avvia animazioni titolo + logo + foto
    setTimeout(() => {
        document.body.classList.add("animate");
    }, 300);

    // Dopo che titolo e logo completano l’animazione (1s)
    setTimeout(() => {
        document.body.classList.add("ready");
    }, 1100); // leggermente oltre 1s per sicurezza
});
