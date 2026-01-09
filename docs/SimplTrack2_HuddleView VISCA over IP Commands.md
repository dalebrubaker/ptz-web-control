TCP control of the SimplTrack or HuddlView is available on port 5678 by default when using the most up to date firmware

Updated: 2020/2/26

ACK / Completion Messages

Command Messages

Comments

z0 4y FF  (y:Socket No.)

Returned when the command is accepted.

z0 5y FF  (y:Socket No.)

Returned when the command has been executed.

ACK

Completion

Error Messages

Command Messages

Comments

Syntax Error

Command Buffer Full

z0 60 02 FF

z0 60 03 FF

Returned when the command format is different or when a command with illegal command parameters is accepted.

Indicates that two sockets are already being used (executing two commands) and the command could not be accepted when received.

Command Canceled

z0 6y 04 FF  (y:Socket No.)

Returned when a command which is being executed in a socket specified by the cancel command is canceled. The completion message for the command is not returned.

No Socket

z0 6y 05 FF  (y:Socket No.)

Returned when no command is executed in a socket specified by the cancel command, or when an invalid socket number is specified.

Command Not Executable

z0 6y 41 FF
 (y:Execution command
 Socket No. Inquiry command:0)

Returned when a command cannot be executed due to current conditions. For
 example, when commands controlling the focus manually are received during auto focus.

Commands

Command Set

AddressSet

IF_Clear

CommandCancel

CAM_Power

CAM_Zoom

CAM_Focus

CAM_ZoomFocus

CAM_WB

CAM_RGain

CAM_BGain

CAM_AE

CAM_Shutter

CAM_Iris

CAM_Gain

CAM_Bright

Command

Broadcast

Broadcast

On

Off

Stop

Tele(Standard)

Wide(Standard)

Tele(Variable)

Wide(Variable)

Direct

Stop

Far(Standard)

Near(Standard)

Far(Variable)

Near(Variable)

Direct

Auto Focus

Manual Focus

Auto/Manual

One Push Trigger

Direct

Auto

Indoor

Outdoor

One Push WB

Manual

One push trigger

Reset

Up

Down

Direct

Reset

Up

Down

Direct

Full Auto

Manual

Shutter Priority

Iris Priority

Bright

Reset

Up

Down

Direct

Reset

Up

Down

Direct

Reset

Up

Down

Direct

Reset

Up

Down

Direct

Command Packet

88 30 01 FF

88 01 00 01 FF

81 2p FF

81 01 04 00 02 FF

81 01 04 00 03 FF

81 01 04 07 00 FF

81 01 04 07 02 FF

81 01 04 07 03 FF

81 01 04 07 2p FF

81 01 04 07 3p FF

Comments

Address setting

I/F Clear

p: Socket No.(=1or2)

Power ON/OFF

p=0 (Low) to 7 (High)

81 01 04 47 0p 0q 0r 0s FF

pqrs: Zoom Position

81 01 04 08 00 FF

81 01 04 08 02 FF

81 01 04 08 03 FF

81 01 04 08 2p FF

81 01 04 08 3p FF

p=0 (Low) to 7 (High)

81 01 04 48 0p 0q 0r 0s FF

pqrs: Focus Position

81 01 04 38 02 FF

81 01 04 38 03 FF

81 01 04 38 10 FF

81 01 04 18 01 FF

81 01 04 47 0p 0q 0r 0s
 0t 0u 0v 0w FF

81 01 04 35 00 FF

81 01 04 35 01 FF

81 01 04 35 02 FF

81 01 04 35 03 FF

81 01 04 35 05 FF

81 01 04 10 05 FF

81 01 04 03 00 FF

81 01 04 03 02 FF

81 01 04 03 03 FF

AF ON/OFF

One Push AF Trigger

pqrs: Zoom Position tuvw: Focus Position

Normal Auto

Indoor mode

Outdoor mode

One Push WB mode

Manual Control mode

One Push WB Trigger

Manual Control of R Gain

81 01 04 43 00 00 0p 0q FF

pq: R Gain

81 01 04 04 00 FF

81 01 04 04 02 FF

81 01 04 04 03 FF

Manual Control of B Gain

81 01 04 44 00 00 0p 0q FF

pq: B Gain

81 01 04 39 00 FF

81 01 04 39 03 FF

81 01 04 39 0A FF

81 01 04 39 0B FF

81 01 04 39 0D FF

81 01 04 0A 00 FF

81 01 04 0A 02 FF

81 01 04 0A 03 FF

Automatic Exposure mode

Manual Control mode

Shutter Priority Automatic Exposure

