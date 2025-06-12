/**
 * animations.js - Animation settings for parallelepipeds and shelves
 * Centralizes all animation configurations for the film visualization
 */

const Animations = (function() {
    // Animation timings
    const timings = {
        // Shelf movement animations
        shelfSplit: {
            duration: 1.5,
            stagger: 0.15,
            ease: 'power3.out'
        },
        shelfReset: {
            duration: 0.5,
            stagger: 0.05,
            ease: 'back.out(0.7)'
        },
        // Parallelepiped movement animations
        itemsToPosition: {
            duration: 2,
            stagger: 0.01,
            ease: "power2.out",
        },
        itemsReset: {
            duration: 0.8, // Changed from 1.8 to 0.8 for faster reset
            stagger: 0.15, // Changed from 1.02 to 0.15 for smoother reset
            ease: 'power3.inOut'
        },
        // Shelf width/sizing animations
        shelfResize: {
            duration: .5,
            ease: "elastic.in(5,0.3)",
        }
    };
    
    // Spatial configurations
    const spatial = {
        // Shelf separation distance when filtered (matching left, non-matching right)
        shelfSeparation: {

        },

    };
    
    // Shelf item capacity
    const capacity = {
        get itemsPerShelf() {
            // Return 9 for both initial screen and filtering
            return 9;
        }
    };
    
    // Public API
    return {
        timings,
        spatial,
        capacity
    };
})(); 