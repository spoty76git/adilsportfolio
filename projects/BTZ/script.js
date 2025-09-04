/**
 * Portfolio Website JavaScript
 * Handles lazy loading, modal functionality, animations, and user interactions
 */

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if IntersectionObserver is supported
 */
function isIntersectionObserverSupported() {
    return 'IntersectionObserver' in window;
}

/**
 * Common error handler for failed image loads
 */
function handleImageError(img) {
    img.onerror = function () {
        this.style.display = 'none';
        const wrapper = this.closest('.lazy-image-wrapper');
        if (wrapper) {
            wrapper.style.background = '#f0f0f0';
            wrapper.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Image unavailable</div>';
        }
    };
}

// =============================================================================
// LAZY LOADING FUNCTIONALITY
// =============================================================================

/**
 * Lazy Image Loading with IntersectionObserver
 */
function initializeLazyImages() {
    const config = {
        rootMargin: '50px 0px',
        threshold: 0.01
    };

    const lazyImages = document.querySelectorAll('img.lazy');

    if (!isIntersectionObserverSupported()) {
        loadImagesImmediately(lazyImages);
        return;
    }

    const imageObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadImage(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, config);

    lazyImages.forEach(image => {
        imageObserver.observe(image);
    });

    function loadImage(img) {
        const wrapper = img.closest('.lazy-image-wrapper');
        const spinner = wrapper ? wrapper.querySelector('.loading-spinner') : null;
        const tempImg = new Image();

        tempImg.onload = function () {
            img.src = tempImg.src;
            img.classList.remove('lazy');
            img.classList.add('loaded');

            if (typeof initializeModal === 'function') {
                setTimeout(initializeModal, 100);
            }

            if (spinner) spinner.classList.add('hidden');
            if (wrapper) wrapper.classList.add('fade-in');
        };

        tempImg.onerror = function () {
            console.error('Failed to load image:', img.dataset.src);
            img.alt = 'Failed to load image';
            if (spinner) spinner.classList.add('hidden');
        };

        tempImg.src = img.dataset.src;
    }

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
}

/**
 * Badge Logo Lazy Loading
 */
function initializeBadgeLogos() {
    const badgeLogos = document.querySelectorAll('.lazy-load-badge');

    if (!isIntersectionObserverSupported()) {
        badgeLogos.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
        });
        return;
    }

    const badgeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const spinner = img.nextElementSibling;
                const logoContainer = img.closest('.badge-logo');
                const tempImg = new Image();

                tempImg.onload = function () {
                    img.src = tempImg.src;
                    img.classList.add('loaded');
                    if (spinner) spinner.classList.add('hidden');
                    observer.unobserve(img);
                };

                tempImg.onerror = function () {
                    console.error('Failed to load badge logo');
                    if (logoContainer) logoContainer.classList.add('icon-fallback');
                    if (spinner) spinner.classList.add('hidden');
                    observer.unobserve(img);
                };

                tempImg.src = img.dataset.src;
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    badgeLogos.forEach(img => badgeObserver.observe(img));
}

/**
 * Lazy Video Loading Class
 */
class LazyVideoLoader {
    constructor() {
        this.videos = document.querySelectorAll('.lazy-video');
        this.videoObserver = null;
        this.init();
    }

    init() {
        if (isIntersectionObserverSupported()) {
            this.createObserver();
            this.observeVideos();
        } else {
            this.loadAllVideos();
        }
    }

