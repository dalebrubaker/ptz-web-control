# PTZ Web Control

A simple, reliable web-based interface for controlling PTZ (Pan-Tilt-Zoom) cameras via VISCA over TCP/UDP protocol. Designed for mobile access during live events like church services.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)

## Why This Exists

Bitfocus Companion has reliability issues with VISCA camera control - persistent TCP connections can get stuck during services, requiring restarts. This solution uses stateless TCP/UDP requests that can't "hang", providing a more reliable control option.

## Features

- **7 Camera Presets** - Quick access to predefined camera positions
  - 5 non-tracking presets (Stage, Welcome, Offering, Widest, Baptistry)
  - 2 tracking presets (Prayer, Podium) with auto-tracking enabled
- **Manual Controls** - Full pan/tilt/zoom control with:
  - 8-way directional pad (including diagonals)
  - Zoom In/Out with hold-to-zoom
  - Home position reset
  - Track Start/Stop buttons
- **Hold-to-Move** - Touch and hold directional/zoom buttons for continuous movement
- **Mobile-First Design** - Large 60px+ touch targets, dark theme for dim environments
- **TCP & UDP Support** - Choose your protocol based on network conditions
- **Modern Browser Support** - Works on Chrome, Firefox, Safari, Edge (desktop and mobile)

## Hardware Compatibility

- **Camera**: SimplTrack2 / HuddleView (VISCA over IP compatible)
- **Protocol**: VISCA over TCP (port 5678) or UDP
- **Network**: Camera and server must be on the same network

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/dalebrubaker/ptz-web-control.git
cd ptz-web-control
```

### 2. Install Dependencies

```bash
npm install
```

**Note**: Only Node.js is required. No build tools, compilers, or full dev environment needed.

### 3. Configure Camera

Edit `config/config.json` with your camera's IP address:

```json
{
  "camera": {
    "ip": "192.168.1.100",
    "port": 5678,
    "protocol": "tcp"
  },
  "server": {
    "port": 3000
  }
}
```

### 4. Start the Server

```bash
npm start
```

Or run in the background (Linux/Mac):

```bash
nohup npm start &
```

As a Windows service (using PM2):

```bash
npm install -g pm2
pm2 start src/server/index.js --name ptz-control
pm2 save
pm2 startup
```

### 5. Open in Browser

- On the server machine: `http://localhost:3000`
- From other devices: `http://[server-ip]:3000`

## Project Structure

```
ptz-web-control/
├── config/
│   └── config.json         # Camera and server configuration
├── src/
│   ├── server/
│   │   ├── index.js        # Express server + TCP/UDP clients
│   │   └── visca.js        # VISCA protocol command builders
│   └── public/
│       ├── index.html      # Presets page
│       ├── manual.html     # Manual controls page
│       ├── css/
│       │   └── style.css   # Styles (dark theme, mobile-first)
│       └── js/
│           └── control.js  # Client-side logic
├── docs/                   # Additional documentation
└── package.json
```

## Configuration

### Preset Configuration

Presets are defined in `config/config.json`:

```json
"presets": {
  "stage": {
    "number": 1,
    "label": "Stage",
    "tracking": false
  },
  "prayer": {
    "number": 3,
    "label": "Prayer (Track)",
    "tracking": true
  }
}
```

- `number`: The camera's preset number (1-255)
- `label`: Display text on the button
- `tracking`: If `true`, enables tracking before recalling preset

### Protocol Selection

In `config/config.json`:

```json
"camera": {
  "protocol": "tcp"   // or "udp"
}
```

- **TCP**: More reliable, ordered delivery. Default for VISCA.
- **UDP**: Faster, fire-and-forget. Use if TCP has issues.

## Usage

### Presets Page (index.html)

- Tap any preset button to recall that camera position
- Tracking presets automatically enable tracking before moving
- Non-tracking presets disable tracking before moving
- Visual feedback confirms command sent

### Manual Controls Page (manual.html)

- **D-pad**: Hold to move in any direction (8-way)
- **Zoom**: Hold Zoom In/Out for continuous zoom
- **Home**: Tap to return to home position
- **Track Start/Stop**: Toggle auto-tracking on/off

## Requirements

### Server Machine

- **Node.js** 18.0.0 or higher
- Network connectivity to the PTZ camera
- Ports 3000 (web server) and 5678 (VISCA) accessible

### Client Devices

- Any modern web browser (Chrome, Firefox, Safari, Edge)
- Devices must be able to reach the server on port 3000

## Troubleshooting

### Server won't start

- Check that Node.js is installed: `node --version`
- Verify port 3000 is not in use by another application
- Check `config/config.json` is valid JSON

### Camera not responding

- Verify camera IP address in config
- Check network connectivity: `ping [camera-ip]`
- Try switching protocol (TCP ↔ UDP) in config
- Check camera's VISCA over IP settings

### Can't access from other devices

- Check firewall settings on server machine (allow port 3000)
- Verify all devices are on the same network
- Use server's IP address, not localhost

## Development

For local development with auto-reload:

```bash
npm run dev
```

## License

MIT License - free to use and modify.

## Acknowledgments

- VISCA protocol specification by Sony
- SimplTrack2/HuddleView camera documentation
