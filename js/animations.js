/**
 * animations.js - Animation settings for parallelepipeds and shelves
 * Centralizes all animation configurations for the film visualization
 */

const Animations = (function() {
    // Animation timings
    const timings = {
        // Shelf movement animations
        shelfSplit: {
            duration: 0.8,
            stagger: 0.05,
            ease: 'back.out(1.0)'
        },
        shelfReset: {
            duration: 0.5,
            stagger: 0.05,
            ease: 'back.out(0.7)'
        },
        // Parallelepiped movement animations
        itemsToPosition: {
            duration: .1,
            stagger: 0.02,
            ease: "back.in(1.7)",
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
            left: -505,
            right: 380
        },
        // Item spacing configurations
        itemSpacing: {
            filtered: {
                itemWidth: 65,
                padding: 40
            },
            normal: {
                itemWidth: 75,
                padding: 60
            }
        },
        // Minimum shelf width
        minShelfWidth: 180
    };
    
    // Shelf item capacity
    const capacity = {
        itemsPerShelf: 6
    };
    
    // Public API
    return {
        timings,
        spatial,
        capacity
    };
})(); 