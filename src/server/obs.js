/**
 * OBS WebSocket v5 Client
 * Handles OBS Studio control via WebSocket protocol
 */

const WebSocket = require('ws');
const crypto = require('crypto');

let ws = null;
let reconnectTimer = null;
let messageHandlers = {};
let currentRequestId = 0;

// OBS configuration
let config = null;

/**
 * Initialize OBS client with configuration
 */
function init(obsConfig) {
    config = obsConfig;
    if (config.enabled) {
        connect();
    }
}

/**
 * Connect to OBS WebSocket
 */
function connect() {
    if (!config || !config.enabled) {
        return;
    }

    const url = `ws://${config.host}:${config.port}`;
    console.log(`[OBS] Connecting to ${url}`);

    ws = new WebSocket(url);

    ws.on('open', () => {
        console.log('[OBS] Connected');
        clearTimeout(reconnectTimer);

        // Send Hello message to initiate handshake
        // OBS v5 sends Hello first, we respond with Identify
    });

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            handleMessage(message);
        } catch (err) {
            console.error('[OBS] Failed to parse message:', err.message);
        }
    });

    ws.on('error', (err) => {
        console.error('[OBS] WebSocket error:', err.message);
    });

    ws.on('close', () => {
        console.log('[OBS] Disconnected');
        ws = null;

        // Attempt to reconnect after 5 seconds
        reconnectTimer = setTimeout(connect, 5000);
    });
}

/**
 * Handle incoming OBS WebSocket messages
 */
function handleMessage(message) {
    // Message types: 'Hello', 'Identify', ' Identified', 'Request', 'RequestResponse', 'Event'
    const opCode = message.op;

    switch (opCode) {
        case 0: // Hello - Server greeting, contains auth info
            handleHello(message.d);
            break;

        case 2: // Identified - Authentication successful
            console.log('[OBS] Identified and ready');
            break;

        case 7: // RequestResponse - Response to a request
            if (message.d.requestId && messageHandlers[message.d.requestId]) {
                messageHandlers[message.d.requestId](message.d);
                delete messageHandlers[message.d.requestId];
            }
            break;

        case 5: // Event - Stream state changed, etc.
            if (message.d.eventType === 'StreamStateChanged') {
                console.log('[OBS] Stream state:', message.d.streamState);
            }
            break;
    }
}

/**
 * Handle Hello message and send Identify with authentication if needed
 */
function handleHello(data) {
    console.log('[OBS] Received Hello');

    const identify = {
        op: 1,
        d: {
            rpcVersion: 1
        }
    };

    // Authentication required
    if (data.authentication) {
        if (!config.password) {
            console.error('[OBS] Authentication required but no password configured');
            ws.close();
            return;
        }

        const auth = computeAuth(data.authentication);
        identify.d.authentication = auth;
    }

    ws.send(JSON.stringify(identify));
}

/**
 * Compute authentication response for OBS WebSocket
 */
function computeAuth(authData) {
    const { salt, challenge } = authData;
    const secret = crypto
        .createHash('sha256')
        .update(config.password + salt)
        .digest('base64');

    const authResponse = crypto
        .createHash('sha256')
        .update(secret + challenge)
        .digest('base64');

    return authResponse;
}

/**
 * Send a request to OBS and wait for response
 */
function sendRequest(requestType, requestData = {}) {
    return new Promise((resolve, reject) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            reject(new Error('OBS WebSocket not connected'));
            return;
        }

        const requestId = `req_${++currentRequestId}`;
        const message = {
            op: 6,
            d: {
                requestType,
                requestId,
                requestData
            }
        };

        messageHandlers[requestId] = (response) => {
            if (response.requestStatus.result) {
                resolve(response.responseData);
            } else {
                reject(new Error(response.requestStatus.comment || 'OBS request failed'));
            }
        };

        ws.send(JSON.stringify(message));

        // Timeout after 5 seconds
        setTimeout(() => {
            if (messageHandlers[requestId]) {
                delete messageHandlers[requestId];
                reject(new Error('OBS request timeout'));
            }
        }, 5000);
    });
}

/**
 * Get current streaming status
 */
async function getStreamStatus() {
    try {
        const status = await sendRequest('GetStreamStatus');
        return {
            streaming: status.outputActive || false
        };
    } catch (err) {
        console.error('[OBS] GetStreamStatus error:', err.message);
        return { streaming: false, error: err.message };
    }
}

/**
 * Start streaming
 */
async function startStreaming() {
    try {
        await sendRequest('StartStream');
        console.log('[OBS] Stream started');
        return { success: true };
    } catch (err) {
        console.error('[OBS] StartStream error:', err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Stop streaming
 */
async function stopStreaming() {
    try {
        await sendRequest('StopStream');
        console.log('[OBS] Stream stopped');
        return { success: true };
    } catch (err) {
        console.error('[OBS] StopStream error:', err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Toggle streaming
 */
async function toggleStreaming() {
    const status = await getStreamStatus();
    if (status.streaming) {
        return await stopStreaming();
    } else {
        return await startStreaming();
    }
}

module.exports = {
    init,
    getStreamStatus,
    startStreaming,
    stopStreaming,
    toggleStreaming
};
