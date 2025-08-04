// Smart Orientation App - Core Implementation
// Focused on the hackathon problem statement

// Global variables
let currentOrientation = 'unknown';
let landscapeFeatureToggle = 'stopwatch';
let currentTheme = 'light';
let timeFormat = '24'; // 24 or 12 hour format
let isFullscreen = false;

// Alarm variables (multiple alarms)
let alarms = [];
let alarmInterval = null;
let snoozeTime = null;
let nextAlarmId = 1;

// Stopwatch variables
let stopwatchInterval = null;
let stopwatchElapsed = 0;
let stopwatchRunning = false;
let lapTimes = [];
let startTime = null;

// Timer variables
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;

// Weather variables
let weatherData = null;
let weatherUpdateInterval = null;
let lastWeatherUpdate = null;
let currentLocation = null;

// DOM elements
let alarmContainer, stopwatchContainer, timerContainer, weatherContainer;
let desktopFallback, orientationIndicator, orientationText;
let loadingScreen;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Get DOM elements
    alarmContainer = document.getElementById('alarm');
    stopwatchContainer = document.getElementById('stopwatch');
    timerContainer = document.getElementById('timer');
    weatherContainer = document.getElementById('weather');
    desktopFallback = document.getElementById('desktop-fallback');
    orientationIndicator = document.getElementById('orientation-indicator');
    orientationText = document.getElementById('orientation-text');
    loadingScreen = document.getElementById('loading');

    // Check if mobile device
    if (!isMobileDevice()) {
        showDesktopFallback();
        return;
    }

    // Hide desktop fallback for mobile devices
    desktopFallback.style.display = 'none';

    // Initialize all features
    initializeAlarmClock();
    initializeStopwatch();
    initializeTimer();
    initializeWeather();
    initializeTheme();

    // Setup orientation detection
    setupOrientationDetection();

    // Hide loading screen
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1000);
}

// Theme functionality
function initializeTheme() {
    // Get theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const savedTimeFormat = localStorage.getItem('timeFormat');
    
    if (savedTheme) {
        currentTheme = savedTheme;
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        currentTheme = prefersDark ? 'dark' : 'light';
    }
    
    // Set time format - default to '24' if not saved
    if (savedTimeFormat) {
        timeFormat = savedTimeFormat;
    } else {
        timeFormat = '24'; // Default to 24-hour format for IST
        localStorage.setItem('timeFormat', timeFormat);
    }
    
    applyTheme(currentTheme);
    addThemeToggle();
    addTimeFormatToggle();
    addFullscreenToggle();
    
    // Update current time immediately
    updateCurrentTime();
    
    // Start time updates
    setInterval(updateCurrentTime, 1000);
}

function addThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
    themeToggle.title = 'Toggle theme';
    themeToggle.onclick = toggleTheme;
    orientationIndicator.appendChild(themeToggle);
}

function addTimeFormatToggle() {
    const timeFormatToggle = document.createElement('button');
    timeFormatToggle.className = 'time-format-toggle';
    timeFormatToggle.textContent = timeFormat === '24' ? '24H' : '12H';
    timeFormatToggle.title = 'Toggle time format';
    timeFormatToggle.onclick = toggleTimeFormat;
    orientationIndicator.appendChild(timeFormatToggle);
}

function addFullscreenToggle() {
    const fullscreenToggle = document.createElement('button');
    fullscreenToggle.className = 'fullscreen-toggle';
    fullscreenToggle.innerHTML = '⛶';
    fullscreenToggle.title = 'Toggle fullscreen';
    fullscreenToggle.onclick = toggleFullscreen;
    orientationIndicator.appendChild(fullscreenToggle);
}

function toggleTheme() {
    // Add transition class for smooth theme switching
    document.body.classList.add('theme-transitioning');
    
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
    
    // Update theme toggle button
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
    }
    
    // Remove transition class after animation completes
    setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
    }, 400); // Match the transition speed from CSS
}

function toggleTimeFormat() {
    timeFormat = timeFormat === '24' ? '12' : '24';
    localStorage.setItem('timeFormat', timeFormat);
    
    // Update time format toggle button
    const timeFormatToggle = document.querySelector('.time-format-toggle');
    if (timeFormatToggle) {
        timeFormatToggle.textContent = timeFormat === '24' ? '24H' : '12H';
    }
    
    // Update current time display
    updateCurrentTime();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
        isFullscreen = true;
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        isFullscreen = false;
    }
}

