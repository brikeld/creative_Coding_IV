/**
 * groupFilter.js - Handles group-based category filtering with column layout
 */

const GroupFilter = (function() {
    
    function arrangeShelvesForGroups(groups) {
        if (!AnimationUtils.startAnimation()) return;
        
        const shelfContainers = document.querySelectorAll('.shelf-container');
        
        // CLEAN UP any existing group labels first
        document.querySelectorAll('.group-label').forEach(label => label.remove());
        
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
        const maxGroups = 5;
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
                
                // Add elements directly to shelf (bypass Bookshelf system)
                for (let j = startIdx; j < endIdx; j++) {
                    if (groupElements[j]) {
                        shelf.appendChild(groupElements[j]);
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
            el.style.transform = window.DEFAULT_TRANSFORM;
            const startPos = startPositions[i];
            const endPos = endPositions[i];
            const deltaX = startPos.left - endPos.left;
            const deltaY = startPos.top - endPos.top;
            
            gsap.set(el, { x: deltaX, y: deltaY, opacity: 1 });
        });
    }
    
    function positionGroupsInColumns(groupPositions, shelfContainers, originalShelfPositions) {
        console.log('📍 positionGroupsInColumns called with', groupPositions.length, 'groups');
        
        // Simple grid layout parameters
        const columnWidth = 600;
        const shelfHeight = 130;
        const startX = 10; // Left column starts here
        const startY = 70;  // All groups start at this Y
        
        // Assign columns: pack vertically first, then horizontally
        const maxColumnHeight = window.innerHeight - 200; // Leave some margin
        const columns = []; // Track column heights
        
        groupPositions.forEach((groupInfo, index) => {
            const groupHeight = groupInfo.shelfCount * shelfHeight;
            let placedInColumn = false;
            
            // Try to place in existing columns first
            for (let colIndex = 0; colIndex < columns.length; colIndex++) {
                if (columns[colIndex] + groupHeight <= maxColumnHeight) {
                    groupInfo.targetColumn = colIndex;
                    groupInfo.targetY = columns[colIndex];
                    columns[colIndex] += groupHeight;
                    placedInColumn = true;
                    console.log(`📦 Group ${groupInfo.groupKey} → column ${colIndex} at Y=${groupInfo.targetY}`);
                    break;
                }
            }
            
            // Create new column if couldn't fit in existing ones
            if (!placedInColumn) {
                groupInfo.targetColumn = columns.length;
                groupInfo.targetY = 0;
                columns.push(groupHeight);
                console.log(`🆕 Group ${groupInfo.groupKey} → new column ${groupInfo.targetColumn}`);
            }
        });
        
        console.log(`📐 Using grid layout: startX=${startX}, startY=${startY}, columnWidth=${columnWidth}`);
        
        groupPositions.forEach((groupInfo) => {
            const columnX = startX + (groupInfo.targetColumn * columnWidth);
            const groupStartY = startY + groupInfo.targetY; // Add group offset within column
            
            console.log(`🏗️ Group ${groupInfo.groupKey}: column=${groupInfo.targetColumn}, x=${columnX}, startY=${groupStartY}`);
            
            // Position each shelf in this group
            for (let i = 0; i < groupInfo.shelfCount; i++) {
                const shelfIndex = groupInfo.shelfStart + i;
                const container = shelfContainers[shelfIndex];
                
                if (!container) continue;
                
                const shelfY = groupStartY + (i * shelfHeight);
                
                console.log(`📍 Shelf ${shelfIndex}: x=${columnX}, y=${shelfY}`);
                
                // Use absolute positioning instead of transforms
                container.style.position = 'absolute';
                container.style.left = `${columnX}px`;
                container.style.top = `${shelfY}px`;
                
                if (i === groupInfo.shelfCount - 1) {
                    addGroupLabel(container, groupInfo);
                }
            }
        });
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
        
        label.textContent = `${groupInfo.groupKey} - ${formatEarnings(groupInfo.groupEarnings)}`;
        label.style.cssText = `
            position: absolute;
            top: 50px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-family: 'Input Mono', monospace;
            font-size: 0.8rem;
            text-align: center;
            white-space: nowrap;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
            max-width: 200px;
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
                }, 100);
                AnimationUtils.addTimeout(timeout);
            }
        });
    }
    
    return {
        arrangeShelvesForGroups
    };
})(); 