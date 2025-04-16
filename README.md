# Audio Player Demo

A simple web application built with React and Vite that features a button to play and pause an audio file.

## Features

- Play/pause functionality for audio files
- Responsive design
- Visual feedback for playback state
- Automatically resets when audio playback ends

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
/
├── public/           # Static assets
│   └── audio/        # Audio files
│       └── sample.mp3  # Sample audio file
├── src/              # Source files
│   ├── App.css       # App styling
│   ├── App.tsx       # Main application component
│   ├── index.css     # Global styles
│   └── main.tsx      # Entry point
└── package.json      # Dependencies and scripts
```

## Adding Custom Audio

To use your own audio files:

1. Place your audio files in the `public/audio/` directory
2. Update the `src` attribute in the `<audio>` tag in `App.tsx`

## Technologies Used

- React
- TypeScript
- Vite
- CSS3

## License

This project is licensed under the MIT License - see the LICENSE file for details.
