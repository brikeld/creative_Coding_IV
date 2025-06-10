/**
 * winnerAnimation.js - Handles winner display animation
 * Shows the highest-earning film as the winner when triggered
 */

const WinnerAnimation = (function() {
    let isWinnerMode = false;
    let winnerElement = null;
    let winnerTextElement = null;

    /**
     * Finds the film that appears most often in top earning groups
     * @returns {Object|null} - The winning film data or null
     */
    function findWinnerFilm() {
        const categories = Object.keys(FilmData.getFilterCategories());
        const filmCounts = {};

        categories.forEach(category => {
            const groups = FilmData.groupFilmsByCategory(category);
            const sortedGroups = Object.keys(groups).map(key => ({
                key,
                earnings: groups[key].reduce((sum, filmId) => {
                    const film = FilmData.getAllFilms().find(f => f.id === filmId);
                    if (film) {
                        const charData = FilmData.getCharacterData(film.filmName);
                        return sum + (charData?.film_info?.box_office || 0);
                    }
                    return sum;
                }, 0)
            })).sort((a, b) => b.earnings - a.earnings);

            if (sortedGroups.length > 0) {
                const topGroup = groups[sortedGroups[0].key];
                topGroup.forEach(filmId => {
                    if (!filmCounts[filmId]) filmCounts[filmId] = 0;
                    filmCounts[filmId]++;
                });
            }
        });

        let maxCount = 0;
        let winnerId = null;
        Object.entries(filmCounts).forEach(([filmId, count]) => {
            if (count > maxCount) {
                maxCount = count;
                winnerId = filmId;
            }
        });

        if (winnerId) {
            const film = FilmData.getAllFilms().find(f => f.id === winnerId);
            return { ...film, topGroupCount: maxCount, totalCategories: categories.length };
        }
        return null;
    }

    /**
     * Formats winner statistics for display
     * @param {number} count - Number of top group appearances
     * @param {number} total - Total number of categories
     * @returns {string} - Formatted string
     */
    function formatWinnerStats(count, total) {
        return `was on the most earning shelf ${count} out of ${total} times`;
    }

    /**
     * Shows the winner animation
     */
    function showWinner() {
        if (isWinnerMode) return;

        const winner = findWinnerFilm();
        if (!winner) return;

        isWinnerMode = true;

        // Clear all UI elements and add dark background
        const bookshelf = document.querySelector('.bookshelf');
        if (bookshelf) {
            bookshelf.style.opacity = '0';
            bookshelf.style.pointerEvents = 'none';
        }

        const filterIndicator = document.querySelector('.filter-indicator');
        if (filterIndicator) filterIndicator.remove();

        if (typeof EmptySpaceDetector !== 'undefined') {
            EmptySpaceDetector.clearText();
        }

        // Add dark overlay
        const overlay = document.createElement('div');
        overlay.className = 'winner-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 999;
        `;
        document.body.appendChild(overlay);

        // Create new winner parallelepiped from scratch
        const winnerFilm = FilmData.getAllFilms().find(f => f.id === winner.id);
        if (winnerFilm) {
            // Create a larger version for the winner display
            const largeWinnerFilm = {
                ...winnerFilm,
                id: 'winner-' + winnerFilm.id,
                // Scale up the dimensions for better quality
                width: 47 * 4,
                height: 73 * 4
            };
            
            winnerElement = Parallelepiped.create(largeWinnerFilm);
            winnerElement.classList.add('winner-parallelepiped');
            
            // Force high quality rendering
            const textureSides = winnerElement.querySelectorAll('.texture-side');
            textureSides.forEach(side => {
                side.style.imageRendering = 'pixelated';
                side.style.backgroundSize = '100% 100%';
                side.style.opacity = '1';
            });
            
            document.body.appendChild(winnerElement);
            setTimeout(() => createWinnerText(winner), 500);
        }
    }

    /**
     * Creates winner text display
     * @param {Object} winner - The winner film object
     */
    function createWinnerText(winner) {
        // Get character data to access character name
        const charData = FilmData.getCharacterData(winner.filmName);
        if (!charData) return;

        const characterName = charData.character_analysis.metadata.character_name;

        winnerTextElement = document.createElement('div');
        winnerTextElement.className = 'winner-text';
        winnerTextElement.innerHTML = `
            <div class="winner-title">${characterName}</div>
            <div class="winner-subtitle">in "${winner.filmName}"</div>
            <div class="winner-stats">is our FAVOURITE type of main character! He was on the most earning shelf ${winner.topGroupCount} out of ${winner.totalCategories} times!</div>
        `;

        winnerTextElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50px;
            transform: translateY(-50%);
            text-align: left;
            color: white;
            font-family: 'Input Mono', monospace;
            z-index: 1001;
            opacity: 0;
            transition: opacity 0.8s ease;
        `;

        // Style individual elements
        const titleStyle = `
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            text-align: left;
        `;

        const subtitleStyle = `
            font-size: 1.2rem;
            font-weight: 300;
            margin-bottom: 1rem;
            color: #ccc;
            text-align: left;
        `;

        const statsStyle = `
            font-size: 1.2rem;
            font-weight: normal;
            color: #4CAF50;
            text-align: left;
            max-width: 500px;
        `;

        winnerTextElement.querySelector('.winner-title').style.cssText = titleStyle;
        winnerTextElement.querySelector('.winner-subtitle').style.cssText = subtitleStyle;
        winnerTextElement.querySelector('.winner-stats').style.cssText = statsStyle;

        document.body.appendChild(winnerTextElement);

        // Fade in text
        setTimeout(() => {
            winnerTextElement.style.opacity = '1';
        }, 100);
    }

    /**
     * Hides the winner animation and restores original state
     */
    function hideWinner() {
        if (!isWinnerMode) return;

        isWinnerMode = false;

        // Clean up all winner elements
        if (winnerTextElement) {
            winnerTextElement.remove();
            winnerTextElement = null;
        }
        
        const overlay = document.querySelector('.winner-overlay');
        if (overlay) overlay.remove();

        if (winnerElement) {
            winnerElement.remove();
            winnerElement = null;
        }

        // Restore bookshelf
        const bookshelf = document.querySelector('.bookshelf');
        if (bookshelf) {
            bookshelf.style.opacity = '';
            bookshelf.style.pointerEvents = '';
        }

        winnerElement = null;
        originalParallelepipeds = [];
    }

    /**
     * Initializes the winner animation system
     */
    function init() {
        // Listen for custom events from external apps
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'showWinner') {
                showWinner();
            }
        });

        // Also listen for direct button clicks if in same document
        document.addEventListener('click', (event) => {
            if (event.target && event.target.id === 'final-answer') {
                showWinner();
            }
        });

        // ESC key to hide winner
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && isWinnerMode) {
                hideWinner();
            }
        });
    }

    return {
        init,
        showWinner,
        hideWinner
    };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', WinnerAnimation.init);
} else {
    WinnerAnimation.init();
} 