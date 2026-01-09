# SimplTrack2/HuddleView VISCA over IP Commands

*Updated: 2020/2/26*

TCP control of the SimplTrack or HuddlView is available on port 5678 by default when using the most up to date firmware.

---

## ACK / Completion Messages

| Message | Command Messages | Comments |
|---------|------------------|----------|
| ACK | z0 4y FF (y:Socket No.) | Returned when the command is accepted. |
| Completion | z0 5y FF (y:Socket No.) | Returned when the command has been executed. |

---

## Error Messages

| Error | Command Messages | Comments |
|-------|------------------|----------|
| Syntax Error | z0 60 02 FF | Returned when the command format is different or when a command with illegal command parameters is accepted. |
| Command Buffer Full | z0 60 03 FF | Indicates that two sockets are already being used (executing two commands) and the command could not be accepted when received. |
| Command Canceled | z0 6y 04 FF (y:Socket No.) | Returned when a command which is being executed in a socket specified by the cancel command is canceled. The completion message for the command is not returned. |
| No Socket | z0 6y 05 FF (y:Socket No.) | Returned when no command is executed in a socket specified by the cancel command, or when an invalid socket number is specified. |
| Command Not Executable | z0 6y 41 FF (y:Execution command Socket No. Inquiry command:0) | Returned when a command cannot be executed due to current conditions. For example, when commands controlling the focus manually are received during auto focus. |

---

## Commands

