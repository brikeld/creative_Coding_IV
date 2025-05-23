/**
 * boxOfficeDisplay.js - Handles the box office total display animation
 */

const BoxOfficeDisplay = (function() {
    let displayElement = null;
    let currentTotal = 0;
    
    function init() {
        // Create display element
        displayElement = document.createElement('div');
        displayElement.className = 'box-office-total';
        document.body.appendChild(displayElement);
        
        // Initial update
        updateDisplay();
        
        // Listen for filter changes
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('filter-button') || e.target.classList.contains('reset-filter')) {
                // Small delay to let filter effects complete
                setTimeout(updateDisplay, 500);
            }
        });
    }
    
    function formatNumber(num) {
        return num.toLocaleString('en-US');
    }
    
    function updateDisplay() {
        // Get all visible parallelepipeds
        const visibleElements = document.querySelectorAll('.parallelepiped:not(.non-matching)');
        let targetTotal = 0;
        
        // Calculate total box office
        visibleElements.forEach(el => {
            const filmId = el.id;
            const filmName = FilmData.getFilm(filmId)?.filmName;
            if (filmName) {
                const charData = FilmData.getCharacterData(filmName);
                if (charData?.film_info?.box_office) {
                    targetTotal += charData.film_info.box_office;
                }
            }
        });
        
        // Animate the number
        gsap.to(displayElement, {
            opacity: 0.15,
            duration: 0.3
        });
        
        gsap.to({value: currentTotal}, {
            value: targetTotal,
            duration: 3.5,
            ease: "power2.out",
            onUpdate: function() {
                const currentValue = this.targets()[0].value;
                displayElement.textContent = `$${formatNumber(Math.round(currentValue))}`;
                
                // Calculate font size based on window width
                const windowWidth = window.innerWidth;
                const digitCount = displayElement.textContent.length;
                const fontSize = Math.min(windowWidth / (digitCount * 0.7), 200);
                displayElement.style.fontSize = `${fontSize}px`;
            },
            onComplete: function() {
                currentTotal = targetTotal;
            }
        });
    }
    
    return {
        init
    };
})(); 