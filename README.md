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
- **Protocol**: VISCA over UDP (port 52381) or TCP
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
    "port": 52381,
    "protocol": "udp"
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

### Running as a Windows Service (PM2)

PM2 allows the server to start automatically when Windows boots and restart if it crashes.

#### Prerequisites

```powershell
# Install PM2 globally (run PowerShell as Administrator)
npm install -g pm2
npm install -g pm2-windows-startup
```

#### Install the Service

```powershell
# Navigate to the project folder
cd c:\dev\ptz-web-control

# Start the app with PM2
pm2 start src/server/index.js --name "ptz-control"

# Save the PM2 process list
pm2 save

# Configure PM2 to start on Windows boot (run as Administrator)
pm2-startup install
```

#### Verify Service is Running

```powershell
pm2 status        # Check if the app is running
pm2 logs          # View application logs
pm2 monit         # Real-time monitoring dashboard
```

#### Uninstall the Service

```powershell
# Stop and remove the app from PM2
pm2 stop ptz-control
pm2 delete ptz-control
pm2 save

# Remove PM2 from Windows startup
pm2-startup uninstall
```

#### Useful PM2 Commands

| Command                   | Description     |
| ------------------------- | --------------- |
| `pm2 start ptz-control`   | Start the app   |
| `pm2 stop ptz-control`    | Stop the app    |
| `pm2 restart ptz-control` | Restart the app |
| `pm2 logs ptz-control`    | View logs       |
| `pm2 flush`               | Clear all logs  |

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
- Ports 3000 (web server) and 52381 (VISCA/UDP) accessible

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
