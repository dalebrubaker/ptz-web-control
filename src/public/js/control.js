/**
 * PTZ Camera Control - Client-Side JavaScript
 * Handles preset buttons, manual controls, and API communication
 */

/**
 * PTZ Camera Control - Client-Side JavaScript
 * Handles preset buttons, manual controls, and API communication
 */

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
            // logDebug(`Continuous ${action} ${type}`); // Too noisy?
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
     * Activate a preset with Tracking Logic
     * If tracking is defined:
     *   On: Call Preset 80 (0x50) -> Wait -> Call Target
     *   Off: Call Preset 81 (0x51) -> Wait -> Call Target
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
                // FIXED: Preset 80 is ON (0x50), Preset 81 is OFF (0x51)
                const trackPreset = preset.tracking ? 80 : 81;
                
                logDebug(`Setting Tracking ${preset.tracking ? 'ON' : 'OFF'} (Preset ${trackPreset})`);
                await sendCommand('preset', { presetNumber: trackPreset });
                
                // Short delay to ensure camera processes the tracking command
                await delay(250);
            }

            // 2. Recall the actual target preset
            logDebug(`Recalling Target Preset ${preset.number}`);
            const success = await sendCommand('preset', { presetNumber: preset.number });
            
            if (success) {
                showStatus(preset.label);
            }

        } catch (err) {
            console.error("Error activating preset:", err);
            showStatus("Error", 'error');
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

            const start = (e) => {
                if (e.type === 'touchstart') e.preventDefault();
                element.classList.add('active');
                startFn();
            };
            
            const stop = (e) => {
                if (e.type === 'touchend') e.preventDefault();
                element.classList.remove('active');
                stopFn();
            };

            element.addEventListener('touchstart', start);
            element.addEventListener('touchend', stop);
            element.addEventListener('touchcancel', stop);

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
     * Initialize app
     */
    async function init() {
        const loaded = await loadConfig();
        if (!loaded) return;

        initPresets();
        initManualControls();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
