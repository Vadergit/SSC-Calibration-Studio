# Aktuell: NOVO-I2C-5 · Labortestkandidat

**Die folgenden v1–v4 Abschnitte sind historische Angaben zum Lesezugriff.** Für aktuelle RAM-/EEPROM-Testfunktionen ausschliesslich [LAB-TEST.md](LAB-TEST.md) und [PROTOCOL.md](PROTOCOL.md) verwenden. Keine Produktionsfreigabe.

# NOVOSENSE I²C bridge v2 protocol (experimental)
Sources: [NSA2300 EN 2.3](https://www.novosns.com/datasheet/NSA2300-QMOR/NSA2300.pdf), pp. 7–10, 14–16, 19–20; [NSA2860X EN 1.4](https://www.novosns.com/Public/Uploads/uploadfile/files/20240115/NSA2860X_Datasheet_Rev1.4_EN-843.pdf), §§5–7. Public technical sources only.
## Hardware
Flash firmware/novo_i2c/novo_i2c.ino with Arduino IDE. ESP32-C3 SuperMini default SDA GPIO8/SCL GPIO9 (check board strapping and schematic; change pins as needed). Arduino Pro Micro uses board SDA/SCL. USB CDC 115200 baud. Use a suitable regulated current-limited supply, common ground and correct I²C logic levels/pull-ups; a 5 V target may require bidirectional level shifting. GPIO does not power the sensor; use a correctly dimensioned adapter supply. Connect only one known SSC, no other devices on the bus. The firmware does not automatically switch power or OWI.
Select exact model and address. NSA2300 0x6C/0x6D depending on package/address pin, NSA2860X 0x6D. Part ID is not UID. NSA2300 matching ID copies cannot uniquely identify chip type; verify physical marking. Do not use measurement command on other models.
## Readback
NSA2300: A4–BC (25 customer OTP shadow bytes); NSA2860X: A1–D9 (57 documented EEPROM shadow bytes, not all physical 64 bytes). No reset is sent. Cold-start readback required to establish persistent content; CRC status is chip-reported, not recomputed from inaccessible bytes. Reads use repeated START. Only explicitly masked NSA2860X volatile AFE writes, no arbitrary write command, no OTP/EEPROM programming, no lock/unlock. Only NSA2300 M command starts a single conversion after checking configuration; analog output mode is blocked. NSA2860X samples existing DRDY data, does not change RAW_P/RAW_T automatically. The AFE page can explicitly configure them in volatile registers with readback. Separate model-specific drivers are required for NSA2302, NSA2860 non-X, NSA/NSC9260(X), NSC2860X, NSC9262, NSC9264.
Original EVM OWI uses mark/space parity according to AN-12-0014; not implemented by this I²C bridge. Firmware not hardware-validated. No production approval.

Live and capture: NSA2300 in analog-output mode reads existing data only; single-shot is used only with DAC disabled. No automatic raw-mode changes. The firmware requires an isolated, physically identified test chip.

## NSA2860X AFE RAM
Read original A4–A6, validate part ID, status and active mode, compare original bytes on firmware, enter CMD=0, apply only PGA gain (A4 high nibble), input swap and RAW_P (A5 bits 1:0), RAW_T (A6 bit 0), check readback, return CMD=3. Explicit user confirmation required. Changes can affect analog output; use isolated test chip. On failure restart sensor and verify settings. No NVM write. Existing measurement matrix is invalidated.

Firmware compilation workflow targets generic ESP32-C3 and ATmega32U4 Leonardo (Pro Micro-compatible MCU, board pin mapping and upload settings must be verified). Compilation is not a physical bus validation.

## v0.4.1
Read-only profiles for NSA2302 (EN 1.2, A0–BC, configured I2C address selected explicitly; default table lists 0x7F, which is a reserved standard address) and NSA2860 (EN 1.4, A1–D9). NSA2302 temperature word is not converted to °C because the published scale is ambiguous. No conversion command for NSA2302 yet. NSA2860 has same part ID as NSA2860X; physical marking is mandatory. No writes for these two profiles. NSA2860X coefficient readback is decoded using documented fixed-point scales. New firmware uses protocol NOVO-I2C-3; previous versions must be reflashed. Source: https://www.novosns.com/Public/Uploads/uploadfile/files/20240205/NSA2302_Datasheet_Rev1.2_EN.pdf and https://www.novosns.com/Public/Uploads/uploadfile3/files/20240115/NSA2860_datasheet_Rev1.4_EN-513.pdf .

Acquisition records carry sample count and pressure min/max. Editing raw fields clears chip provenance. The alarm page reads NSA2860X status and alarm configuration without writes. During a hardware transaction, navigation is blocked until completion.

**Aktuell: NOVO-I2C-4**, HELLO/INFO. Siehe [Adapterkonzept](ADAPTERS.md) für Originalboards.
