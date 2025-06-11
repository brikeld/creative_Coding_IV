/**
 * groupFilter.js - Handles group-based category filtering with column layout
 */

const GroupFilter = (function() {
    
    function arrangeShelvesForGroups(groups) {
        if (!AnimationUtils.startAnimation()) return;
        
        const shelfContainers = document.querySelectorAll('.shelf-container');
        
        // CLEAN UP any existing group labels first
        document.querySelectorAll('.group-label').forEach(label => label.remove());
        
        // Remove any existing floating animations
        document.querySelectorAll('.parallelepiped.group-float').forEach(el => {
            el.classList.remove('group-float');
            el.style.removeProperty('--float-duration');
            el.style.removeProperty('--float-delay');
            el.style.removeProperty('--translate-end');
            el.style.removeProperty('--rotate-z-end');
            el.style.removeProperty('--rotate-start');
        });
        
        // CAPTURE ORIGINAL POSITIONS FIRST - before any manipulation
        const originalShelfPositions = Array.from(shelfContainers).map((container, index) => {
            const rect = container.getBoundingClientRect();
            return { index, top: rect.top, left: rect.left };
        });
        
        console.log('🔥 GroupFilter.arrangeShelvesForGroups called with groups:', Object.keys(groups));
        
        // Set filtered state
        const bookshelf = document.querySelector('.bookshelf');
        if (bookshelf) bookshelf.classList.add('filtered');
        
        // Limit groups and sort by earnings
        const groupKeys = Object.keys(groups);
        const maxGroups = 6;
        const processedGroups = groupKeys.length > maxGroups ? 
            consolidateGroups(groups, groupKeys, maxGroups) : groups;
        const sortedGroupData = sortGroupsByEarnings(processedGroups, Object.keys(processedGroups));
        const sortedGroupKeys = sortedGroupData.map(g => g.key);
        
        // Prepare elements for animation
        const { groupElementsMap, allElements, startPositions } = prepareElementsForAnimation(sortedGroupKeys, processedGroups);
        
        // Distribute groups to shelves and get position data
        const { usedShelves, groupPositions } = distributeGroupsToShelves(sortedGroupKeys, groupElementsMap, sortedGroupData, shelfContainers);
        
        // Hide unused shelves
        hideUnusedShelves(shelfContainers, usedShelves);
        
        // Get end positions and set initial animation state
        const endPositions = getEndPositions(allElements);
        setInitialAnimationPositions(allElements, startPositions, endPositions);
        
        // Execute column positioning BEFORE any other animations - pass original positions
        positionGroupsInColumns(groupPositions, shelfContainers, originalShelfPositions);
        
        // Animate items (no shelf resizing interference)
        animateItemsToPositions(allElements);
        
        // Apply floating animation to highest earning group
        setTimeout(() => {
            applyFloatingAnimation(groupElementsMap, sortedGroupKeys);
        }, 100);
    }
    
    function consolidateGroups(groups, groupKeys, maxGroups) {
        const groupsWithEarnings = groupKeys.map(groupKey => {
            const groupTotal = calculateGroupEarnings(groups[groupKey]);
            return { key: groupKey, earnings: groupTotal, items: groups[groupKey] };
        }).sort((a, b) => b.earnings - a.earnings);
        
        const topGroups = groupsWithEarnings.slice(0, maxGroups - 1);
        const otherGroups = groupsWithEarnings.slice(maxGroups - 1);
        
        const newGroups = {};
        topGroups.forEach(group => {
            newGroups[group.key] = group.items;
        });
        
        if (otherGroups.length > 0) {
            const otherItems = otherGroups.flatMap(group => group.items);
            newGroups['Others'] = otherItems;
        }
        
        return newGroups;
    }
    
    function calculateGroupEarnings(filmIds) {
        return filmIds.reduce((sum, filmId) => {
            const film = FilmData.getAllFilms().find(f => f.id === filmId);
            if (film) {
                const charData = FilmData.getCharacterData(film.filmName);
                return sum + (charData?.film_info?.box_office || 0);
            }
            return sum;
        }, 0);
    }
    
    function sortGroupsByEarnings(groups, groupKeys) {
        return groupKeys.map(groupKey => {
            const groupTotal = calculateGroupEarnings(groups[groupKey]);
            return { key: groupKey, earnings: groupTotal };
        }).sort((a, b) => b.earnings - a.earnings);
    }
    
    function prepareElementsForAnimation(sortedGroupKeys, groups) {
        const groupElementsMap = {};
        const allElements = [];
        
        sortedGroupKeys.forEach(groupKey => {
            const elements = groups[groupKey].map(id => document.getElementById(id)).filter(Boolean);
            groupElementsMap[groupKey] = elements;
            allElements.push(...elements);
        });
        
        const startPositions = allElements.map(el => {
            const rect = el.getBoundingClientRect();
            return { element: el, top: rect.top, left: rect.left };
        });
        
        return { groupElementsMap, allElements, startPositions };
    }
    
    function distributeGroupsToShelves(sortedGroupKeys, groupElementsMap, sortedGroupData, shelfContainers) {
        let shelfIndex = 0;
        const usedShelves = [];
        const groupPositions = [];
        
        sortedGroupKeys.forEach((groupKey, sortedIndex) => {
            const groupElements = groupElementsMap[groupKey];
            if (groupElements.length === 0) return;
            
            const isHighestEarning = sortedIndex === 0;
            const groupEarnings = sortedGroupData.find(g => g.key === groupKey).earnings;
            
            // Apply styling classes
            groupElements.forEach(el => {
                el.classList.remove('matching', 'non-matching');
                el.className = el.className.replace(/group-\d+/g, '');
                el.classList.remove('group-grayscale');
                
                if (isHighestEarning) {
                    el.classList.add('group-0');
                } else {
                    el.classList.add('group-grayscale');
                    // Reset transform for grayscale elements to ensure clean state
                    el.style.transform = 'rotateX(-40deg) rotateY(0deg)';
                    // Clear any GSAP transform properties
                    gsap.set(el, { clearProps: "transform" });
                    // Reapply our manual transform after GSAP clear
                    el.style.transform = 'rotateX(-40deg) rotateY(0deg)';
                }
                el.dataset.groupKey = groupKey;
            });
            
            // Distribute to shelves using direct DOM manipulation
            const shelvesForGroup = Math.ceil(groupElements.length / Animations.capacity.itemsPerShelf);
            const groupStartShelf = shelfIndex;
            
            for (let i = 0; i < shelvesForGroup && shelfIndex < shelfContainers.length; i++) {
                const shelfContainer = shelfContainers[shelfIndex];
                if (!shelfContainer) break;
                
                const shelf = shelfContainer.querySelector('.shelf-items');
                const startIdx = i * Animations.capacity.itemsPerShelf;
                const endIdx = Math.min(startIdx + Animations.capacity.itemsPerShelf, groupElements.length);
                
                // Clear shelf first
                shelf.innerHTML = '';
                
                // Add elements directly to shelf and apply progressive rotation for grayscale groups
                for (let j = startIdx; j < endIdx; j++) {
                    if (groupElements[j]) {
                        shelf.appendChild(groupElements[j]);
                        
                        // Apply progressive rotation for grayscale groups
                        if (!isHighestEarning) {
                            const positionInShelf = j - startIdx;
                            const baseRotation = 30;
                            const increment = 1;
                            const yRotation = baseRotation + (positionInShelf * increment);
                            groupElements[j].style.transform = `rotateX(-40deg) rotateY(${yRotation}deg)`;
                        }
                    }
                }
                
                shelfContainer.classList.add(`group-${sortedIndex}-shelf`);
                shelfContainer.dataset.groupKey = groupKey;
                shelfContainer.style.display = 'block';
                usedShelves.push(shelfIndex);
                shelfIndex++;
            }
            
            groupPositions.push({
                groupKey,
                groupEarnings,
                sortedIndex,
                shelfStart: groupStartShelf,
                shelfCount: shelvesForGroup
            });
        });
        
        return { usedShelves, groupPositions };
    }
    
    function hideUnusedShelves(shelfContainers, usedShelves) {
        shelfContainers.forEach((container, index) => {
            if (!usedShelves.includes(index)) {
                container.style.display = 'none';
            }
        });
    }
    
    function getEndPositions(allElements) {
        return allElements.map(el => {
            const rect = el.getBoundingClientRect();
            return { element: el, top: rect.top, left: rect.left };
        });
    }
    
    function setInitialAnimationPositions(allElements, startPositions, endPositions) {
        allElements.forEach((el, i) => {
            // Don't override CSS animation, just set GSAP positions
            const startPos = startPositions[i];
            const endPos = endPositions[i];
            const deltaX = startPos.left - endPos.left;
            const deltaY = startPos.top - endPos.top;
            
            gsap.set(el, { x: deltaX, y: deltaY, opacity: 1 });
        });
    }
    
    function positionGroupsInColumns(groupPositions, shelfContainers, originalShelfPositions) {
        console.log('📍 positionGroupsInColumns called with', groupPositions.length, 'groups');
        
        // Better spacing - separate intra-group and inter-group spacing
        const columnWidth = 750; // Slightly increased for better spacing
        const shelfHeight = 135; // For inter-group spacing (between different groups)
        const intraGroupShelfHeight = 100; // For intra-group spacing (shelves within same group)
        const startX = 10;
        const startY = 140;
        
        // More conservative column height to ensure all groups are visible
        const maxColumnHeight = 700; // Increased slightly for better distribution
        const columns = []; // Track column heights
        
        groupPositions.forEach((groupInfo, index) => {
            const groupHeight = groupInfo.shelfCount * shelfHeight;
            const extraSpacing = groupInfo.sortedIndex === 0 ? 80 : 0; // Extra gap after highest earning group
            const totalGroupHeight = groupHeight + extraSpacing;
            let placedInColumn = false;
            
            // Try to place in existing columns first
            for (let colIndex = 0; colIndex < columns.length; colIndex++) {
                if (columns[colIndex] + groupHeight <= maxColumnHeight) {
                    groupInfo.targetColumn = colIndex;
                    groupInfo.targetY = columns[colIndex];
                    columns[colIndex] += totalGroupHeight; // Use total height including extra spacing
                    placedInColumn = true;
                    console.log(`📦 Group ${groupInfo.groupKey} → column ${colIndex} at Y=${groupInfo.targetY}`);
                    break;
                }
            }
            
            // Create new column if couldn't fit in existing ones
            if (!placedInColumn) {
                groupInfo.targetColumn = columns.length;
                groupInfo.targetY = 0;
                columns.push(totalGroupHeight); // Use total height including extra spacing
                console.log(`🆕 Group ${groupInfo.groupKey} → new column ${groupInfo.targetColumn}`);
            }
        });
        
        console.log(`📐 Using grid layout: startX=${startX}, startY=${startY}, columnWidth=${columnWidth}`);
        
        groupPositions.forEach((groupInfo, groupIndex) => {
            const columnX = startX + (groupInfo.targetColumn * columnWidth);
            const groupStartY = startY + groupInfo.targetY;
            
            console.log(`🏗️ Group ${groupInfo.groupKey}: column=${groupInfo.targetColumn}, x=${columnX}, startY=${groupStartY}`);
            
            // Position each shelf in this group
            for (let i = 0; i < groupInfo.shelfCount; i++) {
                const shelfIndex = groupInfo.shelfStart + i;
                const container = shelfContainers[shelfIndex];
                
                if (!container) {
                    console.warn(`⚠️ Missing container for shelf ${shelfIndex}`);
                    continue;
                }
                
                const shelfY = groupStartY + (i * intraGroupShelfHeight);
                
                console.log(`📍 Shelf ${shelfIndex}: x=${columnX}, y=${shelfY}`);
                
                // Ensure shelf is visible and properly positioned
                container.style.display = 'block';
                
                // Add natural staggered delay based on shelf position
                const naturalDelay = (shelfIndex * Animations.timings.shelfSplit.stagger) + (groupIndex * 0.1);
                
                // Animate to absolute position with staggered timing
                gsap.to(container, {
                    duration: Animations.timings.shelfSplit.duration,
                    ease: Animations.timings.shelfSplit.ease,
                    delay: naturalDelay,
                    position: 'absolute',
                    left: `${columnX}px`,
                    top: `${shelfY}px`
                });
                
                if (i === groupInfo.shelfCount - 1) {
                    addGroupLabel(container, groupInfo);
                }
            }
        });
        
        // Resize shelves after a short delay
        setTimeout(() => {
            console.log('🔄 Resizing shelves based on content...');
            
            document.querySelectorAll('.shelf-container').forEach((container, index) => {
                const shelfItems = container.querySelector('.shelf-items');
                const itemCount = shelfItems.childElementCount;
                
                if (itemCount > 0) {
                    const itemWidth = 75;
                    const padding = 60;
                    const calculatedWidth = (itemCount * itemWidth) + padding;
                    
                    console.log(`📏 Shelf ${index}: ${itemCount} items → ${calculatedWidth}px`);
                    
                    gsap.to(container, {
                        width: calculatedWidth,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                    
                    gsap.to(container.querySelector('.shelf'), {
                        width: calculatedWidth,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                }
            });
        }, 200);
    }
    
    function addGroupLabel(container, groupInfo) {
        const label = document.createElement('div');
        label.className = 'group-label';
        
        const formatEarnings = (num) => {
            const format = (value, suffix) => {
                let formatted = value.toPrecision(3);
                if (formatted.includes('e+')) {
                    formatted = formatted.split('e+')[0];
                }
                return `${formatted}${suffix}`;
            };
            if (num >= 1e12) return format(num / 1e12, 'T');
            if (num >= 1e9) return format(num / 1e9, 'B');
            if (num >= 1e6) return format(num / 1e6, 'M');
            if (num >= 1e3) return format(num / 1e3, 'K');
            return num.toPrecision(3);
        };
        
        const borderColor = groupInfo.sortedIndex === 0 ? 'white' : 'rgb(167, 167, 167)';
        const nameColor = groupInfo.sortedIndex === 0 ? 'white' : 'rgb(167, 167, 167)';
        label.innerHTML = `
            <span style="color: ${nameColor};">${groupInfo.groupKey.toUpperCase()}</span>
            <span style="color: green;">  $${formatEarnings(groupInfo.groupEarnings)}</span>
        `;
        label.style.cssText = `
            position: absolute;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            font-family: 'Input Mono', monospace;
            font-size: .76rem;
            font-weight: bold;
            text-align: center;
            white-space: nowrap;
            border: 2px solid ${borderColor};
            border-radius: 20px;
            padding: 8px 16px;
            max-width: 250px;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        container.appendChild(label);
    }
    
    function animateItemsToPositions(allElements) {
        gsap.to(allElements, {
            duration: Animations.timings.itemsToPosition.duration,
            x: 0,
            y: 0,
            ease: Animations.timings.itemsToPosition.ease,
            stagger: Animations.timings.itemsToPosition.stagger,
            onComplete: () => {
                const timeout = setTimeout(() => {
                    AnimationUtils.resetAnimationState();
                    EmptySpaceDetector.detectAndPlaceText();
                }, 100);
                AnimationUtils.addTimeout(timeout);
            }
        });
    }
    
    function applyFloatingAnimation(groupElementsMap, sortedGroupKeys) {
        const highestEarningGroup = sortedGroupKeys[0];
        const highestEarningElements = groupElementsMap[highestEarningGroup];
        
        highestEarningElements.forEach((el, index) => {
            el.classList.add('group-float');
            
            // Minimal variation - just subtle floating
            const duration = 2.5 + Math.random() * 1; // 2.5s to 3.5s (slower)
            const delay = Math.random() * 0.3; // 0s to 0.3s delay
            const translateEnd = -1 - Math.random() * 2; // -1px to -3px (minimal up/down)
            const rotateZEnd = -1 + Math.random() * 2; // -1deg to 1deg (tiny left/right)
            const rotateStart = -0.5 + Math.random() * 1; // -0.5deg to 0.5deg
            
            el.style.setProperty('--float-duration', `${duration}s`);
            el.style.setProperty('--float-delay', `${delay}s`);
            el.style.setProperty('--translate-end', `${translateEnd}px`);
            el.style.setProperty('--rotate-z-end', `${rotateZEnd}deg`);
            el.style.setProperty('--rotate-start', `${rotateStart}deg`);
        });
    }
    
    return {
        arrangeShelvesForGroups
    };
})(); 