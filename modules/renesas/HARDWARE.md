# Hardware · v0.4.0 (Laborstand)

## Original SSC Communication Board
ZSC31010 / ZSC31015: Original Renesas SSC-CB, 19200 8N1, CR. Connect reads firmware only. Enter button explicitly requires confirmation of adapter-powered sensor and voltage; trigger KS5V only (t01000), 30 ms off, then Start CM (5090). Read EEPROM twice via 0000; exact lengths 14/20 bytes including A5. ZSC31010 fields decoded; ZSC31015 raw dump. NOM command can return NACK as the sensor changes its output; verify externally. No automatic retries after timeout. No permanent write command is sent by connection or reading. ZSC31010 has an explicit experimental Gain_B/Offset_B expert write path: download and verify original backup, manually enter native codes, preview, consent including temperature <85°C, typed confirmation, compare fresh double-read against backup, issue only changed documented commands, require A5 per command and exact full-dump double-read afterwards. No auto retry or rollback; power failure can leave a partial write. Factory trims, communication and other fields are not targeted. Hardware validation required.

## ESP32-C3 ZSC31014
SDA GPIO4, SCL GPIO5, GPIO10 controls external active-high load switch. 3.3 V compatible I2C lines with external pull-ups; use level conversion where required. Never connect 5V directly to GPIO. Avoid back-power through I2C pullups; use appropriately switched supply/level translator. Arduino sketch in firmware/esp32c3_renesas_i2c. USB CDC 115200, I2C 100 kHz. Default 7-bit address 0x28; verify actual address. Startup A0, read 00–13, expect 5A, then NOM 80 and DF4. Timing and power sequence must be verified with oscilloscope on real hardware. Sketch not compiled or tested physically in this session. No EEPROM writes for ZSC31014.

## Limits
ZSC31010 raw mode needs unity gain and may require direct EEPROM changes; no native raw capture implemented yet. ZSC31014 DF4 reads output values, not raw ADC. Native compensation, AFE programming, alarm and output registers, automatic RAM/NVM calibration and other EEPROM fields, remaining models and DIY ZACwire not implemented. Offline regression is not a chip coefficient algorithm. Do not use for production.

## Public sources
- https://www.renesas.com/en/document/dst/zsc31010-datasheet (sections 3.1, 3.3, 3.4, 3.7)
- https://www.renesas.com/en/document/mat/zsc31010zsc31015zssc3015-zacwire-ssc-modular-evaluation-kit-manual (section 7)
- https://www.renesas.com/en/document/dst/zsc31014-datasheet (sections 3.2, 3.5, 3.6)
- https://www.mouser.com/datasheet/2/464/IDT_SSC-Comm-Board-Datasheet-160330_DST_20160416-1102180.pdf (section 6)

## v0.5.0 · I²C bridge v2
New firmware is incompatible with v1 handshake. ZSC31050 (72, CF, 30–4F EEPROM, 10–2F RAM) and ZSC31150 (72 D1, C372 response, 30–43 EEPROM, 10–1E RAM, checksum and command echo) are supported experimentally. The default primary I2C address 0x78 is intentionally allowed only for these families. D8/D9 read auto-zero-corrected raw pressure and temperature words. Capture is sequential, not synchronized, and raw word representation depends on ADC configuration; unsigned/signed display is explicitly selectable. No native coefficient encoding. ZSC31014 DF status is validated and stale values retried once. OFF powers the sensor down on explicit request or normal disconnect. Sources: https://dtsheet.com/doc/1381384/functional-description (sections 4.3–4.5) and https://dtsheet.com/doc/1381355/functional-description (sections 4.1–4.5). Physical electrical and timing validation required; no claim of completed hardware qualification.

ZSC31010 Raw Mode: requires an already verified unity Gain_B (0800) and Gain_T (80). Explicit command 4010 then candidate board read format RR_00003 (derived from terminal command format; not hardware-verified). No automatic EEPROM changes. Raw temperature low byte is not degrees Celsius and cannot be used for native temperature calibration alone. Two-point candidate calculator uses datasheet ideal BR=1.25*Gain_B*(BR_Raw+Offset_B), assumes no temperature/SOT terms; it proposes quantized codes only and is not equivalent to validated vendor DLL or saturation arithmetic.

