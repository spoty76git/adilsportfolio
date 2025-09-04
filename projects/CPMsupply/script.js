// ===================================
// UTILITY FUNCTIONS
// ===================================

// Check if IntersectionObserver is supported
function supportsIntersectionObserver() {
    return 'IntersectionObserver' in window;
}

// Handle image loading errors
function handleImageError(img) {
    img.onerror = function () {
        console.error('Failed to load image:', this.src || this.dataset.src);
        this.alt = 'Failed to load image';
        this.style.display = 'none';

        const wrapper = this.closest('.lazy-image-wrapper');
        if (wrapper) {
            wrapper.style.background = '#f0f0f0';
            wrapper.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Image unavailable</div>';
        }
    };
}

// ===================================
// LAZY LOADING FUNCTIONALITY
// ===================================

document.addEventListener('DOMContentLoaded', function () {
    // Configuration
    const config = {
        rootMargin: '50px 0px',
        threshold: 0.01
    };

    // Get all lazy images (both regular and badge logos)
    const lazyImages = document.querySelectorAll('img.lazy, .lazy-load-badge');

    // Fallback for browsers that don't support IntersectionObserver
    if (!supportsIntersectionObserver()) {
        loadImagesImmediately(lazyImages);
        return;
    }

    // Create IntersectionObserver for lazy loading
    const imageObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('lazy-load-badge')) {
                    loadBadgeLogo(entry.target);
                } else {
                    loadImage(entry.target);
                }
                observer.unobserve(entry.target);
            }
        });
    }, config);

    // Observe each lazy image
    lazyImages.forEach(image => {
        imageObserver.observe(image);
        handleImageError(image); // Apply error handling to all images
    });

    // Load regular image function
    function loadImage(img) {
        const wrapper = img.closest('.lazy-image-wrapper');
        const spinner = wrapper ? wrapper.querySelector('.loading-spinner') : null;

        const tempImg = new Image();

        tempImg.onload = function () {
            img.src = tempImg.src;
            img.classList.remove('lazy');
            img.classList.add('loaded');

            // Reinitialize modal for newly loaded images
            if (typeof initializeModal === 'function') {
                setTimeout(initializeModal, 100);
            }

            if (spinner) spinner.classList.add('hidden');
            if (wrapper) wrapper.classList.add('fade-in');
        };

        tempImg.onerror = function () {
            handleImageError(img);
            if (spinner) spinner.classList.add('hidden');
        };

        tempImg.src = img.dataset.src;
    }

    // Load badge logo function
    function loadBadgeLogo(img) {
        const spinner = img.nextElementSibling;
        const logoContainer = img.closest('.badge-logo');

        const tempImg = new Image();

        tempImg.onload = function () {
            img.src = tempImg.src;
            img.classList.add('loaded');
            if (spinner) spinner.classList.add('hidden');
        };

        tempImg.onerror = function () {
            console.error('Failed to load badge logo');
            if (logoContainer) logoContainer.classList.add('icon-fallback');
            if (spinner) spinner.classList.add('hidden');
        };

        tempImg.src = img.dataset.src;
    }

    // Fallback function for older browsers
    function loadImagesImmediately(images) {
        images.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            img.classList.add('loaded');

            const wrapper = img.closest('.lazy-image-wrapper');
            const spinner = wrapper ? wrapper.querySelector('.loading-spinner') : null;
            if (spinner) spinner.classList.add('hidden');
        });
    }
});

// ===================================
// SCROLL ANIMATIONS
// ===================================

document.addEventListener('DOMContentLoaded', function () {
    const animateElements = document.querySelectorAll('.result-card, .challenge-card, .tech-badge');

    if (!supportsIntersectionObserver()) {
        animateElements.forEach(el => el.classList.add('fade-in'));
        return;
    }

    const elementObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                elementObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(el => {
        elementObserver.observe(el);
    });
});

