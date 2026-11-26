# NOVO-I2C-5 host protocol
Shared for ESP32-C3 SuperMini and ATmega32U4 Pro Micro. USB CDC at 115200 baud, ASCII, LF line ending (CR ignored), decimal sequence ID, one transaction in flight, 2.5 s host timeout. Request lines limited to 99 bytes; extra arguments rejected for R/M/A. No automatic replay of writes.
## Requests
| Frame | Response data on success |
|---|---|
| 1 HELLO | NOVO-I2C-5 |
| 2 INFO | ESP32-C3 or ATmega32U4 |
| 3 R 6D A1 16 | exactly 32 hexadecimal characters |
| 4 M 6C 1 | STARTED (NSA2300 only, isolated physically verified test chip) |
| 5 A 6D 13 C4 82 A3 C7 83 | AFE_RAM (NSA2860X, example old bytes and new bytes; not a recommended configuration) |
Response format: `<id> OK <payload>\n` or `<id> ERR <reason>\n`.
R arguments are 7-bit address (hex), register (hex), byte count (decimal). 1–24 bytes. Allowed addresses 0x08–0x77, plus 0x7F for NSA2302 as documented. Register allowlist: 01,02,06–0B,30,A0–D9. No scan or arbitrary writes. Host profile restricts chip-specific register access further.
M arguments are address (hex), conversion mode (decimal, 0 temperature or 1 pressure). Readback/preconditions on firmware. A arguments: address followed by original A4,A5,A6 bytes, then requested bytes; all hex. Only permitted masks, compare original data, enter configuration mode, write temporary values, read back, return active mode. AFE command never programs EEPROM; see the separate P laboratory command below. On failure restart and verify test chip. Part ID is not UID.
## Hardware
ESP32-C3 uses GPIO8 SDA / GPIO9 SCL (verify board and boot straps). Pro Micro uses hardware Wire SDA/SCL. I2C 100 kHz. Correct external power and logic levels are mandatory; no direct connection of 24 V or analog OWI to MCU pins. Pro Micro 5 V and 3.3 V variants differ; use appropriate level translation. No integrated SPI/OWI transport yet.
## Original board protocols
See [ADAPTERS.md](ADAPTERS.md). NSX2860_EVM uses RS485 with MARK address and SPACE body; 32CAL uses 8N1. These are separate host protocols and not interchangeable with NOVO-I2C-5. Firmware builds produce downloadable artifacts via GitHub Actions. For ESP32 use the matching board flash procedure; Pro Micro bootloader variant and voltage/clock must be checked before flashing (CI targets Leonardo MCU-compatible build).

## NOVO-I2C-5 (Labor)
Siehe [LAB-TEST.md](LAB-TEST.md). W 6D <reghex> <count> <oldhex> <newhex> vergleicht und schreibt erlaubte RAM-Gruppen. P 6D <8-stelliger FNV-1a-Digest> ist ausschliesslich für den expliziten EEPROM-Test auf einem entbehrlichen NSA2860X. Firmware prüft Lock, Status, RAW-Bits, kompletten zugänglichen Shadow; kein Lock/OTP. Nach P Kaltstart erforderlich. Keine Wiederholung bei Fehler.
