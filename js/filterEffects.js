/**
 * filterEffects.js - Handles animation effects when filtering parallelepipeds
 */

const FilterEffects = (function() {
    let isAnimating = false;
    
    /**
     * First organizes items by filter, then splits shelves to show separation
     * @param {Array} matching - Array of matching film element IDs
     * @param {Array} nonMatching - Array of non-matching film element IDs
     */
    function splitShelvesForFilter(matching, nonMatching) {
        if (isAnimating) return; // Prevent overlapping animations
        isAnimating = true;
        
        // Get shelf containers
        const shelfContainers = document.querySelectorAll('.shelf-container');
        
        // Get elements by their IDs
        const matchingElements = matching.map(id => document.getElementById(id)).filter(Boolean);
        const nonMatchingElements = nonMatching.map(id => document.getElementById(id)).filter(Boolean);
        
        // First reorganize items (before any animation)
        reorganizeItems(matchingElements, nonMatchingElements);
        
        // Then split the shelves to show the separation
        gsap.to(shelfContainers, {
            duration: 0.8,
            stagger: 0.05,
            x: function(index) {
                // Odd shelves (0, 2, 4) go left, even shelves (1, 3, 5) go right
                return index % 2 === 0 ? -300 : 300;
            },
            ease: 'back.out(1.0)',
            onComplete: () => {
                isAnimating = false;
            }
        });
    }
    
    /**
     * Reset shelves to original state
     */
    function resetShelves() {
        if (isAnimating) return; // Prevent overlapping animations
        isAnimating = true;
        
        // Get shelf containers
        const shelfContainers = document.querySelectorAll('.shelf-container');
        
        // First bring shelves back together
        gsap.to(shelfContainers, {
            duration: 0.5,
            x: 0,
            stagger: 0.05,
            ease: 'back.out(0.7)',
            onComplete: () => {
                // After shelves are back together, reorganize items
                Bookshelf.reset();
                
                // Get all elements
                const allElements = Object.values(FilmData.elements);
                
                // Reorganize to original state
                allElements.forEach(element => {
                    // Reset transform and remove filter classes
                    element.style.transition = 'transform 0.5s ease-out';
                    // Use global DEFAULT_TRANSFORM
                    element.style.transform = window.DEFAULT_TRANSFORM;
                    element.classList.remove('matching', 'non-matching');
                    
                    // Add back to bookshelf
                    Bookshelf.addItem(element);
                });
                
                isAnimating = false;
            }
        });
    }
    
    /**
     * Reorganize items based on matching/non-matching status
     * @param {Array} matchingElements - Array of matching DOM elements
     * @param {Array} nonMatchingElements - Array of non-matching DOM elements
     */
    function reorganizeItems(matchingElements, nonMatchingElements) {
        // First detach all elements from current shelves
        [...matchingElements, ...nonMatchingElements].forEach(el => {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
        
        // Reset the bookshelf item counters
        Bookshelf.reset();
        
        // First place all matching items on the left (odd shelves: 0, 2, 4)
        const matchingShelves = document.querySelectorAll('.shelf-container:nth-child(odd) .shelf-items');
        distributeItems(matchingElements, matchingShelves);
        
        // Then place all non-matching items on the right (even shelves: 1, 3, 5)
        const nonMatchingShelves = document.querySelectorAll('.shelf-container:nth-child(even) .shelf-items');
        distributeItems(nonMatchingElements, nonMatchingShelves);
        
        // Add appropriate classes, but use the same transform for both
        matchingElements.forEach(el => {
            el.classList.add('matching');
            el.classList.remove('non-matching');
            el.style.transition = 'transform 0.5s ease-out';
            el.style.transform = window.DEFAULT_TRANSFORM;
        });
        
        nonMatchingElements.forEach(el => {
            el.classList.add('non-matching'); 
            el.classList.remove('matching');
            el.style.transition = 'transform 0.5s ease-out';
            el.style.transform = window.DEFAULT_TRANSFORM;
        });
    }
    
    /**
     * Distribute items evenly across provided shelves
     * @param {Array} items - Array of items to distribute
     * @param {NodeList} shelves - NodeList of shelf elements
     */
    function distributeItems(items, shelves) {
        if (!items.length || !shelves.length) return;
        
        // Calculate items per shelf
        const totalShelves = shelves.length;
        const totalItems = items.length;
        const itemsPerShelf = Math.ceil(totalItems / totalShelves);
        
        // Distribute items across shelves
        let currentShelfIndex = 0;
        let itemsInCurrentShelf = 0;
        
        items.forEach(item => {
            // If current shelf is full, move to next shelf
            if (itemsInCurrentShelf >= itemsPerShelf && currentShelfIndex < totalShelves - 1) {
                currentShelfIndex++;
                itemsInCurrentShelf = 0;
            }
            
            // Add item to current shelf
            if (currentShelfIndex < totalShelves) {
                shelves[currentShelfIndex].appendChild(item);
                itemsInCurrentShelf++;
            }
        });
    }
    
    // Public API
    return {
        splitShelvesForFilter,
        resetShelves
    };
})(); 