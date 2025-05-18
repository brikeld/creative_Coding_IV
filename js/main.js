/**
 * main.js - Main initialization
 * Sets up and initializes the Film Visualizer application
 */

//fireBase

import Firebase from "./Firebase";

let firebaseInstance = null;


// Firebase
initFirebase();

function onFirebaseData(data) {
  console.log("**DATA**", data);
  // Check if the button exists before trying to click it
  const button = document.getElementById(data.id);
  if (button) {
    button.click();
  } else {
    console.warn(`Button with ID '${data.id}' not found`);
  }
}

function initFirebase() {
  firebaseInstance = new Firebase();
  firebaseInstance.addEventListener("dataReceived", (event) => {
    onFirebaseData(event);
  });
}


// Default 3D transform that should be applied consistently to all parallelepipeds
const DEFAULT_TRANSFORM = 'rotateX(-40deg) rotateY(0deg) ';


// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the bookshelf first
    Bookshelf.init();
    
    // Get the first shelf for loading indicator
    const firstShelf = document.querySelector('.shelf-items');
    
    // Create loading indicator and add to first shelf
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-indicator';
    loadingEl.textContent = 'Loading character data...';
    if (firstShelf) {
        firstShelf.appendChild(loadingEl);
    }
    
    // Clear image caches
    FilmData.clearImageCache();
    
    // Load character data first
    FilmData.loadCharacterData().then(() => {
        // Remove loading indicator
        if (loadingEl.parentNode) {
            loadingEl.parentNode.removeChild(loadingEl);
        }
        
        // Initialize - create all parallelepipeds and place them sequentially on shelves
        const films = FilmData.getAllFilms();
        
        // Batch process creation of elements
        requestAnimationFrame(() => {
            films.forEach((film) => {
                const element = Parallelepiped.create(film);
                
                // Explicitly set the initial transform to match our default
                element.style.transform = DEFAULT_TRANSFORM;
                
                Bookshelf.addItem(element);
                FilmData.elements[film.id] = element;
            });
            
            // Force a slight delay to ensure all elements have their correct transforms
            setTimeout(() => {
                Object.values(FilmData.elements).forEach(element => {
                    // Reapply the transform after a short delay to ensure consistency
                    element.style.transform = DEFAULT_TRANSFORM;
                });
            }, 100);
            
            // Expose API globally
            API.exposeGlobally();
            
            // Create global helper for Firebase testing
            window.triggerFilter = function(buttonId) {
                if (firebaseInstance) {
                    firebaseInstance.sendFilterCommand(buttonId);
                    return true;
                }
                return false;
            };
            
            // Helper function to list all available filter button IDs
            window.listFilterButtons = function() {
                const buttons = document.querySelectorAll('.filter-button');
                const buttonInfo = [];
                buttons.forEach(btn => {
                    buttonInfo.push({
                        id: btn.id,
                        text: btn.textContent,
                        category: btn.dataset.category || 'reset'
                    });
                });
                console.table(buttonInfo);
                return buttonInfo;
            };
            
            // Make the transform constant globally available
            window.DEFAULT_TRANSFORM = DEFAULT_TRANSFORM;
            
            // Setup filter controls
            createFilterUI();
            
            console.log('Film Visualizer initialized successfully');
        });
    }).catch(error => {
        // Show error message
        loadingEl.className = 'error-message';
        loadingEl.textContent = 'Error loading character data. Please check if testDoing.json is available.';
        console.error('Error initializing application:', error);
    });
});

/**
 * Creates the filter UI at the bottom of the page
 */
function createFilterUI() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    
    // Get filter categories
    const categories = FilmData.getFilterCategories();
    
    // First add a reset button
    const resetBtn = document.createElement('button');
    resetBtn.className = 'filter-button reset-filter';
    resetBtn.textContent = 'Reset Filters';
    resetBtn.id = 'reset_filters'; // Add ID for Firebase control
    resetBtn.addEventListener('click', () => {
        FilmData.clearFilter();
        resetFilterUI();
        FilterEffects.resetShelves(); // Use new reset animation
    });
    filterContainer.appendChild(resetBtn);
    
    // Priority order for categories - most important first
    const priorityOrder = [
        'demographics.gender', 
        'demographics.ethnicity', 
        'demographics.age_range',
        'personality_traits.introvert_extrovert',
        'personality_traits.biggest_strength.category',
        'personality_traits.biggest_fear.category',
        'moral_ambiguity.betrays_others',
        'background_history.tragic_past',
        'socioeconomic.income_level',
        'narrative_arc.goal_achievement',
        'narrative_arc.success_metrics',
        'relationships_family.parental_status',
        'relationships_family.siblings_status',
        'dialogue_analysis.swear_frequency'
    ];
    
    // Custom category display names mapping
    const categoryDisplayNames = {
        'personality_traits.introvert_extrovert': 'Personality Traits',
        'personality_traits.biggest_strength.category': 'Qualities',
        'personality_traits.biggest_fear.category': 'Biggest Fear'
    };
    
    // Add filter buttons by priority
    priorityOrder.forEach(categoryKey => {
        const values = categories[categoryKey];
        if (!values || values.length === 0) return;
        
        // Create category heading
        const categoryHeading = document.createElement('div');
        categoryHeading.className = 'filter-category';
        
        // Get the custom display name or format the default one
        let displayName;
        if (categoryDisplayNames[categoryKey]) {
            displayName = categoryDisplayNames[categoryKey];
        } else {
            // Format category name for display (original logic)
            displayName = categoryKey.split('.').pop().replace(/_/g, ' ');
        }
        
        categoryHeading.textContent = displayName;
        filterContainer.appendChild(categoryHeading);
        
        // Create filter buttons for each value
        values.sort().forEach(value => {
            const btn = document.createElement('button');
            btn.className = 'filter-button';
            btn.dataset.category = categoryKey;
            btn.dataset.value = value;
            btn.textContent = value;
            
            // Ensure buttons have consistent IDs for Firebase integration
            // Format: lowercase value with no spaces
            const buttonId = value.toLowerCase().replace(/\s+/g, '_');
            btn.id = buttonId;
            
            btn.addEventListener('click', (e) => {
                // Deactivate all buttons
                document.querySelectorAll('.filter-button').forEach(b => {
                    b.classList.remove('active');
                });
                
                // Activate clicked button
                e.target.classList.add('active');
                
                // Apply filter
                const filtered = FilmData.filterFilms(categoryKey, value);
                
                // Use new animation for filter
                FilterEffects.splitShelvesForFilter(filtered.matching, filtered.nonMatching);
            });
            
            filterContainer.appendChild(btn);
        });
    });
    
    // Append filter container to the body
    document.body.appendChild(filterContainer);
}

/**
 * Resets the filter UI
 */
function resetFilterUI() {
    document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('active');
    });
} 