Iris Priority Automatic Exposure mode

Bright Mode (Manual control)

Shutter Setting

81 01 04 4A 00 00 0p 0q FF

pq: Shutter Position

81 01 04 0B 00 FF

81 01 04 0B 02 FF

81 01 04 0B 03 FF

Iris Setting

81 01 04 4B 00 00 0p 0q FF

pq: Iris Position

81 01 04 0C 00 FF

81 01 04 0C 02 FF

81 01 04 0C 03 FF

Gain Setting

81 01 04 4C 00 00 0p 0q FF

pq: Gain Position

81 01 04 0D 00 FF

81 01 04 0D 02 FF

81 01 04 0D 03 FF

Bright Setting

81 01 04 4D 00 00 0p 0q FF

pq: Bright Position

CAM_ExpComp

CAM_Backlight

CAM_Aperture

On

Off

Reset

Up

Down

Direct

On

Off

Reset

Up

Down

Direct

Off

CAM_PictureEffect

Neg.Art

CAM_Memory

SYS_Menu

CAM_IDWrite

IR_Receive

Information Display

Pan-tiltDrive

B&W

Reset

Set

Recall

Off

On

Off

On

Off

Up

Down

Left

Right

UpLeft

UpRight

DownLeft

DownRight

Stop

AbsolutePosition

RelativePosition

Home

Reset

Pan-tiltLimitSet

LimitSet

81 01 04 3E 02 FF

81 01 04 3E 03 FF

81 01 04 0E 00 FF

81 01 04 0E 02 FF

81 01 04 0E 03 FF

Exposure Compensation ON/OFF

Exposure Compensation Amount
Setting

81 01 04 4E 00 00 0p 0q FF

pq: ExpComp Position

81 01 04 33 02 FF

81 01 04 33 03 FF

81 01 04 02 00 FF

81 01 04 02 02 FF

81 01 04 02 03 FF

Back Light Compensation ON/OFF

Aperture Control

81 01 04 42 00 00 0p 0q FF

pq: Aperture Gain

81 01 04 63 00 FF

81 01 04 63 02 FF

81 01 04 63 04 FF

81 01 04 3F 00 pp FF

81 01 04 3F 01 pp FF

81 01 04 3F 02 pp FF

81 01 06 06 03 FF

Picture Effect Setting

pp: Memory Number (=0 to 255)
Corresponds to 0 to 255 on the Remote Commander.

Turns off the menu screen.

81 01 04 22 0p 0q 0r 0s FF

pqrs: Camera ID (=0000 to FFFF)

81 01 06 08 02 FF

81 01 06 08 03 FF

81 01 7E 01 18 02 FF

81 01 7E 01 18 03 FF

81 01 06 01 VV WW 03 01 FF

81 01 06 01 VV WW 03 02 FF

81 01 06 01 VV WW 01 03 FF

81 01 06 01 VV WW 02 03 FF

81 01 06 01 VV WW 01 01 FF

81 01 06 01 VV WW 02 01 FF

81 01 06 01 VV WW 01 02 FF

81 01 06 01 VV WW 02 02 FF

81 01 06 01 VV WW 03 03 FF

81 01 06 02 VV WW
 0Y 0Y 0Y 0Y 0Z 0Z 0Z 0Z FF

81 01 06 03 VV WW
 0Y 0Y 0Y 0Y 0Z 0Z 0Z 0Z FF

81 01 06 04 FF

81 01 06 05 FF

81 01 06 07 00 0W
 0Y 0Y 0Y 0Y 0Z 0Z 0Z 0Z FF

IR(remote commander) receive
ON/OFF

ON/OFF of the Operation status display

VV: Pan speed 0 x01 (low speed) to 0 x18 (high speed) WW: Tilt Speed 0 x 01 (low speed) to 0 x14 (high speed)
YYYY: Pan Position
ZZZZ: Tilt Position

W: 1 UpRight 0: DownLeft
YYYY: Pan Limit Position
ZZZZ: Tilt Position

CAM_TrackingON

Enable Tracking / Framing

81 01 04 3F 02 50 FF

CAM_TrackingOFF

Disable Tracking / Framing

81 01 04 3F 02 51 FF

CAM_AutoFrameTrigger

One Push Auto Frame

81 01 0E 24 6C 0p 0p FF

P P: seconds (i.e. to enable framing / tracking for 21 seconds would be 0p 0p = 02 01)

CAM_DynBlockZones

On

Off

81 0B 0D 00 0p 01 FF

81 0B 0D 00 0p 02 FF

p: blocking zone (1 - 8)

Inquiry Commands

Command Set

Command

