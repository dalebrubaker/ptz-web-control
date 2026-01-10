# Media Control

A simple, reliable web-based interface for controlling PTZ cameras, OBS Studio streaming, and VLC Player playback. Designed for mobile access during live events like church services.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)

## Features

- **Camera Control**

  - 7 camera presets with quick access to predefined positions
  - 8-way directional pad with hold-to-move for pan/tilt
  - Zoom In/Out with continuous zoom
  - Home position reset
  - Tracking toggle for auto-tracking cameras

- **OBS Studio Control**

  - Start/Stop streaming with visual feedback
  - Button turns green when streaming is live
  - Automatic status polling

- **VLC Player Control**

  - Play/Stop toggle for media playback
  - Button turns green when media is playing
  - Automatic status polling

- **Mobile-First Design**
  - Large 60px+ touch targets
  - Dark theme for dim environments
  - Works on Chrome, Firefox, Safari, Edge (desktop and mobile)

## Why This Exists

Bitfocus Companion has reliability issues with VISCA camera control - persistent TCP connections can get stuck during services, requiring restarts. This solution uses stateless TCP/UDP requests that can't "hang", providing a more reliable control option.

## Hardware Compatibility

- **Camera**: SimplTrack2 / HuddleView (VISCA over IP compatible)
- **OBS Studio**: v28+ with OBS WebSocket v5
- **VLC Player**: Any recent version with RC (Remote Control) interface
- **Protocol**: VISCA over UDP (port 52381) or TCP
- **Network**: All devices must be on the same network

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

**Note**: Only Node.js is required. No build tools or compilers needed.

### 3. Configure

Edit `config/config.json`:

```json
{
  "camera": {
    "ip": "192.168.1.100",
    "port": 52381,
    "protocol": "udp"
  },
  "server": {
    "port": 3000
  },
  "obs": {
    "host": "localhost",
    "port": 4444,
    "password": "your-obs-password"
  },
  "vlc": {
    "host": "localhost",
    "port": 4212,
    "password": ""
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

### 5. Open in Browser

- On the server machine: `http://localhost:3000`
- From other devices: `http://[server-ip]:3000`

## OBS Studio Setup

### Enable OBS WebSocket

1. Open OBS Studio
2. Go to **Tools → WebSocket Server Settings**
3. Enable the WebSocket Server
4. Note the port (default: 4444) and set a password
5. Update `config/config.json` with your OBS settings

### Verify OBS Connection

Start streaming manually from OBS first, then test the web button. The button should show "LIVE" with a green background when streaming is active.

## VLC Player Setup

VLC must be started with the Remote Control (RC) interface enabled. The most reliable method is to create a Windows shortcut.

### Step 1: Create a VLC Shortcut

1. **Right-click on your desktop** → New → Shortcut
2. For the location, paste the target command (see examples below)
3. Name it something like **"VLC Walk-in Music"**
4. **Always launch VLC using this shortcut** when you need remote control

### Step 2: Choose Your Shortcut Target

**Basic (RC interface only):**

```
"C:\Program Files\VideoLAN\VLC\vlc.exe" --extraintf rc --rc-host localhost:4212 --rc-quiet
```

**With a music folder (recommended for walk-in music):**

```
"C:\Program Files\VideoLAN\VLC\vlc.exe" --extraintf rc --rc-host localhost:4212 --rc-quiet "C:\Vlc Walk-in Music"
```

**With shuffle + loop (best for background music):**

```
"C:\Program Files\VideoLAN\VLC\vlc.exe" --extraintf rc --rc-host localhost:4212 --rc-quiet --loop --random "C:\Vlc Walk-in Music"
```

### Command Line Flags Reference

| Flag                       | Effect                           |
| -------------------------- | -------------------------------- |
| `--extraintf rc`           | Enable remote control interface  |
| `--rc-host localhost:4212` | Listen on port 4212 for commands |
| `--rc-quiet`               | Hide the console window          |
| `--loop`                   | Loop the playlist forever        |
| `--random`                 | Shuffle/randomize playback order |
| `--no-video`               | Audio only (no video window)     |

