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
        
        // Use custom dimensions if provided, otherwise use defaults
        const width = film.width || 47;
        const height = film.height || 73;
        const depth = Math.floor((film.width || 47) / 6); // Scale depth proportionally
        
        // Set custom dimensions if provided
        if (film.width || film.height) {
            parallelepiped.style.width = `${width}px`;
            parallelepiped.style.height = `${height}px`;
        }
        
        // Create texture wrapper with all sides
        const textureWrapper = document.createElement('div');
        textureWrapper.className = 'texture-wrapper';
        
        // Create all necessary sides for 3D effect (including top and bottom)
        const sides = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        sides.forEach(side => {
            const textureSide = document.createElement('div');
            textureSide.className = `texture-side texture-${side}`;
            if (film.image && film.image.trim() !== '') {
                textureSide.style.backgroundImage = `url('${film.image}')`;
            } else {
                textureSide.style.backgroundImage = 'none';
            }
            
            // Apply custom dimensions to sides
            if (film.width || film.height) {
                if (side === 'right' || side === 'left') {
                    textureSide.style.width = `${depth * 2}px`;
                    textureSide.style.height = `${height}px`;
                    if (side === 'right') {
                        textureSide.style.right = `-${depth}px`;
                    } else {
                        textureSide.style.left = `-${depth}px`;
                    }
                    textureSide.style.transform = `rotateY(${side === 'right' ? '90deg' : '-90deg'})`;
                } else if (side === 'top' || side === 'bottom') {
                    textureSide.style.width = `${width}px`;
                    textureSide.style.height = `${depth * 2}px`;
                    if (side === 'top') {
                        textureSide.style.top = `-${depth}px`;
                    } else {
                        textureSide.style.bottom = `-${depth}px`;
                    }
                    textureSide.style.transform = `rotateX(${side === 'top' ? '90deg' : '-90deg'})`;
                } else {
                    textureSide.style.width = `${width}px`;
                    textureSide.style.height = `${height}px`;
                    textureSide.style.transform = `translateZ(${side === 'front' ? depth : -depth}px)${side === 'back' ? ' rotateY(180deg)' : ''}`;
                }
            }
            
            textureWrapper.appendChild(textureSide);
        });
        
        parallelepiped.appendChild(textureWrapper);
        
        // Create faces (crucial for 3D appearance)
        sides.forEach(side => {
            const face = document.createElement('div');
            face.className = `face ${side}`;
            
            // Apply custom dimensions to faces
            if (film.width || film.height) {
                if (side === 'right' || side === 'left') {
                    face.style.width = `${depth * 2}px`;
                    face.style.height = `${height}px`;
                    face.style.left = `calc(50% - ${depth}px)`;
                    face.style.transform = `rotateY(${side === 'right' ? '90deg' : '-90deg'}) translateZ(${depth}px)`;
                } else if (side === 'top' || side === 'bottom') {
                    face.style.width = `${width}px`;
                    face.style.height = `${depth * 2}px`;
                    face.style.transform = `rotateX(${side === 'top' ? '90deg' : '-90deg'})`;
                } else {
                    face.style.width = `${width}px`;
                    face.style.height = `${height}px`;
                    face.style.transform = `translateZ(${side === 'front' ? depth : -depth}px)${side === 'back' ? ' rotateY(180deg)' : ''}`;
                }
            }
            
            parallelepiped.appendChild(face);
        });
        
        // Apply random rotation animation properties
        const randomDuration = 3 + Math.random() * 4; // 3s to 7s
        const randomDelay = Math.random() * 2;
        
        parallelepiped.style.setProperty('--rotate-duration', `${randomDuration}s`);
        parallelepiped.style.setProperty('--rotate-delay', `${randomDelay}s`);
        
        // Create edges for better 3D effect - adjusted for custom dimensions
        const edges = [
            { class: 'edge-front-top', width: width, height: 2 },
            { class: 'edge-front-bottom', width: width, height: 2 },
            { class: 'edge-front-left', width: 2, height: height },
            { class: 'edge-front-right', width: 2, height: height },
            { class: 'edge-back-top', width: width, height: 2 },
            { class: 'edge-back-bottom', width: width, height: 2 },
            { class: 'edge-back-left', width: 2, height: height },
            { class: 'edge-back-right', width: 2, height: height }
        ];
        
        edges.forEach(edge => {
            const edgeElement = document.createElement('div');
            edgeElement.className = `edge ${edge.class}`;
            edgeElement.style.width = `${edge.width}px`;
            edgeElement.style.height = `${edge.height}px`;
            
            // Adjust edge positions for custom dimensions
            if (film.width || film.height) {
                if (edge.class.includes('front') || edge.class.includes('back')) {
                    edgeElement.style.transform = `translateZ(${edge.class.includes('front') ? depth : -depth}px)${edge.class.includes('back') ? ' rotateY(180deg)' : ''}`;
                }
            }
            
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