// Smart Orientation App - Core Implementation
// Focused on the hackathon problem statement

// Global variables
let currentOrientation = '';
let alarmInterval = null;
let alarmTime = null;
let alarmAudio = null;
let stopwatchInterval = null;
let stopwatchStartTime = null;
let stopwatchElapsed = 0;
let stopwatchRunning = false;
let lapTimes = [];
let timerInterval = null;
let timerEndTime = null;
let timerRunning = false;
let landscapeFeatureToggle = 'stopwatch'; // Track which landscape feature to show

// DOM elements
const loadingScreen = document.getElementById('loading');
const orientationIndicator = document.getElementById('orientation-indicator');
const orientationText = document.getElementById('orientation-text');
const desktopFallback = document.getElementById('desktop-fallback');

// Feature containers
const alarmContainer = document.getElementById('alarm');
const stopwatchContainer = document.getElementById('stopwatch');
const timerContainer = document.getElementById('timer');
const weatherContainer = document.getElementById('weather');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check if device supports orientation
    if (!isMobileDevice()) {
        showDesktopFallback();
        return;
    }

    // Hide desktop fallback since mobile detection succeeded
    desktopFallback.style.display = 'none';

    // Initialize all features first
    initializeAlarmClock();
    initializeStopwatch();
    initializeTimer();
    initializeWeather();
    
    // Setup orientation detection
    setupOrientationDetection();
    
    // Hide loading screen after initialization
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            
            // Ensure at least one feature is shown
            if (!document.querySelector('.feature-container.active')) {
                updateOrientation('portrait-upright');
            }
        }, 500);
    }, 2000);
}

function setupOrientationDetection() {
    // Request device orientation permission
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    setupOrientationListeners();
                } else {
                    showOrientationError();
                }
            })
            .catch(() => {
                setupOrientationListeners();
            });
    } else {
        setupOrientationListeners();
    }
}

function setupOrientationListeners() {
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    window.addEventListener('orientationchange', handleOrientationChange);
    detectInitialOrientation();
}

// Device detection - Improved for better mobile detection
function isMobileDevice() {
    // Check user agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS/i;
    
    // Check if it's a mobile device via user agent
    if (mobileRegex.test(userAgent)) {
        return true;
    }
    
    // Additional checks for mobile characteristics
    const isMobile = {
        Android: () => navigator.userAgent.match(/Android/i),
        BlackBerry: () => navigator.userAgent.match(/BlackBerry/i),
        iOS: () => navigator.userAgent.match(/iPhone|iPad|iPod/i),
        Opera: () => navigator.userAgent.match(/Opera Mini/i),
        Windows: () => navigator.userAgent.match(/IEMobile/i),
        any: function() {
            return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows());
        }
    };
    
    if (isMobile.any()) {
        return true;
    }
    
    // Check for mobile viewport dimensions (for developer tools testing)
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // If viewport is mobile-sized (width <= 768px and height <= 1024px)
    if (viewportWidth <= 768 && viewportHeight <= 1024) {
        return true;
    }
    
    // Check for touch capabilities (many mobile devices have touch)
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        return true;
    }
    
    return false;
}

function showDesktopFallback() {
    desktopFallback.style.display = 'flex';
    loadingScreen.style.display = 'none';
}

function showOrientationError() {
    orientationText.textContent = 'Orientation access denied';
    orientationIndicator.style.background = 'rgba(255, 107, 107, 0.9)';
}

// Device orientation detection - CORE FEATURE
function setupOrientationDetection() {
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    window.addEventListener('orientationchange', handleOrientationChange);
    detectInitialOrientation();
}

