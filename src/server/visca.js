/**
 * VISCA Command Module
 * Builds VISCA over IP command packets per SimplTrack2/HuddleView specification
 */

// VISCA Header per PDF spec: 0x81 0x01 [socket] 0x01
// Socket number: 0/1 for first/second camera
const SOCKET = 0;

const HEADER = Buffer.from([0x81, 0x01, SOCKET, 0x01]);
const TERMINATOR = 0xFF;

// Sequence number for IP packets
let sequenceNumber = 0;

// Direction codes for Pan/Tilt (per PDF spec)
const DIRECTIONS = {
    LEFT: 1,
    RIGHT: 2,
    UP: 3,
    DOWN: 4,
    UP_LEFT: 5,
    UP_RIGHT: 6,
    DOWN_LEFT: 7,
    DOWN_RIGHT: 8
};

/**
 * Build a raw VISCA command packet (without IP wrapper)
 * This is the standard VISCA format: 81 01 [socket] 01 [command] FF
 */
function buildRawViscaPacket(commandBytes) {
    const packet = Buffer.concat([
        HEADER,
        commandBytes,
        Buffer.from([TERMINATOR])
    ]);
    return packet;
}

/**
 * Build a VISCA over IP packet with proper wrapper
 * Per PDF spec: 01 00 [seq] 00 00 [len-hi] [len-lo] [VISCA data]
 */
function buildIpPacket(viscaPacket) {
    const dataLength = viscaPacket.length;
    const ipHeader = Buffer.from([
        0x01,           // VISCA over IP header byte 1
        0x00,           // VISCA over IP header byte 2
        sequenceNumber & 0xFF,  // Sequence number
        0x00,           // Reserved
        0x00,           // Reserved
        (dataLength >> 8) & 0xFF,  // Data length high byte
        dataLength & 0xFF          // Data length low byte
    ]);

    // Increment and wrap sequence number
    sequenceNumber = (sequenceNumber + 1) & 0xFF;

    return Buffer.concat([ipHeader, viscaPacket]);
}

/**
 * Build a complete VISCA over IP packet
 * Wraps the VISCA command in the IP packet format
 */
function buildPacket(commandBytes, useIpWrapper = true) {
    const viscaPacket = Buffer.concat([
        HEADER,
        commandBytes,
        Buffer.from([TERMINATOR])
    ]);

    if (useIpWrapper) {
        return buildIpPacket(viscaPacket);
    }
    return viscaPacket;
}

/**
 * Preset Recall Command
 * Command: 81 01 04 3F 02 [P] FF
 * P = preset number (0x00-0x7F)
 * @param {number} presetNumber - Preset number (1-7 in our config)
 */
function buildPresetRecall(presetNumber) {
    const presetByte = presetNumber & 0x7F;
    return buildPacket(Buffer.from([0x04, 0x3F, 0x02, presetByte]));
}

/**
 * Tracking ON (Preset 80 / 0x50)
 * Command: 81 01 04 3F 02 50 FF
 */
function buildTrackingOn() {
    return buildPacket(Buffer.from([0x04, 0x3F, 0x02, 0x50]));
}

/**
 * Tracking OFF (Preset 81 / 0x51)
 * Command: 81 01 04 3F 02 51 FF
 */
function buildTrackingOff() {
    return buildPacket(Buffer.from([0x04, 0x3F, 0x02, 0x51]));
}

/**
 * Pan/Tilt Command
 * Command: 81 01 06 01 VV WW DD FF
 * VV = pan speed (0-7 for standard, 0-18 for wide range)
 * WW = tilt speed (0-7 for standard, 0-14 for wide range)
 * DD = direction (1-8 per above)
 * @param {number} panSpeed - Pan speed (0-7)
 * @param {number} tiltSpeed - Tilt speed (0-7)
 * @param {number} direction - Direction code (1-8)
 */
function buildPanTilt(panSpeed, tiltSpeed, direction) {
    const p = Math.max(0, Math.min(7, panSpeed)) & 0x7F;
    const t = Math.max(0, Math.min(7, tiltSpeed)) & 0x7F;
    const d = Math.max(1, Math.min(8, direction)) & 0x7F;
    return buildPacket(Buffer.from([0x06, 0x01, p, t, d]));
}

/**
 * Stop Pan/Tilt movement
 */
function buildPanTiltStop() {
    return buildPacket(Buffer.from([0x06, 0x01, 0, 0, 0]));
}

/**
 * Zoom In
 * Command: 81 01 04 07 2P FF
 * P = speed (0-7)
 * @param {number} speed - Zoom speed (0-7, default 4)
 */
function buildZoomIn(speed = 4) {
    const s = Math.max(0, Math.min(7, speed));
    return buildPacket(Buffer.from([0x04, 0x07, 0x20 | s]));
}

/**
 * Zoom Out
 * Command: 81 01 04 07 3P FF
 * P = speed (0-7)
 * @param {number} speed - Zoom speed (0-7, default 4)
 */
function buildZoomOut(speed = 4) {
    const s = Math.max(0, Math.min(7, speed));
    return buildPacket(Buffer.from([0x04, 0x07, 0x30 | s]));
}

/**
 * Stop Zoom
 */
function buildZoomStop() {
    return buildPacket(Buffer.from([0x04, 0x07, 0x00]));
}

/**
 * Home Command - Reset camera to home position
 * Command: 81 01 06 04 FF
 */
function buildHome() {
    return buildPacket(Buffer.from([0x06, 0x04]));
}

module.exports = {
    // Packet builders
    buildPresetRecall,
    buildTrackingOn,
    buildTrackingOff,
    buildPanTilt,
    buildPanTiltStop,
    buildZoomIn,
    buildZoomOut,
    buildZoomStop,
    buildHome,
    buildRawViscaPacket,  // Export for testing

    // Direction constants
    DIRECTIONS
};
