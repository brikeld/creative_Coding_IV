/**
 * Text Tower - Main JavaScript
 * Generates dynamic text layers inside the parallelepiped
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the parallelepiped container
    const parallelepiped = document.querySelector('.parallelepiped');
    
    // Text template for columns
    const textChars = "RANDOMLETTERS".split('');
    
    /**
     * Create text layers inside the parallelepiped
     * Each layer contains columns of text at different depths
     */
    function createTextLayers() {
        // Create 20 layers at different depths
        for (let layer = 1; layer <= 20; layer++) {
            const contentDiv = document.createElement('div');
            contentDiv.className = `content layer-${layer}`;
            
            // Create 4 columns per layer
            for (let col = 0; col < 4; col++) {
                const column = document.createElement('div');
                column.className = 'text-column';
                
                // Add characters to each column
                textChars.forEach(char => {
                    const charDiv = document.createElement('div');
                    charDiv.className = 'text-char';
                    charDiv.textContent = char;
                    column.appendChild(charDiv);
                });
                
                contentDiv.appendChild(column);
            }
            
            parallelepiped.appendChild(contentDiv);
        }
    }
    
    // Initialize the text tower
    createTextLayers();
});