function handleDeviceOrientation(event) {
    const beta = event.beta; // Tilt front-to-back (-180 to 180)
    const gamma = event.gamma; // Tilt left-to-right (-90 to 90)
    
    let orientation = '';
    
    // Core orientation detection logic
    if (Math.abs(beta) < 45 && Math.abs(gamma) < 45) {
        orientation = 'portrait-upright'; // Alarm Clock
    } else if (Math.abs(beta) > 135 && Math.abs(gamma) < 45) {
        orientation = 'portrait-upside-down'; // Timer
    } else if (Math.abs(gamma) > 45) {
        orientation = 'landscape'; // Stopwatch or Weather
    } else {
        orientation = 'unknown';
    }
    
    updateOrientation(orientation);
}

function handleOrientationChange() {
    setTimeout(() => {
        const orientation = window.orientation;
        let orientationType = '';
        
        if (orientation === 0 || orientation === 180) {
            orientationType = orientation === 0 ? 'portrait-upright' : 'portrait-upside-down';
        } else if (orientation === 90 || orientation === -90) {
            orientationType = 'landscape';
        }
        
        updateOrientation(orientationType);
    }, 100);
}

function detectInitialOrientation() {
    // Try multiple methods to detect initial orientation
    if (window.orientation !== undefined) {
        handleOrientationChange();
    } else if (window.screen && window.screen.orientation) {
        // Use Screen Orientation API if available
        const orientation = window.screen.orientation.type;
        if (orientation.includes('portrait')) {
            updateOrientation('portrait-upright');
        } else if (orientation.includes('landscape')) {
            updateOrientation('landscape');
        } else {
            updateOrientation('portrait-upright');
        }
    } else {
        // Fallback to portrait-upright
        updateOrientation('portrait-upright');
    }
}

function updateOrientation(orientation) {
    if (orientation === currentOrientation || orientation === 'unknown') {
        return;
    }
    
    currentOrientation = orientation;
    
    // Update orientation indicator
    const orientationLabels = {
        'portrait-upright': 'Portrait (Alarm)',
        'portrait-upside-down': 'Upside Down (Timer)',
        'landscape': `Landscape (${landscapeFeatureToggle === 'stopwatch' ? 'Stopwatch' : 'Weather'})`
    };
    
    orientationText.textContent = orientationLabels[orientation] || 'Detecting...';
    
    // Hide all feature containers
    document.querySelectorAll('.feature-container').forEach(container => {
        container.classList.remove('active');
    });
    
    // Show appropriate feature based on orientation - CORE LOGIC
    switch (orientation) {
        case 'portrait-upright':
            alarmContainer.classList.add('active');
            break;
        case 'portrait-upside-down':
            timerContainer.classList.add('active');
            break;
        case 'landscape':
            // Toggle between Stopwatch and Weather in landscape mode
            if (landscapeFeatureToggle === 'stopwatch') {
                stopwatchContainer.classList.add('active');
                weatherContainer.classList.remove('active');
            } else {
                weatherContainer.classList.add('active');
                stopwatchContainer.classList.remove('active');
                loadWeatherData();
            }
            break;
    }
}

// FEATURE 1: Alarm Clock
function initializeAlarmClock() {
    const setAlarmBtn = document.getElementById('set-alarm');
    const stopAlarmBtn = document.getElementById('stop-alarm');
    const alarmHourInput = document.getElementById('alarm-hour');
    const alarmMinuteInput = document.getElementById('alarm-minute');
    const alarmStatus = document.getElementById('alarm-status');
    
    // Update current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Set alarm button
    setAlarmBtn.addEventListener('click', () => {
        const hour = parseInt(alarmHourInput.value);
        const minute = parseInt(alarmMinuteInput.value);
        
        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
            setAlarm(hour, minute);
        } else {
            alarmStatus.textContent = 'Please enter valid time (0-23 hours, 0-59 minutes)';
        }
    });
    
    // Stop alarm button
    stopAlarmBtn.addEventListener('click', stopAlarm);
    
    // Check for alarm every second
    setInterval(checkAlarm, 1000);
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    
    document.getElementById('current-time').textContent = timeString;
    document.getElementById('current-date').textContent = dateString;
}