// ===================================
// SMOOTH SCROLL FOR INTERNAL LINKS
// ===================================

document.addEventListener('DOMContentLoaded', function () {
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// ===================================
// IMAGE MODAL FUNCTIONALITY
// ===================================

document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.querySelector('.modal-caption');
    const closeBtn = document.querySelector('.modal-close');
    const prevBtn = document.querySelector('.modal-prev');
    const nextBtn = document.querySelector('.modal-next');

    let currentImageIndex = 0;
    let galleryImages = [];

    // Initialize modal for all project images
    function initializeModal() {
        const images = document.querySelectorAll('.project-image');

        // Clear existing gallery images to prevent duplicates
        galleryImages = [];

        images.forEach((img, index) => {
            galleryImages.push({
                src: img.src || img.dataset.src,
                alt: img.alt,
                caption: img.closest('figure')?.querySelector('figcaption')?.textContent || img.alt
            });

            img.addEventListener('click', function () {
                openModal(index);
            });

            img.style.cursor = 'pointer';
        });
    }

    // Modal control functions
    function openModal(index) {
        currentImageIndex = index;
        const imageData = galleryImages[index];

        modalImg.src = imageData.src;
        modalImg.alt = imageData.alt;
        modalCaption.textContent = imageData.caption;

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.classList.add('modal-open');

        updateNavigationButtons();
    }

    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }, 300);
    }

    function showPrevImage() {
        if (currentImageIndex > 0) {
            openModal(currentImageIndex - 1);
        }
    }

    function showNextImage() {
        if (currentImageIndex < galleryImages.length - 1) {
            openModal(currentImageIndex + 1);
        }
    }

    function updateNavigationButtons() {
        prevBtn.style.display = currentImageIndex === 0 ? 'none' : 'block';
        nextBtn.style.display = currentImageIndex === galleryImages.length - 1 ? 'none' : 'block';
    }

    // Touch/swipe handling
    let touchStartX = 0;
    let touchEndX = 0;

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) showNextImage();
        if (touchEndX > touchStartX + 50) showPrevImage();
    }

    // Event listeners
    if (modal && modalImg && modalCaption && closeBtn && prevBtn && nextBtn) {
        closeBtn.addEventListener('click', closeModal);
        prevBtn.addEventListener('click', showPrevImage);
        nextBtn.addEventListener('click', showNextImage);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });

        modal.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        modal.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        // Make initializeModal globally accessible
        window.initializeModal = initializeModal;

        // Initialize after images are set up
        setTimeout(initializeModal, 100);
    }
});

// ===================================
// KEYBOARD NAVIGATION
// ===================================

document.addEventListener('keydown', function (e) {
    const modal = document.getElementById('imageModal');

    // Modal keyboard navigation
    if (modal && modal.classList.contains('show')) {
        if (e.key === 'Escape') {
            modal.querySelector('.modal-close').click();
        }
        if (e.key === 'ArrowLeft') {
            modal.querySelector('.modal-prev').click();
        }
        if (e.key === 'ArrowRight') {
            modal.querySelector('.modal-next').click();
        }
    }

    // Press 'G' to go to gallery
    if (e.key === 'g' || e.key === 'G') {
        const firstGallery = document.querySelector('.image-gallery');
        if (firstGallery) {
            firstGallery.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// ===================================
// PERFORMANCE MONITORING
// ===================================

window.addEventListener('load', function () {
    const images = document.querySelectorAll('img[data-src]');
    let loadedCount = 0;
    const totalCount = images.length;

    if (totalCount > 0) {
        console.log(`Lazy loading initialized for ${totalCount} images`);

        images.forEach(img => {
            if (img.complete && img.naturalHeight !== 0) {
                loadedCount++;
            }

            img.addEventListener('load', function () {
                loadedCount++;
                console.log(`Image loaded: ${loadedCount}/${totalCount}`);
            });
        });
    }
});