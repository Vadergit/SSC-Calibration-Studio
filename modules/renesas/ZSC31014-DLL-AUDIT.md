# Manufacturer evaluation package audit
Source: IDT_ZSC31014-Eval-Software-Rev1p489_SWR_20160503.zip
SHA-256: a57938097022efaca84d6ee23062bc853a6bd1e0cc17d1caba73190a03294080

The archive contains ZSC31014 Setup.exe (Inno Setup 5.5.7).
Static LZMA stream inspection identified both x86 and x64 iLiteCalMath.dll PE images.
Exports match the calibration technical note: CalculateCoefficients, ConvertFromPercent,
ConvertFromHex, ConvertFromDegrees, SolveBridge, SolveTemp, VerifyCoefficients.
The original executable installer was not run. The embedded PE streams may still contain installer-specific transforms; use the properly installed vendor DLL for runtime reference tests.

The verified input conversion code is implemented in zsc31014-dll-input.mjs.
For example, pressure 100% as a target is 16383; raw 0/50/100% maps to -8192/0/8191.
An 11-bit temperature word is multiplied by 8; this is not recovery of the lost ADC bits.
The DLL flag mapping differs from the EEPROM register layout.

## Independent reference vectors
On a Windows test machine install the manufacturer software and run:
python tools/zsc31014-dll-reference.py "C:\\path\\iLiteCalMath.dll" vectors.json
Use Python matching the DLL architecture. The script uses the official DLL API, records status
and coefficients for nine modes with both signs, and never accesses a sensor.
The script has not been executed against the DLL in this Linux environment. Do not interpret
the continuous solver as register-exact; verify with these and additional actual hardware vectors.

## Communication Board firmware 4.18
Uploaded SSC_CommunicationBoard_Firmware_V4_18.zip contains the .bin, firmware-update
application note and SSC_CB_Command_Syntax_Version_4_18.xlsx. The I2C worksheet rows 28–68
confirm IW_aabbbdd / IR_aabbb / IQ_aabbbcccdd, 7-bit hexadecimal addresses, decimal byte
counts, and combined write/read with repeated start. No board firmware update was performed.
The existing adapter path was not changed.

## Scope
No new native EEPROM programming modes are released by this commit. Extended coefficient
calculation and actual device integration remain pending. Browser smoke flow now explicitly
confirms leaving a task and follows the common plan screen.
