/**
 * scroll.js - Smooth drag scrolling
 * Handles smooth drag scrolling functionality for the container
 */

// Scroll module
const Scroll = (function() {
    // Variables for drag scrolling
    let container;
    let isDown = false;
    let startX;
    let scrollLeft;
    let velocity = 0;
    let rafId = null;
    let lastX;
    let lastTimestamp = 0;
    let isScrolling = false;
    
    /**
     * Sets up smooth drag scrolling
     * @param {HTMLElement} containerElement - The container to add scrolling to
     */
    function setup(containerElement) {
        // Store container reference
        container = containerElement || document.querySelector('#container');
        
        // Initialize inertial scrolling with performance optimizations
        function smoothScroll(timestamp) {
            // Only update if enough time has passed (throttling)
            if (timestamp - lastTimestamp < 16) { // ~60fps
                rafId = requestAnimationFrame(smoothScroll);
                return;
            }
            
            lastTimestamp = timestamp;
            
            if (Math.abs(velocity) < 0.5) {
                isScrolling = false;
                return;
            }
            
            velocity *= 0.95; // Damping factor
            container.scrollLeft += velocity;
            rafId = requestAnimationFrame(smoothScroll);
        }
        
        // Mouse events with event delegation
        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.classList.add('active');
            startX = e.pageX - container.offsetLeft;
            lastX = startX;
            scrollLeft = container.scrollLeft;
            velocity = 0;
            
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            
            e.preventDefault();
        });
        
        // Use window events for better performance
        window.addEventListener('mouseup', () => {
            if (!isDown) return;
            
            isDown = false;
            container.classList.remove('active');
            
            if (Math.abs(velocity) > 0.5) {
                isScrolling = true;
                rafId = requestAnimationFrame(smoothScroll);
            }
        });
        
        window.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 1.5; // Slightly reduced multiplier
            
            // Calculate velocity for inertia
            velocity = (x - lastX) * 0.7; // Slightly reduced
            lastX = x;
            
            container.scrollLeft = scrollLeft - walk;
        });
        
        // Touch events for mobile with passive option where possible
        container.addEventListener('touchstart', (e) => {
            isDown = true;
            container.classList.add('active');
            startX = e.touches[0].pageX - container.offsetLeft;
            lastX = startX;
            scrollLeft = container.scrollLeft;
            velocity = 0;
            
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }, { passive: false });
        
        window.addEventListener('touchend', () => {
            if (!isDown) return;
            
            isDown = false;
            container.classList.remove('active');
            
            if (Math.abs(velocity) > 0.5) {
                isScrolling = true;
                rafId = requestAnimationFrame(smoothScroll);
            }
        });
        
        window.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            
            const x = e.touches[0].pageX - container.offsetLeft;
            const walk = (x - startX) * 1.5;
            
            velocity = (x - lastX) * 0.7;
            lastX = x;
            
            container.scrollLeft = scrollLeft - walk;
            
            // Only prevent default if actually scrolling
            if (Math.abs(velocity) > 0.5) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    /**
     * Checks if scrolling is currently active
     * @returns {boolean} - Whether drag scrolling is active
     */
    function checkScrolling() {
        return isScrolling || isDown;
    }
    
    /**
     * Disables scrolling
     */
    function disable() {
        isDown = false;
        isScrolling = false;
        
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        
        if (container) {
            container.classList.remove('active');
            container.style.overflow = 'hidden';
        }
    }
    
    /**
     * Enables scrolling
     */
    function enable() {
        if (container) {
            container.style.overflow = 'scroll';
        }
    }
    
    // Public API
    return {
        setup,
        isScrolling: checkScrolling,
        disable,
        enable
    };
})(); 