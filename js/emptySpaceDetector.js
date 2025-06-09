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
        
        // Remove existing filter indicator
        const existingIndicator = document.querySelector('.filter-indicator');
        if (existingIndicator) existingIndicator.remove();
        
        // Only run when filtered
        const bookshelf = document.querySelector('.bookshelf');
        if (!bookshelf || !bookshelf.classList.contains('filtered')) {
            return;
        }
        
        // Add filter indicator
        addFilterIndicator();
        
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
        const existingIndicator = document.querySelector('.filter-indicator');
        if (existingIndicator) existingIndicator.remove();
    }
    
    /**
     * Clears only the text content without removing the filter indicator
     * Used when highlighting individual films to preserve category display
     */
    function clearTextOnly() {
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
            bottom: 50px;
            right: 20px;
            color:rgb(167, 167, 167);
            font-family: 'Input Mono', monospace;
            font-size: 15px;
            font-weight: 700;
            z-index: 15;
            opacity: 0;
            max-width: 400px;
            line-height: 1.3;
            text-align: right;
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
                return "The average age chosen by directors is <span style=\"color: #ffffff; font-size: 19px;\">32</span> years old";
            case 'personality_traits.introvert_extrovert':
                return "<span style=\"color: #ffffff; font-size: 19px;\">Introvert</span> characters are far more profitable as a choice for a main characters";
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
        return `The most common name is <span style="color: #ffffff; font-size: 19px;">John</span>`;
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
        const otherPercent = 100 + whitePercent;                               //ethn text
        const diff = whitePercent + otherPercent;
        return `White characters earned <span style="color: #ffffff; font-size: 19px;">${diff}%</span> more than other ethnicities`;
    }

    function getQualityDescription(charData, filmName) {
        const desc = charData.character_analysis.personality_traits.biggest_strength.reason_specific_description;
        return `<span style="color: #ffffff; font-size: 19px;">${filmName}</span>: ${desc}`;
    }

    function getFearDescription(charData, filmName) {
        const desc = charData.character_analysis.personality_traits.biggest_fear.reason_specific_description;
        return `<span style="color: #ffffff; font-size: 19px;">${filmName}</span>: ${desc}`;
    }

    function getBetrayalDescription(charData, filmName) {
        const reason = charData.character_analysis.personality_traits.moral_ambiguity.reason_betrays_others;
        return `<span style="color: #ffffff; font-size: 19px;">${filmName}</span>: ${reason}`;
    }

    function getTragicPastDescription(charData, filmName) {
        const reason = charData.character_analysis.background_history.tragic_past_reason;
        return `<span style="color: #ffffff; font-size: 19px;">${filmName}</span>: ${reason}`;
    }

    function getIncomeDescription(charData, filmName) {
        const occupation = charData.character_analysis.socioeconomic.occupation;
        return `${filmName}: <span style="color: #ffffff; font-size: 19px;">${occupation}</span>`;
    }

    function getGoalDescription(charData, filmName) {
        const goal = charData.character_analysis.narrative_arc.primary_goal;
        return `<span style="color: #ffffff; font-size: 19px;">${filmName}</span>: ${goal}`;
    }

    function getSwearDescription(charData, filmName) {
        const swear = charData.character_analysis.dialogue_analysis.most_used_swear_word;
        return `The most used swear word in <span style="color: #ffffff; font-size: 19px;">${filmName} </span> is <span style="color: #ffffff; font-size: 19px;">${swear}</span>`;
    }

    function addFilterIndicator() {
        const activeFilter = FilmData.getActiveFilter();
        if (!activeFilter || !activeFilter.category) return;
        
        const filterDisplayNames = {
            'demographics.gender': 'GENDERS',
            'demographics.ethnicity': 'ETHNICITIES', 
            'demographics.age_range': 'AGE RANGE',
            'personality_traits.introvert_extrovert': 'PERSONALITY TRAITS',
            'personality_traits.biggest_strength.category': 'BIGGEST STRENGTHS',
            'personality_traits.biggest_fear.category': 'BIGGEST FEARS',
            'personality_traits.moral_ambiguity.betrays_others': 'BETRAYAL',
            'background_history.tragic_past': 'TRAGIC PAST',
            'socioeconomic.income_level': 'INCOME LEVEL',
            'narrative_arc.goal_achievement': 'GOAL ACHIEVEMENT',
            'relationships_family.parental_status': 'PARENTAL STATUS',
            'dialogue_analysis.swear_frequency': 'SWEAR FREQUENCY'
        };
        
        const indicator = document.createElement('div');
        indicator.className = 'filter-indicator';
        indicator.textContent = filterDisplayNames[activeFilter.category] || activeFilter.category.replace(/[._]/g, ' ').toUpperCase();
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-family: 'Input Mono', monospace;
            font-size: .76rem;
            font-weight: bold;
            text-align: center;
            color: black;
            background: white;
            // border: 2px solid rgb(0, 0, 0);
            border-radius: 20px;
            padding: 8px 16px;
            z-index: 100;
        `;
        document.body.appendChild(indicator);
    }

    function typeWriter(element, text, speed = 100) {
        let i = 0;
        
        function type() {
            if (i < text.length && element.parentNode) {
                if (text.includes('<span')) {
                    element.innerHTML = text.substring(0, i + 1);
                } else {
                    element.textContent += text.charAt(i);
                }
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
    

    
    /**
     * Places text for a specific film instead of random selection
     */
    function detectAndPlaceTextForFilm(filmId) {
        // Clear existing text but keep filter indicator
        clearTextOnly();
        
        // Get the specific film data
        const allFilms = FilmData.getAllFilms();
        const film = allFilms.find(f => f.id === filmId);
        if (!film) return;
        
        const charData = FilmData.getCharacterData(film.filmName);
        if (!charData) return;
        
        // Generate content for the specific film
        const content = generateFilterSpecificContentForFilm(charData, film.filmName);
        if (!content) return;
        
        // Place the text (same as original function)
        textElement = document.createElement('div');
        textElement.className = 'empty-space-text';
        textElement.textContent = '';
        
        textElement.style.cssText = `
            position: fixed;
            bottom: 50px;
            right: 20px;
            color:rgb(167, 167, 167);
            font-family: 'Input Mono', monospace;
            font-size: 15px;
            font-weight: 700;
            z-index: 15;
            opacity: 0;
            max-width: 400px;
            line-height: 1.3;
            text-align: right;
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

    /**
     * Generates filter-specific content for a given film (not random)
     */
    function generateFilterSpecificContentForFilm(charData, filmName) {
        const activeFilter = FilmData.getActiveFilter();
        if (!activeFilter || !activeFilter.category) return null;
        
        const category = activeFilter.category;
        
        switch (category) {
            case 'demographics.gender':
                return `<span style="color: #ffffff; font-size: 19px;">${filmName}</span>: ${charData.character_analysis.demographics.gender}`;
            case 'demographics.ethnicity':
                return `<span style="color: #ffffff; font-size: 19px;">${filmName}</span>: ${charData.character_analysis.demographics.ethnicity}`;
            case 'demographics.age_range':
                return `<span style="color: #ffffff; font-size: 19px;">${filmName}</span>: ${charData.character_analysis.demographics.age_range}`;
            case 'personality_traits.introvert_extrovert':
                return `<span style="color: #ffffff; font-size: 19px;">${filmName}</span>: ${charData.character_analysis.personality_traits.introvert_extrovert}`;
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
            case 'relationships_family.parental_status':
                return `<span style="color: #ffffff; font-size: 19px;">${filmName}</span>: ${charData.character_analysis.relationships_family.parental_status}`;
            case 'dialogue_analysis.swear_frequency':
                return getSwearDescription(charData, filmName);
            default:
                return null;
        }
    }

    return {
        detectAndPlaceText,
        detectAndPlaceTextForFilm,
        clearText,
        clearTextOnly
    };
})(); 