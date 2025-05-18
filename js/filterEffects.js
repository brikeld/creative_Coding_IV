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
        
        // First animate the parallelepipeds to their new positions
        animateItemsRepositioning(matchingElements, nonMatchingElements).then(() => {
            // After parallelepiped animation completes, split the shelves
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
                // After shelves are back together, reorganize items with animation
                Bookshelf.reset();
                
                // Get all elements
                const allElements = Object.values(FilmData.elements);
                
                // Animate back to original positions
                animateResetItems(allElements).then(() => {
                    isAnimating = false;
                });
            }
        });
    }
    
    /**
     * Animate repositioning of items based on matching/non-matching status
     * @param {Array} matchingElements - Array of matching DOM elements
     * @param {Array} nonMatchingElements - Array of non-matching DOM elements
     * @returns {Promise} - Promise that resolves when animation is complete
     */
    function animateItemsRepositioning(matchingElements, nonMatchingElements) {
        return new Promise((resolve) => {
            // Store current positions of all elements for animation
            const allElements = [...matchingElements, ...nonMatchingElements];
            const startPositions = allElements.map(el => {
                const rect = el.getBoundingClientRect();
                return {
                    element: el,
                    top: rect.top,
                    left: rect.left
                };
            });
            
            // Add appropriate classes, but keep elements in place for now
            matchingElements.forEach(el => {
                el.classList.add('matching');
                el.classList.remove('non-matching');
            });
            
            nonMatchingElements.forEach(el => {
                el.classList.add('non-matching'); 
                el.classList.remove('matching');
            });
            
            // First detach all elements from current shelves
            allElements.forEach(el => {
                if (el.parentNode) el.parentNode.removeChild(el);
            });
            
            // Reset the bookshelf item counters
            Bookshelf.reset();
            
            // Get shelf containers for distribution
            const matchingShelves = document.querySelectorAll('.shelf-container:nth-child(odd) .shelf-items');
            const nonMatchingShelves = document.querySelectorAll('.shelf-container:nth-child(even) .shelf-items');
            
            // Distribute to new positions without animation yet
            distributeItems(matchingElements, matchingShelves);
            distributeItems(nonMatchingElements, nonMatchingShelves);
            
            // Now get the end positions
            const endPositions = allElements.map(el => {
                const rect = el.getBoundingClientRect();
                return {
                    element: el,
                    top: rect.top,
                    left: rect.left
                };
            });
            
            // Set all elements to their starting positions using GSAP
            allElements.forEach((el, i) => {
                // Apply the common transform
                el.style.transform = window.DEFAULT_TRANSFORM;
                
                // Set initial position with GSAP
                const startPos = startPositions[i];
                const endPos = endPositions[i];
                const deltaX = startPos.left - endPos.left;
                const deltaY = startPos.top - endPos.top;
                
                gsap.set(el, {
                    x: deltaX,
                    y: deltaY,
                    opacity: 1
                });
            });
            
            // Animate to final positions
            gsap.to(allElements, {
                duration: 0.8,
                x: 0,
                y: 0,
                ease: "power3.inOut",
                stagger: 0.02,
                onComplete: resolve
            });
        });
    }
    
    /**
     * Animate items back to their original positions when resetting
     * @param {Array} allElements - All parallelepiped elements
     * @returns {Promise} - Promise that resolves when animation is complete
     */
    function animateResetItems(allElements) {
        return new Promise((resolve) => {
            // Store current positions for all elements
            const startPositions = allElements.map(el => {
                const rect = el.getBoundingClientRect();
                return {
                    element: el,
                    top: rect.top,
                    left: rect.left
                };
            });
            
            // Remove filter classes
            allElements.forEach(element => {
                element.classList.remove('matching', 'non-matching');
                element.style.transform = window.DEFAULT_TRANSFORM;
                
                // Add back to bookshelf
                Bookshelf.addItem(element);
            });
            
            // Get the end positions
            const endPositions = allElements.map(el => {
                const rect = el.getBoundingClientRect();
                return {
                    element: el,
                    top: rect.top,
                    left: rect.left
                };
            });
            
            // Set all elements to their starting positions using GSAP
            allElements.forEach((el, i) => {
                const startPos = startPositions[i];
                const endPos = endPositions[i];
                const deltaX = startPos.left - endPos.left;
                const deltaY = startPos.top - endPos.top;
                
                gsap.set(el, {
                    x: deltaX,
                    y: deltaY
                });
            });
            
            // Animate to final positions
            gsap.to(allElements, {
                duration: 1.8,
                x: 0,
                y: 0,
                ease: "power3.inOut",
                stagger: 1.02,
                onComplete: resolve
            });
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