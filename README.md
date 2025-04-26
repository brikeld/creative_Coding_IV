# Piu Films Collection - Parallelepiped Visualization

A dynamic film collection visualization using 3D parallelepiped elements with DVD-like text displays.

## Features

- 3D parallelepipeds with dynamic lighting and textures
- DVD-style text circular layout inside each parallelepiped
- Smooth drag scrolling for intuitive navigation
- API for dynamically updating film data

## Film Visualization API

The application exposes a global `filmVisualizer` object with the following methods:

### `updateFilmText(filmId, newText)`

Updates the text content of a specific parallelepiped.

```javascript
// Example: Update text for film1
window.filmVisualizer.updateFilmText('film1', 'NEW AMELIE');
```

### `updateFilmImage(filmId, newImagePath)`

Updates the image texture of a specific parallelepiped.

```javascript
// Example: Update image for film2
window.filmVisualizer.updateFilmImage('film2', '/cofanetto/delicatessen.jpg');
```

### `updateFilm(filmId, updateData)`

Updates both text and image of a specific parallelepiped.

```javascript
// Example: Update both text and image for film3
window.filmVisualizer.updateFilm('film3', {
  text: 'CITY OF LOST CHILDREN',
  image: '/cofanetto/city.jpg'
});
```

### `updateAllFilms(newFilmsData)`

Updates multiple films with new data.

```javascript
// Example: Update multiple films
window.filmVisualizer.updateAllFilms([
  { id: 'film1', text: 'AMELIE POULAIN' },
  { id: 'film4', image: '/cofanetto/micmacs.jpg' }
]);
```

### `loadFilmsFromJSON(jsonPath)`

Loads film data from a JSON file and updates the visualization.

```javascript
// Example: Load data from films.json
window.filmVisualizer.loadFilmsFromJSON('films.json');
```

### `getFilmData()`

Returns a copy of the current films array.

```javascript
// Example: Get current film data
const films = window.filmVisualizer.getFilmData();
console.log(films);
```

## JSON Data Format

The film data should follow this format:

```json
[
  { 
    "id": "film1", 
    "image": "/path/to/image.jpg", 
    "text": "FILM TITLE" 
  },
  // More film objects...
]
```

## Demo

Open `demo.html` to see a demonstration of the API in action.

## Files

- `index.html` - Main application
- `demo.html` - API demonstration with controls
- `main.js` - Core visualization logic and API
- `styles.css` - Styling for the 3D elements
- `films.json` - Sample film data 