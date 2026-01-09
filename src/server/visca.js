/**
 * VISCA Command Module
 * Builds VISCA command packets per SimplTrack2/HuddleView specification
 *
 * Notes:
 * - The SimplTrack2/HuddleView TCP control port (default 5678) expects raw VISCA bytes like:
 *   `81 01 ... FF`
 * - Some environments use a VISCA-over-IP wrapper. You can enable that wrapper by setting:
 *   `VISCA_USE_IP_WRAPPER=true`
 */

const TERMINATOR = 0xFF;

// Sequence number for IP packets
let sequenceNumber = 0;

const DEFAULT_USE_IP_WRAPPER = /^(1|true|yes)$/i.test(process.env.VISCA_USE_IP_WRAPPER || '');
const DEFAULT_CAMERA_ADDRESS = (() => {
    const parsed = Number.parseInt(process.env.VISCA_CAMERA_ADDRESS || '1', 10);
    if (!Number.isFinite(parsed)) return 1;
    // VISCA addresses are typically 1-7.
    return Math.max(1, Math.min(7, parsed));
})();
const CAMERA_ADDRESS_BYTE = 0x80 | (DEFAULT_CAMERA_ADDRESS & 0x0F);

// Direction codes for Pan/Tilt (used by the client)
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
 * Ensure VISCA packet ends with 0xFF.
 */
function ensureTerminator(packet) {
    if (packet.length === 0) return Buffer.from([TERMINATOR]);
    if (packet[packet.length - 1] === TERMINATOR) return packet;
    return Buffer.concat([packet, Buffer.from([TERMINATOR])]);
}

/**
 * Build a raw VISCA packet (no IP wrapper).
 * `bytes` should contain the full VISCA message (e.g. `81 01 ... FF`).
 */
