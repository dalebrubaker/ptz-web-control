/**
 * Media Control - Client-Side JavaScript
 * Handles camera presets, manual controls, OBS streaming, and VLC playback
 */

(function() {
    'use strict';

    // Configuration loaded from server
    let config = null;
    let isTracking = false;
    let obsStreaming = false;
    let vlcPlaying = false;

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
     * Helper to wait for ms
     */
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

    // Debug logging
    function logDebug(msg) {
        console.log('[DEBUG]', msg);
        const debugLog = document.getElementById('debug-log');
        if (debugLog) {
            const entry = document.createElement('div');
            entry.textContent = `${new Date().toLocaleTimeString()} - ${msg}`;
            debugLog.prepend(entry);
        }
    }

    /**
     * Send command to API
     */
    async function sendCommand(type, params = {}) {
        try {
            logDebug(`Sending ${type}: ${JSON.stringify(params)}`);
            const response = await fetch('/api/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type, ...params })
            });

            const result = await response.json();
            logDebug(`Response: ${JSON.stringify(result)}`);

            if (!result.success) {
                throw new Error(result.error || 'Command failed');
            }

            return true;
        } catch (error) {
            console.error('Command error:', error);
            logDebug(`Error: ${error.message}`);
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
     * Get OBS streaming status
     */
    async function getObsStatus() {
        try {
            const response = await fetch('/api/obs/status');
            const result = await response.json();
            obsStreaming = result.streaming || false;
            updateObsButton();
        } catch (error) {
            console.error('OBS status error:', error);
        }
    }

    /**
     * Toggle OBS streaming
     */
    async function toggleObsStreaming() {
        try {
            const btn = document.getElementById('obs-stream');
            if (btn) btn.style.opacity = '0.7';

            const response = await fetch('/api/obs/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'toggleStreaming' })
            });

            const result = await response.json();

            if (result.success) {
                // Wait a moment for OBS to process, then update status
                await delay(500);
                await getObsStatus();
                showStatus(obsStreaming ? 'Streaming ON' : 'Streaming OFF');
            } else {
                throw new Error(result.error || 'OBS command failed');
            }
        } catch (error) {
            console.error('OBS command error:', error);
            showStatus(error.message, 'error');
        } finally {
            const btn = document.getElementById('obs-stream');
            if (btn) btn.style.opacity = '1';
        }
    }

    /**
     * Update OBS button appearance based on streaming state
     */
    function updateObsButton() {
        const btn = document.getElementById('obs-stream');
        if (!btn) return;

        if (obsStreaming) {
            btn.classList.add('streaming');
            btn.querySelector('.media-label').textContent = 'LIVE';
        } else {
            btn.classList.remove('streaming');
            btn.querySelector('.media-label').textContent = 'STREAM';
        }
    }

    /**
     * Get VLC playback status
     */
    async function getVlcStatus() {
        try {
            const response = await fetch('/api/vlc/status');
            const result = await response.json();
            vlcPlaying = result.playing || false;
            updateVlcButtons();
        } catch (error) {
            console.error('VLC status error:', error);
        }
    }

    /**
     * Send VLC command
     */
    async function sendVlcCommand(action) {
        try {
            const response = await fetch('/api/vlc/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            });

            const result = await response.json();

            if (result.success) {
                // Wait a moment for VLC to process, then update status
                await delay(300);
                await getVlcStatus();
                showStatus(action === 'toggle' ? 'VLC: ' + (vlcPlaying ? 'Playing' : 'Stopped') : 'VLC: ' + action);
            } else {
                throw new Error(result.error || 'VLC command failed');
            }
        } catch (error) {
            console.error('VLC command error:', error);
            showStatus(error.message, 'error');
        }
    }

    /**
     * Update VLC button appearance based on playback state
     */
    function updateVlcButtons() {
        const btn = document.getElementById('vlc-toggle');
        if (!btn) return;

        if (vlcPlaying) {
            btn.classList.add('playing');
            btn.querySelector('.media-label').textContent = 'PLAY';
        } else {
            btn.classList.remove('playing');
            btn.querySelector('.media-label').textContent = 'PLAY';
        }
    }

    /**
     * Activate a preset with Tracking Logic
     */
    async function activatePreset(presetKey) {
        const preset = config.presets[presetKey];
        if (!preset) return;

        // Visual feedback
        const btn = document.querySelector(`[data-preset="${presetKey}"]`);
        if (btn) {
            btn.style.opacity = '0.7';
        }

        try {
            // 1. Handle Tracking State first if defined
            if (preset.tracking !== undefined) {
                const trackPreset = preset.tracking ? 80 : 81;

                logDebug(`Setting Tracking ${preset.tracking ? 'ON' : 'OFF'} (Preset ${trackPreset})`);
                await sendCommand('preset', { presetNumber: trackPreset });

                // Update UI state immediately
                updateTrackingState(preset.tracking);

                // Short delay to ensure camera processes the tracking command
                await delay(800);
            }

            // 2. Recall the actual target preset
            logDebug(`Recalling Target Preset ${preset.number}`);
            const success = await sendCommand('preset', { presetNumber: preset.number });

            if (success) {
                showStatus(preset.label);
            }

        } catch (err) {
            console.error("Error activating preset:", err);
            showStatus(err.message || "Error", 'error');
        } finally {
            if (btn) btn.style.opacity = '1';
        }
    }

    /**
     * Initialize preset buttons
     */
    function initPresets() {
        const grid = document.getElementById('presets-grid');
        if (!grid || !config) return;

        grid.innerHTML = '';

        Object.entries(config.presets).forEach(([key, preset]) => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-preset';
            btn.setAttribute('data-preset', key);

            const label = document.createElement('span');
            label.className = 'preset-label';
            label.textContent = preset.label;
            btn.appendChild(label);

            btn.addEventListener('click', () => activatePreset(key));
            grid.appendChild(btn);
        });
    }

    /**
     * Update Tracking UI State
     */
    function updateTrackingState(enabled) {
        isTracking = enabled;
        const indicator = document.getElementById('track-indicator');
        if (indicator) {
            if (isTracking) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        }
    }

    /**
     * Initialize manual controls
     */
    function initManualControls() {
        // Home button
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', async () => {
                const success = await sendCommand('home');
                if (success) showStatus('Home');
            });
        }

        // Helper for touch/mouse hold
        const attachHoldHandlers = (element, startFn, stopFn) => {
            if (!element) return;

            let isActive = false;
            let lastEventTime = 0;
            const DEBOUNCE_MS = 100;

            const start = (e) => {
                const now = Date.now();

                if (now - lastEventTime < DEBOUNCE_MS) {
                    e.preventDefault();
                    return;
                }
                lastEventTime = now;

                if (isActive) return;

                if (e.type === 'touchstart') e.preventDefault();

                isActive = true;
                element.classList.add('active');
                startFn();
            };

            const stop = (e) => {
                if (!isActive) return;

                if (e.type === 'touchend' || e.type === 'touchcancel') {
                    e.preventDefault();
                }

                isActive = false;
                element.classList.remove('active');
                stopFn();
            };

            // Touch events
            element.addEventListener('touchstart', start, { passive: false });
            element.addEventListener('touchend', stop, { passive: false });
            element.addEventListener('touchcancel', stop, { passive: false });

            // Mouse events
            element.addEventListener('mousedown', start);
            element.addEventListener('mouseup', stop);
            element.addEventListener('mouseleave', stop);
        };

        // D-pad buttons
        const dpadButtons = document.querySelectorAll('.dpad-btn[data-direction]');
        dpadButtons.forEach(btn => {
            const direction = btn.getAttribute('data-direction');
            const dirCode = DIRECTION_MAP[direction];
            if (!dirCode) return;

            attachHoldHandlers(
                btn,
                () => sendContinuous('start', 'panTilt', { panSpeed: 6, tiltSpeed: 6, direction: dirCode }),
                () => sendContinuous('stop', 'panTilt')
            );
        });

        // Zoom In
        attachHoldHandlers(
            document.getElementById('zoom-in'),
            () => sendContinuous('start', 'zoomIn', { speed: 4 }),
            () => sendContinuous('stop', 'zoomIn')
        );

        // Zoom Out
        attachHoldHandlers(
            document.getElementById('zoom-out'),
            () => sendContinuous('start', 'zoomOut', { speed: 4 }),
            () => sendContinuous('stop', 'zoomOut')
        );
    }

    /**
     * Initialize OBS/VLC controls
     */
    function initMediaControls() {
        // Check if OBS is enabled
        if (config.obs && config.obs.enabled) {
            const obsBtn = document.getElementById('obs-stream');
            if (obsBtn) {
                obsBtn.addEventListener('click', toggleObsStreaming);
                getObsStatus(); // Get initial state
            }
        } else {
            // Hide OBS controls if not enabled
            const obsSection = document.querySelector('.media-section:first-child');
            if (obsSection) obsSection.style.display = 'none';
        }

        // Check if VLC is enabled
        if (config.vlc && config.vlc.enabled) {
            const vlcToggleBtn = document.getElementById('vlc-toggle');
            const vlcStopBtn = document.getElementById('vlc-stop');

            if (vlcToggleBtn) {
                vlcToggleBtn.addEventListener('click', () => sendVlcCommand('toggle'));
            }
            if (vlcStopBtn) {
                vlcStopBtn.addEventListener('click', () => sendVlcCommand('stop'));
            }

            getVlcStatus(); // Get initial state
        } else {
            // Hide VLC controls if not enabled
            const vlcSection = document.querySelector('.vlc-subgroup');
            if (vlcSection) vlcSection.style.display = 'none';
        }
    }

    function initSystemApp() {
        const rebootBtn = document.getElementById('reboot-btn');
        if (rebootBtn) {
            rebootBtn.addEventListener('click', async () => {
                if(confirm('Are you sure you want to reboot the camera?')) {
                    showStatus('Rebooting...', 'error'); // Use redundant error style for visibility
                    await sendCommand('reboot');
                }
            });
        }
    }

    /**
     * Load configuration
     */
    async function loadConfig() {
        try {
            const response = await fetch('/api/config');
            config = await response.json();
            return true;
        } catch (error) {
            console.error('Failed to load config:', error);
            showStatus('Config error', 'error');
            return false;
        }
    }

    /**
     * Emergency Stop - Kills any server-side loops
     */
    async function sendPanicStop() {
        await sendCommand('panTiltStop');
        await sendCommand('zoomStop');
    }

    /**
     * Initialize app
     */
    async function init() {
        // Safety: Stop everything on load
        await sendPanicStop();

        const loaded = await loadConfig();
        if (!loaded) return;

        initPresets();
        initManualControls();
        initMediaControls();
        initSystemApp();

        // Periodic status updates for OBS/VLC (every 5 seconds)
        setInterval(() => {
            if (config.obs && config.obs.enabled) getObsStatus();
            if (config.vlc && config.vlc.enabled) getVlcStatus();
        }, 5000);

        // Safety: Stop on unload
        window.addEventListener('beforeunload', () => {
            navigator.sendBeacon('/api/command', JSON.stringify({ type: 'panTiltStop' }));
            navigator.sendBeacon('/api/command', JSON.stringify({ type: 'zoomStop' }));
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
