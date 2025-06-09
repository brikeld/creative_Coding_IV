/**
 * FilmHighlight.js - Simple lift animation for selected films
 */

const FilmHighlight = (function() {
    let liftedFilms = new Set();
    
    /**
     * Converts mobile app film ID format to internal film ID format
     * @param {string} filmId - Film ID from mobile app (e.g., 'film-anora')
     * @returns {string} - Internal film ID (e.g., 'film1')
     */
    function convertToInternalId(filmId) {
        if (/^film\d+$/.test(filmId)) return filmId;
        
        const allFilms = FilmData.getAllFilms();
        let filmNameFromId = filmId.replace('film-', '').replace(/-/g, ' ');
        
        // Handle special cases for punctuation issues
        if (filmNameFromId.includes('king s speech')) filmNameFromId = "The King's Speech";
        if (filmNameFromId.includes('schindler s list')) filmNameFromId = "Schindler's List";
        if (filmNameFromId.includes('don t look up')) filmNameFromId = "Don't Look Up";
        
        // More specific handling for problematic films (handle double hyphens)
        if (filmNameFromId === 'john wick  chapter 4') filmNameFromId = "John Wick: Chapter 4";
        if (filmNameFromId === 'kill bill  vol  1') filmNameFromId = "Kill Bill: Vol. 1";
        if (filmNameFromId === 'kill bill  vol  2') filmNameFromId = "Kill Bill: Vol. 2";
        
        console.log(`🔍 Original ID: "${filmId}" → Converted: "${filmNameFromId}"`);
        
        let matchedFilm = allFilms.find(film => 
            film.filmName.toLowerCase() === filmNameFromId.toLowerCase()
        );
        
        // If no exact match, try partial matching with special handling for these films
        if (!matchedFilm) {
            if (filmNameFromId.includes('kill bill vol')) {
                matchedFilm = allFilms.find(film => 
                    film.filmName.toLowerCase().includes('kill bill') && 
                    film.filmName.toLowerCase().includes(filmNameFromId.includes('vol 1') ? 'vol. 1' : 'vol. 2')
                );
            } else if (filmNameFromId.includes('john wick')) {
                matchedFilm = allFilms.find(film => 
                    film.filmName.toLowerCase().includes('john wick') && 
                    film.filmName.toLowerCase().includes('chapter 4')
                );
            } else {
                matchedFilm = allFilms.find(film => 
                    film.filmName.toLowerCase().includes(filmNameFromId.toLowerCase()) ||
                    filmNameFromId.toLowerCase().includes(film.filmName.toLowerCase())
                );
            }
        }
        
        console.log(`🎯 Matched film:`, matchedFilm);
        return matchedFilm ? matchedFilm.id : filmId;
    }
    
    /**
     * Toggles lift animation for a film
     * @param {string} filmId - The film ID to toggle
     */
    function toggleFilmLift(filmId) {
        console.log(`🔍 toggleFilmLift called with: ${filmId}`);
        
        const internalFilmId = convertToInternalId(filmId);
        console.log(`🔄 Converted to internal ID: ${internalFilmId}`);
        
        const element = FilmData.elements[internalFilmId];
        console.log(`📦 Element found:`, element);
        
        if (!element) {
            console.warn(`❌ No element found for ${internalFilmId}. Available elements:`, Object.keys(FilmData.elements));
            return;
        }
        
        if (liftedFilms.has(internalFilmId)) {
            // Return to original position
            element.style.transition = 'top 0.6s ease, opacity 0.6s ease, filter 0.6s ease';
            element.style.position = '';
            element.style.top = '';
            element.style.zIndex = '';
            element.style.opacity = ''; // Reset opacity to original
            // Reset color restoration
            resetColorRestoration(element);
            
            // Remove box office text
            removeBoxOfficeText(element);
            
            liftedFilms.delete(internalFilmId);
            
            // Restore original random text
            restoreOriginalText();
            
            console.log(`⬇️ Lowering film: ${internalFilmId}, restoring original state`);
        } else {
            // Lift up (using top instead of transform to preserve animations)
            element.style.transition = 'top 0.6s ease, opacity 0.6s ease, filter 0.6s ease';
            element.style.position = 'relative';
            element.style.top = '-30px';
            element.style.zIndex = '10';
            element.style.opacity = '1'; // Force visibility for lifted films
            // Force color restoration on element and parents
            forceColorRestoration(element);
            liftedFilms.add(internalFilmId);
            
            // Add box office text below lifted parallelepiped
            addBoxOfficeText(element, internalFilmId);
            
            // Update text with selected film data
            updateTextForSelectedFilm(internalFilmId);
            
            console.log(`⬆️ Lifting film: ${internalFilmId} using top: -30px, forcing color and visibility`);
        }
        
        // Clean up transition
        setTimeout(() => element.style.transition = '', 600);
    }
    
    /**
     * Returns all lifted films to original position
     */
    function clearAllLifts() {
        liftedFilms.forEach(filmId => {
            const element = FilmData.elements[filmId];
            if (element) {
                element.style.transition = 'top 0.6s ease, opacity 0.6s ease, filter 0.6s ease';
                element.style.position = '';
                element.style.top = '';
                element.style.zIndex = '';
                element.style.opacity = '';
                resetColorRestoration(element);
                removeBoxOfficeText(element);
                setTimeout(() => element.style.transition = '', 600);
            }
        });
        liftedFilms.clear();
        restoreOriginalText();
    }
    
    /**
     * Updates text with selected film data for specific categories
     */
    function updateTextForSelectedFilm(filmId) {
        const activeFilter = FilmData.getActiveFilter();
        if (!activeFilter) return;
        
        const targetCategories = [
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
        
        if (targetCategories.includes(activeFilter.category)) {
            EmptySpaceDetector.detectAndPlaceTextForFilm(filmId);
        }
    }
    
    /**
     * Restores original random text selection
     */
    function restoreOriginalText() {
        const activeFilter = FilmData.getActiveFilter();
        if (activeFilter) {
            EmptySpaceDetector.clearText();
            EmptySpaceDetector.detectAndPlaceText();
        }
    }
    
    /**
     * Aggressively forces color restoration by targeting element and parent containers
     */
    function forceColorRestoration(element) {
        // Inject ultra-high specificity CSS if not already done
        if (!document.getElementById('film-lift-override')) {
            const style = document.createElement('style');
            style.id = 'film-lift-override';
            style.textContent = `
                .film-lifted,
                .film-lifted *,
                .film-lifted .texture-side,
                .film-lifted .face {
                    filter: none !important;
                    -webkit-filter: none !important;
                    mix-blend-mode: normal !important;
                    opacity: 1 !important;
                    background-color: transparent !important;
                    animation: rotateParallelepiped var(--rotate-duration, 5s) linear infinite var(--rotate-delay, 0s) !important;
                }
                .shelf-items:has(.film-lifted) {
                    filter: none !important;
                    -webkit-filter: none !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Target the element itself
        element.style.setProperty('filter', 'none', 'important');
        element.style.setProperty('mix-blend-mode', 'normal', 'important');
        element.style.setProperty('background-color', 'transparent', 'important');
        // Force restore rotation animations
        const duration = element.style.getPropertyValue('--rotate-duration') || '5s';
        const delay = element.style.getPropertyValue('--rotate-delay') || '0s';
        element.style.setProperty('animation', `rotateParallelepiped ${duration} linear infinite ${delay}`, 'important');
        
        // Target parent containers that might have filters
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
            if (parent.classList.contains('shelf-items') || parent.classList.contains('shelf-container')) {
                parent.style.setProperty('filter', 'none', 'important');
                break;
            }
            parent = parent.parentElement;
        }
        
        // Force enable animations by copying from working group-0 elements
        const workingElement = document.querySelector('.parallelepiped.group-0');
        if (workingElement) {
            const computedStyle = window.getComputedStyle(workingElement);
            element.style.setProperty('animation', computedStyle.animation, 'important');
        }
        element.classList.add('film-lifted');
    }
    
    /**
     * Resets color restoration changes
     */
    function resetColorRestoration(element) {
        element.style.filter = '';
        element.style.mixBlendMode = '';
        element.style.backgroundColor = '';
        element.style.animation = '';
        element.classList.remove('film-lifted');
        
        // Reset parent filters
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
            if (parent.classList.contains('shelf-items') || parent.classList.contains('shelf-container')) {
                parent.style.filter = '';
                break;
            }
            parent = parent.parentElement;
        }
    }
    
    /**
     * Adds box office earnings text below lifted parallelepiped
     */
    function addBoxOfficeText(element, filmId) {
        // Get film data for box office info
        const allFilms = FilmData.getAllFilms();
        const film = allFilms.find(f => f.id === filmId);
        if (!film) return;
        
        const charData = FilmData.getCharacterData(film.filmName);
        if (!charData || !charData.film_info.box_office) return;
        
        // Format box office earnings
        const boxOffice = charData.film_info.box_office;
        let formattedEarnings;
        if (boxOffice >= 1000000000) {
            formattedEarnings = `$${(boxOffice / 1000000000).toFixed(1)}B`;
        } else {
            formattedEarnings = `$${(boxOffice / 1000000).toFixed(0)}M`;
        }
        
        // Create text element
        const textEl = document.createElement('div');
        textEl.className = 'box-office-text';
        textEl.textContent = formattedEarnings;
        textEl.style.cssText = `
            position: absolute;
            top: calc(100% + 5px);
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-family: 'Input Mono', monospace;
            font-size: 12px;
            font-weight: 700;
            z-index: 15;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        element.appendChild(textEl);
        
        // Fade in
        setTimeout(() => textEl.style.opacity = '1', 100);
    }
    
    /**
     * Removes box office text from element
     */
    function removeBoxOfficeText(element) {
        const textEl = element.querySelector('.box-office-text');
        if (textEl) {
            textEl.style.opacity = '0';
            setTimeout(() => textEl.remove(), 300);
        }
    }
    
    return {
        highlightFilm: toggleFilmLift, // Keep same interface
        clearHighlight: clearAllLifts,
        clearAllLifts
    };
})(); 