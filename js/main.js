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
  // Firebase passes data as array, get first element
  const receivedData = Array.isArray(data) ? data[0] : data;
  const buttonId = receivedData.id;
  
  // Check if the button exists before trying to click it
  const button = document.getElementById(buttonId);
  if (button) {
    console.log(`🎯 Triggering button: ${buttonId}`);
    button.click();
  } else {
    console.warn(`Button with ID '${buttonId}' not found`);
  }
}

function initFirebase() {
  firebaseInstance = new Firebase();
  firebaseInstance.addEventListener("dataReceived", (event) => {
    onFirebaseData(event);
  });
}


// Default 3D transform that should be applied consistently to all parallelepipeds
const getBaseTransform = () => `rotateX(-40deg) rotateY(0deg) `;

function initMainApp() {
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
            const elements = [];
            films.forEach((film) => {
                const element = Parallelepiped.create(film);
                
                // Set the base transform (Y rotation handled by CSS animation)
                element.style.transform = getBaseTransform();
                
                elements.push(element);
                FilmData.elements[film.id] = element;
            });
            
            // Add all elements at once
            Bookshelf.addItems(elements);
            
            // Force a slight delay to ensure all elements have their correct transforms
            setTimeout(() => {
                Object.values(FilmData.elements).forEach(element => {
                    // Apply base transform (Y rotation handled by CSS animation)
                    element.style.transform = getBaseTransform();
                });
            }, 100);
            
            // Initialize box office display
            // BoxOfficeDisplay.init();
            
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

            // Test function for film communication
            window.testFilmCommunication = function(filmName) {
                const filmIds = {
                    'ANORA': 'film-anora',
                    'Inception': 'film-inception', 
                    'Dune': 'film-dune'
                };
                const filmId = filmIds[filmName] || filmName;
                if (firebaseInstance) {
                    firebaseInstance.sendFilterCommand(filmId);
                    console.log(`🧪 Testing film communication: ${filmName} → ${filmId}`);
                    return true;
                }
                return false;
            };

            // Test function for film highlighting (direct)
            window.testFilmHighlight = function(filmId) {
                FilmHighlight.highlightFilm(filmId);
                console.log(`🎯 Testing film highlight: ${filmId}`);
            };

            // Debug function to list all film buttons
            window.listFilmButtons = function() {
                const filmButtons = document.querySelectorAll('[id^="film-"]');
                console.log(`📋 Found ${filmButtons.length} film buttons:`);
                filmButtons.forEach(btn => console.log(`  - ${btn.id}`));
                return Array.from(filmButtons).map(btn => btn.id);
            };
            
            // Make the transform function globally available
            window.DEFAULT_TRANSFORM = getBaseTransform;
            
            // Setup filter API (no UI, just functionality)
            setupFilterAPI();
            
            console.log('Film Visualizer initialized successfully');
        });
    }).catch(error => {
        // Show error message
        loadingEl.className = 'error-message';
        loadingEl.textContent = 'Error loading character data. Please check if testDoing.json is available.';
        console.error('Error initializing application:', error);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Start with intro screen
    IntroScreen.init(initMainApp);
});

/**
 * Sets up filter API functions for external control (no UI)
 */
