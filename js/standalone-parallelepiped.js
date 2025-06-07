/**
 * Standalone Parallelepiped Creator
 * Complete implementation with CSS, textures, and animations
 * No external dependencies required
 */

const StandaloneParallelepiped = (function() {
    
    // Inject CSS styles into the document head
    function injectStyles() {
        if (document.getElementById('parallelepiped-styles')) return; // Prevent duplicate injection
        
        const css = `
            <style id="parallelepiped-styles">
                .parallelepiped {
                    position: relative;
                    width: 47px;
                    height: 73px;
                    transform-style: preserve-3d;
                    animation: rotateParallelepiped var(--rotate-duration, 5s) linear infinite var(--rotate-delay, 0s);
                }

                .texture-wrapper {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    transform-style: preserve-3d;
                }

                .texture-side {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    opacity: 0.9;
                }

                .texture-front {
                    transform: translateZ(8px);
                }

                .texture-back {
                    transform: translateZ(-8px) rotateY(180deg);
                }

                .texture-right {
                    transform: rotateY(90deg) translateZ(8px);
                    width: 16px;
                    left: calc(50% - 8px);
                }

                .texture-left {
                    transform: rotateY(-90deg) translateZ(8px);
                    width: 16px;
                    left: calc(50% - 8px);
                }

                .face {
                    position: absolute;
                    background: rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .face.front {
                    width: 47px;
                    height: 73px;
                    transform: translateZ(8px);
                }

                .face.back {
                    width: 47px;
                    height: 73px;
                    transform: translateZ(-8px) rotateY(180deg);
                }

                .face.right {
                    width: 16px;
                    height: 73px;
                    left: calc(50% - 8px);
                    transform: rotateY(90deg) translateZ(8px);
                }

                .face.left {
                    width: 16px;
                    height: 73px;
                    left: calc(50% - 8px);
                    transform: rotateY(-90deg) translateZ(8px);
                }

                .edge {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.3);
                    z-index: 10;
                }

                .edge-front-top {
                    width: 47px;
                    height: 2px;
                    top: 0;
                    left: 0;
                    transform: translateZ(8px);
                }

                .edge-front-bottom {
                    width: 47px;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    transform: translateZ(8px);
                }

                .edge-front-left {
                    width: 2px;
                    height: 73px;
                    top: 0;
                    left: 0;
                    transform: translateZ(8px);
                }

                .edge-front-right {
                    width: 2px;
                    height: 73px;
                    top: 0;
                    right: 0;
                    transform: translateZ(8px);
                }

                .edge-back-top {
                    width: 47px;
                    height: 2px;
                    top: 0;
                    left: 0;
                    transform: translateZ(-8px) rotateY(180deg);
                }

                .edge-back-bottom {
                    width: 47px;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    transform: translateZ(-8px) rotateY(180deg);
                }

                .edge-back-left {
                    width: 2px;
                    height: 73px;
                    top: 0;
                    left: 0;
                    transform: translateZ(-8px) rotateY(180deg);
                }

                .edge-back-right {
                    width: 2px;
                    height: 73px;
                    top: 0;
                    right: 0;
                    transform: translateZ(-8px) rotateY(180deg);
                }

                @keyframes rotateParallelepiped {
                    0% {
                        transform: rotateY(0deg);
                    }
                    100% {
                        transform: rotateY(360deg);
                    }
                }

                /* Container for better display */
                .parallelepiped-container {
                    perspective: 1000px;
                    display: inline-block;
                    margin: 20px;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', css);
    }

    /**
     * Creates a complete parallelepiped element
     * @param {Object} options - Configuration options
     * @param {string} options.id - Unique ID for the parallelepiped
     * @param {string} options.imagePath - Path to texture image (optional)
     * @param {number} options.animationDuration - Animation duration in seconds (default: 5)
     * @param {number} options.animationDelay - Animation delay in seconds (default: 0)
     * @returns {HTMLElement} - The created parallelepiped element with container
     */
    function create(options = {}) {
        // Ensure styles are injected
        injectStyles();
        
        const config = {
            id: options.id || 'parallelepiped-' + Date.now(),
            imagePath: options.imagePath || '',
            animationDuration: options.animationDuration || (3 + Math.random() * 4),
            animationDelay: options.animationDelay || (Math.random() * 2),
            ...options
        };

        // Create container for proper perspective
        const container = document.createElement('div');
        container.className = 'parallelepiped-container';

        // Create main parallelepiped element
        const parallelepiped = document.createElement('div');
        parallelepiped.className = 'parallelepiped';
        parallelepiped.id = config.id;
        
        // Set animation properties
        parallelepiped.style.setProperty('--rotate-duration', `${config.animationDuration}s`);
        parallelepiped.style.setProperty('--rotate-delay', `${config.animationDelay}s`);
        
        // Create texture wrapper with all sides
        const textureWrapper = document.createElement('div');
        textureWrapper.className = 'texture-wrapper';
        
        // Create all texture sides
        const sides = ['front', 'back', 'right', 'left'];
        sides.forEach(side => {
            const textureSide = document.createElement('div');
            textureSide.className = `texture-side texture-${side}`;
            if (config.imagePath && config.imagePath.trim() !== '') {
                textureSide.style.backgroundImage = `url('${config.imagePath}')`;
            }
            textureWrapper.appendChild(textureSide);
        });
        
        parallelepiped.appendChild(textureWrapper);
        
        // Create faces for 3D appearance
        sides.forEach(side => {
            const face = document.createElement('div');
            face.className = `face ${side}`;
            parallelepiped.appendChild(face);
        });
        
        // Create edges for better 3D effect
        const edges = [
            { class: 'edge-front-top', width: 47, height: 2 },
            { class: 'edge-front-bottom', width: 47, height: 2 },
            { class: 'edge-front-left', width: 2, height: 73 },
            { class: 'edge-front-right', width: 2, height: 73 },
            { class: 'edge-back-top', width: 47, height: 2 },
            { class: 'edge-back-bottom', width: 47, height: 2 },
            { class: 'edge-back-left', width: 2, height: 73 },
            { class: 'edge-back-right', width: 2, height: 73 }
        ];
        
        edges.forEach(edge => {
            const edgeElement = document.createElement('div');
            edgeElement.className = `edge ${edge.class}`;
            edgeElement.style.width = `${edge.width}px`;
            edgeElement.style.height = `${edge.height}px`;
            parallelepiped.appendChild(edgeElement);
        });
        
        container.appendChild(parallelepiped);
        return container;
    }

    /**
     * Updates the texture image of an existing parallelepiped
     * @param {string} parallelepipedId - The ID of the parallelepiped to update
     * @param {string} newImagePath - Path to the new texture image
     * @returns {boolean} - Success status
     */
    function updateTexture(parallelepipedId, newImagePath) {
        const parallelepiped = document.getElementById(parallelepipedId);
        if (!parallelepiped) return false;
        
        const textureSides = parallelepiped.querySelectorAll('.texture-side');
        textureSides.forEach(side => {
            if (newImagePath && newImagePath.trim() !== '') {
                side.style.backgroundImage = `url('${newImagePath}')`;
            } else {
                side.style.backgroundImage = 'none';
            }
        });
        
        return true;
    }

    /**
     * Creates multiple parallelepipeds and appends them to a container
     * @param {HTMLElement} containerElement - Element to append parallelepipeds to
     * @param {Array} parallelepipedsData - Array of parallelepiped configurations
     */
    function createMultiple(containerElement, parallelepipedsData) {
        parallelepipedsData.forEach((config, index) => {
            const parallelepiped = create({
                id: config.id || `parallelepiped-${index}`,
                imagePath: config.imagePath || '',
                animationDuration: config.animationDuration,
                animationDelay: config.animationDelay,
                ...config
            });
            containerElement.appendChild(parallelepiped);
        });
    }

    /**
     * Simple demo function to show how to use the parallelepiped
     * Creates a demo with sample parallelepipeds
     */
    function createDemo() {
        // Create demo container
        const demoContainer = document.createElement('div');
        demoContainer.style.cssText = `
            padding: 20px;
            text-align: center;
            background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
        `;

        // Create sample parallelepipeds
        const sampleData = [
            { id: 'demo1', animationDuration: 4, animationDelay: 0 },
            { id: 'demo2', animationDuration: 6, animationDelay: 1 },
            { id: 'demo3', animationDuration: 3.5, animationDelay: 2 }
        ];

        createMultiple(demoContainer, sampleData);
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Standalone Parallelepiped Demo';
        title.style.cssText = 'color: white; width: 100%; margin-bottom: 20px;';
        demoContainer.insertBefore(title, demoContainer.firstChild);

        return demoContainer;
    }

    // Public API
    return {
        create,
        updateTexture,
        createMultiple,
        createDemo,
        injectStyles
    };
})();

// Example usage:
/*
// Basic usage - create a single parallelepiped
const myParallelepiped = StandaloneParallelepiped.create({
    id: 'my-parallelepiped',
    imagePath: 'path/to/your/image.jpg',
    animationDuration: 5,
    animationDelay: 1
});
document.body.appendChild(myParallelepiped);

// Create multiple parallelepipeds
const container = document.getElementById('my-container');
StandaloneParallelepiped.createMultiple(container, [
    { id: 'p1', imagePath: 'image1.jpg' },
    { id: 'p2', imagePath: 'image2.jpg' },
    { id: 'p3', imagePath: 'image3.jpg' }
]);

// Update texture of existing parallelepiped
StandaloneParallelepiped.updateTexture('my-parallelepiped', 'new-image.jpg');

// Create and show demo
document.body.appendChild(StandaloneParallelepiped.createDemo());
*/ 