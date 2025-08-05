# Smart Orientation App

A mobile-first web application that automatically switches between four different features based on device orientation.

## Features

### Device Orientation → Feature Mapping

1. **Portrait Mode (Upright)** → **Alarm Clock**
   - Real-time clock display with IST timezone
   - Multiple alarm management with individual controls
   - Quick alarm presets (+1, +2, +4 hours)
   - Bulk operations (Enable All, Disable All, Clear All)
   - Snooze functionality with 5-minute increments
   - Next-day scheduling for late-night alarms

2. **Landscape Mode (Right-Side Up)** → **Stopwatch**
   - High-precision timing with milliseconds
   - Lap functionality with detailed statistics
   - Start/pause/reset controls
   - Lap time tracking with fastest/slowest indicators

3. **Portrait Mode (Upside Down)** → **Timer**
   - Countdown timer with custom input
   - Quick preset buttons (1, 5, 10, 15 minutes)
   - Audio completion alerts
   - Pause/resume functionality

4. **Landscape Mode (Right-Side Up)** → **Weather**
   - Real-time weather data via OpenWeatherMap API
   - Location-based information with automatic updates
   - 5-day forecast with detailed information
   - Manual refresh with visual feedback
   - Location change detection using Haversine formula

## Usage

1. Open the app on a mobile device
2. Hold phone upright → Alarm Clock appears
3. Rotate to landscape → Stopwatch appears
4. Double-tap or swipe in landscape → Switches to Weather
5. Flip phone upside down → Timer appears

## Technical Stack

- **HTML5** - Semantic structure with PWA support
- **CSS3** - Responsive design with glass morphism and modern animations
- **JavaScript (ES6+)** - Device orientation detection and feature logic
- **Device APIs** - DeviceOrientationEvent, Geolocation, Fullscreen
- **Weather API** - OpenWeatherMap (free tier) with automatic updates
- **PWA** - Service worker for offline functionality and caching
- **Local Storage** - Data persistence for user preferences and alarms

## Project Structure

```
techgig-hackathon/
├── index.html                 # Main app entry point
├── src/                       # Source code
│   ├── js/app.js             # Core functionality
│   ├── css/main.css          # Styling
│   └── assets/service-worker.js # PWA support
├── docs/                      # Documentation
│   ├── REQUIREMENTS.md        # Original requirements
│   └── PROJECT_STRUCTURE.md   # Structure guide
├── package.json               # Project configuration
├── LICENSE                    # MIT license
└── README.md                  # This file
```

## Requirements

- **Mobile device** (iOS/Android) with orientation sensors
- **HTTPS connection** (required for device orientation and geolocation)
- **Modern browser** with device orientation support
- **Location permissions** (for weather feature)

## Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Go to repository Settings → Pages
3. Source: "Deploy from a branch" → Branch: `main`
4. Click "Save"
5. Access at: `https://manojkumarkarumanchi.github.io/techgig-hackathon/`

### Local Development
```bash
# Clone the repository
git clone https://github.com/manojkumarkarumanchi/techgig-hackathon.git
cd techgig-hackathon

# Start local server
python -m http.server 8000
# or
npm start

# Access at http://localhost:8000
```

## Core Requirements

- ✅ **Mobile-friendly web application**
- ✅ **Device orientation detection**
- ✅ **Four distinct features based on orientation**
- ✅ **Weather API integration (free tier)**
- ✅ **Browser-only (no native apps)**
- ✅ **Cross-platform compatibility**
- ✅ **Seamless orientation transitions**
- ✅ **Touch-friendly interface**

## Advanced Features

### Production Optimizations
- **Service Worker Caching** - Static and dynamic cache strategies
- **PWA Support** - Installable on mobile devices
- **Offline Functionality** - Works without internet connection
- **Performance Optimized** - Efficient rendering and updates
- **Cross-Browser Compatible** - Works on all modern browsers

### User Experience Enhancements
- **Light/Dark Theme** - Automatic system preference detection
- **12/24 Hour Format** - User preference persistence
- **Fullscreen Mode** - Immersive experience option
- **IST Timezone Support** - Accurate Kolkata time display
- **Responsive Design** - Optimized for all screen sizes

### Technical Implementation
- **Edge Case Handling** - Comprehensive error management
- **Data Persistence** - Local storage for all user data
- **Location Services** - Automatic weather updates based on movement
- **Accessibility** - Screen reader and keyboard navigation support
- **Security** - HTTPS-only features and secure API calls

## Performance Metrics

- **First Load**: ~2-3 seconds (cached)
- **Subsequent Loads**: <1 second (service worker)
- **Orientation Switch**: Instant (<100ms)
- **Weather Updates**: Every 10 minutes + location change
- **Offline Support**: Full functionality for cached features

## Future Enhancements

- **Push Notifications** - For alarm reminders
- **Voice Commands** - Hands-free operation
- **Custom Themes** - User-defined color schemes
- **Data Export** - Backup and restore functionality
- **Social Features** - Share weather and achievements

---

**Live Demo**: [https://manojkumarkarumanchi.github.io/techgig-hackathon/](https://manojkumarkarumanchi.github.io/techgig-hackathon/)

**Repository**: [https://github.com/manojkumarkarumanchi/techgig-hackathon](https://github.com/manojkumarkarumanchi/techgig-hackathon)