function setupFilterAPI() {
    const priorityOrder = [
        'demographics.gender', 
        'demographics.ethnicity', 
        'demographics.age_range',
        'personality_traits.introvert_extrovert',
        'personality_traits.biggest_strength.category',
        'personality_traits.biggest_fear.category',
        'personality_traits.moral_ambiguity.betrays_others',
        'background_history.tragic_past',
        'socioeconomic.income_level',
        'narrative_arc.goal_achievement',
        'relationships_family.parental_status',
        'dialogue_analysis.swear_frequency'
    ];

    // Create invisible buttons for Firebase integration
    const hiddenContainer = document.createElement('div');
    hiddenContainer.style.display = 'none';
    
    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.id = 'reset_filters';
    resetBtn.addEventListener('click', () => {
        EmptySpaceDetector.clearText();
        FilmHighlight.clearAllLifts(); // Clear lifted films when resetting
        FilmData.clearFilter();
        FilterEffects.resetShelves();
    });
    hiddenContainer.appendChild(resetBtn);
    
    // Category buttons
    priorityOrder.forEach(categoryKey => {
        const btn = document.createElement('button');
        // Special case for moral_ambiguity to match mobile app expectation
        if (categoryKey === 'personality_traits.moral_ambiguity.betrays_others') {
            btn.id = 'moral_ambiguity_betrays_others';
        } else {
            btn.id = categoryKey.toLowerCase().replace(/\./g, '_').replace(/\s+/g, '_');
        }
        btn.addEventListener('click', () => {
            EmptySpaceDetector.clearText();
            FilmHighlight.clearAllLifts(); // Clear lifted films before filtering
            const groups = FilmData.groupFilmsByCategory(categoryKey);
            FilterEffects.arrangeShelvesForGroups(groups);
        });
        hiddenContainer.appendChild(btn);
    });

    // Film buttons for cross-app communication
    const FILM_IDS = {
        'ANORA': 'film-anora',
        'No Country for Old Men': 'film-no-country-for-old-men',
        '1917': 'film-1917',
        'Schindler\'s List': 'film-schindler-s-list',
        'Titanic': 'film-titanic',
        'American Beauty': 'film-american-beauty',
        'Gladiator': 'film-gladiator',
        'A Beautiful Mind': 'film-a-beautiful-mind',
        'Crash': 'film-crash',
        'The Departed': 'film-the-departed',
        'Birdman': 'film-birdman',
        '12 Years a Slave': 'film-12-years-a-slave',
        'Spotlight': 'film-spotlight',
        'Moonlight': 'film-moonlight',
        'Napoleon': 'film-napoleon',
        'Shutter Island': 'film-shutter-island',
        'The Martian': 'film-the-martian',
        'Amélie': 'film-am-lie',
        'The Return of the King': 'film-the-return-of-the-king',
        'The King\'s Speech': 'film-the-king-s-speech',
        'The Shape of Water': 'film-the-shape-of-water',
        'Green Book': 'film-green-book',
        'Parasite': 'film-parasite',
        'Nomadland': 'film-nomadland',
        'Anatomy of a Fall': 'film-anatomy-of-a-fall',
        'All Quiet on the Western Front': 'film-all-quiet-on-the-western-front',
        'Everything Everywhere All At Once': 'film-everything-everywhere-all-at-once',
        'CODA': 'film-coda',
        'Baby Driver': 'film-baby-driver',
        'House of Gucci': 'film-house-of-gucci',
        'Inception': 'film-inception',
        'Ferrari': 'film-ferrari',
        'Her': 'film-her',
        'Kill Bill: Vol. 1': 'film-kill-bill--vol--1',
        'Kill Bill: Vol. 2': 'film-kill-bill--vol--2',
        'American Hustle': 'film-american-hustle',
        'Conclave': 'film-conclave',
        'Don\'t Look Up': 'film-don-t-look-up',
        'Drive': 'film-drive',
        'Dunkirk': 'film-dunkirk',
        'Focus': 'film-focus',
        'Gladiator 2': 'film-gladiator-2',
        'Girl with a Pearl Earring': 'film-girl-with-a-pearl-earring',
        'Ford v Ferrari': 'film-ford-v-ferrari',
        'Maestro': 'film-maestro',
        'Moneyball': 'film-moneyball',
        'Memoirs of a Geisha': 'film-memoirs-of-a-geisha',
        'Midnight in Paris': 'film-midnight-in-paris',
        'Mank': 'film-mank',
        'Oppenheimer': 'film-oppenheimer',
        'The Brutalist': 'film-the-brutalist',
        'Arrival': 'film-arrival',
        'Asteroid City': 'film-asteroid-city',
        'Barbie': 'film-barbie',
        'Blade Runner 2049': 'film-blade-runner-2049',
        'Dune': 'film-dune',
        'John Wick: Chapter 4': 'film-john-wick--chapter-4',
        'The Killer': 'film-the-killer',
        'The Devil Wears Prada': 'film-the-devil-wears-prada',
        'The Hunger Games': 'film-the-hunger-games',
        'Sicario': 'film-sicario',
        'The Danish Girl': 'film-the-danish-girl',
        'Maria': 'film-maria'
    };

    // Create buttons for each film
    Object.entries(FILM_IDS).forEach(([filmName, filmId]) => {
        const filmBtn = document.createElement('button');
        filmBtn.id = filmId;
        filmBtn.addEventListener('click', () => {
            console.log(`🎬 Film selected from mobile app: ${filmName} (ID: ${filmId})`);
            FilmHighlight.highlightFilm(filmId);
        });
        hiddenContainer.appendChild(filmBtn);
    });
    
    document.body.appendChild(hiddenContainer);
}

/**
 * Creates the filter UI at the bottom of the page (UNUSED - kept for reference)
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
    resetBtn.id = 'reset_filters';
    resetBtn.addEventListener('click', () => {
        EmptySpaceDetector.clearText(); // Clear immediately
        FilmData.clearFilter();
        resetFilterUI();
        FilterEffects.resetShelves();   
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
        'personality_traits.moral_ambiguity.betrays_others',
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
    
    // Add category buttons only
    priorityOrder.forEach(categoryKey => {
        const values = categories[categoryKey];
        if (!values || values.length === 0) return;
        
        // Get the custom display name or format the default one
        let displayName;
        if (categoryDisplayNames[categoryKey]) {
            displayName = categoryDisplayNames[categoryKey];
        } else {
            // Format category name for display
            displayName = categoryKey.split('.').pop().replace(/_/g, ' ');
        }
        
        // Create category button (single button per category)
        const btn = document.createElement('button');
        btn.className = 'filter-button category-button';
        btn.dataset.category = categoryKey;
        btn.textContent = displayName;
        
        // Ensure buttons have consistent IDs for Firebase integration
        const buttonId = categoryKey.toLowerCase().replace(/\./g, '_').replace(/\s+/g, '_');
        btn.id = buttonId;
        
        btn.addEventListener('click', (e) => {
            EmptySpaceDetector.clearText(); // Clear immediately
            
            // Deactivate all buttons
            document.querySelectorAll('.filter-button').forEach(b => {
                b.classList.remove('active');
            });
            
            // Activate clicked button
            e.target.classList.add('active');
            
            // Apply category-based grouping filter
            const groups = FilmData.groupFilmsByCategory(categoryKey);
            console.log('Filter groups for', categoryKey, ':', groups);
            console.log('Group keys:', Object.keys(groups));
            Object.keys(groups).forEach(groupKey => {
                console.log(`Group ${groupKey}: ${groups[groupKey].length} items`);
            });
            
            // Use new multi-group animation
            FilterEffects.arrangeShelvesForGroups(groups);
        });
        
        filterContainer.appendChild(btn);
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