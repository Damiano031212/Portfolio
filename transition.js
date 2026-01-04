document.addEventListener("DOMContentLoaded", () => {
  const shutter = document.createElement("div");
  shutter.className = "page-shutter";
  document.body.appendChild(shutter);

  let isAnimating = false;

  function clearFlag() {
    sessionStorage.removeItem("pageTransition");
  }

  function finishReveal() {
    shutter.classList.remove("down");
    isAnimating = false;
    clearFlag();
  }

  // --- GESTIONE CARICAMENTO PAGINA (SALITA TENDINA) ---
  if (sessionStorage.getItem("pageTransition") === "1") {
    // 1. Posiziona la tendina giù (copre tutto) istantaneamente
    shutter.style.transition = "none";
    shutter.classList.add("down");
    
    // 2. Forza il reflow per applicare la posizione
    shutter.getBoundingClientRect();
    
    // 3. Ripristina la transizione CSS (1s ease-in-out)
    shutter.style.transition = "";

    // 4. Avvia l'animazione di salita
    requestAnimationFrame(() => {
        shutter.classList.remove("down");
    });

    const onRevealEnd = (e) => {
      if (e.propertyName !== "transform") return;
      isAnimating = false;
      clearFlag();
      shutter.removeEventListener("transitionend", onRevealEnd);
    };
    shutter.addEventListener("transitionend", onRevealEnd);
  }

  // --- GESTIONE CLICK LINK (DISCESA TENDINA) ---
  
  // 1. Selezioniamo tutti i link della Navbar
  const navbarLinks = Array.from(document.querySelectorAll("nav a"));
  
  // 2. Creiamo una lista di link da animare
  let linksToAnimate = [...navbarLinks];

  // 3. Selezioniamo SPECIFICAMENTE il link che avvolge il bottone .home nel footer
  const footerHomeBtn = document.querySelector("footer .home");
  if (footerHomeBtn) {
      // Risaliamo al tag <a> genitore del bottone .home
      const footerHomeLink = footerHomeBtn.closest("a");
      if (footerHomeLink) {
          linksToAnimate.push(footerHomeLink);
      }
  }

  // 4. Applichiamo l'event listener solo a questi elementi
  linksToAnimate.forEach((a) => {
    a.addEventListener("click", (ev) => {
      // Controllo sicurezza href
      if (!a.href) return;

      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return; // Ignora link esterni

      const isSamePageHash = (url.pathname === location.pathname) && !!url.hash;
      
      ev.preventDefault();
      if (isAnimating) return;
      isAnimating = true;

      // Fallback di sicurezza
      const fallbackDuration = 1200; 
      let fallback = setTimeout(() => {
        isAnimating = false;
        clearFlag();
        shutter.classList.remove("down"); 
      }, fallbackDuration * 2); 

      // Funzione che gestisce cosa fare quando la tendina ha finito di SCENDERE
      const onCoverComplete = () => {
        clearTimeout(fallback); 
        
        if (isSamePageHash) {
          // A. Navigazione interna (Hash)
          location.hash = url.hash;
          requestAnimationFrame(() => shutter.classList.remove("down"));
          shutter.addEventListener("transitionend", function onUp(ev2) {
             if (ev2.propertyName !== "transform") return;
             finishReveal();
             shutter.removeEventListener("transitionend", onUp);
          }, { once: true });

        } else {
          // B. Cambio Pagina Reale
          sessionStorage.setItem("pageTransition", "1");
          if (url.href === location.href) {
            location.reload();
          } else {
            location.href = url.href;
          }
        }
      };

      // Avvia discesa
      shutter.classList.add("down");
      
      // Ascolta la fine della discesa
      shutter.addEventListener("transitionend", function onDown(e) {
        if (e.propertyName !== "transform") return;
        shutter.removeEventListener("transitionend", onDown);
        onCoverComplete();
      });
    });
  });
});