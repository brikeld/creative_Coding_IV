/**
 * filterEffects.js - Main controller for filter operations
 * Coordinates between different filter modules
 */

const FilterEffects = (function() {
    
    // Public API that delegates to appropriate modules
    function splitShelvesForFilter(matching, nonMatching) {
        BinaryFilter.splitShelvesForFilter(matching, nonMatching);
    }
    
    function arrangeShelvesForGroups(groups) {
        GroupFilter.arrangeShelvesForGroups(groups);
    }
    
    function resetShelves() {
        ShelfManager.resetShelves();
    }
    
    function resizeShelvesBasedOnContent(isFiltered = false) {
        ShelfManager.resizeShelvesBasedOnContent(isFiltered);
    }
    
    return {
        splitShelvesForFilter,
        arrangeShelvesForGroups,
        resetShelves,
        resizeShelvesBasedOnContent
    };
})(); 