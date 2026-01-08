/**
 * PTZ Web Control Server
 * Express server with TCP/UDP VISCA camera control
 */

const express = require('express');
const net = require('net');
const dgram = require('dgram');
const path = require('path');
const fs = require('fs');

// Load configuration
const configPath = path.join(__dirname, '../../config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = express();
const PORT = config.server.port || 3000;

// Camera config
const CAMERA_IP = config.camera.ip;
const CAMERA_PORT = config.camera.port;
const PROTOCOL = config.camera.protocol || 'tcp'; // 'tcp' or 'udp'

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

/**
 * Helper: Get timestamp for logging
 */
function logTime() {
    return new Date().toISOString().split('T')[1].slice(0, -1);
}

/**
 * Send VISCA command via TCP
 * @param {Buffer} packet - VISCA command packet
 * @returns {Promise<void>}
 */
function sendTcpCommand(packet) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        let timeoutId;

        // Set timeout
        timeoutId = setTimeout(() => {
            client.destroy();
            reject(new Error('TCP connection timeout'));
        }, 5000);

        client.connect(CAMERA_PORT, CAMERA_IP, () => {
            clearTimeout(timeoutId);
            console.log(`[${logTime()}] TCP connected to ${CAMERA_IP}:${CAMERA_PORT}`);
            // Send the VISCA packet
            client.write(packet);

            // Listen for response
            const responseChunks = [];
            client.on('data', (data) => {
                responseChunks.push(data);
                const response = Buffer.concat(responseChunks);
                console.log(`[${logTime()}] <<< Response hex:`, response.toString('hex'));
                console.log(`[${logTime()}] <<< Response bytes:`, Array.from(response).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
            });

            // Give a small delay for the command to be received, then close
            setTimeout(() => {
                if (responseChunks.length === 0) {
                    console.log(`[${logTime()}] <<< No response received`);
                }
                client.destroy();
                resolve();
            }, 500);
        });

        client.on('error', (err) => {
            clearTimeout(timeoutId);
            console.log(`[${logTime()}] TCP error:`, err.message);
            client.destroy();
            reject(err);
        });

        client.on('close', () => {
            clearTimeout(timeoutId);
        });
    });
}

/**
 * Send VISCA command via UDP
 * @param {Buffer} packet - VISCA command packet
 * @returns {Promise<void>}
 */
function sendUdpCommand(packet) {
    return new Promise((resolve, reject) => {
        const client = dgram.createSocket('udp4');
        let closed = false;

        function closeIfNeeded() {
            if (!closed) {
                closed = true;
                try {
                    client.close();
                } catch (e) {
                    // Ignore close errors
                }
            }
        }

        client.send(packet, CAMERA_PORT, CAMERA_IP, (err) => {
            if (err) {
                console.log(`[${logTime()}] UDP send error:`, err.message);
                closeIfNeeded();
                reject(err);
            } else {
                console.log(`[${logTime()}] UDP packet sent to ${CAMERA_IP}:${CAMERA_PORT} (no response expected)`);
                closeIfNeeded();
                resolve();
            }
        });

        client.on('error', (err) => {
            console.log(`[${logTime()}] UDP socket error:`, err.message);
            closeIfNeeded();
            reject(err);
        });
    });
}

/**
 * Send command to camera using configured protocol
 * @param {Buffer} packet - VISCA command packet
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendCommand(packet) {
    try {
        // DEBUG: Log the packet being sent
        console.log(`[${logTime()}] >>> Sending to ${CAMERA_IP}:${CAMERA_PORT} via ${PROTOCOL.toUpperCase()}`);
        console.log(`[${logTime()}] >>> Packet hex:`, packet.toString('hex'));
        console.log(`[${logTime()}] >>> Packet bytes:`, Array.from(packet).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));

        if (PROTOCOL === 'udp') {
            await sendUdpCommand(packet);
        } else {
            // Default to TCP
            await sendTcpCommand(packet);
        }
        console.log(`[${logTime()}] >>> Command complete`);
        return { success: true };
    } catch (error) {
        console.error(`[${logTime()}] Command send error:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Send command with tracking toggle delay
 * @param {Buffer} trackingPacket - Tracking on/off packet
 * @param {Buffer} presetPacket - Preset recall packet
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendPresetWithTracking(trackingPacket, presetPacket) {
    try {
        // Send tracking command first
        await sendCommand(trackingPacket);

        // Wait 50ms before sending preset (per spec)
        await new Promise(resolve => setTimeout(resolve, 50));

        // Send preset recall
        await sendCommand(presetPacket);

        return { success: true };
    } catch (error) {
        console.error('Preset with tracking error:', error.message);
        return { success: false, error: error.message };
    }
}

// API Routes

/**
 * GET /api/config
 * Return camera and preset configuration (without sensitive details)
 */
