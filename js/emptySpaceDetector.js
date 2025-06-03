/**
 * emptySpaceDetector.js - Detects empty screen areas after filtering and places text
 */

const EmptySpaceDetector = (function() {
    let textElement = null;
    let detectionTimeout = null;
    
    function detectAndPlaceText() {
        return;
        
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
            const emptyArea = findLargestEmptyArea();
            if (emptyArea.width > 250 && emptyArea.height > 80) {
                placeTextInArea(emptyArea);
            }
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
    
    function findLargestEmptyArea() {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight - 200
        };
        
        // Get all visible shelf containers with larger buffer zones
        const shelves = Array.from(document.querySelectorAll('.shelf-container'))
            .filter(shelf => shelf.style.display !== 'none')
            .map(shelf => {
                const rect = shelf.getBoundingClientRect();
                return {
                    left: rect.left - 100, // Increased buffer
                    top: rect.top - 80,
                    right: rect.right + 100,
                    bottom: rect.bottom + 80
                };
            });
        
        // More granular grid scanning
        const gridSize = 30;
        let maxArea = 0;
        let bestArea = { x: 0, y: 0, width: 0, height: 0 };
        
        for (let x = 50; x < viewport.width - 300; x += gridSize) {
            for (let y = 120; y < viewport.height - 120; y += gridSize) {
                const area = findMaxRectangleAt(x, y, shelves, viewport);
                if (area.width * area.height > maxArea) {
                    maxArea = area.width * area.height;
                    bestArea = area;
                }
            }
        }
        
        return bestArea;
    }
    
    function findMaxRectangleAt(startX, startY, shelves, viewport) {
        let maxWidth = 0;
        let maxHeight = 0;
        
        // Find max width at this Y position
        for (let x = startX; x < viewport.width - 50; x += 15) {
            if (isPointEmpty(x, startY, shelves)) {
                maxWidth = x - startX + 15;
            } else {
                break;
            }
        }
        
        // Find max height at this X position
        for (let y = startY; y < viewport.height - 50; y += 15) {
            if (isPointEmpty(startX, y, shelves)) {
                maxHeight = y - startY + 15;
            } else {
                break;
            }
        }
        
        return { x: startX, y: startY, width: maxWidth, height: maxHeight };
    }
    
    function isPointEmpty(x, y, shelves) {
        return !shelves.some(shelf => 
            x >= shelf.left && x <= shelf.right &&
            y >= shelf.top && y <= shelf.bottom
        );
    }
    
    function placeTextInArea(area) {
        textElement = document.createElement('div');
        textElement.className = 'empty-space-text';
        
        // Content to display
        const content = {
            title: 'Analysis Results',
            body: 'Top performing character group shows significant box office correlation with specific demographic patterns.',
            footer: `Detected: ${Math.round(area.width)}×${Math.round(area.height)}px`
        };
        
        // Calculate available space (minus padding)
        const padding = 32; // 16px on each side
        const availableWidth = area.width - padding;
        const availableHeight = area.height - padding;
        
        // Find optimal font size using binary search
        const optimalSize = findOptimalFontSize(content, availableWidth, availableHeight);
        
        textElement.innerHTML = `
            <h3 style="margin: 0 0 ${optimalSize.fontSize * 0.5}px 0; font-size: ${optimalSize.fontSize}px; line-height: ${optimalSize.lineHeight};">${content.title}</h3>
            <p style="margin: 0 0 ${optimalSize.fontSize * 0.3}px 0; font-size: ${optimalSize.fontSize}px; line-height: ${optimalSize.lineHeight};">${content.body}</p>
            <p style="margin: 0; font-size: ${optimalSize.fontSize * 0.7}px; line-height: ${optimalSize.lineHeight}; opacity: 0.7;">${content.footer}</p>
        `;
        
        textElement.style.cssText = `
            position: fixed;
            left: ${area.x + 16}px;
            top: ${area.y + 16}px;
            width: ${availableWidth}px;
            height: ${availableHeight}px;
            background: rgba(0, 0, 0, 0.85);
            color: #ffffff;
            font-family: 'Input Mono', monospace;
            padding: 16px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.25);
            z-index: 15;
            opacity: 0;
            transition: opacity 0.3s ease;
            overflow: hidden;
            box-sizing: border-box;
        `;
        
        document.body.appendChild(textElement);
        
        // Fade in
        setTimeout(() => {
            if (textElement) {
                textElement.style.opacity = '0.9';
            }
        }, 50);
    }
    
    function findOptimalFontSize(content, maxWidth, maxHeight) {
        let minSize = 8;
        let maxSize = Math.min(maxWidth / 10, maxHeight / 8); // Reasonable upper bound
        let bestSize = minSize;
        
        // Binary search for optimal font size
        while (minSize <= maxSize) {
            const testSize = Math.floor((minSize + maxSize) / 2);
            const lineHeight = testSize * 1.3;
            
            if (textFitsInArea(content, testSize, lineHeight, maxWidth, maxHeight)) {
                bestSize = testSize;
                minSize = testSize + 1;
            } else {
                maxSize = testSize - 1;
            }
        }
        
        return {
            fontSize: bestSize,
            lineHeight: bestSize * 1.3
        };
    }
    
    function textFitsInArea(content, fontSize, lineHeight, maxWidth, maxHeight) {
        // Create temporary element to measure text dimensions
        const tempEl = document.createElement('div');
        tempEl.style.cssText = `
            position: absolute;
            visibility: hidden;
            font-family: 'Input Mono', monospace;
            font-size: ${fontSize}px;
            line-height: ${lineHeight}px;
            width: ${maxWidth}px;
            word-wrap: break-word;
            white-space: normal;
        `;
        
        // Build the same content structure
        const titleMargin = fontSize * 0.5;
        const bodyMargin = fontSize * 0.3;
        tempEl.innerHTML = `
            <h3 style="margin: 0 0 ${titleMargin}px 0; font-size: ${fontSize}px; line-height: ${lineHeight}px;">${content.title}</h3>
            <p style="margin: 0 0 ${bodyMargin}px 0; font-size: ${fontSize}px; line-height: ${lineHeight}px;">${content.body}</p>
            <p style="margin: 0; font-size: ${fontSize * 0.7}px; line-height: ${lineHeight}px;">${content.footer}</p>
        `;
        
        document.body.appendChild(tempEl);
        const height = tempEl.offsetHeight;
        document.body.removeChild(tempEl);
        
        return height <= maxHeight;
    }
    
    return {
        detectAndPlaceText,
        clearText
    };
})(); 