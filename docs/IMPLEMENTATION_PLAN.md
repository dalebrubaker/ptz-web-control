# PTZ Web Control - Implementation Plan

## Project Overview
Build a web-based PTZ camera control interface for the SimplTrack2/HuddleView camera using VISCA over TCP/UDP. Designed for reliable mobile access during church services.

## Current State
- Skeleton files exist but are mostly empty
- Config file is complete with 7 presets (5 non-tracking, 2 tracking)
- Dependencies defined (Express, Nodemon)
- No actual implementation yet

## Key Requirements
- **Protocol**: VISCA over TCP (port 5678) OR UDP - support both
- **Mobile-first**: Large touch targets (60px minimum)
- **Modern clean UI**: Keep reference layout but with modern styling (not exact replica)
- **Browser support**: Standard HTML/CSS/JS for Chrome, Firefox, Safari, Edge
- **Reliable**: Stateless connections, no persistent TCP hanging issues

---

## Implementation Plan

### Phase 1: Server Implementation

**File**: `src/server/index.js`

1. **Setup Express server** serving static files from `src/public/`
2. **API endpoint**: `POST /api/command` - accepts VISCA commands to send to camera
3. **TCP client** using Node.js `net` module:
   - Connect to camera IP:port from config
   - Send command packets
   - Handle connection errors gracefully
   - Close connection after each command (stateless)
4. **UDP client** using Node.js `dgram` module:
   - Send commands to camera IP:port
   - No connection state needed
5. **Config loading**: Read `config/config.json` at startup

### Phase 2: VISCA Command Module

**File**: `src/server/visca.js`

Create command utilities based on the PDF specification:

1. **Packet builders**:
   - `buildPresetRecall(presetNumber)` - Returns Buffer for preset recall
   - `buildTrackingOn()` - Preset 80 (0x50)
   - `buildTrackingOff()` - Preset 81 (0x51)
   - `buildPanTilt(panSpeed, tiltSpeed, direction)` - Direction: 1-7
   - `buildZoom(speed, direction)` - In/Out
   - `buildHome()` - Reset to home position

2. **Command format per PDF**:
   ```
   Header: 0x81 0x01 [socket] 0x01
   Trail info (optional)
   Command: [command bytes]
   Terminator: 0xFF
   ```

### Phase 3: Presets Page (index.html)

**Files**: `src/public/index.html`, `src/public/css/style.css`, `src/public/js/control.js`

**Layout** (modern clean version of Page1 reference):
```
+----------------------------------+
|         PTZ Camera Control       |
+----------------------------------+
|  [Stage]  [Welcome]  [Offering]  |
|  [Prayer]  [Podium]   [Widest]   |
|        [Baptistry]               |
|                                  |
|      [Manual Controls →]         |
+----------------------------------+
```

**Button behavior**:
- Non-tracking presets: Send Tracking OFF → wait 50ms → Send preset recall
- Tracking presets: Send Tracking ON → wait 50ms → Send preset recall
- Visual feedback: Highlight on tap, brief confirmation message

**CSS**:
- Mobile-first flexbox/grid layout
- 60px+ minimum touch targets
- Dark theme (high contrast for dim church environments)
- Responsive: Works on phone, tablet, desktop

### Phase 4: Manual Controls Page (manual.html)

**Files**: `src/public/manual.html`, extended CSS and JS

**Layout** (modern clean version of Page2 reference):
```
+----------------------------------+
|  [← Presets]      Manual Control |
+----------------------------------+
|  [Track Start]  [↑]  [Zoom In]   |
|  [Track Stop] [←][Home][→]       |
|  [Back]        [↓]  [Zoom Out]   |
+----------------------------------+
```

**Hold-to-move implementation**:
```javascript
// Touch and mouse events for mobile/desktop
touchstart/mousedown → Start sending pan/tilt commands
touchend/mouseup → Stop sending
```

**Buttons**:
- 8 directional pad (including diagonals)
- Zoom In/Out
- Home
- Track Start/Stop
- Back to presets

### Phase 5: Client-Side JavaScript

**File**: `src/public/js/control.js`

1. **Fetch API** to call `/api/command` endpoint
2. **Config loading**: Fetch preset config from server
3. **Dynamic button generation**: Create buttons from config
4. **Event handlers**: Click/touch for presets, hold-to-move for manual
5. **Visual feedback**: Toast notifications, button active states

---

## File Structure After Implementation

```
ptz-web-control/
├── package.json                    (✓ already exists)
├── config/
│   └── config.json                 (✓ already exists)
├── src/
│   ├── server/
│   │   ├── index.js                (IMPLEMENT - Express + TCP/UDP)
│   │   └── visca.js                (CREATE - VISCA command builders)
│   └── public/
│       ├── index.html              (IMPLEMENT - Presets page)
│       ├── manual.html             (CREATE - Manual controls)
│       ├── css/
│       │   └── style.css           (IMPLEMENT - Modern styles)
│       └── js/
│           └── control.js          (IMPLEMENT - Client logic)
└── docs/
    └── PROJECT_SETUP.md            (✓ reference)
```

---

## VISCA Commands Summary (from PDF)

| Command | Bytes | Description |
|---------|-------|-------------|
| Preset Recall | `81 01 04 3F 02 [P] FF` | P = preset number (0x00-0x7F) |
| Tracking On | `81 01 04 3F 02 50 FF` | Preset 80 |
| Tracking Off | `81 01 04 3F 02 51 FF` | Preset 81 |
| Pan/Tilt | `81 01 06 01 VV WW DD FF` | VV/Tilt, WW/Pan, DD=direction |
| Zoom In | `81 01 04 07 2P FF` | P = speed (0-7) |
| Zoom Out | `81 01 04 07 3P FF` | P = speed (0-7) |
| Home | `81 01 06 04 FF` | Reset position |

## Testing Checklist

- [ ] Server starts without errors (`npm start`)
- [ ] Can access from PC browser (http://localhost:3000)
- [ ] Preset buttons send correct VISCA commands to camera
- [ ] Tracking presets enable tracking before recall
- [ ] Non-tracking presets disable tracking before recall
- [ ] Manual controls respond to hold/release
- [ ] Mobile browser loads and functions
- [ ] Touch events work properly on phone
- [ ] Visual feedback shows command sent
- [ ] TCP connection closes after each command (no hanging)
- [ ] UDP mode works (if configured)

## Implementation Order

1. **Server** - Express + VISCA command builders + TCP/UDP clients
2. **API** - Command endpoint with error handling
3. **Index.html** - Presets page structure and layout
4. **Style.css** - Modern mobile-first styling
5. **Control.js** - Client logic, fetch, event handlers
6. **Manual.html** - Manual controls page
7. **Testing** - Verify all functionality

---

**Critical Files**:
- `src/server/index.js` - Main server, TCP/UDP handling
- `src/server/visca.js` - VISCA protocol implementation
- `src/public/index.html` - Presets UI
- `src/public/manual.html` - Manual controls UI
- `src/public/css/style.css` - Shared styles
- `src/public/js/control.js` - Client-side logic