app.get('/api/config', (req, res) => {
    // Return presets without camera IP for security
    const publicConfig = {
        presets: config.presets,
        protocol: PROTOCOL
    };
    res.json(publicConfig);
});

/**
 * POST /api/command
 * Send a single VISCA command
 * Body: { type: 'preset'|'tracking'|'panTilt'|'zoom'|'home', ...params }
 */
app.post('/api/command', async (req, res) => {
    const { type, ...params } = req.body;

    try {
        const visca = require('./visca');
        let packet;
        let result;

        switch (type) {
            case 'preset':
                packet = visca.buildPresetRecall(params.presetNumber);
                result = await sendCommand(packet);
                break;

            case 'presetWithTracking':
                const trackingPacket = params.tracking
                    ? visca.buildTrackingOn()
                    : visca.buildTrackingOff();
                const presetPacket = visca.buildPresetRecall(params.presetNumber);
                result = await sendPresetWithTracking(trackingPacket, presetPacket);
                break;

            case 'trackingOn':
                packet = visca.buildTrackingOn();
                result = await sendCommand(packet);
                break;

            case 'trackingOff':
                packet = visca.buildTrackingOff();
                result = await sendCommand(packet);
                break;

            case 'panTilt':
                packet = visca.buildPanTilt(
                    params.panSpeed || 4,
                    params.tiltSpeed || 4,
                    params.direction
                );
                result = await sendCommand(packet);
                break;

            case 'panTiltStop':
                packet = visca.buildPanTiltStop();
                result = await sendCommand(packet);
                break;

            case 'zoomIn':
                packet = visca.buildZoomIn(params.speed || 4);
                result = await sendCommand(packet);
                break;

            case 'zoomOut':
                packet = visca.buildZoomOut(params.speed || 4);
                result = await sendCommand(packet);
                break;

            case 'zoomStop':
                packet = visca.buildZoomStop();
                result = await sendCommand(packet);
                break;

            case 'home':
                packet = visca.buildHome();
                result = await sendCommand(packet);
                break;

            default:
                return res.status(400).json({ success: false, error: 'Unknown command type' });
        }

        if (result.success) {
            res.json({ success: true });
        } else {
            res.status(500).json(result);
        }

    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/continuous
 * Send continuous commands (for hold-to-move)
 * This allows starting/stopping movement for pan/tilt/zoom
 */
let continuousInterval = null;

app.post('/api/continuous', async (req, res) => {
    const { action, type, ...params } = req.body;

    try {
        const visca = require('./visca');

        // Stop any existing continuous command
        if (continuousInterval) {
            clearInterval(continuousInterval);
            continuousInterval = null;
        }

        if (action === 'start') {
            // Send first command immediately
            let packet;
            switch (type) {
                case 'panTilt':
                    packet = visca.buildPanTilt(
                        params.panSpeed || 4,
                        params.tiltSpeed || 4,
                        params.direction
                    );
                    break;
                case 'zoomIn':
                    packet = visca.buildZoomIn(params.speed || 4);
                    break;
                case 'zoomOut':
                    packet = visca.buildZoomOut(params.speed || 4);
                    break;
            }

            if (packet) {
                await sendCommand(packet);

                // Set up interval to repeat the command
                continuousInterval = setInterval(async () => {
                    await sendCommand(packet);
                }, 200); // Send every 200ms while holding
            }
        } else if (action === 'stop') {
            // Send stop command
            let stopPacket;
            if (type === 'panTilt') {
                stopPacket = visca.buildPanTiltStop();
            } else if (type === 'zoomIn' || type === 'zoomOut') {
                stopPacket = visca.buildZoomStop();
            }

            if (stopPacket) {
                await sendCommand(stopPacket);
            }
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Continuous command error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`PTZ Web Control Server running on port ${PORT}`);
    console.log(`Camera: ${CAMERA_IP}:${CAMERA_PORT} via ${PROTOCOL.toUpperCase()}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
