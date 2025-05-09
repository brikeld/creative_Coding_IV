/**
 * data.js - Film data management
 * Handles film data storage and operations
 */

// Film data module
const FilmData = (function() {
    // Film data - each object will have a unique image and character data
    let films = [
        { id: 'film1', image: '/cofanetto/amelie.jpg', text: "AMELIE", filmName: "Amélie" },
        { id: 'film2', image: '/cofanetto/Anton.jpg', text: "NOCOUNTRYFOROLDMEN", filmName: "No Country for Old Men" },
        { id: 'film3', image: '/cofanetto/Napoleon.jpg', text: "NAPOLEON", filmName: "Napoleon" },
        { id: 'film4', image: '/cofanetto/Ani.jpg', text: "ANORA", filmName: "ANORA" },
        { id: 'film5', image: '/cofanetto/1917.jpg', text: "1917", filmName: "1917" },
        { id: 'film6', image: '/cofanetto/Schindler.jpg', text: "SCHINDLERSLIST", filmName: "Schindler's List" },
        { id: 'film7', image: '/cofanetto/titanic.jpg', text: "TITANIC", filmName: "Titanic" },
        { id: 'film8', image: '/cofanetto/AmericanBeauty.jpg', text: "AMERICANBEAUTY", filmName: "American Beauty" },
        { id: 'film9', image: '/cofanetto/Gladiator.jpg', text: "GLADIATOR", filmName: "Gladiator" },
        { id: 'film10', image: '/cofanetto/The Martian.jpg', text: "THEMARTIAN", filmName: "The Martian" },
        { id: 'film11', image: '/cofanetto/Crash.jpg', text: "CRASH", filmName: "Crash" },
        { id: 'film12', image: '/cofanetto/The Departed.jpg', text: "THEDEPARTED", filmName: "The Departed" },
        { id: 'film13', image: '/cofanetto/Birdman.jpg', text: "BIRDMAN", filmName: "Birdman or (The Unexpected Virtue of Ignorance)" },
        { id: 'film14', image: '/cofanetto/12 Years a Slave.jpg', text: "12YEARSASLAVE", filmName: "12 Years a Slave" },
        { id: 'film15', image: '/cofanetto/Spotlight.jpg', text: "SPOTLIGHT", filmName: "Spotlight" },
        { id: 'film16', image: '/cofanetto/Moonlight.jpg', text: "MOONLIGHT", filmName: "Moonlight" },
        { id: 'film17', image: '/cofanetto/Shutter Island.jpg', text: "SHUTTERISLAND", filmName: "Shutter Island" },
        { id: 'film18', image: '/cofanetto/BeatifulMind.png', text: "ABEAUTIFULMIND", filmName: "A Beautiful Mind" }
    ];
    
    // Complete character data from the JSON
    let characterData = [];
    
    // References to created parallelepipeds
    const elements = {};
    
    // Current active filter
    let activeFilter = null;
    
    /**
     * Gets a film by ID
     * @param {string} filmId - The ID of the film to retrieve
     * @returns {Object|null} - The film object or null if not found
     */
    function getFilm(filmId) {
        return films.find(film => film.id === filmId) || null;
    }
    
    /**
     * Gets all films
     * @returns {Array} - Copy of the films array
     */
    function getAllFilms() {
        return [...films];
    }

    /**
     * Gets character data for a film
     * @param {string} filmName - The name of the film
     * @returns {Object|null} - The character data or null if not found
     */
    function getCharacterData(filmName) {
        return characterData.find(char => 
            char.film_info.film_name.toLowerCase() === filmName.toLowerCase()
        ) || null;
    }
    
    /**
     * Updates a film's properties
     * @param {string} filmId - The ID of the film to update
     * @param {Object} data - Object with text and/or image properties
     * @returns {boolean} - Whether the update was successful
     */
    function updateFilm(filmId, data) {
        const filmIndex = films.findIndex(film => film.id === filmId);
        if (filmIndex === -1) return false;
        
        if (data.text) {
            films[filmIndex].text = data.text;
        }
        
        if (data.hasOwnProperty('image')) {
            films[filmIndex].image = data.image;
        }
        
        return true;
    }
    
    /**
     * Loads character data from the JSON file
     * @returns {Promise} - Promise that resolves when data is loaded
     */
    function loadCharacterData() {
        return fetch('./testDoing.json')
            .then(response => response.json())
            .then(data => {
                characterData = data.characters;
                return data;
            })
            .catch(error => {
                console.error('Error loading character data:', error);
                return null;
            });
    }
    
    /**
     * Gets all filter categories and their possible values
     * @returns {Object} - Object with categories and their values
     */
    function getFilterCategories() {
        // All possible values from template
        const templateValues = {
            'personality_traits.biggest_strength.category': [
                'intelligence', 'empathy', 'strength', 'creativity', 'determination', 
                'charisma', 'resourcefulness', 'courage', 'humor', 'loyalty'
            ],
            'personality_traits.introvert_extrovert': ['introvert', 'extrovert', 'ambivert'],
            'demographics.gender': ['male', 'female', 'non-binary'],
            'demographics.age_range': ['child', 'adult', 'senior'],
            'demographics.ethnicity': ['white', 'black', 'asian', 'latinx', 'indigenous', 'other'],
            'personality_traits.biggest_fear.category': [
                'death', 'failure', 'loneliness', 'betrayal', 'love_loss', 'poverty', 'power_loss'
            ],
            'moral_ambiguity.betrays_others': ['yes', 'no', 'unknown'],
            'relationships_family.parental_status': ['parent', 'not_parent', 'lost_child', 'unknown'],
            'relationships_family.siblings_status': ['only_child', 'siblings', 'orphan', 'unknown'],
            'dialogue_analysis.swear_frequency': ['never', 'rare', 'occasional', 'frequent', 'excessive'],
            'background_history.tragic_past': ['explicit', 'implied', 'none', 'unknown'],
            'socioeconomic.income_level': ['poor', 'middle_class', 'rich', 'unknown'],
            'narrative_arc.goal_achievement': ['fully', 'partially', 'not_at_all', 'ambiguous'],
            'narrative_arc.success_metrics': ['fully', 'partially', 'not_at_all', 'ambiguous']
        };
        
        // Return the template values directly
        return templateValues;
    }
    
    /**
     * Gets a nested property from an object using a dot-notation path
     * @param {Object} obj - The object to get property from
     * @param {string} path - The path to the property, e.g. 'a.b.c'
     * @returns {*} - The property value or undefined if not found
     */
    function getNestedProperty(obj, path) {
        return path.split('.').reduce((prev, curr) => {
            return prev ? prev[curr] : undefined;
        }, obj);
    }
    
    /**
     * Filters films based on a filter category and value
     * @param {string} category - The category to filter by
     * @param {string} value - The value to filter for
     * @returns {Object} - Object with matching and non-matching films
     */
    function filterFilms(category, value) {
        const result = { 
            matching: [], 
            nonMatching: [] 
        };
        
        films.forEach(film => {
            const charData = characterData.find(char => 
                char.film_info.film_name.toLowerCase() === film.filmName.toLowerCase()
            );
            
            if (!charData) {
                result.nonMatching.push(film.id);
                return;
            }
            
            // Add character_analysis prefix if not already included
            const fullPath = category.startsWith('character_analysis.') 
                ? category 
                : 'character_analysis.' + category;
            
            const propValue = getNestedProperty(charData, fullPath);
            
            if (propValue === value) {
                result.matching.push(film.id);
            } else {
                result.nonMatching.push(film.id);
            }
        });
        
        activeFilter = { category, value };
        return result;
    }
    
    /**
     * Clears the active filter
     */
    function clearFilter() {
        activeFilter = null;
    }
    
    /**
     * Gets the active filter
     * @returns {Object|null} - The active filter or null
     */
    function getActiveFilter() {
        return activeFilter;
    }
    
    /**
     * Resets films to their initial state
     */
    function resetFilms() {
        films = [
            { id: 'film1', image: '/cofanetto/amelie.jpg', text: "AMELIE", filmName: "Amélie" },
            { id: 'film2', image: '/cofanetto/Anton.jpg', text: "NOCOUNTRYFOROLDMEN", filmName: "No Country for Old Men" },
            { id: 'film3', image: '/cofanetto/Napoleon.jpg', text: "NAPOLEON", filmName: "Napoleon" },
            { id: 'film4', image: '/cofanetto/Ani.jpg', text: "ANORA", filmName: "ANORA" },
            { id: 'film5', image: '/cofanetto/1917.jpg', text: "1917", filmName: "1917" },
            { id: 'film6', image: '/cofanetto/Schindler.jpg', text: "SCHINDLERSLIST", filmName: "Schindler's List" },
            { id: 'film7', image: '/cofanetto/titanic.jpg', text: "TITANIC", filmName: "Titanic" },
            { id: 'film8', image: '/cofanetto/AmericanBeauty.jpg', text: "AMERICANBEAUTY", filmName: "American Beauty" },
            { id: 'film9', image: '/cofanetto/Gladiator.jpg', text: "GLADIATOR", filmName: "Gladiator" },
            { id: 'film10', image: '/cofanetto/The Martian.jpg', text: "THEMARTIAN", filmName: "The Martian" },
            { id: 'film11', image: '/cofanetto/Crash.jpg', text: "CRASH", filmName: "Crash" },
            { id: 'film12', image: '/cofanetto/The Departed.jpg', text: "THEDEPARTED", filmName: "The Departed" },
            { id: 'film13', image: '/cofanetto/Birdman.jpg', text: "BIRDMAN", filmName: "Birdman or (The Unexpected Virtue of Ignorance)" },
            { id: 'film14', image: '/cofanetto/12 Years a Slave.jpg', text: "12YEARSASLAVE", filmName: "12 Years a Slave" },
            { id: 'film15', image: '/cofanetto/Spotlight.jpg', text: "SPOTLIGHT", filmName: "Spotlight" },
            { id: 'film16', image: '/cofanetto/Moonlight.jpg', text: "MOONLIGHT", filmName: "Moonlight" },
            { id: 'film17', image: '/cofanetto/Shutter Island.jpg', text: "SHUTTERISLAND", filmName: "Shutter Island" },
            { id: 'film18', image: '/cofanetto/BeatifulMind.png', text: "ABEAUTIFULMIND", filmName: "A Beautiful Mind" }
        ];
    }
    
    /**
     * Clears image caches by adding timestamps to URLs
     */
    function clearImageCache() {
        const timestamp = new Date().getTime();
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.src.includes('?')) {
                img.src = img.src.split('?')[0] + '?' + timestamp;
            } else {
                img.src = img.src + '?' + timestamp;
            }
        });
        
        // Also clear background images in CSS
        const elements = document.querySelectorAll('[style*="background-image"]');
        elements.forEach(el => {
            const style = el.getAttribute('style');
            if (style) {
                const newStyle = style.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, url) => {
                    if (url.includes('?')) {
                        return `url('${url.split('?')[0]}?${timestamp}')`;
                    }
                    return `url('${url}?${timestamp}')`;
                });
                el.setAttribute('style', newStyle);
            }
        });
    }
    
    // Public API
    return {
        getFilm,
        getAllFilms,
        getCharacterData,
        updateFilm,
        loadCharacterData,
        getFilterCategories,
        filterFilms,
        clearFilter,
        getActiveFilter,
        resetFilms,
        clearImageCache,
        elements
    };
})(); 