// Add sticky blur effect to navbar on scroll
document.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.7)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.4)';
        navbar.style.boxShadow = 'none';
    }
});

// Scroll Reveal for Masonry Cards
function revealCards() {
    const cards = document.querySelectorAll('.moment-card');
    const windowHeight = window.innerHeight;
    const elementVisible = 100;

    cards.forEach((card, index) => {
        const elementTop = card.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
            // Stagger animation based on index
            setTimeout(() => {
                card.classList.add('reveal');
            }, (index % 3) * 150);
        }
    });
}

window.addEventListener('scroll', revealCards);
// Trigger once on load
document.addEventListener('DOMContentLoaded', revealCards);
