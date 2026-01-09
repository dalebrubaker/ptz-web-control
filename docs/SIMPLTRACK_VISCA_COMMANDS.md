# SimplTrack / HuddleView VISCA over IP Commands

Source: SimplTrack2_HuddleView VISCA over IP Commands.pdf
Updated: 2020-02-26

This file is a cleaned text extraction of the original PDF, focused on practical VISCA commands.
It is intended for reference and use in open-source VISCA control projects.

---

## Transport

- Protocol: VISCA over IP
- Default TCP Port: 5678 (per documentation)
- VISCA commands are commonly supported over UDP on ports 52381 or 1259 depending on firmware.

---

## Preset (Memory) Commands

Preset Reset:
81 01 04 3F 00 pp FF

Preset Set:
81 01 04 3F 01 pp FF

Preset Recall:
81 01 04 3F 02 pp FF

pp = preset number (00–FF / 0–255)

---

## Tracking / Auto Framing

Enable Tracking / Framing:
81 01 04 3F 02 50 FF

Disable Tracking / Framing:
81 01 04 3F 02 51 FF

---

## Pan / Tilt Control

Pan-Tilt Drive:
81 01 06 01 VV WW DD DD FF

VV = Pan speed (01–18)
WW = Tilt speed (01–14)

Directions:
Up        : 03 01
Down      : 03 02
Left      : 01 03
Right     : 02 03
Stop      : 03 03

Home:
81 01 06 04 FF

Reset:
81 01 06 05 FF

---

## Zoom Control

Stop:
81 01 04 07 00 FF

Tele:
81 01 04 07 02 FF

Wide:
81 01 04 07 03 FF

Direct Zoom:
81 01 04 47 0p 0q 0r 0s FF

---

## Auto Frame (Timed)

One Push Auto Frame:
81 01 0E 24 6C pp FF

pp = duration in seconds (example: 02 01 = 21 seconds)

---

## Notes

- All VISCA commands terminate with FF.
- Send-only operation is valid; responses are optional.
- Tracking ON/OFF is implemented as preset recall on SimplTrack devices.
