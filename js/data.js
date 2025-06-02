/**
 * data.js - Film data management
 * Handles film data storage and operations
 */

// Film data module
const FilmData = (function() {
    // Film data - dynamically generated from JSON
    let films = [];
    
    // Complete character data from the JSON
    let characterData = [];
    
    // References to created parallelepipeds
    const elements = {};
    
    // Current active filter
    let activeFilter = null;
    
    /**
     * Creates a film ID from film name
     * @param {string} filmName - The film name
     * @param {number} index - The index for uniqueness
     * @returns {string} - The generated film ID
     */
    function createFilmId(filmName, index) {
        return `film${index + 1}`;
    }
    
    /**
     * Creates a text representation from film name
     * @param {string} filmName - The film name
     * @returns {string} - The text representation
     */
    function createFilmText(filmName) {
        return filmName.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
    
    /**
     * Maps film name to image file
     * @param {string} filmName - The film name from JSON
     * @returns {string} - The image path
     */
    function mapFilmToImage(filmName) {
        // Available images from the cofanetto folder
        const imageMap = {
            'ANORA': '/cofanetto/Ani.jpg',
            'No Country for Old Men': '/cofanetto/Anton.jpg',
            '1917': '/cofanetto/1917.jpg',
            "Schindler's List": '/cofanetto/Schindler.jpg',
            'Titanic': '/cofanetto/titanic.jpg',
            'American Beauty': '/cofanetto/AmericanBeauty.jpg',
            'Gladiator': '/cofanetto/Gladiator.jpg',
            'A Beautiful Mind': '/cofanetto/BeatifulMind.png',
            'Crash': '/cofanetto/Crash.jpg',
            'The Departed': '/cofanetto/The Departed.jpg',
            'Birdman or (The Unexpected Virtue of Ignorance)': '/cofanetto/Birdman.jpg',
            '12 Years a Slave': '/cofanetto/12 Years a Slave.jpg',
            'Spotlight': '/cofanetto/Spotlight.jpg',
            'Moonlight': '/cofanetto/Moonlight.jpg',
            'Napoleon': '/cofanetto/Napoleon.jpg',
            'Shutter Island': '/cofanetto/Shutter Island.jpg',
            'The Martian': '/cofanetto/The Martian.jpg',
            'Amélie': '/cofanetto/amelie.jpg',
            'The Lord of the Rings: The Return of the King': '/cofanetto/theLordofTheRings-ReturnOfTheKing.jpg',
            'The King\'s Speech': '/cofanetto/TheKingSpeech.jpg',
            'The Shape of Water': '/cofanetto/ShapeOfWater.jpg',
            'Green Book': '/cofanetto/GreenBook.jpg',
            'Parasite': '/cofanetto/Parasite.jpg',
            'Nomadland': '/cofanetto/nomadLand.jpg',
            'Anatomy of a Fall': '/cofanetto/anatomyofafall.jpg',
            'All Quiet on the Western Front': '/cofanetto/allquietonthewesternfront.jpg',
            'Everything Everywhere All At Once': '/cofanetto/everythingeverywhereallatonce.jpg',
            'CODA': '/cofanetto/coda.jpg',
            'Baby Driver': '/cofanetto/babyDriver.jpg',
            'House of Gucci': '/cofanetto/houseofgucci.jpg',
            'Inception': '/cofanetto/inception.jpg',
            'Ferrari': '/cofanetto/ferrari.jpg',
            'Her': '/cofanetto/her.jpg',
            'Kill Bill: Vol. 1': '/cofanetto/killbill1.jpg',
            'Kill Bill: Vol. 2': '/cofanetto/killbill2.png',
            // Adding the missing 22 films
            'American Hustle': '/cofanetto/AmericanHustle.jpg',
            'Conclave': '/cofanetto/conclave.jpg',
            'Don\'t Look Up': '/cofanetto/dontlookup.jpg',
            'Drive': '/cofanetto/drive.jpg',
            'Dunkirk': '/cofanetto/dunkirk.jpg',
            'Focus': '/cofanetto/focus.jpg',
            'Gladiator 2': '/cofanetto/gladiator2.jpg',
            'Girl with a Pearl Earring': '/cofanetto/girlwiththepearlearring.jpg',
            'Ford v Ferrari': '/cofanetto/fordvferrari.jpg',
            'Maestro': '/cofanetto/maestro.jpg',
            'Moneyball': '/cofanetto/moneyball.jpg',
            'Memoirs of a Geisha': '/cofanetto/memoirsofageisha.jpg',
            'Midnight in Paris': '/cofanetto/midnightinparis.jpg',
            'Mank': '/cofanetto/mank.jpg',
            'Oppenheimer': '/cofanetto/Oppenheimer.jpg',
            'The Brutalist': '/cofanetto/the brutalist.jpg',
            'Arrival': '/cofanetto/Arrival.jpg',
            'Asteroid City': '/cofanetto/Asteroid City .jpg',
            'Barbie': '/cofanetto/Barbie.jpg',
            'Blade Runner 2049': '/cofanetto/Blade Runner 2049 .jpg',
            'Dune': '/cofanetto/Dune.jpg',
            'John Wick: Chapter 4': '/cofanetto/John Wick Chapter 4.jpg',
            'Avatar': '/cofanetto/Avatar.jpg'
        };
        
        return imageMap[filmName] || '/cofanetto/default.jpg';
    }
    
    /**
     * Generates films array from character data
     */
    function generateFilmsFromCharacterData() {
        films = characterData.map((character, index) => {
            const filmName = character.film_info.film_name;
            return {
                id: createFilmId(filmName, index),
                image: mapFilmToImage(filmName),
                text: createFilmText(filmName),
                filmName: filmName
            };
        });
    }
    
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
                generateFilmsFromCharacterData();
                console.log(`Generated ${films.length} film objects from character data`);
                console.log('Films generated:', films.map(f => f.filmName));
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
            'personality_traits.moral_ambiguity.betrays_others': ['yes', 'no', 'unknown'],
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
     * Groups films by all values within a category
     * @param {string} category - The category to group by
     * @returns {Object} - Object with groups for each value in the category
     */
    function groupFilmsByCategory(category) {
        const groups = {};
        
        films.forEach(film => {
            const charData = characterData.find(char => 
                char.film_info.film_name.toLowerCase() === film.filmName.toLowerCase()
            );
            
            if (!charData) {
                // Add to 'unknown' group
                if (!groups['unknown']) groups['unknown'] = [];
                groups['unknown'].push(film.id);
                return;
            }
            
            // Add character_analysis prefix if not already included
            const fullPath = category.startsWith('character_analysis.') 
                ? category 
                : 'character_analysis.' + category;
            
            const propValue = getNestedProperty(charData, fullPath);
            const groupKey = propValue || 'unknown';
            
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(film.id);
        });
        
        activeFilter = { category, groups };
        return groups;
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
        if (characterData.length > 0) {
            generateFilmsFromCharacterData();
        } else {
            films = [];
        }
    }
    
    /**
     * Refreshes all existing parallelepipeds with updated images from the imageMap
     * This is useful when the imageMap has been updated but films are already created
     */
    function refreshAllImages() {
        if (characterData.length === 0) {
            console.warn('No character data loaded. Cannot refresh images.');
            return false;
        }
        
        // Regenerate films with updated image mappings
        generateFilmsFromCharacterData();
        
        // Update existing parallelepiped elements with new images
        films.forEach(film => {
            const element = elements[film.id];
            if (element) {
                // Update all texture sides with new image
                const textureSides = element.querySelectorAll('.texture-side');
                textureSides.forEach(side => {
                    if (film.image && film.image.trim() !== '') {
                        side.style.backgroundImage = `url('${film.image}')`;
                    } else {
                        side.style.backgroundImage = 'none';
                    }
                });
            }
        });
        
        console.log(`Refreshed ${films.length} parallelepipeds with updated images`);
        return true;
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
        generateFilmsFromCharacterData,
        getFilterCategories,
        filterFilms,
        groupFilmsByCategory,
        clearFilter,
        getActiveFilter,
        resetFilms,
        refreshAllImages,
        clearImageCache,
        elements
    };
})(); 