# 📁 Project Structure

```
techgig-hackathon/
├── 📄 index.html                 # Main application entry point
├── 📁 src/                       # Source code directory
│   ├── 📁 js/                    # JavaScript files
│   │   └── 📄 app.js            # Main application logic
│   ├── 📁 css/                   # Stylesheet files
│   │   └── 📄 main.css          # Main stylesheet
│   └── 📁 assets/                # Static assets
│       └── 📄 service-worker.js  # Service worker for PWA
├── 📁 docs/                      # Documentation
│   ├── 📄 requirements.md        # Original project requirements
│   └── 📄 PROJECT_STRUCTURE.md   # This file
├── 📄 README.md                  # Project documentation
├── 📄 package.json               # Package configuration
├── 📄 LICENSE                    # MIT license
└── 📄 .gitignore                 # Git ignore rules
```

## File Descriptions

### Core Application Files

- **`index.html`**: The main HTML file that serves as the entry point for the web application. Contains the structure for all four features (Alarm Clock, Stopwatch, Timer, Weather) and the orientation detection interface.

- **`src/js/app.js`**: The main JavaScript file containing all application logic including:
  - Device orientation detection and handling
  - Feature switching based on orientation
  - Alarm clock functionality with time display and alarm setting
  - Stopwatch with start, pause, reset, and lap functionality
  - Timer with countdown, preset buttons, and completion handling
  - Weather data fetching and display (with fallback demo data)
  - Mobile device detection
  - Service worker registration

- **`src/css/main.css`**: The main stylesheet containing all styling including:
  - Glass morphism UI design
  - Responsive layout for different orientations
  - Feature container styling and transitions
  - Button and input styling
  - Loading animations and effects
  - Mobile-first responsive design

### Assets

- **`src/assets/service-worker.js`**: Service worker for Progressive Web App (PWA) functionality including:
  - Caching of application resources
  - Offline functionality
  - Favicon handling
  - Cache management and updates

### Documentation

- **`docs/requirements.md`**: Contains the original project requirements and feature specifications from the hackathon problem statement.

- **`docs/PROJECT_STRUCTURE.md`**: This file, documenting the project structure and file organization.

- **`README.md`**: Main project documentation including:
  - Project overview and features
  - Installation and usage instructions
  - Deployment options
  - Technical stack information
  - Project structure overview

### Configuration

- **`package.json`**: Node.js package configuration with:
  - Project metadata
  - Dependencies (if any)
  - Scripts for development and deployment

- **`.gitignore`**: Git ignore rules for excluding unnecessary files from version control.

- **`LICENSE`**: MIT license file for the project.

## Key Features

### Orientation-Based Feature Switching
- **Portrait Upright**: Alarm Clock
- **Landscape**: Stopwatch (with double-tap toggle to Weather)
- **Portrait Upside Down**: Timer

### Mobile-First Design
- Responsive layout optimized for mobile devices
- Touch-friendly interface
- Glass morphism UI design
- Smooth transitions and animations

### Progressive Web App (PWA)
- Service worker for offline functionality
- Caching of application resources
- Installable on mobile devices

### Cross-Platform Compatibility
- Works on Android and iOS devices
- Browser-based execution (no native app required)
- Responsive design for different screen sizes

## Development Workflow

1. **Local Development**: Use a local server to test the application
2. **GitHub Pages Deployment**: Automatic deployment from the `cursor-test` branch
3. **Version Control**: Git-based workflow with proper branching strategy

## Deployment

The application is deployed to GitHub Pages at:
`https://manojkumarkarumanchi.github.io/techgig-hackathon/`

The deployment branch is `cursor-test` and updates are automatically reflected when changes are pushed to this branch. 