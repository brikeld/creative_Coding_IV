/**
 * api.js - Public API for Film Visualizer
 * Exposes interface for external applications to interact with the visualization
 */

// API module
const API = (function() {
    /**
     * Updates both text and image of a specific parallelepiped
     * @param {string} filmId - The ID of the film/parallelepiped to update
     * @param {Object} updateData - Object containing text and/or image properties
     * @returns {boolean} - Whether the update was successful
     */
    function updateFilm(filmId, updateData) {
        return Parallelepiped.update(filmId, updateData);
    }
    
    /**
     * Updates the image of a specific parallelepiped
     * @param {string} filmId - The ID of the film/parallelepiped to update
     * @param {string} newImagePath - The path to the new image
     * @returns {boolean} - Whether the update was successful
     */
    function updateFilmImage(filmId, newImagePath) {
        return Parallelepiped.updateImage(filmId, newImagePath);
    }
    
    /**
     * Updates all films with new data
     * @param {Array} newFilmsData - Array of film objects with id, text, and image properties
     */
    function updateAllFilms(newFilmsData) {
        Parallelepiped.updateMultiple(newFilmsData);
    }
    
    /**
     * Loads film data from a JSON file
     * @param {string} jsonPath - Path to the JSON file
     * @returns {Promise} - Promise that resolves when data is loaded and applied
     */
    function loadFilmsFromJSON(jsonPath) {
        return FilmData.loadFromJSON(jsonPath)
            .then(data => {
                if (data) {
                    updateAllFilms(data);
                }
                return data;
            });
    }
    
    /**
     * Gets a copy of all film data
     * @returns {Array} - Copy of the films array
     */
    function getFilmData() {
        return FilmData.getAllFilms();
    }
    
    /**
     * Resets the application to its initial state
     * @returns {boolean} - Whether the reset was successful
     */
    function resetFilms() {
        // Clear container
        const container = document.querySelector('#container');
        container.innerHTML = '';
        
        // Reset films to initial state
        FilmData.resetFilms();
        FilmData.clearImageCache();
        
        // Recreate all parallelepipeds
        const films = FilmData.getAllFilms();
        films.forEach(film => {
            const element = Parallelepiped.create(film);
            container.appendChild(element);
            FilmData.elements[film.id] = element;
        });
        
        return true;
    }
    
    // Make functions available globally
    function exposeGlobally() {
        window.filmVisualizer = {
            updateFilm,
            updateFilmImage,
            updateAllFilms,
            loadFilmsFromJSON,
            getFilmData,
            resetFilms
        };
    }
    
    // Public API
    return {
        updateFilm,
        updateFilmImage,
        updateAllFilms,
        loadFilmsFromJSON,
        getFilmData,
        resetFilms,
        exposeGlobally
    };
})(); 