## v0.6.0 · Three adapter choices
Original SSC-CB has experimental I²C read path for ZSC31014/50/31150 alongside ZACwire 31010/15. ESP32-C3 and Pro Micro use shared protocol v3 and portable source for I²C. Pro Micro SDA D2, SCL D3, external load switch enable D7. ESP32-C3 GPIO4/5/10. Match logic voltages and use switched supply, never power via GPIO. DIY ZACwire read-only candidate added (see below). Original 31014 board sequence from evaluation kit manual Fig 7.1; 31050 IWT/IW/IR example from application note serial communication §4.3, 31150 model-specific adaptation. Physical validation pending.

### DIY ZACwire experimental
ESP32 GPIO6 / Pro Micro D4, open-drain signal, external switched pull-up and voltage-compatible interface. ZSC31010/15 CM and dump, 31010 Raw Mode only after host and firmware unity gain checks. 19-bit transmit, per-byte pulse duration and even parity checks, packet gap alignment. Timing especially at AVR 8 MHz and fast sensor output needs oscilloscope validation; no production qualification. No EEPROM writes through DIY. Sources: ZSC31010 datasheet rev 2.91 §§3.2.1–3.2.5, https://dtsheet.com/doc/1381341/data-sheet .

## v0.6.1 – Laboratory test candidate
SparkFun CPU identifiers fixed. RAM writes restricted to volatile coefficient words 00–07 for ZSC31050/31150, original and DIY, each with direct readback; no EEPROM commit. Reference: functional descriptions command tables 4.6 / 4.1. ZSC31050 normal mode now uses 71. Continuous sequential raw logging, backup comparison and explicit cold-start EEPROM comparison added. These features require hardware testing. All other missing native calibration and NVM paths remain blocked.

Firmware protocol 3.1 required (older v3 rejected). Both I²C model families now have named register maps and masked volatile CFGAFE gain changes; 31050 CFGAFE 19 bits 3:0, 31150 CFGAFE 0B bits 9:6. Only gain bits change; actual ADC conversion and range must be validated on the bench. No auto-AFE calibration.

## v0.6.5 ZSC31014 original board lab workflow
Read all 20 words, named register map. Digital DF4 capture/logging, bridge-only unity preparation, selectable AFE gain/offset/polarity, native linear two-point code candidate and protected EEPROM writes. The temperature trim and device ID/lock/communication words are preserved. 25 ms wait and 5A for each write, then Start_NOM to generate signature before cold start and double full readback (signature excluded). Original bridge backup restore only. Not vendor DLL-equivalent; TK0/TKE and native higher-order math remain open. Test on spare sensor first. DIY adapters do not yet support this new programming workflow. Datasheet sections 2.2.2, 3.5–3.8 and evaluation kit manual fig 7.1.

## v0.6.6 consolidated ZSC31014 laboratory flow
Single bridge calibration workspace and native module zsc31014-native.mjs. Original-board NOM measurement and general logging use the same fresh DF4 reader. EEPROM write completion ACK checked; backup display updated after successful readback. No claim of physical qualification.

## v0.6.8 live header and EEPROM overview
The native ZSC31014 board switches to NOM after the initial double EEPROM read. Header polling shares the command channel with explicit reads and stops while exclusive operations/logging are active. Output scale is code / 16384, temperature is nominal code * 200 / 2048 - 50 if non-unity temperature calibration is present; independent temperature accuracy not verified. Raw ADC values are not inferred from calibrated output. Viewer is read-only, with documented ZSC31014 fields, and export uses the same verified backup path. Other model-specific live polling and register explanations remain incomplete. Renesas SSC-CB default; demo hidden unless expert settings are enabled.

## v0.6.9 automatic connection
One connection workflow after explicit supply/power-cycle consent: USB identity, chip command mode, double EEPROM read, then ZSC31014 original-board normal mode and automatic live polling. If consent is given after USB selection, chip initialization starts immediately. Failures keep the USB adapter available for diagnostics/retry. Manual output start and individual communication commands are expert-only. Other models still retain their existing model-specific command-mode read behavior; no new write commands or automatic calibration.

## v0.6.10 original-board automatic start, register interpretation and bridge inverse
Original SSC-CB connection starts the selected chip without a separate supply checkbox; selecting Connect authorizes the existing board-specific power-cycle. DIY external supply confirmation remains. ZSC31014 detailed register explanation and signed magnitude codes, reference-temperature bridge inverse with explicitly assumed digital targets, no inversion when bridge SOT active. Eq. 1–4, table 2.4 (ADC offset codes 1–15, corrected previous restriction), table 3.7. Physical bridge comparison and non-linear/temperature inversion still pending. No added EEPROM writes.