function buildRawViscaPacket(bytes) {
    const packet = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
    return ensureTerminator(packet);
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
 * Build a complete packet.
 * Default is raw VISCA. Set `VISCA_USE_IP_WRAPPER=true` to enable the wrapper.
 */
function buildPacket(viscaPacket, useIpWrapper = DEFAULT_USE_IP_WRAPPER) {
    const raw = buildRawViscaPacket(viscaPacket);
    return useIpWrapper ? buildIpPacket(raw) : raw;
}

/**
 * Preset Recall Command
 * Command: 81 01 04 3F 02 [pp] FF
 * P = preset number (0x00-0x7F)
 * @param {number} presetNumber - Preset number (1-7 in our config)
 */
function buildPresetRecall(presetNumber) {
    const presetByte = presetNumber & 0x7F;
    return buildPacket(Buffer.from([CAMERA_ADDRESS_BYTE, 0x01, 0x04, 0x3F, 0x02, presetByte, TERMINATOR]));
}

/**
 * Tracking ON (Preset 80 / 0x50)
 * Command: 81 01 04 3F 02 50 FF
 */
function buildTrackingOn() {
    return buildPacket(Buffer.from([CAMERA_ADDRESS_BYTE, 0x01, 0x04, 0x3F, 0x02, 0x50, TERMINATOR]));
}

/**
 * Tracking OFF (Preset 81 / 0x51)
 * Command: 81 01 04 3F 02 51 FF
 */
function buildTrackingOff() {
    return buildPacket(Buffer.from([CAMERA_ADDRESS_BYTE, 0x01, 0x04, 0x3F, 0x02, 0x51, TERMINATOR]));
}

/**
 * Pan/Tilt Command
 * Command: 81 01 06 01 VV WW AA BB FF
 * VV = pan speed  (0x01-0x18)
 * WW = tilt speed (0x01-0x14)
 * AA/BB = pan/tilt direction bytes
 */
const PAN_TILT_DIR = {
    [DIRECTIONS.UP]: [0x03, 0x01],
    [DIRECTIONS.DOWN]: [0x03, 0x02],
    [DIRECTIONS.LEFT]: [0x01, 0x03],
    [DIRECTIONS.RIGHT]: [0x02, 0x03],
    [DIRECTIONS.UP_LEFT]: [0x01, 0x01],
    [DIRECTIONS.UP_RIGHT]: [0x02, 0x01],
    [DIRECTIONS.DOWN_LEFT]: [0x01, 0x02],
    [DIRECTIONS.DOWN_RIGHT]: [0x02, 0x02]
};

function clampByte(value, min, max, fallback) {
    if (!Number.isFinite(value)) return fallback;
    return Math.max(min, Math.min(max, value)) & 0xFF;
}

function buildPanTilt(panSpeed, tiltSpeed, direction) {
    const p = clampByte(panSpeed, 0x01, 0x18, 0x04);
    const t = clampByte(tiltSpeed, 0x01, 0x14, 0x04);
    const [panDir, tiltDir] = PAN_TILT_DIR[direction] || [0x03, 0x03];
    return buildPacket(Buffer.from([CAMERA_ADDRESS_BYTE, 0x01, 0x06, 0x01, p, t, panDir, tiltDir, TERMINATOR]));
}

/**
 * Stop Pan/Tilt movement
 */
function buildPanTiltStop(panSpeed = 0x04, tiltSpeed = 0x04) {
    const p = clampByte(panSpeed, 0x01, 0x18, 0x04);
    const t = clampByte(tiltSpeed, 0x01, 0x14, 0x04);
    return buildPacket(Buffer.from([CAMERA_ADDRESS_BYTE, 0x01, 0x06, 0x01, p, t, 0x03, 0x03, TERMINATOR]));
}

/**
 * Zoom In
 * Command: 81 01 04 07 2P FF
 * P = speed (0-7)
 * @param {number} speed - Zoom speed (0-7, default 4)
 */
function buildZoomIn(speed = 4) {
    const s = Math.max(0, Math.min(7, speed));
    return buildPacket(Buffer.from([CAMERA_ADDRESS_BYTE, 0x01, 0x04, 0x07, 0x20 | s, TERMINATOR]));
}

/**
 * Zoom Out
 * Command: 81 01 04 07 3P FF
 * P = speed (0-7)
 * @param {number} speed - Zoom speed (0-7, default 4)
 */
function buildZoomOut(speed = 4) {
    const s = Math.max(0, Math.min(7, speed));
    return buildPacket(Buffer.from([CAMERA_ADDRESS_BYTE, 0x01, 0x04, 0x07, 0x30 | s, TERMINATOR]));
}

/**
 * Stop Zoom
 */
function buildZoomStop() {
    return buildPacket(Buffer.from([CAMERA_ADDRESS_BYTE, 0x01, 0x04, 0x07, 0x00, TERMINATOR]));
}

/**
 * Home Command - Reset camera to home position
 * Command: 81 01 06 04 FF
 */
function buildHome() {
    return buildPacket(Buffer.from([CAMERA_ADDRESS_BYTE, 0x01, 0x06, 0x04, TERMINATOR]));
}

/**
 * I/F Clear (broadcast)
 * Command: 88 01 00 01 FF
 */
function buildIfClear() {
    return buildPacket(Buffer.from([0x88, 0x01, 0x00, 0x01, TERMINATOR]));
}

/**
 * Address Set (broadcast)
 * Command: 88 30 01 FF
 */
function buildAddressSet() {
    return buildPacket(Buffer.from([0x88, 0x30, 0x01, TERMINATOR]));
}

/**
 * Command Cancel
 * Command: 81 2p FF (p: socket number 1 or 2)
 */
function buildCommandCancel(socketNumber = 1) {
    const p = socketNumber === 2 ? 0x02 : 0x01;
    return buildPacket(Buffer.from([CAMERA_ADDRESS_BYTE, 0x20 | p, TERMINATOR]));
}

/**
 * Power control / inquiry (useful for diagnostics)
 */
function buildPowerOn() {
    return buildPacket(Buffer.from([CAMERA_ADDRESS_BYTE, 0x01, 0x04, 0x00, 0x02, TERMINATOR]));
}

function buildPowerOff() {
    return buildPacket(Buffer.from([CAMERA_ADDRESS_BYTE, 0x01, 0x04, 0x00, 0x03, TERMINATOR]));
}

function buildPowerInquiry() {
    return buildPacket(Buffer.from([CAMERA_ADDRESS_BYTE, 0x09, 0x04, 0x00, TERMINATOR]));
}

function buildVersionInquiry() {
    return buildPacket(Buffer.from([CAMERA_ADDRESS_BYTE, 0x09, 0x00, 0x02, TERMINATOR]));
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
    buildIfClear,
    buildAddressSet,
    buildCommandCancel,
    buildPowerOn,
    buildPowerOff,
    buildPowerInquiry,
    buildVersionInquiry,
    buildRawViscaPacket,  // Export for testing

    // Direction constants
    DIRECTIONS
};