    createObserver() {
        const options = {
            root: null,
            rootMargin: '50px 0px',
            threshold: 0.1
        };

        this.videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadVideo(entry.target);
                }
            });
        }, options);
    }

    observeVideos() {
        this.videos.forEach(video => {
            this.videoObserver.observe(video);
        });
    }

    loadVideo(videoElement) {
        const videoSrc = videoElement.dataset.src;
        const spinner = videoElement.parentElement.querySelector('.video-loading-spinner');

        if (!videoSrc) {
            console.warn('No data-src attribute found on video element');
            return;
        }

        if (spinner) spinner.classList.remove('hidden');

        const tempVideo = document.createElement('video');

        tempVideo.addEventListener('loadeddata', () => {
            this.onVideoLoaded(videoElement, videoSrc, spinner);
        });

        tempVideo.addEventListener('error', (e) => {
            console.error('Error loading video:', e);
            this.onVideoError(videoElement, spinner);
        });

        tempVideo.src = videoSrc;
        tempVideo.load();
    }

    onVideoLoaded(videoElement, videoSrc, spinner) {
        videoElement.src = videoSrc;
        videoElement.classList.add('loaded');

        if (spinner) spinner.classList.add('hidden');
        if (this.videoObserver) this.videoObserver.unobserve(videoElement);

        this.addVideoControls(videoElement);
        this.showPlayButton(videoElement);

        console.log('Video loaded successfully:', videoSrc);
    }

    onVideoError(videoElement, spinner) {
        if (spinner) spinner.classList.add('hidden');
        videoElement.classList.add('video-error');

        const errorMsg = document.createElement('div');
        errorMsg.className = 'video-error-message';
        errorMsg.textContent = 'Unable to load video';
        errorMsg.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #999;
            font-size: 14px;
            text-align: center;
        `;

        videoElement.parentElement.appendChild(errorMsg);

        if (this.videoObserver) this.videoObserver.unobserve(videoElement);
    }

    addVideoControls(videoElement) {
        videoElement.addEventListener('click', (e) => {
            e.preventDefault();
            if (videoElement.paused) {
                videoElement.play().catch(e => {
                    console.log('Play prevented:', e);
                });
            } else {
                videoElement.pause();
            }
        });

        const container = videoElement.parentElement;
        container.addEventListener('mouseenter', () => {
            container.style.cursor = 'pointer';
        });
        container.addEventListener('mouseleave', () => {
            container.style.cursor = 'default';
        });
    }

    showPlayButton(videoElement) {
        const playButton = document.createElement('div');
        playButton.className = 'video-play-button';
        playButton.innerHTML = '▶';
        playButton.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 10;
        `;

        playButton.addEventListener('mouseenter', () => {
            playButton.style.background = 'rgba(0, 0, 0, 0.9)';
            playButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
        });

        playButton.addEventListener('mouseleave', () => {
            playButton.style.background = 'rgba(0, 0, 0, 0.7)';
            playButton.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        playButton.addEventListener('click', (e) => {
            e.stopPropagation();
            videoElement.play().then(() => {
                playButton.style.opacity = '0';
                playButton.style.pointerEvents = 'none';
            }).catch(e => {
                console.log('Manual play prevented:', e);
            });
        });

        videoElement.parentElement.appendChild(playButton);

        videoElement.addEventListener('play', () => {
            playButton.style.opacity = '0';
            playButton.style.pointerEvents = 'none';
        });

        videoElement.addEventListener('pause', () => {
            playButton.style.opacity = '1';
            playButton.style.pointerEvents = 'auto';
        });

        videoElement.addEventListener('ended', () => {
            playButton.style.opacity = '1';
            playButton.style.pointerEvents = 'auto';
        });
    }

    loadAllVideos() {
        this.videos.forEach(video => {
            this.loadVideo(video);
        });
    }

    loadVideoById(videoId) {
        const video = document.getElementById(videoId);
        if (video && video.classList.contains('lazy-video')) {
            this.loadVideo(video);
        }
    }

    destroy() {
        if (this.videoObserver) {
            this.videoObserver.disconnect();
        }
    }
}

// =============================================================================
// MODAL FUNCTIONALITY
// =============================================================================

/**
 * Image Modal System
 */
function initializeImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.querySelector('.modal-caption');
    const closeBtn = document.querySelector('.modal-close');
    const prevBtn = document.querySelector('.modal-prev');
    const nextBtn = document.querySelector('.modal-next');

    let currentImageIndex = 0;
    let galleryImages = [];

    function initializeModal() {
        const images = document.querySelectorAll('.project-image');

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

    // Event listeners
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (prevBtn) prevBtn.addEventListener('click', showPrevImage);
    if (nextBtn) nextBtn.addEventListener('click', showNextImage);

    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });

        // Touch navigation
        let touchStartX = 0;
        let touchEndX = 0;

        modal.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        modal.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) showNextImage();
            if (touchEndX > touchStartX + 50) showPrevImage();
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (modal && modal.classList.contains('show')) {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === 'ArrowRight') showNextImage();
        }
    });

    // Make initializeModal globally accessible
    window.initializeModal = initializeModal;

    setTimeout(initializeModal, 100);
}

// =============================================================================
// ANIMATION SYSTEM
// =============================================================================

/**
 * Scroll-based animations for elements
 */
function initializeScrollAnimations() {
    const animateElements = document.querySelectorAll('.result-card, .challenge-card, .tech-badge');

    if (!isIntersectionObserverSupported()) {
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
}

// =============================================================================
// NAVIGATION FUNCTIONALITY
// =============================================================================

/**
 * Smooth scroll for internal links
 */
function initializeSmoothScroll() {
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
}

/**
 * Keyboard shortcuts
 */
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        // Press 'G' to go to gallery
        if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.altKey) {
            const firstGallery = document.querySelector('.image-gallery');
            if (firstGallery) {
                firstGallery.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

/**
 * Monitor lazy loading performance
 */
function initializePerformanceMonitoring() {
    window.addEventListener('load', function () {
        const images = document.querySelectorAll('img[data-src]');
        let loadedCount = 0;
        let totalCount = images.length;

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
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize all functionality when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function () {
    // Core functionality
    initializeLazyImages();
    initializeBadgeLogos();
    initializeImageModal();
    initializeScrollAnimations();

    // Navigation features
    initializeSmoothScroll();
    initializeKeyboardShortcuts();

    // Performance monitoring
    initializePerformanceMonitoring();

    // Initialize lazy video loader
    window.lazyVideoLoader = new LazyVideoLoader();

    // Apply error handling to all images
    document.querySelectorAll('img').forEach(handleImageError);
});