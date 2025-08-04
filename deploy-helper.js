// Deployment Helper Script
// Add this to your HTML to help with deployment issues

(function() {
    'use strict';
    
    // Force cache refresh on page load
    function forceRefresh() {
        if (performance.getEntriesByType('navigation')[0]?.type === 'reload') {
            // Page was refreshed
            console.log('🔄 Page refreshed - cache cleared');
        }
    }
    
    // Check deployment status
    function checkDeployment() {
        const deploymentInfo = {
            url: window.location.href,
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            pathname: window.location.pathname,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
        
        console.log('🚀 Deployment Info:', deploymentInfo);
        
        // Check if we're on GitHub Pages
        if (deploymentInfo.hostname.includes('github.io')) {
            console.log('✅ Deployed on GitHub Pages');
            
            // Check HTTPS
            if (deploymentInfo.protocol === 'https:') {
                console.log('✅ HTTPS enabled (required for device orientation)');
            } else {
                console.warn('⚠️ HTTP detected - device orientation may not work');
            }
        } else if (deploymentInfo.hostname === 'localhost') {
            console.log('🖥️ Running locally');
        } else {
            console.log('🌐 Deployed on other platform');
        }
    }
    
    // Check for common deployment issues
    function checkForIssues() {
        const issues = [];
        
        // Check if required files are loaded
        const requiredFiles = ['styles.css', 'script.js'];
        requiredFiles.forEach(file => {
            const link = document.querySelector(`link[href="${file}"], script[src="${file}"]`);
            if (!link) {
                issues.push(`Missing file: ${file}`);
            }
        });
        
        // Check for console errors
        const originalError = console.error;
        console.error = function(...args) {
            issues.push(`Console error: ${args.join(' ')}`);
            originalError.apply(console, args);
        };
        
        // Check mobile detection
        if (typeof isMobileDevice === 'function') {
            const isMobile = isMobileDevice();
            console.log(`📱 Mobile detection: ${isMobile}`);
        } else {
            issues.push('Mobile detection function not found');
        }
        
        // Report issues
        if (issues.length > 0) {
            console.warn('⚠️ Deployment Issues Found:');
            issues.forEach(issue => console.warn(`  - ${issue}`));
        } else {
            console.log('✅ No deployment issues detected');
        }
    }
    
    // Auto-refresh helper for development
    function setupAutoRefresh() {
        if (window.location.hostname === 'localhost') {
            console.log('🔄 Auto-refresh enabled for local development');
            
            // Refresh every 30 seconds in development
            setInterval(() => {
                if (document.hidden) return; // Don't refresh if tab is not active
                
                fetch(window.location.href, { method: 'HEAD' })
                    .then(response => {
                        if (response.headers.get('last-modified')) {
                            const lastModified = new Date(response.headers.get('last-modified'));
                            const currentTime = new Date();
                            
                            if (currentTime - lastModified > 30000) { // 30 seconds
                                console.log('🔄 New version detected, refreshing...');
                                window.location.reload();
                            }
                        }
                    })
                    .catch(() => {
                        // Ignore errors in development
                    });
            }, 30000);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        console.log('🚀 Smart Orientation App - Deployment Helper Loaded');
        
        forceRefresh();
        checkDeployment();
        
        // Wait a bit for other scripts to load
        setTimeout(() => {
            checkForIssues();
            setupAutoRefresh();
        }, 1000);
    }
    
    // Expose functions globally for debugging
    window.deploymentHelper = {
        checkDeployment,
        checkForIssues,
        forceRefresh: () => window.location.reload(true)
    };
    
})(); 