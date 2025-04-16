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

## API Integration

This project includes setup for OpenAI API integration. To configure the API key:

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Replace `your_openai_api_key_here` with your actual OpenAI API key in the `.env` file

3. Restart the development server if it's already running

**Important security notes:**
- Never commit your `.env` file to version control
- Never expose API keys in client-side code
- The `.env` file is included in `.gitignore` to prevent accidental exposure
- For production, set environment variables on your hosting platform