function setAlarm(hour, minute) {
    const now = new Date();
    alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
    
    if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
    }
    
    const alarmStatus = document.getElementById('alarm-status');
    const timeUntilAlarm = Math.floor((alarmTime - now) / 1000);
    const hours = Math.floor(timeUntilAlarm / 3600);
    const minutes = Math.floor((timeUntilAlarm % 3600) / 60);
    
    alarmStatus.textContent = `Alarm set for ${alarmTime.toLocaleTimeString()} (${hours}h ${minutes}m from now)`;
    
    document.getElementById('set-alarm').style.display = 'none';
    document.getElementById('stop-alarm').style.display = 'flex';
}

function checkAlarm() {
    if (alarmTime && new Date() >= alarmTime) {
        triggerAlarm();
    }
}

function triggerAlarm() {
    if (!alarmAudio) {
        alarmAudio = new Audio();
        alarmAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        alarmAudio.loop = true;
    }
    
    alarmAudio.play();
    alarmContainer.classList.add('alarm-ringing');
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Alarm', { body: 'Time to wake up!' });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('Alarm', { body: 'Time to wake up!' });
            }
        });
    }
}

function stopAlarm() {
    if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
    }
    
    alarmContainer.classList.remove('alarm-ringing');
    alarmTime = null;
    
    document.getElementById('set-alarm').style.display = 'flex';
    document.getElementById('stop-alarm').style.display = 'none';
    document.getElementById('alarm-status').textContent = '';
}

// FEATURE 2: Stopwatch
function initializeStopwatch() {
    const startBtn = document.getElementById('start-stopwatch');
    const pauseBtn = document.getElementById('pause-stopwatch');
    const resetBtn = document.getElementById('reset-stopwatch');
    
    startBtn.addEventListener('click', startStopwatch);
    pauseBtn.addEventListener('click', pauseStopwatch);
    resetBtn.addEventListener('click', resetStopwatch);
    startBtn.addEventListener('dblclick', addLap);
}

function startStopwatch() {
    if (!stopwatchRunning) {
        stopwatchRunning = true;
        stopwatchStartTime = Date.now() - stopwatchElapsed;
        stopwatchInterval = setInterval(updateStopwatch, 10);
        
        document.getElementById('start-stopwatch').style.display = 'none';
        document.getElementById('pause-stopwatch').style.display = 'flex';
    }
}

function pauseStopwatch() {
    if (stopwatchRunning) {
        stopwatchRunning = false;
        stopwatchElapsed = Date.now() - stopwatchStartTime;
        clearInterval(stopwatchInterval);
        
        document.getElementById('start-stopwatch').style.display = 'flex';
        document.getElementById('pause-stopwatch').style.display = 'none';
    }
}

function resetStopwatch() {
    pauseStopwatch();
    stopwatchElapsed = 0;
    updateStopwatchDisplay(0);
    lapTimes = [];
    updateLapList();
}

function updateStopwatch() {
    const elapsed = Date.now() - stopwatchStartTime;
    updateStopwatchDisplay(elapsed);
}

function updateStopwatchDisplay(elapsed) {
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const milliseconds = Math.floor((elapsed % 1000) / 10);
    
    document.getElementById('stopwatch-time').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('stopwatch-milliseconds').textContent = `.${milliseconds.toString().padStart(3, '0')}`;
}

function addLap() {
    if (stopwatchRunning) {
        const currentTime = Date.now() - stopwatchStartTime;
        lapTimes.push(currentTime);
        updateLapList();
    }
}

function updateLapList() {
    const lapList = document.getElementById('lap-list');
    lapList.innerHTML = '';
    
    lapTimes.forEach((lapTime, index) => {
        const hours = Math.floor(lapTime / 3600000);
        const minutes = Math.floor((lapTime % 3600000) / 60000);
        const seconds = Math.floor((lapTime % 60000) / 1000);
        const milliseconds = Math.floor((lapTime % 1000) / 10);
        
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        lapItem.innerHTML = `
            <span>Lap ${index + 1}</span>
            <span>${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}</span>
        `;
        lapList.appendChild(lapItem);
    });
}

