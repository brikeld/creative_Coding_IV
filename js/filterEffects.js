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
        // Add filtered class to bookshelf for gap animation
        const bookshelf = document.querySelector('.bookshelf');
        if (bookshelf) bookshelf.classList.add('filtered');
        
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
        // Remove filtered class from bookshelf for gap animation
        const bookshelf = document.querySelector('.bookshelf');
        if (bookshelf) bookshelf.classList.remove('filtered');
        
        // Get shelf containers
        const shelfContainers = document.querySelectorAll('.shelf-container');
        
        // Remove existing group labels
        document.querySelectorAll('.group-label').forEach(label => label.remove());
        
        // Remove the filter-related classes and reset opacity
        shelfContainers.forEach(container => {
            container.classList.remove('matching-shelf', 'non-matching-shelf');
            container.style.opacity = '1';  // Reset opacity for all shelves
            container.style.display = 'block';  // Reset display for all shelves
            container.dataset.isEmpty = 'false';  // Reset empty state
            // Remove group classes
            container.className = container.className.replace(/group-\d+-shelf/g, '');
            delete container.dataset.groupKey;
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
            // Remove group classes
            element.className = element.className.replace(/group-\d+/g, '');
            element.classList.remove('group-grayscale');
            delete element.dataset.groupKey;
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
        
        // Use actual parallelepiped dimensions: 47px width + 20px gap
        const itemWidth = 67; // 47px + 20px gap
        const padding = 40; // Reduced padding for better fit
        
        shelfContainers.forEach(container => {
            const shelfItems = container.querySelector('.shelf-items');
            const itemsCount = shelfItems.childElementCount;
            
            // Calculate width based on actual items with proper spacing
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
        
        const shelfCapacity = Animations.capacity.itemsPerShelf;
        let currentIndex = 0;
        
        // Calculate how many items per shelf
        const itemsPerShelf = Math.min(items.length, shelfCapacity);
        
        // Distribute items across shelves, maintaining row alignment
        while (currentIndex < items.length) {
            const targetShelfIndex = Math.floor(currentIndex / itemsPerShelf);
            if (targetShelfIndex < shelves.length) {
                const shelf = shelves[targetShelfIndex];
                shelf.appendChild(items[currentIndex]);
            } else {
                // If we run out of shelves, add to the last shelf
                shelves[shelves.length - 1].appendChild(items[currentIndex]);
            }
            currentIndex++;
        }
        
        // Handle empty shelf visibility
        Array.from(shelves).forEach((shelf, index) => {
            const container = shelf.closest('.shelf-container');
            if (container) {
                if (shelf.childElementCount === 0) {
                    container.style.opacity = '0';
                    container.dataset.isEmpty = 'true';
                } else {
                    container.style.opacity = '1';
                    container.dataset.isEmpty = 'false';
                }
            }
        });
    }
    
    /**
     * Arranges shelves for multiple groups based on category filtering
     * @param {Object} groups - Object with group names as keys and film ID arrays as values
     */
    function arrangeShelvesForGroups(groups) {
        if (isAnimating) return;
        isAnimating = true;
        
        const bookshelf = document.querySelector('.bookshelf');
        if (bookshelf) bookshelf.classList.add('filtered');
        
        const shelfContainers = document.querySelectorAll('.shelf-container');
        const groupKeys = Object.keys(groups);
        const groupCount = groupKeys.length;
        
        // Calculate highest earning group
        let highestEarningGroup = '';
        let highestEarnings = 0;
        
        groupKeys.forEach(groupKey => {
            const groupTotal = groups[groupKey].reduce((sum, filmId) => {
                const film = FilmData.getAllFilms().find(f => f.id === filmId);
                return sum + (film?.film_info?.box_office || 0);
            }, 0);
            
            console.log(`Group ${groupKey}: $${groupTotal.toLocaleString()}`);
            
            if (groupTotal > highestEarnings) {
                highestEarnings = groupTotal;
                highestEarningGroup = groupKey;
            }
        });
        
        console.log(`Highest earning group: ${highestEarningGroup} with $${highestEarnings.toLocaleString()}`);
        
        // Remove existing group labels
        document.querySelectorAll('.group-label').forEach(label => label.remove());
        
        // IMPORTANT: Get all elements BEFORE clearing shelves
        const groupElementsMap = {};
        const allElements = [];
        
        groupKeys.forEach(groupKey => {
            const elements = groups[groupKey].map(id => document.getElementById(id)).filter(Boolean);
            groupElementsMap[groupKey] = elements;
            allElements.push(...elements);
        });
        
        // Store current positions for animation
        const startPositions = allElements.map(el => {
            const rect = el.getBoundingClientRect();
            return { element: el, top: rect.top, left: rect.left };
        });
        
        // Clear all shelves and reset tracking
        Bookshelf.reset();
        
        // Distribute groups across shelves using preserved element references
        let shelfIndex = 0;
        const usedShelves = [];
        
        groupKeys.forEach((groupKey, groupIndex) => {
            const groupElements = groupElementsMap[groupKey];
            if (groupElements.length === 0) return; // Skip empty groups
            
            const isHighestEarning = groupKey === highestEarningGroup;
            console.log(`Group ${groupKey} (index ${groupIndex}): isHighestEarning = ${isHighestEarning}`);
            
            // Add group-specific classes
            groupElements.forEach(el => {
                el.classList.remove('matching', 'non-matching');
                // Remove any existing group classes
                el.className = el.className.replace(/group-\d+/g, '');
                el.classList.remove('group-grayscale');
                
                if (isHighestEarning) {
                    el.classList.add(`group-${groupIndex}`); // Only highest earning gets color
                    console.log(`Adding color class group-${groupIndex} to element`, el.id);
                } else {
                    el.classList.add('group-grayscale');
                    console.log(`Adding grayscale class to element`, el.id);
                }
                el.dataset.groupKey = groupKey;
            });
            
            // Distribute this group's items across available shelves
            const shelvesForGroup = Math.ceil(groupElements.length / Animations.capacity.itemsPerShelf);
            
            for (let i = 0; i < shelvesForGroup && shelfIndex < shelfContainers.length; i++) {
                const shelf = shelfContainers[shelfIndex].querySelector('.shelf-items');
                const startIdx = i * Animations.capacity.itemsPerShelf;
                const endIdx = Math.min(startIdx + Animations.capacity.itemsPerShelf, groupElements.length);
                
                for (let j = startIdx; j < endIdx; j++) {
                    if (groupElements[j]) {
                        shelf.appendChild(groupElements[j]);
                    }
                }
                
                // Mark shelf container with group info
                shelfContainers[shelfIndex].classList.add(`group-${groupIndex}-shelf`);
                shelfContainers[shelfIndex].dataset.groupKey = groupKey;
                shelfContainers[shelfIndex].style.display = 'block';
                usedShelves.push(shelfIndex);
                shelfIndex++;
            }
            
            // Create group label after the last shelf of this group
            const lastShelf = shelfContainers[shelfIndex - 1];
            const label = document.createElement('div');
            label.className = 'group-label';
            label.textContent = groupKey;
            label.style.cssText = `
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                color: white;
                font-family: 'Input Mono', monospace;
                font-size: 0.8rem;
                margin-top: 10px;
                text-align: center;
                white-space: nowrap;
                z-index: 10;
            `;
            lastShelf.appendChild(label);
        });
        
        // Hide unused shelves completely
        shelfContainers.forEach((container, index) => {
            if (!usedShelves.includes(index)) {
                container.style.display = 'none';
            }
        });
        
        // Get end positions after redistribution
        const endPositions = allElements.map(el => {
            const rect = el.getBoundingClientRect();
            return { element: el, top: rect.top, left: rect.left };
        });
        
        // Set initial positions for animation
        allElements.forEach((el, i) => {
            el.style.transform = window.DEFAULT_TRANSFORM;
            const startPos = startPositions[i];
            const endPos = endPositions[i];
            const deltaX = startPos.left - endPos.left;
            const deltaY = startPos.top - endPos.top;
            
            gsap.set(el, { x: deltaX, y: deltaY, opacity: 1 });
        });
        
        let animationsComplete = 0;
        const totalAnimations = 2;
        const checkAllComplete = () => {
            animationsComplete++;
            if (animationsComplete >= totalAnimations) {
                resizeShelvesBasedOnContent(true);
                isAnimating = false;
            }
        };
        
        // Calculate shelf positions for groups with efficient screen usage
        const availableWidth = window.innerWidth - 200; // Leave margins
        const shelfSpacing = Math.max(300, availableWidth / (groupCount + 1));
        
        // Animate shelves to group positions
        usedShelves.forEach((shelfIndex, arrayIndex) => {
            const container = shelfContainers[shelfIndex];
            const groupIndex = parseInt(container.className.match(/group-(\d+)-shelf/)?.[1] || '0');
            const xPosition = (groupIndex - (groupCount - 1) / 2) * shelfSpacing;
            
            gsap.to(container, {
                duration: Animations.timings.shelfSplit.duration,
                x: xPosition,
                ease: Animations.timings.shelfSplit.ease,
                onComplete: arrayIndex === 0 ? checkAllComplete : undefined
            });
        });
        
        // Animate items to their new positions
        gsap.to(allElements, {
            duration: Animations.timings.itemsToPosition.duration,
            x: 0,
            y: 0,
            ease: Animations.timings.itemsToPosition.ease,
            stagger: Animations.timings.itemsToPosition.stagger,
            onComplete: checkAllComplete
        });
    }
    
    // Public API
    return {
        splitShelvesForFilter,
        resetShelves,
        resizeShelvesBasedOnContent,
        arrangeShelvesForGroups
    };
})(); 