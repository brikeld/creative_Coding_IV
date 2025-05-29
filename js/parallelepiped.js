/**
 * parallelepiped.js - Parallelepiped creation and management
 * Creates and manages parallelepiped 3D elements
 */

// Parallelepiped module
const Parallelepiped = (function() {
    /**
     * Creates a single parallelepiped element with all its components
     * @param {Object} film - Film data object
     * @returns {HTMLElement} - The created parallelepiped element
     */
    function create(film) {
        const parallelepiped = document.createElement('div');
        parallelepiped.className = 'parallelepiped';
        parallelepiped.id = film.id;
        parallelepiped.dataset.filmId = film.id;
        parallelepiped.dataset.filmName = film.filmName;
        
        // Create texture wrapper with all sides
        const textureWrapper = document.createElement('div');
        textureWrapper.className = 'texture-wrapper';
        
        // Create all necessary sides for 3D effect
        const sides = ['front', 'back', 'right', 'left'];
        sides.forEach(side => {
            const textureSide = document.createElement('div');
            textureSide.className = `texture-side texture-${side}`;
            if (film.image && film.image.trim() !== '') {
                textureSide.style.backgroundImage = `url('${film.image}')`;
            } else {
                textureSide.style.backgroundImage = 'none';
            }
            textureWrapper.appendChild(textureSide);
        });
        
        parallelepiped.appendChild(textureWrapper);
        
        // Create faces (crucial for 3D appearance)
        sides.forEach(side => {
            const face = document.createElement('div');
            face.className = `face ${side}`;
            parallelepiped.appendChild(face);
        });
        
        // Create edges for better 3D effect - adjusted for smaller parallelepiped
        const edgeWidth = 47; // Width of the parallelepiped (reduced from 70)
        const edgeHeight = 73; // Height of the parallelepiped (reduced from 110)
        const edgeDepth = 8; // Half of the depth of the parallelepiped (reduced from 15 to 8)
        
        const edges = [
            // Front face edges
            { class: 'edge-front-top', width: edgeWidth, height: 2 },
            { class: 'edge-front-bottom', width: edgeWidth, height: 2 },
            { class: 'edge-front-left', width: 2, height: edgeHeight },
            { class: 'edge-front-right', width: 2, height: edgeHeight },
            // Back face edges
            { class: 'edge-back-top', width: edgeWidth, height: 2 },
            { class: 'edge-back-bottom', width: edgeWidth, height: 2 },
            { class: 'edge-back-left', width: 2, height: edgeHeight },
            { class: 'edge-back-right', width: 2, height: edgeHeight }
        ];
        
        edges.forEach(edge => {
            const edgeElement = document.createElement('div');
            edgeElement.className = `edge ${edge.class}`;
            // Set size directly in JS to match CSS
            if (edge.width) edgeElement.style.width = `${edge.width}px`;
            if (edge.height) edgeElement.style.height = `${edge.height}px`;
            parallelepiped.appendChild(edgeElement);
        });
        
        return parallelepiped;
    }
    
    /**
     * Updates a parallelepiped's image
     * @param {string} filmId - The ID of the film/parallelepiped to update
     * @param {string} newImagePath - The path to the new image
     * @returns {boolean} - Whether the update was successful
     */
    function updateImage(filmId, newImagePath) {
        const parallelepiped = document.getElementById(filmId);
        if (!parallelepiped) return false;
        
        // Update all texture sides with new image
        const textureSides = parallelepiped.querySelectorAll('.texture-side');
        textureSides.forEach(side => {
            if (newImagePath && newImagePath.trim() !== '') {
                side.style.backgroundImage = `url('${newImagePath}')`;
            } else {
                side.style.backgroundImage = 'none';
            }
        });
        
        // Update the films data
        FilmData.updateFilm(filmId, { image: newImagePath });
        
        return true;
    }
    
    /**
     * Updates both text and image for a parallelepiped
     * @param {string} filmId - The ID of the film/parallelepiped to update
     * @param {Object} updateData - Object containing text and/or image
     * @returns {boolean} - Whether the update was successful
     */
    function update(filmId, updateData) {
        let success = true;
        
        if (updateData.hasOwnProperty('text')) {
            FilmData.updateFilm(filmId, { text: updateData.text });
        }
        
        if (updateData.hasOwnProperty('image')) {
            success = updateImage(filmId, updateData.image);
        }
        
        return success;
    }
    
    /**
     * Updates multiple parallelepipeds
     * @param {Array} filmsData - Array of film objects with updates
     */
    function updateMultiple(filmsData) {
        filmsData.forEach(filmData => {
            if (filmData.id) {
                update(filmData.id, filmData);
            }
        });
    }
    // Public API
    return {
        create,
        updateImage,
        update,
        updateMultiple
    };
})(); 