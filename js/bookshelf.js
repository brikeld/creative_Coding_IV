/**
 * bookshelf.js - Handles bookshelf management for parallelepiped placement
 */

const Bookshelf = (function() {
    // Keep track of shelf capacities and fill levels
    const shelves = [];
    
    /**
     * Initialize the bookshelf
     */
    function init() {
        // Get all shelf item containers
        const shelfItems = document.querySelectorAll('.shelf-items');
        
        // Initialize shelf tracking array
        shelfItems.forEach((shelf, index) => {
            shelves.push({
                element: shelf,
                index: index,
                items: 0,
                // Use fixed capacity of 6 items per shelf
                capacity: 6
            });
        });
        
        console.log('Bookshelf initialized with shelf capacities:', 
            shelves.map(s => s.capacity)
        );
    }
    
    /**
     * Add an item to the next available spot on the bookshelf
     * @param {HTMLElement} item - The item to add
     * @returns {boolean} - Whether the item was successfully added
     */
    function addItem(item) {
        // Find the first shelf with available space
        for (const shelf of shelves) {
            if (shelf.items < shelf.capacity) {
                // Important: We need to preserve any transforms already set on the item
                const currentTransform = item.style.transform;
                
                shelf.element.appendChild(item);
                shelf.items++;
                
                // Make sure the transform is preserved after appending
                if (currentTransform) {
                    // Force a repaint to ensure the transform is applied correctly
                    void item.offsetWidth;
                    item.style.transform = currentTransform;
                }
                
                return true;
            }
        }
        
        // If all shelves are full, add to the last shelf anyway
        const lastShelf = shelves[shelves.length - 1];
        const currentTransform = item.style.transform;
        
        lastShelf.element.appendChild(item);
        lastShelf.items++;
        
        // Make sure the transform is preserved after appending
        if (currentTransform) {
            // Force a repaint to ensure the transform is applied correctly
            void item.offsetWidth;
            item.style.transform = currentTransform;
        }
        
        return true;
    }
    
    /**
     * Reset the bookshelf by clearing all items
     */
    function reset() {
        shelves.forEach(shelf => {
            shelf.element.innerHTML = '';
            shelf.items = 0;
            // Show all shelves when resetting
            const container = shelf.element.closest('.shelf-container');
            if (container) {
                container.style.display = 'block';
            }
        });
    }
    
    /**
     * Get all shelf elements
     * @returns {Array} Array of shelf elements
     */
    function getShelves() {
        return [...shelves];
    }
    
    /**
     * Add multiple items to the bookshelf at once
     * @param {Array} items - Array of items to add
     */
    function addItems(items) {
        items.forEach(item => addItem(item));
        
        // Hide empty shelves after adding all items
        hideEmptyShelves();
        
        // Resize shelves after adding items
        if (typeof FilterEffects !== 'undefined' && 
            FilterEffects.resizeShelvesBasedOnContent) {
            FilterEffects.resizeShelvesBasedOnContent();
        }
    }
    
    /**
     * Hide shelves that have no items
     */
    function hideEmptyShelves() {
        shelves.forEach(shelf => {
            const container = shelf.element.closest('.shelf-container');
            if (container) {
                if (shelf.items === 0) {
                    container.style.display = 'none';
                } else {
                    container.style.display = 'block';
                }
            }
        });
    }
    
    // Public API
    return {
        init,
        addItem,
        reset,
        getShelves,
        addItems,
        hideEmptyShelves
    };
})(); 