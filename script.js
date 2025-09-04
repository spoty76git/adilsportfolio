// ====================================
// NAVIGATION & SCROLL EFFECTS
// ====================================

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }
});

// ====================================
// INTERSECTION OBSERVER & ANIMATIONS
// ====================================

// Fade-in animation observer
const fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe all experience items for fade-in
document.querySelectorAll('.experience-item').forEach(item => {
    fadeObserver.observe(item);
});

// ====================================
// IMAGE LAZY LOADING SYSTEM
// ====================================

// Shared image loading function with retry logic
function loadImageWithRetry(img, loader, iconOverlay, imageContainer, retries = 3, isExperienceImage = false) {
    const tempImg = new Image();

    tempImg.onload = function () {
        img.src = tempImg.src;

        if (isExperienceImage) {
            // Experience image specific loading effects
            const pulseElement = loader ? loader.querySelector('.pulse-loader') : null;

            if (pulseElement) {
                pulseElement.classList.add('stop-pulse');
            }

            imageContainer.classList.add('show-shimmer');

            setTimeout(() => {
                img.classList.add('loaded');
            }, 50);

            setTimeout(() => {
                if (loader) loader.classList.add('hidden');
                imageContainer.classList.remove('show-shimmer');
            }, 5000);

            // Animate icon overlay
            if (iconOverlay) {
                setTimeout(() => {
                    iconOverlay.style.transform = 'scale(0.8) rotate(180deg)';
                    setTimeout(() => {
                        iconOverlay.style.opacity = '0';
                    }, 300);
                }, 100);
            }
        } else {
            // Profile image loading
            img.classList.add('loaded');
            if (loader) loader.classList.add('hidden');
        }
    };

    tempImg.onerror = function () {
        if (retries > 0) {
            console.log(`Retrying image load... (${retries} attempts left)`);
            setTimeout(() => loadImageWithRetry(img, loader, iconOverlay, imageContainer, retries - 1, isExperienceImage), 1000);
        } else {
            console.error('Failed to load image:', img.dataset.src);

            if (isExperienceImage) {
                const pulseElement = loader ? loader.querySelector('.pulse-loader') : null;
                if (pulseElement) pulseElement.classList.add('stop-pulse');
                imageContainer.classList.add('error-state');
                if (iconOverlay) {
                    iconOverlay.innerHTML = '⚠️';
                    iconOverlay.style.opacity = '0.7';
                }
            } else {
                img.src = 'fallback-avatar.svg';
                img.classList.add('loaded');
            }

            if (loader) loader.classList.add('hidden');
        }
    };

    tempImg.src = img.dataset.src;
}

// Initialize lazy loading on DOM content loaded
document.addEventListener('DOMContentLoaded', function () {

    // ====================================
    // PROFILE IMAGE LAZY LOADING
    // ====================================

    const profileImages = document.querySelectorAll('.lazy-load');

    const profileImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const loader = img.nextElementSibling;

                loadImageWithRetry(img, loader, null, null, 3, false);
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    profileImages.forEach(img => profileImageObserver.observe(img));

    // ====================================
    // EXPERIENCE IMAGE LAZY LOADING
    // ====================================

    const experienceImages = document.querySelectorAll('.lazy-load-experience');

    const experienceImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const loader = img.parentElement.querySelector('.experience-loading');
                const iconOverlay = img.parentElement.querySelector('.experience-icon-overlay');
                const imageContainer = img.parentElement;

                loadImageWithRetry(img, loader, iconOverlay, imageContainer, 3, true);
                observer.unobserve(img);

                // Add entrance animation
                entry.target.closest('.experience-item').style.animation = 'slideInFade 0.6s ease forwards';
            }
        });
    }, {
        rootMargin: '100px 0px',
        threshold: 0.01
    });

    experienceImages.forEach(img => experienceImageObserver.observe(img));

    // ====================================
    // IMAGE PRELOADING ON HOVER
    // ====================================

    // Preload next image when hovering on experience item
    document.querySelectorAll('.experience-item').forEach(item => {
        item.addEventListener('mouseenter', function () {
            const nextItem = this.nextElementSibling;
            if (nextItem) {
                const nextImg = nextItem.querySelector('.lazy-load-experience');
                if (nextImg && !nextImg.classList.contains('loaded') && nextImg.dataset.src) {
                    const preloadImg = new Image();
                    preloadImg.src = nextImg.dataset.src;
                }
            }
        });
    });
});