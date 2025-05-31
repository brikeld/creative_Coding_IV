/**
 * animationUtils.js - Shared animation utilities and state management
 */

const AnimationUtils = (function() {
    let isAnimating = false;
    let animationTimeouts = [];

    function clearAnimationTimeouts() {
        animationTimeouts.forEach(timeout => clearTimeout(timeout));
        animationTimeouts.length = 0;
    }

    function resetAnimationState() {
        isAnimating = false;
        clearAnimationTimeouts();
    }

    function startAnimation() {
        if (isAnimating) return false;
        isAnimating = true;
        clearAnimationTimeouts();
        return true;
    }

    function addTimeout(timeout) {
        animationTimeouts.push(timeout);
    }

    function getAnimationState() {
        return isAnimating;
    }

    return {
        clearAnimationTimeouts,
        resetAnimationState,
        startAnimation,
        addTimeout,
        getAnimationState
    };
})(); 