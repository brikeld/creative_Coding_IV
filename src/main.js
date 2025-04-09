// main.js
let allFacts = [];
let selectedTags = new Set();
let allTags = [];


async function fetchTags() {
  try {
    const response = await fetch('/facts.json');
    const data = await response.json();
    allFacts = data.facts;
    
    allTags = [...new Set(
      data.facts.flatMap(fact => fact.tags)
    )];
    
    displayTags(allTags);
    updateResults(); 
  } catch (error) {
    console.error('Error:', error);
    document.querySelector('#tags-container').innerHTML = `
      <p class="error">Error: ${error.message}</p>
    `;
  }
}

function getAvailableTags() {
  if (selectedTags.size === 0) {
    return allTags;
  }

  const matchingFacts = allFacts.filter(fact => 
    Array.from(selectedTags).every(tag => fact.tags.includes(tag))
  );

  const availableTags = [...new Set(
    matchingFacts.flatMap(fact => fact.tags)
  )];

  return availableTags;
}

function displayTags(tags) {
  const availableTags = getAvailableTags();
  
  const tagCounts = {};
  availableTags.forEach(tag => {
    const factsWithTag = allFacts.filter(fact => {
      return fact.tags.includes(tag) && 
             Array.from(selectedTags).every(selectedTag => fact.tags.includes(selectedTag));
    });
    tagCounts[tag] = factsWithTag.length;
  });
  
  const sortedTags = availableTags.sort((a, b) => tagCounts[b] - tagCounts[a]);
  
  const tagsContainer = document.querySelector('#tags-container');
  
  tagsContainer.innerHTML = `
    <h2>Select Tags</h2>
    <ul class="tags-list">
      ${sortedTags.map(tag => `
        <li class="tag ${selectedTags.has(tag) ? 'selected' : ''}" 
            data-tag="${tag}">
          ${tag} (${tagCounts[tag]})
        </li>
      `).join('')}
    </ul>
  `;

  document.querySelectorAll('.tag').forEach(tagElement => {
    tagElement.addEventListener('click', () => {
      const tag = tagElement.dataset.tag;
      
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
      } else {
        selectedTags.add(tag);
      }
      
      displayTags(allTags); 
      updateResults();
    });
  });
}

function updateResults() {
  const resultsContainer = document.querySelector('#results-container');
  const filteredFacts = allFacts.filter(fact => 
    Array.from(selectedTags).every(tag => fact.tags.includes(tag))
  );

  resultsContainer.innerHTML = selectedTags.size === 0 
    ? '<p class="info">Select tags to see matching facts</p>'
    : `
      <h2>Showing facts with all selected tags (${selectedTags.size})</h2>
      <div class="facts-list">
        ${filteredFacts.map(fact => `
          <div class="fact-card">
            <p class="fact-text">${fact.text}</p>
            <div class="fact-tags">
              ${fact.tags.map(tag => `
                <span class="fact-tag ${selectedTags.has(tag) ? 'highlight' : ''}">${tag}</span>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
}
fetchTags();