document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.querySelector('.progress-bar');
    
    // Calcola e aggiorna la percentuale di scroll
    function updateProgressBar() {
        // Altezza totale scrollabile = altezza totale del contenuto - altezza della viewport
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        
        // Percentuale di scroll corrente
        const scrolled = Math.min((window.scrollY / scrollable) * 100, 100);
        
        // Aggiorna la larghezza della barra di progresso
        progressBar.style.width = scrolled + '%';
    }

    // Ascolta l'evento scroll
    window.addEventListener('scroll', updateProgressBar);
    
    // Aggiorna anche al ridimensionamento della finestra
    window.addEventListener('resize', updateProgressBar);
    
    // Aggiornamento iniziale
    updateProgressBar();
});