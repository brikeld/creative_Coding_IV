// Test script to verify winner calculation
// Run this in browser console after page loads

function testWinnerCalculation() {
    const categories = Object.keys(FilmData.getFilterCategories());
    const filmCounts = {};
    
    console.log('Testing winner calculation...');
    console.log('Categories:', categories.length);
    
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
            console.log(`${category}: Top group "${sortedGroups[0].key}" with ${topGroup.length} films`);
            topGroup.forEach(filmId => {
                const film = FilmData.getAllFilms().find(f => f.id === filmId);
                if (film) {
                    if (!filmCounts[film.filmName]) filmCounts[film.filmName] = 0;
                    filmCounts[film.filmName]++;
                }
            });
        }
    });

    const sorted = Object.entries(filmCounts).sort((a, b) => b[1] - a[1]);
    console.log('Top 5 films by appearances in top earning groups:');
    sorted.slice(0, 5).forEach(([name, count]) => {
        console.log(`${name}: ${count}/${categories.length} times`);
    });
    
    return sorted[0];
}

// Auto-run after 3 seconds
setTimeout(() => {
    if (typeof FilmData !== 'undefined') {
        testWinnerCalculation();
    }
}, 3000); 