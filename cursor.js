document.addEventListener("DOMContentLoaded", () => {

    const cursor = document.querySelector(".cursor");

    // 🛠️ FIX GEOMETRICO: Forza il cursore a restare sempre un quadrato/cerchio perfetto
    cursor.style.aspectRatio = "1"; 

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    const speed = 1;

    document.body.style.cursor = "none";

    setTimeout(() => {
        cursor.style.opacity = 1;
    }, 300);

    let freezeCursor = false;
    let hasDetectedMouse = false;
    let isHoverSphere = false;
    let isHovered = false;
    let isPressed = false;

    function setCursorToCenter() {
        mouseX = window.innerWidth / 2;
        mouseY = window.innerHeight / 2;
        cursorX = mouseX;
        cursorY = mouseY;
        cursor.style.left = cursorX + "px";
        cursor.style.top = cursorY + "px";
    }

    setCursorToCenter();

    document.addEventListener("mousemove", (e) => {
        if (freezeCursor) return;
        hasDetectedMouse = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener("pointermove", (e) => {
        if (freezeCursor) return;
        hasDetectedMouse = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener("resize", () => {
        if (!hasDetectedMouse) setCursorToCenter();
    });

    function animate() {
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;

        cursor.style.left = cursorX + "px";
        cursor.style.top = cursorY + "px";

        if (window.isHoverSphere !== isHoverSphere) {
            isHoverSphere = window.isHoverSphere;
            applyCursorScale();
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    const interactive = document.querySelectorAll("a, button, .clickable,.project-wrapper");

    function applyCursorScale() {
        if (isPressed) {
            cursor.style.transform = "translate(-50%, -50%) scale(0.6)";
        } else if (isHovered || isHoverSphere) {
            cursor.style.transform = "translate(-50%, -50%) scale(2)";
        } else {
            cursor.style.transform = "translate(-50%, -50%) scale(1)";
        }
    }

    interactive.forEach((el) => {
        el.addEventListener("mouseenter", () => { isHovered = true; applyCursorScale(); });
        el.addEventListener("mouseleave", () => { isHovered = false; applyCursorScale(); });
        el.addEventListener("pointerdown", (ev) => {
            if (ev.button !== undefined && ev.button !== 0) return;
            isPressed = true;
            applyCursorScale();
        });
        el.addEventListener("pointerup", () => { isPressed = false; applyCursorScale(); });
    });

    document.addEventListener("pointerdown", () => { if (isHoverSphere) { isPressed = true; applyCursorScale(); } });
    document.addEventListener("pointerup", () => { if (isPressed) { isPressed = false; applyCursorScale(); } });

    // ⭐⭐⭐ FULL-FILL TRANSITION (Percentuale + Aspect Ratio) ⭐⭐⭐
    const projectButtons = document.querySelectorAll(".link-wrapper");
    let isButtonAnimating = false;

    projectButtons.forEach((btn) => {
        btn.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();

            if (isButtonAnimating) return;

            const parentA = btn.closest("a");
            const targetHref = parentA?.href || btn.dataset.href || null;
            if (!targetHref) return;

            isButtonAnimating = true;
            document.body.style.pointerEvents = "none";

            // 🔒 Ferma il cursore
            freezeCursor = true;
            mouseX = cursorX;
            mouseY = cursorY;

            const comp = getComputedStyle(cursor);
            const origWidth = comp.width || "50px";
            // Non serve salvare height perché aspect-ratio lo gestisce

            // ⏱️ CONFIGURAZIONE TEMPI
            const expandDuration = 800; 
            const shrinkDuration = 800; 
            const curve = "ease-in-out"; 

            // 1️⃣ FASE ESPANSIONE
            // Usiamo width percentuale. L'aspect-ratio nel CSS manterrà l'altezza uguale alla larghezza.
            cursor.style.transition = 
                `width ${expandDuration}ms ${curve}, height ${expandDuration}ms ${curve}, transform 0.25s ease`;

            requestAnimationFrame(() => {
                // 300% è necessario perché se clicchi in un angolo, 100% coprirebbe solo un quarto dello schermo.
                // aspect-ratio: 1 assicura che rimanga un cerchio perfetto.
                cursor.style.width = "100%"; 
                cursor.style.height = "auto"; // Lascia che aspect-ratio calcoli l'altezza
            });

            // 2️⃣ FASE RITORNO
            const expandTimeout = setTimeout(() => {
                
                cursor.style.transition = 
                    `width ${shrinkDuration}ms ${curve}, height ${shrinkDuration}ms ${curve}, transform 0.2s ease`;

                // Ritorno dimensioni originali
                cursor.style.width = origWidth;
                cursor.style.height = "auto"; // aspect-ratio gestisce il ritorno

                // 3️⃣ CAMBIO PAGINA
                const finalTimeout = setTimeout(() => {
                    location.href = targetHref;
                }, shrinkDuration);

            }, expandDuration);

            // ⭐ FAIL-SAFE
            const safetyTimeout = setTimeout(() => {
                if (isButtonAnimating) {
                    freezeCursor = false;
                    document.body.style.pointerEvents = "";
                    isButtonAnimating = false;
                    location.href = targetHref;
                }
            }, 3000);
        });
    });

});