// FEATURE 3: Timer
function initializeTimer() {
    const startBtn = document.getElementById('start-timer');
    const pauseBtn = document.getElementById('pause-timer');
    const resetBtn = document.getElementById('reset-timer');
    const presetBtns = document.querySelectorAll('.preset-btn');
    
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const minutes = parseInt(btn.dataset.minutes);
            document.getElementById('timer-minutes').value = minutes;
            document.getElementById('timer-seconds').value = 0;
            updateTimerDisplay(minutes * 60);
        });
    });
}

function startTimer() {
    if (!timerRunning) {
        const minutes = parseInt(document.getElementById('timer-minutes').value) || 0;
        const seconds = parseInt(document.getElementById('timer-seconds').value) || 0;
        const totalSeconds = minutes * 60 + seconds;
        
        if (totalSeconds > 0) {
            timerRunning = true;
            timerEndTime = Date.now() + (totalSeconds * 1000);
            timerInterval = setInterval(updateTimer, 1000);
            
            document.getElementById('start-timer').style.display = 'none';
            document.getElementById('pause-timer').style.display = 'flex';
        }
    }
}

function pauseTimer() {
    if (timerRunning) {
        timerRunning = false;
        clearInterval(timerInterval);
        
        document.getElementById('start-timer').style.display = 'flex';
        document.getElementById('pause-timer').style.display = 'none';
    }
}

function resetTimer() {
    pauseTimer();
    document.getElementById('timer-minutes').value = 5;
    document.getElementById('timer-seconds').value = 0;
    updateTimerDisplay(300);
}

function updateTimer() {
    const remaining = Math.max(0, timerEndTime - Date.now());
    const totalSeconds = Math.ceil(remaining / 1000);
    
    if (totalSeconds <= 0) {
        timerComplete();
        return;
    }
    
    updateTimerDisplay(totalSeconds);
}

function updateTimerDisplay(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    document.getElementById('timer-time').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function timerComplete() {
    pauseTimer();
    
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    audio.play();
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Complete', { body: 'Your timer has finished!' });
    }
    
    resetTimer();
}

// FEATURE 4: Weather
function initializeWeather() {
    const retryBtn = document.getElementById('retry-weather');
    retryBtn.addEventListener('click', loadWeatherData);
    
    if (weatherContainer.classList.contains('active')) {
        loadWeatherData();
    }
}

async function loadWeatherData() {
    const weatherLoading = document.getElementById('weather-loading');
    const weatherData = document.getElementById('weather-data');
    const weatherError = document.getElementById('weather-error');
    
    weatherLoading.style.display = 'flex';
    weatherData.style.display = 'none';
    weatherError.style.display = 'none';
    
    try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        const apiKey = 'a481ce21915ef7d512dc450ab857113c';
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
        
        if (!weatherResponse.ok) {
            if (weatherResponse.status === 401) {
                displayDemoWeatherData();
                return;
            }
            throw new Error('Weather API not available');
        }
        
        const data = await weatherResponse.json();
        displayWeatherData(data);
        
    } catch (error) {
        console.error('Weather error:', error);
        showWeatherError();
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: false
        });
    });
}

