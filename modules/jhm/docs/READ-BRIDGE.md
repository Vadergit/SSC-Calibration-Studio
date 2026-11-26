# Jiuhao USB Read Bridge (Preview)

This is a generic I2C transport, not a JHM-specific programming protocol. It is intentionally limited to reads. Some JHM models use other interfaces (including one-wire/SENT); do not use this bridge for them without a verified I2C service interface.

## Hardware

- ESP32-C3 SuperMini, Arduino ESP32 core, USB CDC on boot enabled. Firmware: `firmware/jhm_i2c_read_bridge/jhm_i2c_read_bridge.ino`. GPIO4 SDA, GPIO5 SCL, 100 kHz. 
- Arduino Pro Micro, Arduino AVR core, hardware SDA/SCL, 100 kHz. Same sketch.
- Check I/O voltage, pull-ups, pinout, supply and common ground against the actual SSC datasheet. Use appropriate level translation. The bridge does not supply or switch sensor power. No high voltage/OTP pulse.
- Firmware source not compiled or hardware-tested in this session.

## Browser

Chrome/Edge HTTPS, select exact model, open Verbindung & Diagnose, connect USB. The HELLO command validates the custom adapter only. Load a JSON profile made from the actual programming manual. Confirm the physical and protocol settings. Identity comparison is optional and checks only the configured expected bytes. Read twice and compare declared nonvolatile values; export full dump and compare against a saved baseline. Live polling uses roles in the profile; one operation at a time, 1 s cadence, no automatic writes.

The template deliberately contains no valid address/registers. Do not guess. Each register uses a decimal 7-bit I2C address inherited from profile, 0–2 bytes of hex prefix, 1–32 bytes returned, area ram/otp/eeprom/status/telemetry/unknown, endian be/le, signed boolean, scale/offset, optional role adcS/adcT/dspS/tempC/pressure/identity and expected hex only for identity. A prefix is sent with repeated START, not a generic safe operation for all chips. Only configure documented read selectors. No automatic scan or generic arbitrary write. If the chip requires a different read sequence, a separate driver is required.

## Source access blocker

Private `ssc-bibliothek` returns LFS pointers for JHM1101/1102/1103, JHM2102, Jiu Hao signaling and evaluation software documents. No chip-specific addresses, timing, read/write sequences or coefficients can be validated yet. Never use the public preview as production calibration software.

ADC roles adcS/adcT/dspS must use scale 1 and offset 0 (raw digits). Live capture is rejected after 2.5 s without a completed poll. If an identity read is configured, it is checked before the first poll. This does not establish independently that the profile is correct.
