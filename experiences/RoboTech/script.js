/**
 * Main JavaScript file for image gallery and lazy loading functionality
 * Organized into sections: Utilities, Lazy Loading, Animations, Modal, and Initialization
 */

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Creates an Intersection Observer with fallback for older browsers
 */
function createObserver(callback, options = {}) {
    if (!('IntersectionObserver' in window)) {
        return null;
    }
    return new IntersectionObserver(callback, options);
}

/**
 * Handles image loading errors with fallback UI
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
// LAZY LOADING SYSTEM
// =============================================================================

/**
 * Lazy Image Loader
 * Handles intersection observer-based lazy loading for images
 */
class LazyImageLoader {
    constructor() {
        this.config = {
            rootMargin: '50px 0px',
            threshold: 0.01
        };
        this.init();
    }

    init() {
        const lazyImages = document.querySelectorAll('img.lazy');

        const observer = createObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, this.config);

        if (observer) {
            lazyImages.forEach(image => observer.observe(image));
        } else {
            this.loadImagesImmediately(lazyImages);
        }
    }

    loadImage(img) {
        const wrapper = img.closest('.lazy-image-wrapper');
        const spinner = wrapper ? wrapper.querySelector('.loading-spinner') : null;
        const tempImg = new Image();

        tempImg.onload = () => {
            img.src = tempImg.src;
            img.classList.remove('lazy');
            img.classList.add('loaded');

            // Reinitialize modal for newly loaded images
            if (typeof window.imageModal !== 'undefined') {
                setTimeout(() => window.imageModal.reinitialize(), 100);
            }

            if (spinner) spinner.classList.add('hidden');
            if (wrapper) wrapper.classList.add('fade-in');
        };

        tempImg.onerror = () => {
            console.error('Failed to load image:', img.dataset.src);
            img.alt = 'Failed to load image';
            if (spinner) spinner.classList.add('hidden');
        };

        tempImg.src = img.dataset.src;
    }

    loadImagesImmediately(images) {
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
 * Lazy Video Loader
 * Handles intersection observer-based lazy loading for video elements
 */
class LazyVideoLoader {
    constructor() {
        this.videos = document.querySelectorAll('.lazy-video');
        this.init();
    }

    init() {
        const observer = createObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadVideo(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        if (observer) {
            this.videos.forEach(video => observer.observe(video));
            this.videoObserver = observer;
        } else {
            this.loadAllVideos();
        }
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
                videoElement.play().catch(e => console.log('Play prevented:', e));
            } else {
                videoElement.pause();
            }
        });

        const container = videoElement.parentElement;
        container.addEventListener('mouseenter', () => container.style.cursor = 'pointer');
        container.addEventListener('mouseleave', () => container.style.cursor = 'default');
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
            }).catch(e => console.log('Manual play prevented:', e));
        });

        videoElement.parentElement.appendChild(playButton);

        // Video event listeners for play button visibility
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
        this.videos.forEach(video => this.loadVideo(video));
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

/**
 * Badge Logo Lazy Loader
 */
