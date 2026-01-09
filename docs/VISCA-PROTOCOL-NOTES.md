# VISCA Protocol Notes for HuddleCamHD SimplTrack Cameras

This document captures key learnings from debugging VISCA communication with HuddleCamHD SimplTrack cameras.

## Working Configuration

For the HC20X-SIMPLTRACK-LT camera:

| Setting | Value |
|---------|-------|
| Protocol | **UDP** |
| Port | **52381** |
| Command Format | **Raw VISCA** (no IP wrapper) |
| Camera Mode | Server (listening for commands) |

## Key Concepts

### 1. Raw VISCA vs. VISCA-over-IP

There are two ways to send VISCA commands over a network:

**Raw VISCA (what this camera needs):**
```
81 01 04 3F 02 01 FF
```
- Starts with camera address byte (`0x81` for camera 1)
- Ends with terminator (`0xFF`)
- No header wrapper

**VISCA-over-IP (Sony standard, NOT used here):**
```
01 00 00 07 00 00 00 01 | 81 01 04 3F 02 01 FF
[------ 8-byte header -----] [--- VISCA payload ---]
```
- 8-byte header containing: type, length, sequence number
- Then the VISCA payload
- Used by some Sony cameras and controllers

**Important:** The HuddleCamHD SimplTrack cameras expect **raw VISCA commands without the IP wrapper**.

### 2. UDP vs. TCP

| Protocol | Description |
|----------|-------------|
| **UDP** | Connectionless, send-and-forget. Camera responds to same port. **This is what works.** |
| TCP | Connection-oriented, requires handshake. Camera documentation mentions TCP on port 5678, but UDP on 52381 works better. |

The camera's web interface allows configuring either protocol. For this application, **UDP** is required.

### 3. Port Numbers

| Port | Usage |
|------|-------|
| **52381** | Standard VISCA-over-IP UDP port. This is what works with our camera. |
| 5678 | Often mentioned for TCP control. May work for some setups. |
| 1259 | Alternative VISCA port used by some manufacturers (Avonic, etc.) |

**Note:** Port 52381 is the official VISCA-over-IP standard port, even though we send raw commands (without the IP header).

### 4. Camera Web Interface Settings

In the camera's Remote Configuration > Protocol tab:

| Setting | Required Value |
|---------|----------------|
| Enable | Enable |
| Protocol | **UDP** |
| Camera As | **Server** |
| IP | 0.0.0.0 |
| Port | **52381** |

"Server" mode means the camera listens for incoming commands. "Client" mode would have the camera connect out to a controller.

## Common VISCA Commands

### Preset Recall
```
81 01 04 3F 02 [pp] FF
```
- `pp` = preset number (0x00-0xFF)
- Example: Preset 1 = `81 01 04 3F 02 01 FF`

### Pan/Tilt
```
81 01 06 01 [VV] [WW] [AA] [BB] FF
```
- `VV` = pan speed (0x01-0x18)
- `WW` = tilt speed (0x01-0x14)
- `AA` = pan direction (01=left, 02=right, 03=stop)
- `BB` = tilt direction (01=up, 02=down, 03=stop)

### Pan/Tilt Stop
```
81 01 06 01 [VV] [WW] 03 03 FF
```

### Zoom
```
81 01 04 07 [2p] FF  - Zoom In (p=0-7 speed)
81 01 04 07 [3p] FF  - Zoom Out (p=0-7 speed)
81 01 04 07 00 FF    - Zoom Stop
```

### Tracking On/Off (SimplTrack specific)
```
81 01 04 3F 02 50 FF  - Tracking ON
81 01 04 3F 02 51 FF  - Tracking OFF
```

## Response Messages

The camera responds with raw VISCA replies:

| Response | Meaning |
|----------|---------|
| `90 41 FF` | ACK (socket 1) - command received |
| `90 42 FF` | ACK (socket 2) - command received |
| `90 51 FF` | Completion (socket 1) - command finished |
| `90 52 FF` | Completion (socket 2) - command finished |
| `90 60 02 FF` | Syntax Error |
| `90 60 03 FF` | Command Buffer Full |
| `90 6x 41 FF` | Command Not Executable |

## Troubleshooting

### Camera not responding
1. Verify camera IP address (ping it)
2. Check protocol is set to **UDP** (not TCP)
3. Check port is **52381**
4. Ensure camera is in **Server** mode
5. Verify no IP wrapper is being added to commands

### Commands sent but camera doesn't move
1. Check command format - should start with `81`, end with `FF`
2. Verify no VISCA-over-IP header is prepended
3. Look at server logs to see exact bytes being sent
4. Compare with known-working commands from documentation

### Getting ACK but no Completion
- Some commands (like continuous pan/tilt) only send ACK
- Preset recall should send ACK then Completion when movement finishes
- Long movements may take several seconds to complete

## References

- [SimplTrack2/HuddleView VISCA over IP Commands](../SimplTrack2_HuddleView%20VISCA%20over%20IP%20Commands.md) - Full command reference
- HuddleCamHD camera web interface - Protocol configuration
