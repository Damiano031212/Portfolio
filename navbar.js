document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.Navigation');
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateNav = () => {
        // Nascondi la navbar solo se abbiamo scrollato più di 100px
        if (window.scrollY > 20) {
            // Scrolling down
            if (window.scrollY > lastScrollY) {
                nav.classList.add('nav-hidden');
            }
            // Scrolling up
            else {
                nav.classList.remove('nav-hidden');
            }
        } else {
            nav.classList.remove('nav-hidden');
        }
        
        lastScrollY = window.scrollY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateNav();
            });
            ticking = true;
        }
    });
});