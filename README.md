# 📱 Smart Orientation App

A mobile web application that **automatically switches between four different features** based on how you hold your device.

## 🎯 Features

### 📱 Device Orientation → Feature Mapping

1. **Portrait Mode (Upright)** → **Alarm Clock**
   - Real-time clock display
   - Set custom alarms with notifications
   - Audio alerts

2. **Landscape Mode (Right-Side Up)** → **Stopwatch**
   - High-precision timing with milliseconds
   - Lap functionality
   - Start/pause/reset controls

3. **Portrait Mode (Upside Down)** → **Timer**
   - Countdown timer with presets
   - Audio completion alerts
   - Quick preset buttons (1, 5, 10, 15 minutes)

4. **Landscape Mode (Right-Side Up)** → **Weather**
   - Real-time weather data
   - Location-based information
   - OpenWeatherMap API integration

## 🚀 How to Use

1. **Open the app** on a mobile device
2. **Hold phone upright** → Alarm Clock appears
3. **Rotate to landscape** → Stopwatch appears
4. **Double-tap in landscape** → Switches to Weather
5. **Flip phone upside down** → Timer appears

## 🛠️ Technical Stack

- **HTML5** - Semantic structure
- **CSS3** - Responsive design with glass morphism
- **JavaScript (ES6+)** - Device orientation detection
- **Device APIs** - DeviceOrientationEvent, Geolocation
- **Weather API** - OpenWeatherMap (free tier)
- **PWA** - Service worker for offline functionality

## 📁 Project Structure

```
techgig-hackathon/
├── index.html                 # Main app entry point
├── src/                       # Source code
│   ├── js/app.js             # Core functionality
│   ├── css/main.css          # Styling
│   └── assets/service-worker.js # PWA support
├── docs/                      # Documentation
│   ├── requirements.md        # Original requirements
│   └── PROJECT_STRUCTURE.md   # Structure guide
└── README.md                  # This file
```

## 📱 Requirements

- Mobile device (iOS/Android)
- HTTPS connection (required for device orientation)
- Modern browser with device orientation support

## 🚀 Quick Deployment

Deployed on GitHub Pages
1. Push to GitHub
2. Go to repository Settings → Pages
3. Source: "Deploy from a branch" → Branch: `main`
4. Click "Save"


## 🧪 Local Testing
```bash
python -m http.server 8000
# Access at http://localhost:8000
```

## ✅ Requirements Met

- ✅ **Mobile-friendly web application**
- ✅ **Device orientation detection**
- ✅ **Four distinct features based on orientation**
- ✅ **Weather API integration (free tier)**
- ✅ **Browser-only (no native apps)**
- ✅ **Cross-platform compatibility**
- ✅ **Seamless orientation transitions**
- ✅ **Touch-friendly interface**

---

**Built for the "Prompt This Into Existence!" Hackathon** 🚀 