CAM_PowerInq

81 09 04 00 FF

Inquiry Packet

y0 50 02 FF

y0 50 03 FF

y0 50 04 FF

Comments

On

Off (Standby)

Internal power circuit error

CAM_ZoomPosInq

81 09 04 47 FF

y0 50 0p 0q 0r 0s FF

pqrs: Zoom Position

CAM_FocusModeInq

81 09 04 38 FF

y0 50 02 FF

y0 50 03 FF

Auto Focus

Manual Focus

CAM_FocusPosInq

81 09 04 48 FF

y0 50 0p 0q 0r 0s FF

pqrs: Focus Position

CAM_WBModeInq

81 09 04 35 FF

y0 50 00 FF

y0 50 01 FF

y0 50 02 FF

y0 50 03 FF

y0 50 05 FF

CAM_RGainInq

CAM_BGainInq

81 09 04 43 FF

81 09 04 44 FF

y0 50 00 00 0p 0q FF

y0 50 00 00 0p 0q FF

CAM_AEModeInq

81 09 04 39 FF

CAM_ShutterPosInq

81 09 04 4A FF

CAM_IrisPosInq

CAM_GainPosInq

CAM_BrightPosInq

81 09 04 4B FF

81 09 04 4C FF

81 09 04 4D FF

CAM_ExpCompModeInq

81 09 04 3E FF

y0 50 00 FF

y0 50 03 FF

y0 50 0A FF

y0 50 0B FF

y0 50 0D FF

y0 50 00 00 0p 0q FF

y0 50 00 00 0p 0q FF

y0 50 00 00 0p 0q FF

y0 50 00 00 0p 0q FF

y0 50 02 FF

y0 50 03 FF

Auto

In Door

Out Door

One Push WB

Manual

pq: R Gain

pq: B Gain

Full Auto

Manual

Shutter Priority

Iris Priority

Bright

pq: Shutter Position

pq: Iris Position

pq: Gain Position

pq: Bright Position

On

Off

CAM_ExpCompPosInq

81 09 04 4E FF

y0 50 00 00 0p 0q FF

pq: ExpComp Position

CAM_BacklightModeInq

81 09 04 33 FF

y0 50 02 FF

y0 50 03 FF

On

Off

CAM_ApertureInq

81 09 04 42 FF

y0 50 00 00 0p 0q FF

pq: Aperture Gain

CAM_PictureEffectModeInq 81 09 04 63 FF

CAM_MemoryInq

81 09 04 3F FF

SYS_MenuModeInq

81 09 06 06 FF

CAM_IDInq

CAM_VersionInq

81 09 04 22 FF

81 09 00 02 FF

Information Display

81 09 7E 01 18 FF

VideoSystemInq

81 09 06 23 FF

IR_Receive

81 09 06 08 FF

Pan-tiltMaxSpeedInq

81 09 06 11 FF

Pan-tiltPosInq

81 09 06 12 FF

Pan-tiltModeInq

81 09 06 10 FF

y0 50 00 FF

y0 50 02 FF

y0 50 04 FF

y0 50 0p FF

y0 50 02 FF

y0 50 03 FF

Off

Neg.Art

B&W

p: Memory number last operated.

On

Off

y0 50 0p 0q 0r 0s FF

pqrs: Camera ID

y0 50 00 01 mn pq rs tu vw FF

mnpq: Model Code (0504) rstu: ROM version vw: Socket Number (=02)

y0 50 02 FF

y0 50 03 FF

y0 50 00 FF

y0 50 01 FF

y0 50 02 FF

y0 50 03 FF

y0 50 07 FF

y0 50 08 FF

y0 50 09 FF

y0 50 0A FF

y0 50 0B FF

y0 50 0F FF

y0 50 02 FF

y0 50 03 FF

On

Off

1920 x1080i/60

1920 x1080p/30

1280 x720p/60

1280 x720p/30

1920 x1080p/60

1920 x1080i/50

1920 x1080p/25

1280 x720p/50

1280 x 720p/25

1920 x1080p/50

On

Off

y0 50 ww zz FF

y0 50 0w 0w 0w 0w
 0z 0z 0z 0z FF

y0 50 pq rs FF

ww = Pan Max Speed zz = Tilt Max Speed

wwww = Pan Position zzzz = Tilt Position

pqrs: Pan/Tilt Status

60 Hz system

50 Hz system

CAM_AnalyticsInq

81 01 0E 24 6E 00 00 FF

Inquires tracking status, current PTZ
[tracking status on/off][current X, Y, Z][#][human][date powered on][date command was sent]
position, faces in sight, & when the command was sent

