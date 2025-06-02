/**
 * shelfManager.js - Handles shelf sizing, distribution, and reset operations
 */

const ShelfManager = (function() {
    
    function resizeShelvesBasedOnContent(isFiltered = false) {
        const shelfContainers = document.querySelectorAll('.shelf-container');
        const minShelfWidth = Animations.spatial.minShelfWidth;
        
        const itemWidth = 75;
        const padding = 60;
        
        shelfContainers.forEach(container => {
            const shelfItems = container.querySelector('.shelf-items');
            const itemsCount = shelfItems.childElementCount;
            
            const calculatedWidth = Math.max(minShelfWidth, (itemsCount * itemWidth) + padding);
            
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
    
    function distributeItems(items, shelves, isCompact = false) {
        if (!items.length || !shelves.length) return;
        
        const shelfCapacity = Animations.capacity.itemsPerShelf;
        let currentIndex = 0;
        
        const itemsPerShelf = Math.min(items.length, shelfCapacity);
        
        while (currentIndex < items.length) {
            const targetShelfIndex = Math.floor(currentIndex / itemsPerShelf);
            if (targetShelfIndex < shelves.length) {
                const shelf = shelves[targetShelfIndex];
                shelf.appendChild(items[currentIndex]);
            } else {
                shelves[shelves.length - 1].appendChild(items[currentIndex]);
            }
            currentIndex++;
        }
        
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
    
    function resetShelves() {
        if (!AnimationUtils.startAnimation()) return;
        
        const bookshelf = document.querySelector('.bookshelf');
        if (bookshelf) bookshelf.classList.remove('filtered');
        
        const shelfContainers = document.querySelectorAll('.shelf-container');
        
        // Clean up
        document.querySelectorAll('.group-label').forEach(label => label.remove());
        
        shelfContainers.forEach(container => {
            container.classList.remove('matching-shelf', 'non-matching-shelf');
            container.style.opacity = '1';
            container.style.display = 'block';
            container.dataset.isEmpty = 'false';
            container.className = container.className.replace(/group-\d+-shelf/g, '');
            delete container.dataset.groupKey;
            container.style.transform = '';
            // Reset absolute positioning from group filter
            container.style.position = '';
            container.style.left = '';
            container.style.top = '';
        });
        
        Bookshelf.reset();
        
        const allElements = Object.values(FilmData.elements);
        
        const startPositions = allElements.map(el => {
            const rect = el.getBoundingClientRect();
            return { element: el, top: rect.top, left: rect.left };
        });
        
        allElements.forEach(element => {
            element.classList.remove('matching', 'non-matching');
            element.className = element.className.replace(/group-\d+/g, '');
            element.classList.remove('group-grayscale');
            element.classList.remove('group-float');
            
            // Clean up CSS custom properties
            element.style.removeProperty('--float-duration');
            element.style.removeProperty('--float-delay');
            element.style.removeProperty('--translate-end');
            element.style.removeProperty('--rotate-z-end');
            element.style.removeProperty('--rotate-start');
            
            delete element.dataset.groupKey;
            element.style.transform = window.DEFAULT_TRANSFORM;
            
            Bookshelf.addItem(element);
        });
        
        const endPositions = allElements.map(el => {
            const rect = el.getBoundingClientRect();
            return { element: el, top: rect.top, left: rect.left };
        });
        
        allElements.forEach((el, i) => {
            const startPos = startPositions[i];
            const endPos = endPositions[i];
            const deltaX = startPos.left - endPos.left;
            const deltaY = startPos.top - endPos.top;
            
            gsap.set(el, { x: deltaX, y: deltaY, opacity: 1 });
        });
        
        let animationsComplete = 0;
        const checkAllComplete = () => {
            animationsComplete++;
            if (animationsComplete >= 2) {
                const timeout = setTimeout(() => {
                    AnimationUtils.resetAnimationState();
                }, 100);
                AnimationUtils.addTimeout(timeout);
            }
        };
        
        resizeShelvesBasedOnContent(false);
        
        gsap.to(shelfContainers, {
            duration: Animations.timings.shelfReset.duration,
            x: 0,
            y: 0,
            stagger: Animations.timings.shelfReset.stagger,
            ease: Animations.timings.shelfReset.ease,
            onComplete: checkAllComplete
        });
        
        gsap.to(allElements, {
            duration: Animations.timings.itemsReset.duration,
            x: 0,
            y: 0,
            ease: Animations.timings.itemsReset.ease,
            stagger: Animations.timings.itemsReset.stagger,
            onComplete: checkAllComplete
        });
    }
    
    return {
        resizeShelvesBasedOnContent,
        distributeItems,
        resetShelves
    };
})(); 