function applyTheme(theme) {
    // Remove existing theme classes
    document.body.classList.remove('light', 'dark', 'light-theme', 'dark-theme');
    
    // Add new theme class
    document.body.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update currentTheme variable
    currentTheme = theme;
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
    const userAgent = navigator.userAgent || window.opera;
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

// Alarm Clock functionality (multiple alarms)
function initializeAlarmClock() {
    // Load saved alarms
    loadSavedAlarms();
    
    // Set up event listeners
    document.getElementById('set-alarm').addEventListener('click', () => {
        const hour = parseInt(document.getElementById('alarm-hour').value);
        const minute = parseInt(document.getElementById('alarm-minute').value);
        setAlarm(hour, minute);
    });
    
    document.getElementById('stop-alarm').addEventListener('click', stopAlarm);
    document.getElementById('snooze-alarm').addEventListener('click', snoozeAlarm);
    
    // Start time updates
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    setInterval(checkAlarms, 1000);
}

function updateCurrentTime() {
    const now = new Date();
    
    // Use proper IST timezone (Asia/Kolkata)
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    
    let timeString;
    if (timeFormat === '24') {
        timeString = istTime.toLocaleTimeString('en-IN', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            timeZone: 'Asia/Kolkata'
        });
    } else {
        timeString = istTime.toLocaleTimeString('en-IN', { 
            hour12: true, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            timeZone: 'Asia/Kolkata'
        });
    }
    
    const dateString = istTime.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
    });
    
    const dayString = istTime.toLocaleDateString('en-IN', { 
        weekday: 'long',
        timeZone: 'Asia/Kolkata'
    });
    
    document.getElementById('current-time').textContent = `${timeString} (IST)`;
    document.getElementById('current-date').textContent = `${dateString} (${dayString})`;
}