function initializeBadgeLoader() {
    const badgeLogos = document.querySelectorAll('.lazy-load-badge');

    const observer = createObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const spinner = img.nextElementSibling;
                const logoContainer = img.closest('.badge-logo');
                const tempImg = new Image();

                tempImg.onload = () => {
                    img.src = tempImg.src;
                    img.classList.add('loaded');
                    if (spinner) spinner.classList.add('hidden');
                    observer.unobserve(img);
                };

                tempImg.onerror = () => {
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

    if (observer) {
        badgeLogos.forEach(img => observer.observe(img));
    }
}

// =============================================================================
// ANIMATION SYSTEM
// =============================================================================

/**
 * Scroll-triggered animations for elements
 */
function initializeScrollAnimations() {
    const animateElements = document.querySelectorAll('.result-card, .challenge-card, .tech-badge');

    const observer = createObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    if (observer) {
        animateElements.forEach(el => observer.observe(el));
    } else {
        animateElements.forEach(el => el.classList.add('fade-in'));
    }
}

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

// =============================================================================
// IMAGE MODAL SYSTEM
// =============================================================================

/**
 * Image Modal Handler
 */
class ImageModal {
    constructor() {
        this.modal = document.getElementById('imageModal');
        this.modalImg = document.getElementById('modalImage');
        this.modalCaption = document.querySelector('.modal-caption');
        this.closeBtn = document.querySelector('.modal-close');
        this.prevBtn = document.querySelector('.modal-prev');
        this.nextBtn = document.querySelector('.modal-next');

        this.currentImageIndex = 0;
        this.galleryImages = [];

        this.init();
    }

    init() {
        if (!this.modal) return;

        this.setupEventListeners();
        this.initializeImages();
    }

    initializeImages() {
        const images = document.querySelectorAll('.project-image');
        this.galleryImages = [];

        images.forEach((img, index) => {
            this.galleryImages.push({
                src: img.src || img.dataset.src,
                alt: img.alt,
                caption: img.closest('figure')?.querySelector('figcaption')?.textContent || img.alt
            });

            img.addEventListener('click', () => this.openModal(index));
            img.style.cursor = 'pointer';
        });
    }

    setupEventListeners() {
        // Button events
        this.closeBtn?.addEventListener('click', () => this.closeModal());
        this.prevBtn?.addEventListener('click', () => this.showPrevImage());
        this.nextBtn?.addEventListener('click', () => this.showNextImage());

        // Background click to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.modal.classList.contains('show')) {
                if (e.key === 'Escape') this.closeModal();
                if (e.key === 'ArrowLeft') this.showPrevImage();
                if (e.key === 'ArrowRight') this.showNextImage();
            }
        });

        // Touch/swipe navigation
        this.setupTouchNavigation();
    }

    setupTouchNavigation() {
        let touchStartX = 0;
        let touchEndX = 0;

        this.modal.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.modal.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;

            if (touchEndX < touchStartX - 50) this.showNextImage();
            if (touchEndX > touchStartX + 50) this.showPrevImage();
        });
    }

    openModal(index) {
        this.currentImageIndex = index;
        const imageData = this.galleryImages[index];

        this.modalImg.src = imageData.src;
        this.modalImg.alt = imageData.alt;
        this.modalCaption.textContent = imageData.caption;

        this.modal.style.display = 'flex';
        setTimeout(() => this.modal.classList.add('show'), 10);
        document.body.classList.add('modal-open');

        this.updateNavigationButtons();
    }

    closeModal() {
        this.modal.classList.remove('show');
        setTimeout(() => {
            this.modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }, 300);
    }

    showPrevImage() {
        if (this.currentImageIndex > 0) {
            this.openModal(this.currentImageIndex - 1);
        }
    }

    showNextImage() {
        if (this.currentImageIndex < this.galleryImages.length - 1) {
            this.openModal(this.currentImageIndex + 1);
        }
    }

    updateNavigationButtons() {
        if (this.prevBtn) this.prevBtn.style.display = this.currentImageIndex === 0 ? 'none' : 'block';
        if (this.nextBtn) this.nextBtn.style.display = this.currentImageIndex === this.galleryImages.length - 1 ? 'none' : 'block';
    }

    reinitialize() {
        this.initializeImages();
    }
}

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

/**
 * Performance monitoring for lazy loaded content
 */
function initializePerformanceMonitoring() {
    window.addEventListener('load', () => {
        const images = document.querySelectorAll('img[data-src]');
        let loadedCount = 0;
        const totalCount = images.length;

        if (totalCount > 0) {
            console.log(`Lazy loading initialized for ${totalCount} images`);

            images.forEach(img => {
                if (img.complete && img.naturalHeight !== 0) {
                    loadedCount++;
                }

                img.addEventListener('load', () => {
                    loadedCount++;
                    console.log(`Image loaded: ${loadedCount}/${totalCount}`);
                });
            });
        }
    });
}

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

/**
 * Keyboard shortcuts for navigation
 */
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Press 'G' to go to gallery
        if (e.key === 'g' || e.key === 'G') {
            const firstGallery = document.querySelector('.image-gallery');
            if (firstGallery) {
                firstGallery.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Main initialization function
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize lazy loading systems
    new LazyImageLoader();
    window.lazyVideoLoader = new LazyVideoLoader();
    initializeBadgeLoader();

    // Initialize UI systems  
    initializeScrollAnimations();
    initializeSmoothScroll();
    window.imageModal = new ImageModal();

    // Initialize utilities
    initializePerformanceMonitoring();
    initializeKeyboardShortcuts();

    // Apply error handling to all images
    document.querySelectorAll('img').forEach(handleImageError);

    console.log('All systems initialized successfully');
});

// Global function for backward compatibility
window.initializeModal = () => {
    if (window.imageModal) {
        window.imageModal.reinitialize();
    }
};