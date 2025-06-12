# Film Collection Bookshelf Visualization

An interactive 3D film collection displayed as a virtual bookshelf with dynamic filtering, animations, and character-driven exploration.

## Features

- **Typewriter Intro**: 
- **3D Bookshelf**: 
- **Interactive Filtering**:
- **Character Exploration**:
- **Winner Animations**:
- **Mobile Support**: 
- **Firebase Integration**:
- **API Integration**: 

## Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the local development URL

## Tech Stack

- **Frontend**: Vanilla JS 
- **3D Graphics**: CSS 3D rendering
- **Animations**: GSAP mostly
- **Build Tool**: Vite
- **Database**: Firebase for data persistence

## Project Structure

- `js/` - Core application modules
  - `intro.js` - Typewriter intro screen
  - `bookshelf.js` - 3D bookshelf rendering
  - `parallelepiped.js` - Individual film object creation
  - `groupFilter.js` - Film filtering and grouping
  - `winnerAnimation.js` - Special effect animations
  - `api.js` - External API for film data updates
- `styles.css` - Application styling
- `testDoing.json` - Film data source

## API Usage

The application exposes a global `filmVisualizer` object for dynamic updates:

```javascript
// Update film text
window.filmVisualizer.updateFilmText('film1', 'NEW TITLE');

// Update film image  
window.filmVisualizer.updateFilmImage('film2', '/path/to/image.jpg');

// Load from JSON
window.filmVisualizer.loadFilmsFromJSON('films.json');
```