function displayWeatherData(data) {
    const weatherLoading = document.getElementById('weather-loading');
    const weatherData = document.getElementById('weather-data');
    
    weatherLoading.style.display = 'none';
    weatherData.style.display = 'block';
    
    document.getElementById('weather-location').textContent = data.name || 'Unknown Location';
    document.getElementById('weather-temp').textContent = Math.round(data.main.temp);
    document.getElementById('weather-description').textContent = data.weather[0].description;
    document.getElementById('weather-humidity').textContent = data.main.humidity;
    document.getElementById('weather-wind').textContent = Math.round(data.wind.speed * 3.6);
    document.getElementById('weather-visibility').textContent = Math.round(data.visibility / 1000);
    
    const weatherIcon = document.getElementById('weather-icon');
    const weatherCode = data.weather[0].id;
    
    if (weatherCode >= 200 && weatherCode < 300) {
        weatherIcon.className = 'fas fa-bolt';
    } else if (weatherCode >= 300 && weatherCode < 400) {
        weatherIcon.className = 'fas fa-cloud-rain';
    } else if (weatherCode >= 500 && weatherCode < 600) {
        weatherIcon.className = 'fas fa-cloud-showers-heavy';
    } else if (weatherCode >= 600 && weatherCode < 700) {
        weatherIcon.className = 'fas fa-snowflake';
    } else if (weatherCode >= 700 && weatherCode < 800) {
        weatherIcon.className = 'fas fa-smog';
    } else if (weatherCode === 800) {
        weatherIcon.className = 'fas fa-sun';
    } else if (weatherCode >= 801 && weatherCode < 900) {
        weatherIcon.className = 'fas fa-cloud';
    }
}

function showWeatherError() {
    const weatherLoading = document.getElementById('weather-loading');
    const weatherError = document.getElementById('weather-error');
    
    weatherLoading.style.display = 'none';
    weatherError.style.display = 'flex';
}

function displayDemoWeatherData() {
    const weatherLoading = document.getElementById('weather-loading');
    const weatherData = document.getElementById('weather-data');
    
    weatherLoading.style.display = 'none';
    weatherData.style.display = 'block';
    
    const demoData = {
        name: 'Hyderabad, IN',
        main: {
            temp: 28,
            humidity: 65
        },
        weather: [{
            description: 'partly cloudy',
            id: 801
        }],
        wind: {
            speed: 12
        },
        visibility: 10000
    };
    
    document.getElementById('weather-location').textContent = demoData.name;
    document.getElementById('weather-temp').textContent = Math.round(demoData.main.temp);
    document.getElementById('weather-description').textContent = demoData.weather[0].description;
    document.getElementById('weather-humidity').textContent = demoData.main.humidity;
    document.getElementById('weather-wind').textContent = Math.round(demoData.wind.speed * 3.6);
    document.getElementById('weather-visibility').textContent = Math.round(demoData.visibility / 1000);
    
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.className = 'fas fa-cloud-sun';
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounce orientation changes
const debouncedOrientationUpdate = debounce(updateOrientation, 300);

// Touch feedback
document.addEventListener('touchstart', function(e) {
    if (e.target.classList.contains('btn') || e.target.classList.contains('preset-btn')) {
        e.target.style.transform = 'scale(0.95)';
    }
});

document.addEventListener('touchend', function(e) {
    if (e.target.classList.contains('btn') || e.target.classList.contains('preset-btn')) {
        e.target.style.transform = '';
    }
});

// Landscape feature toggle - tap to switch between Stopwatch and Weather
let lastTapTime = 0;
document.addEventListener('touchend', function(e) {
    // Only trigger if we're in landscape mode and not clicking on buttons
    if (currentOrientation === 'landscape' && 
        !e.target.classList.contains('btn') && 
        !e.target.classList.contains('preset-btn') &&
        !e.target.closest('.btn') &&
        !e.target.closest('.preset-btn')) {
        
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        
        // Double tap to toggle landscape features
        if (tapLength < 500 && tapLength > 0) {
            landscapeFeatureToggle = landscapeFeatureToggle === 'stopwatch' ? 'weather' : 'stopwatch';
            updateOrientation('landscape'); // Refresh the display
            e.preventDefault();
        }
        lastTapTime = currentTime;
    }
});

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Handle visibility change
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        if (stopwatchRunning) {
            pauseStopwatch();
        }
        if (timerRunning) {
            pauseTimer();
        }
    }
});

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Use relative path for local development, absolute for production
        const swPath = window.location.hostname === 'localhost' ? './sw.js' : '/sw.js';
        navigator.serviceWorker.register(swPath)
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 