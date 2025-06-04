/**
 * binaryFilter.js - Handles binary filter operations (matching/non-matching)
 */

const BinaryFilter = (function() {
    
    function splitShelvesForFilter(matching, nonMatching) {
        if (!AnimationUtils.startAnimation()) return;
        
        const bookshelf = document.querySelector('.bookshelf');
        if (bookshelf) bookshelf.classList.add('filtered');
        
        const shelfContainers = document.querySelectorAll('.shelf-container');
        const allElements = [...matching, ...nonMatching];
        
        // Store current positions for animation
        const startPositions = allElements.map(el => {
            const rect = el.getBoundingClientRect();
            return { element: el, top: rect.top, left: rect.left };
        });
        
        // Reset and redistribute items
        Bookshelf.reset();
        
        // Add items back in order
        const allItems = [...matching, ...nonMatching];
        allItems.forEach(item => {
            item.classList.remove('matching', 'non-matching');
            if (matching.includes(item)) {
                item.classList.add('matching');
            } else {
                item.classList.add('non-matching');
            }
            Bookshelf.addItem(item);
        });
        
        // Get end positions after redistribution
        const endPositions = allElements.map(el => {
            const rect = el.getBoundingClientRect();
            return { element: el, top: rect.top, left: rect.left };
        });
        
        // Set initial positions for animation
        allElements.forEach((el, i) => {
            // Don't override the CSS animation, just ensure base transform is applied
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
                ShelfManager.resizeShelvesBasedOnContent(true);
                const timeout = setTimeout(() => {
                    AnimationUtils.resetAnimationState();
                    EmptySpaceDetector.detectAndPlaceText();
                }, 100);
                AnimationUtils.addTimeout(timeout);
            }
        };
        
        // Animate shelves to left/right positions
        gsap.to(shelfContainers, {
            duration: Animations.timings.shelfSplit.duration,
            stagger: Animations.timings.shelfSplit.stagger,
            x: function(index) {
                const shelfItems = shelfContainers[index].querySelector('.shelf-items');
                if (shelfItems && shelfItems.childElementCount === 0) {
                    return 0;
                }
                return index % 2 === 0 ? Animations.spatial.shelfSeparation.left : Animations.spatial.shelfSeparation.right;
            },
            ease: Animations.timings.shelfSplit.ease,
            onComplete: checkAllComplete
        });
        
        // Animate items to their positions
        gsap.to(allElements, {
            duration: Animations.timings.itemsToPosition.duration,
            x: 0,
            y: 0,
            ease: Animations.timings.itemsToPosition.ease,
            stagger: Animations.timings.itemsToPosition.stagger,
            onComplete: checkAllComplete
        });
    }
    
    return {
        splitShelvesForFilter
    };
})(); 