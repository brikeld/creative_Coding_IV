/**
 * intro.js - Introduction screen with typewriter effect
 */

const IntroScreen = (function() {
    const text = "Who are the protagonist that we enjoy the most?";
    let isTypingComplete = false;
    let onComplete = null;

    function typeWriter(element, text, speed = 60) { 
        let i = 0;
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                element.classList.add('typing-complete');
                isTypingComplete = true;
                element.addEventListener('click', handleClick);
            }
        }
        
        type();
    }

    function handleClick() {
        if (!isTypingComplete) return;
        
        const introScreen = document.getElementById('intro-screen');
        const mainApp = document.getElementById('main-app');
        
        introScreen.classList.add('fade-out');
        
        setTimeout(() => {
            introScreen.style.display = 'none';
            mainApp.style.display = 'flex';
            if (onComplete) onComplete();
        }, 800);
    }

    function init(callback) {
        onComplete = callback;
        const introText = document.getElementById('intro-text');
        typeWriter(introText, text);
    }

    return { init };
})(); 