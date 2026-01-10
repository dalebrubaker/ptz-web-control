/**
 * VLC RC (Remote Control) Client
 * Handles VLC media player control via TCP telnet interface
 */

const net = require('net');

// VLC configuration
let config = null;
let state = {
    playing: false,
    paused: false
};

/**
 * Initialize VLC client with configuration
 */
function init(vlcConfig) {
    config = vlcConfig;
}

/**
 * Execute a VLC command and get response
 */
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        if (!config || !config.enabled) {
            reject(new Error('VLC not configured or disabled'));
            return;
        }

        const client = new net.Socket();
        let responseBuffer = '';
        let authComplete = false;

        // Connection timeout
        const timeout = setTimeout(() => {
            client.destroy();
            reject(new Error('VLC connection timeout'));
        }, 3000);

        client.connect(config.port, config.host, () => {
            clearTimeout(timeout);
            console.log(`[VLC] Connected to ${config.host}:${config.port}`);

            // Send password if configured
            if (config.password) {
                client.write(`${config.password}\n`);
                authComplete = true;
            }

            // Small delay after auth, then send command
            setTimeout(() => {
                client.write(`${command}\n`);
            }, config.password ? 100 : 10);
        });

        client.on('data', (data) => {
            responseBuffer += data.toString();

            // VLC ends responses with a prompt (usually '> ' or password prompt)
            // We wait a bit for the full response
        });

        client.on('error', (err) => {
            clearTimeout(timeout);
            console.error('[VLC] Socket error:', err.message);
            client.destroy();
            reject(err);
        });

        client.on('end', () => {
            // Connection closed by VLC
        });

        client.on('close', () => {
            clearTimeout(timeout);
            // Parse the response
            const response = parseVlcResponse(responseBuffer, command);
            resolve(response);
        });

        // Close connection after a short delay to receive response
        setTimeout(() => {
            if (!client.destroyed) {
                client.destroy();
            }
        }, 500);
    });
}

/**
 * Parse VLC RC response
 */
function parseVlcResponse(buffer, command) {
    const lines = buffer.split('\n').filter(l => l.trim());
    const response = {
        success: true,
        data: null,
        state: null
    };

    // Check for errors
    if (buffer.includes('Error:')) {
        response.success = false;
        response.error = buffer.match(/Error:\s*(.+)/)?.[1] || 'Unknown error';
        return response;
    }

    // Parse status from various commands
    if (command === 'status') {
        // Parse status output
        if (buffer.includes('state playing')) {
            state.playing = true;
            state.paused = false;
            response.state = 'playing';
        } else if (buffer.includes('state paused')) {
            state.playing = false;
            state.paused = true;
            response.state = 'paused';
        } else if (buffer.includes('state stopped')) {
            state.playing = false;
            state.paused = false;
            response.state = 'stopped';
        }
        response.data = { ...state };
    } else {
        // For play/pause/stop commands, update our tracked state
        if (command === 'play') {
            state.playing = true;
            state.paused = false;
        } else if (command === 'pause') {
            state.paused = true;
        } else if (command === 'stop') {
            state.playing = false;
            state.paused = false;
        }
        response.data = { ...state };
    }

    return response;
}

/**
 * Get current playback state
 */
async function getState() {
    try {
        const response = await executeCommand('status');
        return {
            playing: response.data?.playing || false,
            paused: response.data?.paused || false
        };
    } catch (err) {
        console.error('[VLC] GetState error:', err.message);
        return { playing: false, paused: false, error: err.message };
    }
}

/**
 * Play media
 */
async function play() {
    try {
        const response = await executeCommand('play');
        console.log('[VLC] Play command sent');
        return { success: true };
    } catch (err) {
        console.error('[VLC] Play error:', err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Pause media
 */
async function pause() {
    try {
        const response = await executeCommand('pause');
        console.log('[VLC] Pause command sent');
        return { success: true };
    } catch (err) {
        console.error('[VLC] Pause error:', err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Stop media
 */
async function stop() {
    try {
        const response = await executeCommand('stop');
        console.log('[VLC] Stop command sent');
        return { success: true };
    } catch (err) {
        console.error('[VLC] Stop error:', err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Toggle play/stop
 */
async function toggle() {
    const currentState = await getState();
    if (currentState.playing) {
        return await stop();
    } else {
        return await play();
    }
}

module.exports = {
    init,
    getState,
    play,
    pause,
    stop,
    toggle
};
