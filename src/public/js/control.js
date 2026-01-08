/**
 * PTZ Camera Control - Client-Side JavaScript
 * Handles preset buttons, manual controls, and API communication
 */

(function() {
    'use strict';

    // Configuration loaded from server
    let config = null;

    // Direction mapping for D-pad
    const DIRECTION_MAP = {
        'up': 3,
        'down': 4,
        'left': 1,
        'right': 2,
        'up-left': 5,
        'up-right': 6,
        'down-left': 7,
        'down-right': 8
    };

    // Status display
    let statusTimeout = null;

    /**
     * Show status message
     */
    function showStatus(message, type = 'success') {
        const statusEl = document.getElementById('status');
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.className = 'status visible ' + type;

        if (statusTimeout) {
            clearTimeout(statusTimeout);
        }

        statusTimeout = setTimeout(() => {
            statusEl.className = 'status';
        }, 2000);
    }

    /**
     * Send command to API
     */
    async function sendCommand(type, params = {}) {
        try {
            const response = await fetch('/api/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type, ...params })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Command failed');
            }

            return true;
        } catch (error) {
            console.error('Command error:', error);
            showStatus(error.message, 'error');
            return false;
        }
    }

    /**
     * Send continuous command (for hold-to-move)
     */
    async function sendContinuous(action, type, params = {}) {
        try {
            const response = await fetch('/api/continuous', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action, type, ...params })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Continuous command failed');
            }

            return true;
        } catch (error) {
            console.error('Continuous command error:', error);
            return false;
        }
    }

    /**
     * Activate a preset
     */
    async function activatePreset(presetKey) {
        const preset = config.presets[presetKey];
        if (!preset) return;

        // Visual feedback
        const btn = document.querySelector(`[data-preset="${presetKey}"]`);
        if (btn) {
            btn.classList.add('sending');
        }

        // Send command with tracking toggle
        const success = await sendCommand('presetWithTracking', {
            presetNumber: preset.number,
            tracking: preset.tracking
        });

        // Remove visual feedback
        if (btn) {
            btn.classList.remove('sending');
        }

        if (success) {
            showStatus(preset.label);
        }
    }

    /**
     * Initialize preset buttons on index page
     */
    function initPresetsPage() {
        const grid = document.getElementById('presets-grid');
        if (!grid || !config) return;

        // Clear existing content
        grid.innerHTML = '';

        // Create preset buttons
        Object.entries(config.presets).forEach(([key, preset]) => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-preset';
            btn.setAttribute('data-preset', key);

            if (preset.tracking) {
                btn.classList.add('tracking');
            }

            // Label
            const label = document.createElement('span');
            label.className = 'preset-label';
            label.textContent = preset.label;
            btn.appendChild(label);

            // Tracking badge
            if (preset.tracking) {
                const badge = document.createElement('span');
                badge.className = 'preset-badge';
                badge.textContent = 'Track';
                btn.appendChild(badge);
            }

            // Click handler
            btn.addEventListener('click', () => activatePreset(key));

            grid.appendChild(btn);
        });
    }

    /**
     * Initialize manual controls on manual.html page
     */
    function initManualControls() {
        // Track Start button
        const trackStartBtn = document.getElementById('track-start');
        if (trackStartBtn) {
            trackStartBtn.addEventListener('click', async () => {
                const success = await sendCommand('trackingOn');
                if (success) showStatus('Tracking ON');
            });
        }

        // Track Stop button
        const trackStopBtn = document.getElementById('track-stop');
        if (trackStopBtn) {
            trackStopBtn.addEventListener('click', async () => {
                const success = await sendCommand('trackingOff');
                if (success) showStatus('Tracking OFF');
            });
        }

        // Home button
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', async () => {
                const success = await sendCommand('home');
                if (success) showStatus('Home position');
            });
        }

        // D-pad buttons (hold-to-move)
        const dpadButtons = document.querySelectorAll('.dpad-btn[data-direction]');
        dpadButtons.forEach(btn => {
            const direction = btn.getAttribute('data-direction');
            const dirCode = DIRECTION_MAP[direction];

            if (!dirCode) return;

            // Touch events
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.classList.add('active');
                sendContinuous('start', 'panTilt', {
                    panSpeed: 4,
                    tiltSpeed: 4,
                    direction: dirCode
                });
            });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.classList.remove('active');
                sendContinuous('stop', 'panTilt');
            });

            btn.addEventListener('touchcancel', () => {
                btn.classList.remove('active');
                sendContinuous('stop', 'panTilt');
            });

            // Mouse events for desktop
            btn.addEventListener('mousedown', () => {
                btn.classList.add('active');
                sendContinuous('start', 'panTilt', {
                    panSpeed: 4,
                    tiltSpeed: 4,
                    direction: dirCode
                });
            });

            btn.addEventListener('mouseup', () => {
                btn.classList.remove('active');
                sendContinuous('stop', 'panTilt');
            });

            btn.addEventListener('mouseleave', () => {
                btn.classList.remove('active');
                sendContinuous('stop', 'panTilt');
            });
        });

        // Zoom In button (hold-to-zoom)
        const zoomInBtn = document.getElementById('zoom-in');
        if (zoomInBtn) {
            // Touch events
            zoomInBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                zoomInBtn.classList.add('active');
                sendContinuous('start', 'zoomIn', { speed: 4 });
            });

            zoomInBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                zoomInBtn.classList.remove('active');
                sendContinuous('stop', 'zoomIn');
            });

            zoomInBtn.addEventListener('touchcancel', () => {
                zoomInBtn.classList.remove('active');
                sendContinuous('stop', 'zoomIn');
            });

            // Mouse events
            zoomInBtn.addEventListener('mousedown', () => {
                zoomInBtn.classList.add('active');
                sendContinuous('start', 'zoomIn', { speed: 4 });
            });

            zoomInBtn.addEventListener('mouseup', () => {
                zoomInBtn.classList.remove('active');
                sendContinuous('stop', 'zoomIn');
            });

            zoomInBtn.addEventListener('mouseleave', () => {
                zoomInBtn.classList.remove('active');
                sendContinuous('stop', 'zoomIn');
            });
        }

        // Zoom Out button (hold-to-zoom)
        const zoomOutBtn = document.getElementById('zoom-out');
        if (zoomOutBtn) {
            // Touch events
            zoomOutBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                zoomOutBtn.classList.add('active');
                sendContinuous('start', 'zoomOut', { speed: 4 });
            });

            zoomOutBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                zoomOutBtn.classList.remove('active');
                sendContinuous('stop', 'zoomOut');
            });

            zoomOutBtn.addEventListener('touchcancel', () => {
                zoomOutBtn.classList.remove('active');
                sendContinuous('stop', 'zoomOut');
            });

            // Mouse events
            zoomOutBtn.addEventListener('mousedown', () => {
                zoomOutBtn.classList.add('active');
                sendContinuous('start', 'zoomOut', { speed: 4 });
            });

            zoomOutBtn.addEventListener('mouseup', () => {
                zoomOutBtn.classList.remove('active');
                sendContinuous('stop', 'zoomOut');
            });

            zoomOutBtn.addEventListener('mouseleave', () => {
                zoomOutBtn.classList.remove('active');
                sendContinuous('stop', 'zoomOut');
            });
        }
    }

    /**
     * Load configuration from server
     */
    async function loadConfig() {
        try {
            const response = await fetch('/api/config');
            config = await response.json();
            return true;
        } catch (error) {
            console.error('Failed to load config:', error);
            showStatus('Failed to load configuration', 'error');
            return false;
        }
    }

    /**
     * Initialize the application
     */
    async function init() {
        // Load config
        const loaded = await loadConfig();
        if (!loaded) return;

        // Determine which page we're on and initialize accordingly
        const isManualPage = document.getElementById('track-start') !== null;

        if (isManualPage) {
            initManualControls();
        } else {
            initPresetsPage();
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