### Step 3: Test the Connection

After launching VLC with your shortcut, open PowerShell and run:

```powershell
Test-NetConnection -ComputerName localhost -Port 4212
```

If it shows `TcpTestSucceeded : True`, VLC is ready for remote control.

### VLC Password (Optional)

If you set a password in VLC, add it to `config/config.json` under `vlc.password`. Leave empty if no password is set.

## Running as a Windows Service (PM2)

PM2 allows the server to start automatically when Windows boots and restart if it crashes.

### Prerequisites

```powershell
# Install PM2 globally (run PowerShell as Administrator)
npm install -g pm2
npm install -g pm2-windows-startup
```

### Install the Service

```powershell
# Navigate to the project folder
cd c:\dev\ptz-web-control

# Start the app with PM2
pm2 start src/server/index.js --name "media-control"

# Save the PM2 process list
pm2 save

# Configure PM2 to start on Windows boot (run as Administrator)
pm2-startup install
```

### Verify Service is Running

```powershell
pm2 status        # Check if the app is running
pm2 logs          # View application logs
pm2 monit         # Real-time monitoring dashboard
```

### Uninstall the Service

```powershell
pm2 stop media-control
pm2 delete media-control
pm2 save
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

## Project Structure

```
ptz-web-control/
├── config/
│   └── config.json         # Camera, OBS, VLC, and server configuration
├── src/
│   ├── server/
│   │   ├── index.js        # Express server + all control clients
│   │   ├── visca.js        # VISCA protocol command builders
│   │   ├── obs.js          # OBS WebSocket v5 client
│   │   └── vlc.js          # VLC RC TCP client
│   └── public/
│       ├── index.html      # Main control page
│       ├── css/
│       │   └── style.css   # Dark theme, mobile-first styles
│       └── js/
│           └── control.js  # Client-side logic
└── package.json
```

## Configuration

### Camera Presets

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
- `tracking`: If `true`, enables auto-tracking before recalling preset

### Protocol Selection

```json
"camera": {
  "protocol": "tcp"   // or "udp"
}
```

- **TCP**: More reliable, ordered delivery. Default for VISCA.
- **UDP**: Faster, fire-and-forget. Use if TCP has issues.

## Usage

### Left Panel - Media Controls

- **STREAM button**: Toggle OBS streaming on/off. Button turns green with "LIVE" label when streaming.
- **PLAY button**: Toggle VLC playback on/off. Button turns green when playing.
- **STOP button**: Stop VLC playback.

### Right Panel - Camera Controls

- **Presets**: Tap any preset button to recall that camera position
- **D-Pad**: Hold to move in any direction (8-way)
- **Zoom**: Hold Zoom In/Out for continuous zoom
- **Home**: Tap to return to home position

## Requirements

### Server Machine

- **Node.js** 18.0.0 or higher
- Network connectivity to camera, OBS, and VLC
- Ports 3000 (web), 52381 (VISCA), 4444 (OBS), 4212 (VLC) accessible

### Client Devices

- Any modern web browser (Chrome, Firefox, Safari, Edge)
- Devices must be able to reach the server on port 3000

## Troubleshooting

### OBS button shows but doesn't work

- Verify OBS WebSocket is enabled in OBS Studio
- Check the port and password in config match OBS settings
- Try clicking the button - check server logs for errors

### VLC button shows but doesn't work

- Verify VLC is running with RC interface enabled
- Check that VLC is listening on port 4212
- Load media into VLC before using the play button

### Camera not responding

- Verify camera IP address in config
- Check network connectivity: `ping [camera-ip]`
- Try switching protocol (TCP ↔ UDP) in config

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
- OBS WebSocket v5 documentation
- SimplTrack2/HuddleView camera documentation
