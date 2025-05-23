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
        
        // Store all elements for animation
        const allElements = [...matchingElements, ...nonMatchingElements];
        
        // Store current positions of all elements for animation
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
        
        // Distribute to new positions without animation yet - use more compact distribution
        distributeItems(matchingElements, matchingShelves, true);
        distributeItems(nonMatchingElements, nonMatchingShelves, true);
        
        // Apply CSS classes to shelves for matching/non-matching state
        shelfContainers.forEach((container, index) => {
            if (index % 2 === 0) {
                container.classList.add('matching-shelf');
                container.classList.remove('non-matching-shelf');
            } else {
                container.classList.add('non-matching-shelf');
                container.classList.remove('matching-shelf');
            }
        });
        
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
        
        // Counter to track when both animations are complete
        let animationsComplete = 0;
        const checkAllComplete = () => {
            animationsComplete++;
            if (animationsComplete >= 2) {
                // Both animations are done
                isAnimating = false;
            }
        };
        
        // Resize shelves based on content - do this immediately before animations start
        resizeShelvesBasedOnContent(true);
        
        // Run both animations concurrently
        
        // 1. Split the shelves
        gsap.to(shelfContainers, {
            duration: Animations.timings.shelfSplit.duration,
            stagger: Animations.timings.shelfSplit.stagger,
            x: function(index) {
                // Only apply splitting to shelves that have content
                const shelfItems = shelfContainers[index].querySelector('.shelf-items');
                if (shelfItems && shelfItems.childElementCount === 0) {
                    return 0; // Don't move empty shelves
                }
                
                // Odd shelves (0, 2, 4) go left, even shelves (1, 3, 5) go right
                return index % 2 === 0 ? Animations.spatial.shelfSeparation.left : Animations.spatial.shelfSeparation.right;
            },
            ease: Animations.timings.shelfSplit.ease,
            onComplete: checkAllComplete
        });
        
        // 2. Animate parallelepipeds to their positions
        gsap.to(allElements, {
            duration: Animations.timings.itemsToPosition.duration,
            x: 0,
            y: 0,
            ease: Animations.timings.itemsToPosition.ease,
            stagger: Animations.timings.itemsToPosition.stagger,
            onComplete: checkAllComplete
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
        
        // Remove the filter-related classes and reset opacity
        shelfContainers.forEach(container => {
            container.classList.remove('matching-shelf', 'non-matching-shelf');
            container.style.opacity = '1';  // Reset opacity for all shelves
            container.dataset.isEmpty = 'false';  // Reset empty state
        });
        
        // First reset the bookshelf item tracking
        Bookshelf.reset();
        
        // Get all parallelepiped elements
        const allElements = Object.values(FilmData.elements);
        
        // Store current positions for all elements before moving anything
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
        
        // Get the end positions after adding to bookshelf
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
        
        // Counter to track when both animations are complete
        let animationsComplete = 0;
        const checkAllComplete = () => {
            animationsComplete++;
            if (animationsComplete >= 2) {
                // Both animations are done
                resizeShelvesBasedOnContent(false);
                isAnimating = false;
            }
        };
        
        // Run both animations concurrently
        
        // 1. Bring shelves back together
        gsap.to(shelfContainers, {
            duration: Animations.timings.shelfReset.duration,
            x: 0,
            stagger: Animations.timings.shelfReset.stagger,
            ease: Animations.timings.shelfReset.ease,
            onComplete: checkAllComplete
        });
        
        // 2. Animate parallelepipeds to their final positions
        gsap.to(allElements, {
            duration: Animations.timings.itemsReset.duration,
            x: 0,
            y: 0,
            ease: Animations.timings.itemsReset.ease,
            stagger: Animations.timings.itemsReset.stagger,
            onComplete: checkAllComplete
        });
    }
    
    /**
     * Dynamically resize shelves based on their content
     * @param {boolean} isFiltered - Whether we're in filtered mode (more compact) or not
     */
    function resizeShelvesBasedOnContent(isFiltered = false) {
        const shelfContainers = document.querySelectorAll('.shelf-container');
        const minShelfWidth = Animations.spatial.minShelfWidth;
        
        // Use more compact spacing when filtered
        const config = isFiltered ? Animations.spatial.itemSpacing.filtered : Animations.spatial.itemSpacing.normal;
        const itemWidth = config.itemWidth;
        const padding = config.padding;
        
        shelfContainers.forEach(container => {
            const shelfItems = container.querySelector('.shelf-items');
            const itemsCount = shelfItems.childElementCount;
            
            // Calculate width based on number of items
            const calculatedWidth = Math.max(minShelfWidth, (itemsCount * itemWidth) + padding);
            
            // Apply width to container, shelf and items
            gsap.to(container, {
                width: calculatedWidth,
                duration: Animations.timings.shelfResize.duration,
                ease: Animations.timings.shelfResize.ease
            });
            
            gsap.to(container.querySelector('.shelf'), {
                width: calculatedWidth,
                duration: Animations.timings.shelfResize.duration,
                ease: Animations.timings.shelfResize.ease
            });
        });
    }
    
    /**
     * Distribute items evenly across provided shelves
     * @param {Array} items - Array of items to distribute
     * @param {NodeList} shelves - NodeList of shelf elements
     * @param {boolean} isCompact - Whether to use compact distribution
     */
    function distributeItems(items, shelves, isCompact = false) {
        if (!items.length || !shelves.length) return;
        
        // Maximum capacity per shelf
        const shelfCapacity = Animations.capacity.itemsPerShelf;
        
        // Clear any distribution tracking
        let currentShelfIndex = 0;
        
        // Add each item to the current shelf until it's full, then move to next shelf
        items.forEach(item => {
            if (currentShelfIndex >= shelves.length) {
                // If we've run out of shelves, add to the last shelf anyway
                shelves[shelves.length - 1].appendChild(item);
                return;
            }
            
            const currentShelf = shelves[currentShelfIndex];
            currentShelf.appendChild(item);
            
            // If we've reached capacity for this shelf, move to the next one
            if (currentShelf.childElementCount >= shelfCapacity && currentShelfIndex < shelves.length - 1) {
                currentShelfIndex++;
            }
        });
        
        // Hide empty shelves by not transforming them and making them transparent
        Array.from(shelves).forEach((shelf, index) => {
            const container = shelf.closest('.shelf-container');
            if (shelf.childElementCount === 0 && container) {
                container.style.opacity = '0';
                container.dataset.isEmpty = 'true';
            } else if (container) {
                container.style.opacity = '1';
                container.dataset.isEmpty = 'false';
            }
        });
    }
    
    // Public API
    return {
        splitShelvesForFilter,
        resetShelves,
        resizeShelvesBasedOnContent
    };
})(); 