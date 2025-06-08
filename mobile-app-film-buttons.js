// MOBILE APP CODE - Add this to your mobile app
// Film button handler for cross-app communication

import Firebase from "./Firebase"; // Your existing Firebase setup

const firebase = new Firebase();

// Film IDs matching your other app
const FILM_IDS = {
    'ANORA': 'film-anora',
    'No Country for Old Men': 'film-no-country-for-old-men',
    '1917': 'film-1917',
    'Schindler\'s List': 'film-schindler-s-list',
    'Titanic': 'film-titanic',
    'American Beauty': 'film-american-beauty',
    'Gladiator': 'film-gladiator',
    'A Beautiful Mind': 'film-a-beautiful-mind',
    'Crash': 'film-crash',
    'The Departed': 'film-the-departed',
    'Birdman or (The Unexpected Virtue of Ignorance)': 'film-birdman-or-the-unexpected-virtue-of-ignorance-',
    '12 Years a Slave': 'film-12-years-a-slave',
    'Spotlight': 'film-spotlight',
    'Moonlight': 'film-moonlight',
    'Napoleon': 'film-napoleon',
    'Shutter Island': 'film-shutter-island',
    'The Martian': 'film-the-martian',
    'Amélie': 'film-am-lie',
    'The Return of the King': 'film-the-return-of-the-king',
    'The King\'s Speech': 'film-the-king-s-speech',
    'The Shape of Water': 'film-the-shape-of-water',
    'Green Book': 'film-green-book',
    'Parasite': 'film-parasite',
    'Nomadland': 'film-nomadland',
    'Anatomy of a Fall': 'film-anatomy-of-a-fall',
    'All Quiet on the Western Front': 'film-all-quiet-on-the-western-front',
    'Everything Everywhere All At Once': 'film-everything-everywhere-all-at-once',
    'CODA': 'film-coda',
    'Baby Driver': 'film-baby-driver',
    'House of Gucci': 'film-house-of-gucci',
    'Inception': 'film-inception',
    'Ferrari': 'film-ferrari',
    'Her': 'film-her',
    'Kill Bill: Vol. 1': 'film-kill-bill-vol-1',
    'Kill Bill: Vol. 2': 'film-kill-bill-vol-2',
    'American Hustle': 'film-american-hustle',
    'Conclave': 'film-conclave',
    'Don\'t Look Up': 'film-don-t-look-up',
    'Drive': 'film-drive',
    'Dunkirk': 'film-dunkirk',
    'Focus': 'film-focus',
    'Gladiator 2': 'film-gladiator-2',
    'Girl with a Pearl Earring': 'film-girl-with-a-pearl-earring',
    'Ford v Ferrari': 'film-ford-v-ferrari',
    'Maestro': 'film-maestro',
    'Moneyball': 'film-moneyball',
    'Memoirs of a Geisha': 'film-memoirs-of-a-geisha',
    'Midnight in Paris': 'film-midnight-in-paris',
    'Mank': 'film-mank',
    'Oppenheimer': 'film-oppenheimer',
    'The Brutalist': 'film-the-brutalist',
    'Arrival': 'film-arrival',
    'Asteroid City': 'film-asteroid-city',
    'Barbie': 'film-barbie',
    'Blade Runner 2049': 'film-blade-runner-2049',
    'Dune': 'film-dune',
    'John Wick: Chapter 4': 'film-john-wick-chapter-4',
    'The Killer': 'film-the-killer',
    'The Devil Wears Prada': 'film-the-devil-wears-prada',
    'The Hunger Games Catching Fire': 'film-the-hunger-games-catching-fire',
    'Sicario': 'film-sicario',
    'The Danish Girl': 'film-the-danish-girl',
    'Maria': 'film-maria'
};

// Function to send film selection to other app
function selectFilm(filmName) {
    const filmId = FILM_IDS[filmName];
    if (filmId) {
        // Send using the same pattern as gender/age filters
        firebase.sendFilterCommand(filmId);
        console.log(`📱 Sending film selection: ${filmName} (${filmId})`);
    } else {
        console.warn(`Film not found: ${filmName}`);
    }
}

// Add click handlers to your film buttons
// Example: if your buttons have data-film-name attributes
document.querySelectorAll('.film-button').forEach(button => {
    button.addEventListener('click', () => {
        const filmName = button.dataset.filmName || button.textContent;
        selectFilm(filmName);
    });
});

// Or manually call selectFilm() when buttons are clicked:
// selectFilm('ANORA');
// selectFilm('Inception');
// etc.

export { selectFilm, FILM_IDS }; 