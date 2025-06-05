/**
 * emptySpaceDetector.js - Detects empty screen areas after filtering and places text
 */

const EmptySpaceDetector = (function() {
    let textElement = null;
    let detectionTimeout = null;
    
    function detectAndPlaceText() {
        // return;
        
        // Clear any pending detection
        if (detectionTimeout) {
            clearTimeout(detectionTimeout);
            detectionTimeout = null;
        }
        
        // Remove existing text immediately
        if (textElement) {
            textElement.remove();
            textElement = null;
        }
        
        // Only run when filtered
        const bookshelf = document.querySelector('.bookshelf');
        if (!bookshelf || !bookshelf.classList.contains('filtered')) {
            return;
        }
        
        // Wait for animations to settle
        detectionTimeout = setTimeout(() => {
            placeTextInArea();
        }, 500);
    }
    
    function clearText() {
        if (detectionTimeout) {
            clearTimeout(detectionTimeout);
            detectionTimeout = null;
        }
        if (textElement) {
            textElement.remove();
            textElement = null;
        }
    }
    

    
    function placeTextInArea() {
        // Generate specific content based on current filter
        const content = generateFilterSpecificContent();
        if (!content) return;
        
        textElement = document.createElement('div');
        textElement.className = 'empty-space-text';
        textElement.textContent = ''; // Start empty for typewriter effect
        
        textElement.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            color:rgb(167, 167, 167);
            font-family: 'Input Mono', monospace;
            font-size: 11px;
            font-weight: 700;
            z-index: 15;
            opacity: 0;
            white-space: nowrap;
            transition: opacity .3s ease;
        `;
        
        document.body.appendChild(textElement);
        
        // Fade in then start typewriter
        setTimeout(() => {
            if (textElement) {
                textElement.style.opacity = '1';
                typeWriter(textElement, content, 30);
            }
        }, 100);
    }

    function generateFilterSpecificContent() {
        const activeFilter = FilmData.getActiveFilter();
        if (!activeFilter || !activeFilter.category) return null;
        
        const category = activeFilter.category;
        const topGroupElements = document.querySelectorAll('.parallelepiped.group-0');
        if (topGroupElements.length === 0) return null;
        
        // Get random film from top group
        const randomElement = topGroupElements[Math.floor(Math.random() * topGroupElements.length)];
        const filmName = randomElement.dataset.filmName;
        const charData = FilmData.getCharacterData(filmName);
        if (!charData) return null;
        
        switch (category) {
            case 'demographics.gender':
                return getMostCommonName();
            case 'demographics.ethnicity':
                return getEthnicityPercentage();
            case 'demographics.age_range':
                return "The average age chosen by directors is 32 years old";
            case 'personality_traits.introvert_extrovert':
                return "Introvert characters are far more popular as a choice for a main characters";
            case 'personality_traits.biggest_strength.category':
                return getQualityDescription(charData, filmName);
            case 'personality_traits.biggest_fear.category':
                return getFearDescription(charData, filmName);
            case 'personality_traits.moral_ambiguity.betrays_others':
                return getBetrayalDescription(charData, filmName);
            case 'background_history.tragic_past':
                return getTragicPastDescription(charData, filmName);
            case 'socioeconomic.income_level':
                return getIncomeDescription(charData, filmName);
            case 'narrative_arc.goal_achievement':
                return getGoalDescription(charData, filmName);
            case 'dialogue_analysis.swear_frequency':
                return getSwearDescription(charData, filmName);
            default:
                return filmName;
        }
    }

    function getMostCommonName() {
        const allFilms = FilmData.getAllFilms();
        const names = {};
        allFilms.forEach(film => {
            const charData = FilmData.getCharacterData(film.filmName);
            if (charData && charData.character_analysis.metadata.character_name) {
                const name = charData.character_analysis.metadata.character_name;
                names[name] = (names[name] || 0) + 1;
            }
        });
        if (Object.keys(names).length === 0) return "No character names found";
        const mostCommon = Object.keys(names).reduce((a, b) => names[a] > names[b] ? a : b);
        return `The most common name is ${mostCommon}`;
    }

    function getEthnicityPercentage() {
        const groups = {};
        const allFilms = FilmData.getAllFilms();
        allFilms.forEach(film => {
            const charData = FilmData.getCharacterData(film.filmName);
            if (charData && charData.character_analysis.demographics.ethnicity) {
                const ethnicity = charData.character_analysis.demographics.ethnicity;
                if (!groups[ethnicity]) groups[ethnicity] = 0;
                groups[ethnicity] += charData.film_info.box_office || 0;
            }
        });
        const total = Object.values(groups).reduce((a, b) => a + b, 0);
        const whitePercent = Math.round((groups.white || 0) / total * 100);
        const otherPercent = 100 - whitePercent;
        const diff = whitePercent - otherPercent;
        return `White characters earned ${diff}% more than others`;
    }

    function getQualityDescription(charData, filmName) {
        const desc = charData.character_analysis.personality_traits.biggest_strength.reason_specific_description;
        return `${filmName}: ${desc}`;
    }

    function getFearDescription(charData, filmName) {
        const desc = charData.character_analysis.personality_traits.biggest_fear.reason_specific_description;
        return `${filmName}: ${desc}`;
    }

    function getBetrayalDescription(charData, filmName) {
        const reason = charData.character_analysis.personality_traits.moral_ambiguity.reason_betrays_others;
        return `${filmName}: ${reason}`;
    }

    function getTragicPastDescription(charData, filmName) {
        const reason = charData.character_analysis.background_history.tragic_past_reason;
        return `${filmName}: ${reason}`;
    }

    function getIncomeDescription(charData, filmName) {
        const occupation = charData.character_analysis.socioeconomic.occupation;
        return `${filmName}: ${occupation}`;
    }

    function getGoalDescription(charData, filmName) {
        const goal = charData.character_analysis.narrative_arc.primary_goal;
        return `${filmName}: ${goal}`;
    }

    function getSwearDescription(charData, filmName) {
        const swear = charData.character_analysis.dialogue_analysis.most_used_swear_word;
        return `${filmName}: "${swear}"`;
    }

    function typeWriter(element, text, speed = 100) {
        let i = 0;
        
        function type() {
            if (i < text.length && element.parentNode) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
    

    
    return {
        detectAndPlaceText,
        clearText
    };
})(); 