| Command Set | Command | Command Packet | Comments |
|-------------|---------|----------------|----------|
| AddressSet | Broadcast | 88 30 01 FF | Address setting |
| IF_Clear | Broadcast | 88 01 00 01 FF | I/F Clear |
| CommandCancel | | 81 2p FF | p: Socket No.(=1or2) |
| CAM_Power | On | 81 01 04 00 02 FF | Power ON/OFF |
| | Off | 81 01 04 00 03 FF | |
| CAM_Zoom | Stop | 81 01 04 07 00 FF | |
| | Tele(Standard) | 81 01 04 07 02 FF | |
| | Wide(Standard) | 81 01 04 07 03 FF | |
| | Tele(Variable) | 81 01 04 07 2p FF | p=0 (Low) to 7 (High) |
| | Wide(Variable) | 81 01 04 07 3p FF | p=0 (Low) to 7 (High) |
| | Direct | 81 01 04 47 0p 0q 0r 0s FF | pqrs: Zoom Position |
| CAM_Focus | Stop | 81 01 04 08 00 FF | |
| | Far(Standard) | 81 01 04 08 02 FF | |
| | Near(Standard) | 81 01 04 08 03 FF | |
| | Far(Variable) | 81 01 04 08 2p FF | p=0 (Low) to 7 (High) |
| | Near(Variable) | 81 01 04 08 3p FF | p=0 (Low) to 7 (High) |
| | Direct | 81 01 04 48 0p 0q 0r 0s FF | pqrs: Focus Position |
| | Auto Focus | 81 01 04 38 02 FF | AF ON/OFF |
| | Manual Focus | 81 01 04 38 03 FF | |
| | Auto/Manual | 81 01 04 38 10 FF | |
| | One Push Trigger | 81 01 04 18 01 FF | One Push AF Trigger |
| CAM_ZoomFocus | Direct | 81 01 04 47 0p 0q 0r 0s 0t 0u 0v 0w FF | pqrs: Zoom Position tuvw: Focus Position |
| CAM_WB | Auto | 81 01 04 35 00 FF | Normal Auto |
| | Indoor | 81 01 04 35 01 FF | Indoor mode |
| | Outdoor | 81 01 04 35 02 FF | Outdoor mode |
| | One Push WB | 81 01 04 35 03 FF | One Push WB mode |
| | Manual | 81 01 04 35 05 FF | Manual Control mode |
| | One push trigger | 81 01 04 10 05 FF | One Push WB Trigger |
| CAM_RGain | Reset | 81 01 04 03 00 FF | Manual Control of R Gain |
| | Up | 81 01 04 03 02 FF | |
| | Down | 81 01 04 03 03 FF | |
| | Direct | 81 01 04 43 00 00 0p 0q FF | pq: R Gain |
| CAM_BGain | Reset | 81 01 04 04 00 FF | Manual Control of B Gain |
| | Up | 81 01 04 04 02 FF | |
| | Down | 81 01 04 04 03 FF | |
| | Direct | 81 01 04 44 00 00 0p 0q FF | pq: B Gain |
| CAM_AE | Full Auto | 81 01 04 39 00 FF | Automatic Exposure mode |
| | Manual | 81 01 04 39 03 FF | Manual Control mode |
| | Shutter Priority | 81 01 04 39 0A FF | Shutter Priority Automatic Exposure |
| | Iris Priority | 81 01 04 39 0B FF | Iris Priority Automatic Exposure mode |
| | Bright | 81 01 04 39 0D FF | Bright Mode (Manual control) |
| CAM_Shutter | Reset | 81 01 04 0A 00 FF | Shutter Setting |
| | Up | 81 01 04 0A 02 FF | |
| | Down | 81 01 04 0A 03 FF | |
| | Direct | 81 01 04 4A 00 00 0p 0q FF | pq: Shutter Position |
| CAM_Iris | Reset | 81 01 04 0B 00 FF | Iris Setting |
| | Up | 81 01 04 0B 02 FF | |
| | Down | 81 01 04 0B 03 FF | |
| | Direct | 81 01 04 4B 00 00 0p 0q FF | pq: Iris Position |
| CAM_Gain | Reset | 81 01 04 0C 00 FF | Gain Setting |
| | Up | 81 01 04 0C 02 FF | |
| | Down | 81 01 04 0C 03 FF | |
| | Direct | 81 01 04 4C 00 00 0p 0q FF | pq: Gain Position |
| CAM_Bright | Reset | 81 01 04 0D 00 FF | Bright Setting |
| | Up | 81 01 04 0D 02 FF | |
| | Down | 81 01 04 0D 03 FF | |
| | Direct | 81 01 04 4D 00 00 0p 0q FF | pq: Bright Position |
| CAM_ExpComp | On | 81 01 04 3E 02 FF | Exposure Compensation ON/OFF |
| | Off | 81 01 04 3E 03 FF | |
| | Reset | 81 01 04 0E 00 FF | Exposure Compensation Amount Setting |
| | Up | 81 01 04 0E 02 FF | |
| | Down | 81 01 04 0E 03 FF | |
| | Direct | 81 01 04 4E 00 00 0p 0q FF | pq: ExpComp Position |
| CAM_Backlight | On | 81 01 04 33 02 FF | Back Light Compensation ON/OFF |
| | Off | 81 01 04 33 03 FF | |
| CAM_Aperture | Reset | 81 01 04 02 00 FF | Aperture Control |
| | Up | 81 01 04 02 02 FF | |
| | Down | 81 01 04 02 03 FF | |
| | Direct | 81 01 04 42 00 00 0p 0q FF | pq: Aperture Gain |
| CAM_PictureEffect | Off | 81 01 04 63 00 FF | Picture Effect Setting |
| | Neg.Art | 81 01 04 63 02 FF | |
| | B&W | 81 01 04 63 04 FF | |
| CAM_Memory | Reset | 81 01 04 3F 00 pp FF | pp: Memory Number (=0 to 255) |
| | Set | 81 01 04 3F 01 pp FF | Corresponds to 0 to 255 on the Remote Commander. |
| | Recall | 81 01 04 3F 02 pp FF | |
| SYS_Menu | Off | 81 01 06 06 03 FF | Turns off the menu screen. |
| CAM_IDWrite | | 81 01 04 22 0p 0q 0r 0s FF | pqrs: Camera ID (=0000 to FFFF) |
| IR_Receive | On | 81 01 06 08 02 FF | IR (remote commander) receive ON/OFF |
| | Off | 81 01 06 08 03 FF | |
| Information Display | On | 81 01 7E 01 18 02 FF | ON/OFF of the Operation status display |
| | Off | 81 01 7E 01 18 03 FF | |
| Pan-tiltDrive | Up | 81 01 06 01 VV WW 03 01 FF | VV: Pan speed 0x01 (low) to 0x18 (high) |
| | Down | 81 01 06 01 VV WW 03 02 FF | WW: Tilt speed 0x01 (low) to 0x14 (high) |
| | Left | 81 01 06 01 VV WW 01 03 FF | |
| | Right | 81 01 06 01 VV WW 02 03 FF | |
| | UpLeft | 81 01 06 01 VV WW 01 01 FF | |
| | UpRight | 81 01 06 01 VV WW 02 01 FF | |
| | DownLeft | 81 01 06 01 VV WW 01 02 FF | |
| | DownRight | 81 01 06 01 VV WW 02 02 FF | |
| | Stop | 81 01 06 01 VV WW 03 03 FF | |
| | AbsolutePosition | 81 01 06 02 VV WW 0Y 0Y 0Y 0Y 0Z 0Z 0Z 0Z FF | YYYY: Pan Position, ZZZZ: Tilt Position |
| | RelativePosition | 81 01 06 03 VV WW 0Y 0Y 0Y 0Y 0Z 0Z 0Z 0Z FF | YYYY: Pan Position, ZZZZ: Tilt Position |
| | Home | 81 01 06 04 FF | |
| | Reset | 81 01 06 05 FF | |
| Pan-tiltLimitSet | LimitSet | 81 01 06 07 00 0W 0Y 0Y 0Y 0Y 0Z 0Z 0Z 0Z FF | W: 1=UpRight, 0=DownLeft; YYYY: Pan Limit Position; ZZZZ: Tilt Position |
| CAM_TrackingON | Enable Tracking/Framing | 81 01 04 3F 02 50 FF | |
| CAM_TrackingOFF | Disable Tracking/Framing | 81 01 04 3F 02 51 FF | |
| CAM_AutoFrameTrigger | One Push Auto Frame | 81 01 0E 24 6C 0p 0p FF | PP: seconds (e.g. 21 seconds = 02 01) |
| CAM_DynBlockZones | On | 81 0B 0D 00 0p 01 FF | p: blocking zone (1-8) |
| | Off | 81 0B 0D 00 0p 02 FF | |

