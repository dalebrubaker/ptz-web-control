import net from 'net';

const HOST = '10.0.0.2';
const PORT = 5678;

// Try with VISCA-over-IP wrapper
// Format: 01 00 [seq] 00 00 [len-hi] [len-lo] [VISCA data]
let seq = 0;
function wrapViscaIP(viscaBytes) {
    const len = viscaBytes.length;
    const header = Buffer.from([0x01, 0x00, seq++, 0x00, 0x00, 0x00, len]);
    return Buffer.concat([header, viscaBytes]);
}

// Raw VISCA commands
const RAW_PRESET_2 = Buffer.from([0x81, 0x01, 0x04, 0x3F, 0x02, 0x02, 0xFF]);
const RAW_PRESET_0 = Buffer.from([0x81, 0x01, 0x04, 0x3F, 0x02, 0x00, 0xFF]);

// Toggle this to test with/without IP wrapper
const USE_IP_WRAPPER = false;

const COMMANDS = {
    'Preset 2': USE_IP_WRAPPER ? wrapViscaIP(RAW_PRESET_2) : RAW_PRESET_2,
    'Preset 0': USE_IP_WRAPPER ? wrapViscaIP(RAW_PRESET_0) : RAW_PRESET_0,
};

function sendCommand(name, packet) {
    const client = new net.Socket();

    console.log(`Connecting to ${HOST}:${PORT} to send ${name}...`);
    console.log(`Packet (hex): ${packet.toString('hex')}`);
    client.connect(PORT, HOST, () => {
        console.log('Connected! Sending...');
        client.write(packet);
        console.log('Sent! Waiting for response...');

        setTimeout(() => {
            console.log('Closing.');
            client.destroy();
        }, 3000);
    });

    client.on('data', (data) => console.log('>>> Response:', data.toString('hex')));
    client.on('error', (err) => console.error('Error:', err.message));
    client.on('close', () => console.log('Connection closed.'));
}

// Call preset 2
sendCommand('Preset 2', COMMANDS['Preset 2']);

// Call preset 0 after 3 seconds
setTimeout(() => {
    sendCommand('Preset 0', COMMANDS['Preset 0']);
}, 3000);