function setAlarm(hour, minute, label = null) {
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        showAlarmStatus('Please enter valid time (0-23 hours, 0-59 minutes)', 'error');
        return;
    }
    
    // Check for duplicate alarm at the same time
    const existingAlarm = alarms.find(alarm => 
        alarm.hour === hour && 
        alarm.minute === minute && 
        alarm.enabled
    );
    
    if (existingAlarm) {
        showAlarmStatus('An alarm already exists at this time', 'error');
        return;
    }
    
    // Create new alarm
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const alarmTime = new Date(istTime);
    alarmTime.setHours(hour, minute, 0, 0);
    
    // If alarm time has passed today, set for tomorrow
    if (alarmTime <= istTime) {
        alarmTime.setDate(alarmTime.getDate() + 1);
    }
    
    const alarmLabel = label || `Alarm for ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    const newAlarm = {
        id: nextAlarmId++,
        hour: hour,
        minute: minute,
        time: alarmTime,
        enabled: true,
        label: alarmLabel,
        repeat: false, // Can be extended for recurring alarms
        created: new Date()
    };
    
    alarms.push(newAlarm);
    saveAlarms();
    updateAlarmDisplay();
    
    const timeUntilAlarm = alarmTime - istTime;
    const hours = Math.floor(timeUntilAlarm / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilAlarm % (1000 * 60 * 60)) / (1000 * 60));
    
    showAlarmStatus(`Alarm set for ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} (${hours}h ${minutes}m from now)`, 'set');
    
    // Clear input fields
    document.getElementById('alarm-hour').value = '';
    document.getElementById('alarm-minute').value = '';
}

function checkAlarms() {
    if (alarms.length === 0) return;
    
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    
    // Update alarm times for next day if needed
    updateAlarmTimes();
    
    // Check all enabled alarms
    alarms.forEach(alarm => {
        if (alarm.enabled && istTime >= alarm.time) {
            triggerAlarm(alarm);
        }
    });
}

function triggerAlarm(alarm) {
    if (!alarm) return;
    
    // Vibrate if supported
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }
    
    // Show notification
    if (Notification.permission === 'granted') {
        new Notification('Alarm', {
            body: alarm.label,
            icon: '/favicon.ico',
            requireInteraction: true
        });
    }
    
    // Show alarm controls
    document.getElementById('stop-alarm').style.display = 'inline-flex';
    document.getElementById('snooze-alarm').style.display = 'inline-flex';
    document.getElementById('set-alarm').style.display = 'none';
    
    // Store the triggered alarm for snooze/stop functionality
    window.currentTriggeredAlarm = alarm;
    
    // Play alarm sound (if available)
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audio.loop = true;
    audio.play().catch(() => {}); // Ignore errors if audio fails
    
    showAlarmStatus(`ALARM! ${alarm.label}`, 'active');
}

function stopAlarm() {
    if (navigator.vibrate) {
        navigator.vibrate(0);
    }
    
    // Hide alarm controls
    document.getElementById('stop-alarm').style.display = 'none';
    document.getElementById('snooze-alarm').style.display = 'none';
    document.getElementById('set-alarm').style.display = 'inline-flex';
    
    // Stop audio
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => audio.pause());
    
    // Disable the triggered alarm
    if (window.currentTriggeredAlarm) {
        const alarmIndex = alarms.findIndex(a => a.id === window.currentTriggeredAlarm.id);
        if (alarmIndex !== -1) {
            alarms[alarmIndex].enabled = false;
            saveAlarms();
            updateAlarmDisplay();
        }
        window.currentTriggeredAlarm = null;
    }
    
    showAlarmStatus('Alarm stopped', 'stopped');
}

function snoozeAlarm() {
    stopAlarm();
    
    // Set snooze for 5 minutes from now
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const snoozeTime = new Date(istTime.getTime() + (5 * 60 * 1000));
    
    const snoozeAlarm = {
        id: nextAlarmId++,
        hour: snoozeTime.getHours(),
        minute: snoozeTime.getMinutes(),
        time: snoozeTime,
        enabled: true,
        label: 'Snooze Alarm (5 minutes)',
        repeat: false,
        created: new Date()
    };
    
    alarms.push(snoozeAlarm);
    saveAlarms();
    updateAlarmDisplay();
    
    showAlarmStatus('Alarm snoozed for 5 minutes', 'snooze');
}

function saveAlarms() {
    const alarmsToSave = alarms.map(alarm => ({
        ...alarm,
        time: alarm.time.toISOString(),
        created: alarm.created.toISOString()
    }));
    localStorage.setItem('alarms', JSON.stringify(alarmsToSave));
    localStorage.setItem('nextAlarmId', nextAlarmId.toString());
}

function loadSavedAlarms() {
    const saved = localStorage.getItem('alarms');
    const savedNextId = localStorage.getItem('nextAlarmId');
    
    if (saved) {
        const alarmsData = JSON.parse(saved);
        alarms = alarmsData.map(alarmData => ({
            ...alarmData,
            time: new Date(alarmData.time),
            created: new Date(alarmData.created)
        }));
    }
    
    if (savedNextId) {
        nextAlarmId = parseInt(savedNextId);
    }
    
    updateAlarmDisplay();
}

function updateAlarmDisplay() {
    const alarmDisplay = document.getElementById('alarm-display');
    if (!alarmDisplay) return;
    
    const enabledAlarms = alarms.filter(alarm => alarm.enabled);
    const disabledAlarms = alarms.filter(alarm => !alarm.enabled);
    
    if (alarms.length === 0) {
        alarmDisplay.innerHTML = '<p class="no-alarm">No alarms set</p>';
        return;
    }
    
    let html = '<div class="alarms-list">';
    
    // Show enabled alarms first
    if (enabledAlarms.length > 0) {
        html += '<div class="alarms-section"><h4>Active Alarms</h4>';
        enabledAlarms.forEach(alarm => {
            const timeString = alarm.time.toLocaleTimeString('en-IN', { 
                hour12: timeFormat === '12',
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'Asia/Kolkata'
            });
            const dateString = alarm.time.toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                timeZone: 'Asia/Kolkata'
            });
            
            // Calculate time until alarm
            const now = new Date();
            const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
            const timeUntilAlarm = alarm.time - istTime;
            const hours = Math.floor(timeUntilAlarm / (1000 * 60 * 60));
            const minutes = Math.floor((timeUntilAlarm % (1000 * 60 * 60)) / (1000 * 60));
            
            html += `
                <div class="alarm-item enabled" data-alarm-id="${alarm.id}">
                    <div class="alarm-info">
                        <div class="alarm-time">${timeString}</div>
                        <div class="alarm-date">${dateString}</div>
                        <div class="alarm-label">${alarm.label}</div>
                        <div class="alarm-countdown">${hours}h ${minutes}m from now</div>
                    </div>
                    <div class="alarm-controls">
                        <button class="alarm-toggle" onclick="toggleAlarm(${alarm.id})" title="Disable Alarm">
                            <i class="fas fa-bell"></i>
                        </button>
                        <button class="alarm-delete" onclick="deleteAlarm(${alarm.id})" title="Delete Alarm">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Show disabled alarms
    if (disabledAlarms.length > 0) {
        html += '<div class="alarms-section"><h4>Disabled Alarms</h4>';
        disabledAlarms.forEach(alarm => {
            const timeString = alarm.time.toLocaleTimeString('en-IN', { 
                hour12: timeFormat === '12',
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'Asia/Kolkata'
            });
            const dateString = alarm.time.toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                timeZone: 'Asia/Kolkata'
            });
            
            html += `
                <div class="alarm-item disabled" data-alarm-id="${alarm.id}">
                    <div class="alarm-info">
                        <div class="alarm-time">${timeString}</div>
                        <div class="alarm-date">${dateString}</div>
                        <div class="alarm-label">${alarm.label}</div>
                    </div>
                    <div class="alarm-controls">
                        <button class="alarm-toggle" onclick="toggleAlarm(${alarm.id})" title="Enable Alarm">
                            <i class="fas fa-bell-slash"></i>
                        </button>
                        <button class="alarm-delete" onclick="deleteAlarm(${alarm.id})" title="Delete Alarm">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    html += '</div>';
    alarmDisplay.innerHTML = html;
}

function toggleAlarm(alarmId) {
    const alarmIndex = alarms.findIndex(a => a.id === alarmId);
    if (alarmIndex !== -1) {
        alarms[alarmIndex].enabled = !alarms[alarmIndex].enabled;
        saveAlarms();
        updateAlarmDisplay();
        
        const status = alarms[alarmIndex].enabled ? 'enabled' : 'disabled';
        showAlarmStatus(`Alarm ${status}`, status);
    }
}

function deleteAlarm(alarmId) {
    const alarmIndex = alarms.findIndex(a => a.id === alarmId);
    if (alarmIndex !== -1) {
        const deletedAlarm = alarms[alarmIndex];
        alarms.splice(alarmIndex, 1);
        saveAlarms();
        updateAlarmDisplay();
        showAlarmStatus(`Alarm "${deletedAlarm.label}" deleted`, 'deleted');
    }
}

function showAlarmStatus(message, type) {
    const statusElement = document.getElementById('alarm-status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `alarm-status ${type}`;
        
        // Clear status after 3 seconds
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'alarm-status';
        }, 3000);
    }
}

// Additional alarm management functions
function addQuickAlarm(hoursFromNow = 1) {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const alarmTime = new Date(istTime.getTime() + (hoursFromNow * 60 * 60 * 1000));
    
    const hour = alarmTime.getHours();
    const minute = alarmTime.getMinutes();
    
    setAlarm(hour, minute, `Quick Alarm (${hoursFromNow}h from now)`);
}

function clearAllAlarms() {
    if (alarms.length === 0) {
        showAlarmStatus('No alarms to clear', 'info');
        return;
    }
    
    alarms = [];
    saveAlarms();
    updateAlarmDisplay();
    showAlarmStatus('All alarms cleared', 'deleted');
}

function enableAllAlarms() {
    const disabledAlarms = alarms.filter(alarm => !alarm.enabled);
    if (disabledAlarms.length === 0) {
        showAlarmStatus('No disabled alarms to enable', 'info');
        return;
    }
    
    alarms.forEach(alarm => alarm.enabled = true);
    saveAlarms();
    updateAlarmDisplay();
    showAlarmStatus(`${disabledAlarms.length} alarms enabled`, 'enabled');
}

function disableAllAlarms() {
    const enabledAlarms = alarms.filter(alarm => alarm.enabled);
    if (enabledAlarms.length === 0) {
        showAlarmStatus('No active alarms to disable', 'info');
        return;
    }
    
    alarms.forEach(alarm => alarm.enabled = false);
    saveAlarms();
    updateAlarmDisplay();
    showAlarmStatus(`${enabledAlarms.length} alarms disabled`, 'disabled');
}

function getNextAlarm() {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    
    const enabledAlarms = alarms.filter(alarm => alarm.enabled && alarm.time > istTime);
    if (enabledAlarms.length === 0) return null;
    
    return enabledAlarms.reduce((next, alarm) => 
        alarm.time < next.time ? alarm : next
    );
}

function updateAlarmTimes() {
    // Update alarm times for next day if they've passed
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    
    alarms.forEach(alarm => {
        if (alarm.time <= istTime && alarm.enabled) {
            // Set alarm for next day
            const nextDay = new Date(alarm.time);
            nextDay.setDate(nextDay.getDate() + 1);
            alarm.time = nextDay;
        }
    });
    
    saveAlarms();
}

// FEATURE 2: Stopwatch
function initializeStopwatch() {
    const startBtn = document.getElementById('start-stopwatch');
    const pauseBtn = document.getElementById('pause-stopwatch');
    const resetBtn = document.getElementById('reset-stopwatch');
    const lapBtn = document.getElementById('lap-stopwatch');
    
    startBtn.addEventListener('click', startStopwatch);
    pauseBtn.addEventListener('click', pauseStopwatch);
    resetBtn.addEventListener('click', resetStopwatch);
    if (lapBtn) {
        lapBtn.addEventListener('click', addLap);
    }
    
    // Double-click to add lap
    startBtn.addEventListener('dblclick', addLap);
    pauseBtn.addEventListener('dblclick', addLap);
    
    // Load saved stopwatch data
    loadStopwatchData();
}

function startStopwatch() {
    if (!stopwatchRunning) {
        stopwatchRunning = true;
        stopwatchStartTime = Date.now() - stopwatchElapsed;
        stopwatchInterval = setInterval(updateStopwatch, 10); // 10ms precision
        
        document.getElementById('start-stopwatch').style.display = 'none';
        document.getElementById('pause-stopwatch').style.display = 'flex';
        
        // Save running state
        saveStopwatchData();
    }
}

function pauseStopwatch() {
    if (stopwatchRunning) {
        stopwatchRunning = false;
        stopwatchElapsed = Date.now() - stopwatchStartTime;
        clearInterval(stopwatchInterval);
        
        document.getElementById('start-stopwatch').style.display = 'flex';
        document.getElementById('pause-stopwatch').style.display = 'none';
        
        // Save state
        saveStopwatchData();
    }
}

function resetStopwatch() {
    pauseStopwatch();
    stopwatchElapsed = 0;
    updateStopwatchDisplay(0);
    lapTimes = [];
    updateLapList();
    
    // Clear saved data
    localStorage.removeItem('stopwatchData');
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
    
    const timeDisplay = document.getElementById('stopwatch-time');
    const msDisplay = document.getElementById('stopwatch-milliseconds');
    
    if (timeDisplay) {
        // Show hours only if > 0
        if (hours > 0) {
            timeDisplay.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            timeDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    if (msDisplay) {
        msDisplay.textContent = `.${milliseconds.toString().padStart(2, '0')}`;
    }
}

function addLap() {
    if (stopwatchRunning) {
        const currentTime = Date.now() - stopwatchStartTime;
        const lapTime = currentTime - (lapTimes.length > 0 ? lapTimes[lapTimes.length - 1].totalTime : 0);
        
        // Get current IST time for lap timestamp
        const now = new Date();
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        
        lapTimes.push({
            totalTime: currentTime,
            lapTime: lapTime,
            timestamp: istTime
        });
        
        updateLapList();
        saveStopwatchData();
    }
}

function updateLapList() {
    const lapList = document.getElementById('lap-list');
    if (!lapList) return;
    
    lapList.innerHTML = '';
    
    if (lapTimes.length === 0) {
        lapList.innerHTML = '<p class="no-laps">No laps recorded</p>';
        return;
    }
    
    // Find fastest and slowest laps
    const lapTimesOnly = lapTimes.map(lap => lap.lapTime);
    const fastestLap = Math.min(...lapTimesOnly);
    const slowestLap = Math.max(...lapTimesOnly);
    
    lapTimes.forEach((lap, index) => {
        const totalHours = Math.floor(lap.totalTime / 3600000);
        const totalMinutes = Math.floor((lap.totalTime % 3600000) / 60000);
        const totalSeconds = Math.floor((lap.totalTime % 60000) / 1000);
        const totalMs = Math.floor((lap.totalTime % 1000) / 10);
        
        const lapHours = Math.floor(lap.lapTime / 3600000);
        const lapMinutes = Math.floor((lap.lapTime % 3600000) / 60000);
        const lapSeconds = Math.floor((lap.lapTime % 60000) / 1000);
        const lapMs = Math.floor((lap.lapTime % 1000) / 10);
        
        const isFastest = lap.lapTime === fastestLap;
        const isSlowest = lap.lapTime === slowestLap;
        
        const lapItem = document.createElement('div');
        lapItem.className = `lap-item ${isFastest ? 'fastest' : ''} ${isSlowest ? 'slowest' : ''}`;
        
        // Format lap time display
        let lapTimeDisplay, totalTimeDisplay;
        
        if (lapHours > 0) {
            lapTimeDisplay = `${lapHours.toString().padStart(2, '0')}:${lapMinutes.toString().padStart(2, '0')}:${lapSeconds.toString().padStart(2, '0')}.${lapMs.toString().padStart(2, '0')}`;
        } else {
            lapTimeDisplay = `${lapMinutes.toString().padStart(2, '0')}:${lapSeconds.toString().padStart(2, '0')}.${lapMs.toString().padStart(2, '0')}`;
        }
        
        if (totalHours > 0) {
            totalTimeDisplay = `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}.${totalMs.toString().padStart(2, '0')}`;
        } else {
            totalTimeDisplay = `${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}.${totalMs.toString().padStart(2, '0')}`;
        }
        
        // Format timestamp in IST
        const timestampString = lap.timestamp.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        
        lapItem.innerHTML = `
            <div class="lap-header">
                <span class="lap-number">Lap ${index + 1}</span>
                <span class="lap-time">${lapTimeDisplay}</span>
            </div>
            <div class="lap-details">
                <span class="total-time">Total: ${totalTimeDisplay}</span>
                <span class="lap-timestamp">${timestampString}</span>
            </div>
        `;
        
        lapList.appendChild(lapItem);
    });
}

function saveStopwatchData() {
    const data = {
        elapsed: stopwatchElapsed,
        running: stopwatchRunning,
        lapTimes: lapTimes,
        timestamp: Date.now()
    };
    localStorage.setItem('stopwatchData', JSON.stringify(data));
}

function loadStopwatchData() {
    const saved = localStorage.getItem('stopwatchData');
    if (saved) {
        const data = JSON.parse(saved);
        stopwatchElapsed = data.elapsed || 0;
        stopwatchRunning = data.running || false;
        lapTimes = data.lapTimes || [];
        
        // Convert timestamp strings back to Date objects
        lapTimes.forEach(lap => {
            if (lap.timestamp) {
                lap.timestamp = new Date(lap.timestamp);
            }
        });
        
        updateStopwatchDisplay(stopwatchElapsed);
        updateLapList();
        
        // Restore running state if it was running
        if (stopwatchRunning) {
            startStopwatch();
        }
    }
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
    const refreshBtn = document.getElementById('refresh-weather');
    
    retryBtn.addEventListener('click', loadWeatherData);
    refreshBtn.addEventListener('click', () => {
        // Add spinning animation
        const icon = refreshBtn.querySelector('i');
        icon.classList.add('fa-spin');
        
        loadWeatherData().finally(() => {
            // Remove spinning animation after 1 second
            setTimeout(() => {
                icon.classList.remove('fa-spin');
            }, 1000);
        });
    });
    
    // Start automatic weather updates
    startWeatherUpdates();
    
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
        let latitude, longitude;
        
        // Use current location if available, otherwise get new position
        if (currentLocation) {
            latitude = currentLocation.latitude;
            longitude = currentLocation.longitude;
        } else {
            const position = await getCurrentPosition();
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            currentLocation = { latitude, longitude };
        }
        
        const apiKey = 'a481ce21915ef7d512dc450ab857113c';
        
        // Fetch current weather
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
        
        if (!weatherResponse.ok) {
            throw new Error('Weather API not available');
        }
        
        const weatherData = await weatherResponse.json();
        
        // Fetch 5-day forecast
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
        let forecastData = null;
        
        if (forecastResponse.ok) {
            forecastData = await forecastResponse.json();
        }
        
        // Update last update time
        lastWeatherUpdate = new Date();
        
        displayWeatherData(weatherData, forecastData);
        
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

function displayWeatherData(data, forecastData = null) {
    const weatherLoading = document.getElementById('weather-loading');
    const weatherData = document.getElementById('weather-data');
    
    weatherLoading.style.display = 'none';
    weatherData.style.display = 'block';
    
    // Basic weather info
    document.getElementById('weather-location').textContent = data.name || 'Unknown Location';
    document.getElementById('weather-temp').textContent = Math.round(data.main.temp);
    document.getElementById('weather-description').textContent = data.weather[0].description;
    
    // Detailed weather information
    const weatherDetails = document.getElementById('weather-details');
    if (weatherDetails) {
        weatherDetails.innerHTML = `
            <div class="detail-item">
                <i class="fas fa-thermometer-half"></i>
                <span>Feels like: <span id="weather-feels-like">${Math.round(data.main.feels_like)}</span>°C</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-thermometer-empty"></i>
                <span>Min: <span id="weather-temp-min">${Math.round(data.main.temp_min)}</span>°C</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-thermometer-full"></i>
                <span>Max: <span id="weather-temp-max">${Math.round(data.main.temp_max)}</span>°C</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-tint"></i>
                <span>Humidity: <span id="weather-humidity">${data.main.humidity}</span>%</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-compress-alt"></i>
                <span>Pressure: <span id="weather-pressure">${data.main.pressure}</span> hPa</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-wind"></i>
                <span>Wind: <span id="weather-wind">${Math.round(data.wind.speed * 3.6)}</span> km/h</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-compass"></i>
                <span>Direction: <span id="weather-wind-direction">${getWindDirection(data.wind.deg)}</span></span>
            </div>
            <div class="detail-item">
                <i class="fas fa-eye"></i>
                <span>Visibility: <span id="weather-visibility">${Math.round(data.visibility / 1000)}</span> km</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-cloud"></i>
                <span>Clouds: <span id="weather-clouds">${data.clouds.all}</span>%</span>
            </div>
        `;
    }
    
    // Sunrise and sunset times
    const sunInfo = document.getElementById('sun-info');
    if (sunInfo && data.sys) {
        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);
        
        sunInfo.innerHTML = `
            <div class="sun-item">
                <i class="fas fa-sunrise"></i>
                <span>Sunrise: ${sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="sun-item">
                <i class="fas fa-sunset"></i>
                <span>Sunset: ${sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `;
    }
    
    // Weather icon
    const weatherIcon = document.getElementById('weather-icon');
    const weatherCode = data.weather[0].id;
    weatherIcon.className = getWeatherIconClass(weatherCode);
    
    // Display forecast if available
    if (forecastData) {
        displayForecast(forecastData);
    }
    
    // Additional weather details
    const additionalInfo = document.getElementById('additional-info');
    if (additionalInfo) {
        const country = data.sys.country || '';
        const timezone = data.timezone || 0;
        const localTime = new Date(Date.now() + (timezone * 1000));
        
        // Get IST time
        const istTime = new Date(Date.now() + (5.5 * 60 * 60 * 1000));
        
        // Format last update time
        const lastUpdateText = lastWeatherUpdate ? 
            lastWeatherUpdate.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }) : 'Just now';
        
        additionalInfo.innerHTML = `
            <div class="info-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>Country: ${country}</span>
            </div>
            <div class="info-item">
                <i class="fas fa-clock"></i>
                <span>Local Time: ${localTime.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                })}</span>
            </div>
            <div class="info-item">
                <i class="fas fa-globe"></i>
                <span>IST Time: ${istTime.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                })}</span>
            </div>
            <div class="info-item">
                <i class="fas fa-calendar"></i>
                <span>Date: ${istTime.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })}</span>
            </div>
            <div class="info-item">
                <i class="fas fa-sync-alt"></i>
                <span>Last Updated: ${lastUpdateText}</span>
            </div>
        `;
    }
}

function displayForecast(forecastData) {
    const forecastContainer = document.getElementById('forecast-container');
    if (!forecastContainer) return;
    
    // Group forecast by day
    const dailyForecast = {};
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toDateString();
        
        if (!dailyForecast[day]) {
            dailyForecast[day] = [];
        }
        dailyForecast[day].push(item);
    });
    
    // Get daily averages
    const dailyAverages = Object.keys(dailyForecast).map(day => {
        const dayData = dailyForecast[day];
        const avgTemp = dayData.reduce((sum, item) => sum + item.main.temp, 0) / dayData.length;
        const avgHumidity = dayData.reduce((sum, item) => sum + item.main.humidity, 0) / dayData.length;
        const mostCommonWeather = dayData[Math.floor(dayData.length / 2)].weather[0]; // Use middle of day
        
        return {
            day: new Date(day),
            temp: Math.round(avgTemp),
            humidity: Math.round(avgHumidity),
            weather: mostCommonWeather,
            description: mostCommonWeather.description
        };
    }).slice(0, 5); // Show next 5 days
    
    forecastContainer.innerHTML = `
        <h3>5-Day Forecast</h3>
        <div class="forecast-list">
            ${dailyAverages.map(day => `
                <div class="forecast-day">
                    <div class="forecast-date">${day.day.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div class="forecast-icon">
                        <i class="${getWeatherIconClass(day.weather.id)}"></i>
                    </div>
                    <div class="forecast-temp">${day.temp}°C</div>
                    <div class="forecast-desc">${day.description}</div>
                    <div class="forecast-humidity">${day.humidity}%</div>
                </div>
            `).join('')}
        </div>
    `;
}

function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

function getWeatherIconClass(weatherCode) {
    if (weatherCode >= 200 && weatherCode < 300) {
        return 'fas fa-bolt';
    } else if (weatherCode >= 300 && weatherCode < 400) {
        return 'fas fa-cloud-rain';
    } else if (weatherCode >= 500 && weatherCode < 600) {
        return 'fas fa-cloud-showers-heavy';
    } else if (weatherCode >= 600 && weatherCode < 700) {
        return 'fas fa-snowflake';
    } else if (weatherCode >= 700 && weatherCode < 800) {
        return 'fas fa-smog';
    } else if (weatherCode === 800) {
        return 'fas fa-sun';
    } else if (weatherCode >= 801 && weatherCode < 900) {
        return 'fas fa-cloud';
    }
    return 'fas fa-question';
}

function showWeatherError() {
    const weatherLoading = document.getElementById('weather-loading');
    const weatherError = document.getElementById('weather-error');
    
    weatherLoading.style.display = 'none';
    weatherError.style.display = 'flex';
}

// Weather update functions
function startWeatherUpdates() {
    // Clear any existing interval
    if (weatherUpdateInterval) {
        clearInterval(weatherUpdateInterval);
    }
    
    // Update weather every 10 minutes (600,000 ms)
    weatherUpdateInterval = setInterval(() => {
        if (weatherContainer.classList.contains('active')) {
            loadWeatherData();
        }
    }, 600000); // 10 minutes
    
    // Also update when location changes
    if ('geolocation' in navigator) {
        navigator.geolocation.watchPosition(
            (position) => {
                const newLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                
                // Check if location has changed significantly (more than 1km)
                if (hasLocationChanged(newLocation)) {
                    currentLocation = newLocation;
                    if (weatherContainer.classList.contains('active')) {
                        loadWeatherData();
                    }
                }
            },
            (error) => {
                console.log('Location watch error:', error);
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    }
}

function hasLocationChanged(newLocation) {
    if (!currentLocation) {
        currentLocation = newLocation;
        return true;
    }
    
    // Calculate distance between old and new location
    const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        newLocation.latitude,
        newLocation.longitude
    );
    
    // Return true if distance is more than 1km
    return distance > 1;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function stopWeatherUpdates() {
    if (weatherUpdateInterval) {
        clearInterval(weatherUpdateInterval);
        weatherUpdateInterval = null;
    }
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
        const swPath = window.location.hostname === 'localhost' ? './src/assets/service-worker.js' : '/techgig-hackathon/src/assets/service-worker.js';
        navigator.serviceWorker.register(swPath)
            .then(function(registration) {
                console.log('Service Worker registered successfully:', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', function() {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', function() {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            console.log('New service worker available');
                        }
                    });
                });
            })
            .catch(function(registrationError) {
                console.log('Service Worker registration failed:', registrationError);
            });
    });
} 