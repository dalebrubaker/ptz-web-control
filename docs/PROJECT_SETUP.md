# PTZ-Web-Control Project Setup

## Project Overview
Simple, reliable web interface for controlling PTZ camera via UDP/TCP Visca commands.
Designed for mobile access during church services.

## Why This Exists
Bitfocus Companion has reliability issues with Visca camera control - persistent TCP connections get stuck, requiring service restarts mid-service. This solution uses stateless UDP/TCP requests that can't "hang".

## Camera Details
- **Model**: SimplTrack2/HuddleView
- **Protocol**: Visca over TCP (port 5678 default) or UDP
- **Tracking Presets**: 80 (ON), 81 (OFF)
- **Position Presets**: Custom numbered presets with labels

## Project Structure
```
ptz-web-control/
├── server.js           # Node.js server (TCP/UDP proxy + web server)
├── public/
│   ├── index.html      # Main control interface (presets page)
│   ├── manual.html     # Manual controls (pan/tilt/zoom)
│   ├── style.css       # Shared styles
│   └── control.js      # Client-side JavaScript
├── package.json        # Dependencies
├── config.json         # Camera configuration
├── README.md          # User documentation
└── LICENSE            # MIT license
```

## Button Configuration

### Page 1 - Presets (index.html)
**Non-tracking presets** (tracking OFF first, then preset):
- Stage
- Welcome  
- Offering
- Widest
- Baptistry

**Tracking presets** (tracking ON first, then preset):
- Prayer (Track)
- Podium (Track)

### Page 2 - Manual Controls (manual.html)
**Hold-to-move controls:**
- Pan: Left, Right, Up, Down, Diagonals
- Tilt: Up, Down
- Zoom: In, Out
- HOME button
- Track Start / Track Stop buttons

## Technical Requirements

### Visca Commands (from PDF)
```
Tracking ON:   81 01 04 3F 02 50 FF  (preset 80)
Tracking OFF:  81 01 04 3F 02 51 FF  (preset 81)
Preset Recall: 81 01 04 3F 02 [nn] FF  (nn = preset number)
Pan/Tilt:      81 01 06 01 VV WW [direction] FF
Zoom In:       81 01 04 07 2p FF  (p = speed 0-7)
Zoom Out:      81 01 04 07 3p FF
Home:          81 01 06 04 FF
```

### Command Sequencing
For each preset button:
1. Send tracking command (50ms delay)
2. Send preset recall command
3. Show feedback to user

### Hold-to-Move Implementation
```javascript
button.addEventListener('touchstart', startMoving);
button.addEventListener('touchend', stopMoving);
button.addEventListener('mousedown', startMoving);
button.addEventListener('mouseup', stopMoving);
```

## Configuration File Format
```json
{
  "camera": {
    "ip": "192.168.1.100",

## Installation

Prerequisites:

- Node.js v16 or later (LTS)
- Git
- (Optional, recommended for production) `pm2` process manager

Quick install (development):

```powershell
git clone https://github.com/<your-org>/ptz-web-control.git
cd ptz-web-control
npm install
npm start
```

Notes:

- Edit `config/config.json` to set your camera IP, port, protocol, and server port before starting.
- The default entry point is `src/server/index.js` and the `npm start` script runs it.

Installing `pm2` (optional, cross-platform):

```bash
npm install -g pm2
pm2 start npm --name "ptz-udp-control" -- start
pm2 save
```

## Running & Restarting the Service

Development (manual):

- Start: `npm start` (runs in the foreground)
- Stop: Ctrl+C in the terminal running the process
- Restart: stop then `npm start` again, or use `nodemon` with `npm run dev` for auto-restart on file changes

Production (recommended options):

1) Using `pm2` (cross-platform):

```bash
pm2 start npm --name "ptz-web-control" -- start
pm2 restart ptz-web-control    # restart the service
pm2 stop ptz-web-control       # stop the service
pm2 logs ptz-web-control       # view logs
```

2) Using systemd (Linux): create `/etc/systemd/system/ptz-web-control.service` with:

```ini
[Unit]
Description=PTZ UDP Control Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/ptz-web-control
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Commands to enable and manage:

```bash
sudo systemctl daemon-reload
sudo systemctl enable ptz-web-control
sudo systemctl start ptz-web-control
sudo systemctl restart ptz-web-control   # restart
sudo journalctl -u ptz-web-control -f    # live logs
```

Windows (PowerShell) quick restart:

If you launched with `npm start` in a console, close the console (or press Ctrl+C) and start again. For a managed service, use `pm2` as above or create a Windows service wrapper (e.g., NSSM).

Troubleshooting tips:

- If the server port is in use, change `server.port` in `config/config.json` or stop the process using that port.
- Check logs (console, `pm2 logs`, or `journalctl`) for errors about camera connectivity or port binding.
- Use `npm run dev` for live reload during development.

    "port": 5678,
    "protocol": "tcp"
  },
  "server": {
    "port": 3000
  },
  "presets": {
    "stage": { "number": 1, "label": "Stage", "tracking": false },
    "welcome": { "number": 2, "label": "Welcome", "tracking": false },
    "prayer": { "number": 3, "label": "Prayer (Track)", "tracking": true },
    "podium": { "number": 4, "label": "Podium (Track)", "tracking": true },
    "offering": { "number": 5, "label": "Offering", "tracking": false },
    "widest": { "number": 6, "label": "Widest", "tracking": false },
    "baptistry": { "number": 7, "label": "Baptistry", "tracking": false }
  }
}
```

## Next Steps with Claude in VS Code

1. **Open folder in VS Code**:
  - File → Open Folder → `E:\GitDev\ptz-web-control`

2. **Start Claude Code view**:
   - Open this file (PROJECT_SETUP.md) in the editor
   - Use Claude to start building files

3. **Implementation order**:
   - Create package.json and config.json
   - Build server.js (TCP/UDP handler)
   - Create index.html (preset buttons)
   - Create manual.html (pan/tilt/zoom)
   - Add CSS styling
   - Test and iterate

4. **Testing checklist**:
   - [ ] Server starts without errors
   - [ ] Can access from PC browser
   - [ ] Preset buttons send correct commands
   - [ ] Tracking logic works (on/off before preset)
   - [ ] Manual controls respond to hold/release
   - [ ] Mobile browser works
   - [ ] Touch events work on phone
   - [ ] Network connectivity is reliable

## Design Requirements

### UI Priorities
1. **Large touch targets** - Minimum 60px buttons for fat fingers
2. **Clear labels** - Preset names obvious at a glance
3. **Visual feedback** - Show when command sent
4. **Fast response** - No lag between tap and command
5. **Mobile-first** - Design for phone/tablet, PC is secondary

### Styling Notes
- Use high contrast colors
- Match Companion button grid from screenshots
- Page navigation clear (back button, etc.)
- Status messages non-intrusive

## GitHub Repository Setup

When ready to publish:

```bash
cd E:\GitDev\ptz-web-control
git init
git add .
git commit -m "Initial commit: PTZ Web control interface"
gh repo create ptz-web-control --public --source=. --remote=origin --push
```

Add topics: `ptz-camera`, `visca`, `udp`, `church-tech`, `camera-control`

## License
MIT License - open source, free to use and modify

---

**Ready to start building!** Use Claude in VS Code to implement each component.