---

## Inquiry Commands

| Command Set | Command | Inquiry Packet | Comments |
|-------------|---------|----------------|----------|
| CAM_PowerInq | | 81 09 04 00 FF | |
| | | y0 50 02 FF | On |
| | | y0 50 03 FF | Off (Standby) |
| | | y0 50 04 FF | Internal power circuit error |
| CAM_ZoomPosInq | | 81 09 04 47 FF | |
| | | y0 50 0p 0q 0r 0s FF | pqrs: Zoom Position |
| CAM_FocusModeInq | | 81 09 04 38 FF | |
| | | y0 50 02 FF | Auto Focus |
| | | y0 50 03 FF | Manual Focus |
| CAM_FocusPosInq | | 81 09 04 48 FF | |
| | | y0 50 0p 0q 0r 0s FF | pqrs: Focus Position |
| CAM_WBModeInq | | 81 09 04 35 FF | |
| | | y0 50 00 FF | Auto |
| | | y0 50 01 FF | In Door |
| | | y0 50 02 FF | Out Door |
| | | y0 50 03 FF | One Push WB |
| | | y0 50 05 FF | Manual |
| CAM_RGainInq | | 81 09 04 43 FF | |
| | | y0 50 00 00 0p 0q FF | pq: R Gain |
| CAM_BGainInq | | 81 09 04 44 FF | |
| | | y0 50 00 00 0p 0q FF | pq: B Gain |
| CAM_AEModeInq | | 81 09 04 39 FF | |
| | | y0 50 00 FF | Full Auto |
| | | y0 50 03 FF | Manual |
| | | y0 50 0A FF | Shutter Priority |
| | | y0 50 0B FF | Iris Priority |
| | | y0 50 0D FF | Bright |
| CAM_ShutterPosInq | | 81 09 04 4A FF | |
| | | y0 50 00 00 0p 0q FF | pq: Shutter Position |
| CAM_IrisPosInq | | 81 09 04 4B FF | |
| | | y0 50 00 00 0p 0q FF | pq: Iris Position |
| CAM_GainPosInq | | 81 09 04 4C FF | |
| | | y0 50 00 00 0p 0q FF | pq: Gain Position |
| CAM_BrightPosInq | | 81 09 04 4D FF | |
| | | y0 50 00 00 0p 0q FF | pq: Bright Position |
| CAM_ExpCompModeInq | | 81 09 04 3E FF | |
| | | y0 50 02 FF | On |
| | | y0 50 03 FF | Off |
| CAM_ExpCompPosInq | | 81 09 04 4E FF | |
| | | y0 50 00 00 0p 0q FF | pq: ExpComp Position |
| CAM_BacklightModeInq | | 81 09 04 33 FF | |
| | | y0 50 02 FF | On |
| | | y0 50 03 FF | Off |
| CAM_ApertureInq | | 81 09 04 42 FF | |
| | | y0 50 00 00 0p 0q FF | pq: Aperture Gain |
| CAM_PictureEffectModeInq | | 81 09 04 63 FF | |
| | | y0 50 00 FF | Off |
| | | y0 50 02 FF | Neg.Art |
| | | y0 50 04 FF | B&W |
| CAM_MemoryInq | | 81 09 04 3F FF | |
| | | y0 50 0p FF | p: Memory number last operated |
| SYS_MenuModeInq | | 81 09 06 06 FF | |
| | | y0 50 02 FF | On |
| | | y0 50 03 FF | Off |
| CAM_IDInq | | 81 09 04 22 FF | |
| | | y0 50 0p 0q 0r 0s FF | pqrs: Camera ID |
| CAM_VersionInq | | 81 09 00 02 FF | |
| | | y0 50 00 01 mn pq rs tu vw FF | mnpq: Model Code (0504), rstu: ROM version, vw: Socket Number (=02) |
| Information Display | | 81 09 7E 01 18 FF | |
| | | y0 50 02 FF | On |
| | | y0 50 03 FF | Off |
| VideoSystemInq | | 81 09 06 23 FF | |
| | | y0 50 00 FF | 1920x1080i/60 (60 Hz system) |
| | | y0 50 01 FF | 1920x1080p/30 |
| | | y0 50 02 FF | 1280x720p/60 |
| | | y0 50 03 FF | 1280x720p/30 |
| | | y0 50 07 FF | 1920x1080p/60 |
| | | y0 50 08 FF | 1920x1080i/50 (50 Hz system) |
| | | y0 50 09 FF | 1920x1080p/25 |
| | | y0 50 0A FF | 1280x720p/50 |
| | | y0 50 0B FF | 1280x720p/25 |
| | | y0 50 0F FF | 1920x1080p/50 |
| IR_Receive | | 81 09 06 08 FF | |
| | | y0 50 02 FF | On |
| | | y0 50 03 FF | Off |
| Pan-tiltMaxSpeedInq | | 81 09 06 11 FF | |
| | | y0 50 ww zz FF | ww: Pan Max Speed, zz: Tilt Max Speed |
| Pan-tiltPosInq | | 81 09 06 12 FF | |
| | | y0 50 0w 0w 0w 0w 0z 0z 0z 0z FF | wwww: Pan Position, zzzz: Tilt Position |
| Pan-tiltModeInq | | 81 09 06 10 FF | |
| | | y0 50 pq rs FF | pqrs: Pan/Tilt Status |
| CAM_AnalyticsInq | | 81 01 0E 24 6E 00 00 FF | Inquires tracking status, current PTZ position, faces in sight, & when the command was sent. Response: [tracking status on/off][current X, Y, Z][#][human][date powered on][date command was sent] |
