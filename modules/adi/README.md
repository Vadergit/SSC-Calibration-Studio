# Analog Devices / Maxim SSC Calibration Web App

[Web-App](https://vadergit.github.io/Analog-Devices-Maxim-SSC-Calibration-Web-App/) · [SSC Calibration Studio](https://vadergit.github.io/SSC-Calibration-Studio/)

**v0.3.0 – Laborprototyp, keine Hardwarefreigabe.** Geführte Ansicht nach dem Elmos-Master, inklusive Messmatrix, Brückenrechner, Temperaturkennlinie, Host-Druckmodell bis dritter Ordnung, unabhängiger Nachmessung und Export. MAX40109 ist das Hauptmodell; MAX1454 bleibt als manuelle lineare Host-Auswertung erhalten.

## Quellen und Abgrenzung

- [MAX40109 Datenblatt Rev. 3](https://www.analog.com/media/en/technical-documentation/data-sheets/max40109.pdf): Registerübersicht S. 19–20, PGA Tabelle 9, Polynom S. 36–37, I²C S. 44–45, Kalibrierung S. 55.
- [MAX1454 Datenblatt](https://www.analog.com/media/en/technical-documentation/data-sheets/MAX1454.pdf): analoger DAC-/Flash-Abgleich, nicht kompatibel zum MAX40109-DSP.
- [Elmos Master](https://github.com/Vadergit/ELMOS-E703.11-Calibration-Web-App): geführter Ablauf, Farbwelt und Navigation. Keine Elmos-Register übernommen.

Die MAX40109-Druckformel hat die Gruppen h/g/n/m für P⁰/P¹/P²/P³, jeweils bis T³; die Temperaturformel nutzt k0…k3. Der Host verwendet normierte Rohcodes und Referenzwerte in Benutzereinheiten; Temperatur-Fit in °C wird separat ausgegeben. Das ist ausdrücklich **kein** fertig skalierter DSP-/MTP-Koeffizientensatz. Die reale Kodierung, korrigierte Temperatur als DSP-Eingang, Ausgangsskalierung, Quantisierung, Registerreihenfolge, Speicherfreigabe und Rücklesung müssen separat implementiert und validiert werden.

## Experimentelle I²C-Lesebridge

Firmware: `firmware/esp32c3_max40109_readonly/esp32c3_max40109_readonly.ino`. Arduino IDE mit ESP32-C3 Boardpaket und USB CDC beim Booten aktiv. SDA GPIO4, SCL GPIO5, 100 kHz, Standardadresse 0x4D. Externe, datenblattkonforme Versorgung, Pegelanpassung, Pullups, gemeinsame Masse und DQ high erforderlich; GPIO niemals direkt an Hochvoltversorgung anschliessen. Firmware schaltet die Sensorversorgung nicht. Nur bei passender Testschaltung verwenden.

Web Serial (Chrome/Edge, HTTPS oder localhost), 115200 Baud. HELLO prüft Adapter, nicht Chipidentität. READ 06/08/0F/11 liest jeweils 16 Bit mit repeated START, MSB zuerst. Keine Registerwert-Schreiboperationen; Registeradressauswahl ist Teil der I²C-Leseoperation. Messung liest den letzten Registerwert, keine garantierte neue oder synchrone Konversion. Kein automatisches Sampling. Keine Unterstützung für Hersteller-Evalboard, PLC, 1-Wire oder MAX1454-Hardware. Firmware und Verbindung sind noch nicht an realer Hardware validiert.

## Lokaler Test

`python3 -m http.server 8000 --bind 127.0.0.1` und http://127.0.0.1:8000 öffnen. Rechentests: `node --test tests/engine.test.mjs`.

## Freigabeschritte

1. Modell-/Revisionsidentifikation und vollständige Register-/Speicherdokumentation prüfen.
2. 1-Wire-Transport, Frische-/Statusprüfung, Versorgung und AFE-RAM-Änderungen am Prüfaufbau validieren.
3. Gerätespezifische Temperatur- und Druckkoeffizienten inklusive Zielskalierung und Quantisierung implementieren; unabhängige Golden Vectors.
4. Speicher-Backup, Schutzbits, Änderungsvergleich, explizite Bestätigung, kontrollierte Programmierung, Rücklesung und Kaltstartprüfung.
5. MAX1454 separat mit Herstellerverfahren und DAC-/Flash-Treiber implementieren.
6. Automatisches Logging, Archivimport und eigenständiges PDF-Layout ergänzen. Aktuell CSV/JSON und Browser-Druckansicht.

## Oberflächen-Master

Die originalen Styles `guided.css`, `theme.css`, `interface.css`, `settings-refresh.css` und die eingebetteten CSS-Regeln aus dem Elmos-Master (`master-base.css`) wurden aus Commit `13220433b1bde9b6ff8747f6fecf5262c1f85213` übernommen. Header, acht Aufgabenkacheln, elf Schritte, Presets, Fortschrittsleiste und Dialog orientieren sich an der dortigen DOM-Struktur. Es werden keine Elmos-JavaScript-Treiber geladen. Klassisch ist eine kompaktere Darstellung des gemeinsamen Arbeitsbereichs (noch keine vollständige klassische Elmos-Ansicht). Manuelles Logging und lokales JSON-Archiv sind implementiert, automatisches Logging, Hardwarealarme, TK0-only, NVM, vollständiger EEPROM-Viewer und eigenständiger PDF-Bericht fehlen. Keine visuelle 1:1-Freigabe ohne Browservergleich.

## v0.4.0 — MAX40109 hardware laboratory preview

Flash `firmware/esp32c3_max40109/esp32c3_max40109.ino` (ESP32-C3, USB CDC, SDA GPIO4, SCL GPIO5, external supply and level matching, DQ high). Firmware v2 adds 23 documented RAM register reads, 69 MTP shadow words (0x00–0x44), duplicate snapshot verification, JSON backup/diff, live polling and masked volatile RAM changes with readback. No permanent burn or generic write command. The MTP read enters prototype mode A2=0x10 only if previous control is zero and MTP enabled; it clears control after reading. Shadow is not guaranteed permanent memory except after cold start. I2C address field only guaranteed via 1-Wire. Source: MAX40109 Rev.3 pp.19–25,31–35,42,44. Permanent burn, coefficient upload, 1-Wire/PLC, MAX1454 hardware and automatic offset calibration remain open. No hardware validation. v1 sketch incompatible with v2.

## v0.5.0 — DSP prototype and browser fixes

Firmware v3, GPIO6 DQ via suitable external pull-up/level translator, single MAX40109 on bus. ROM command reads family 0x76 and verifies CRC8; no full 1-Wire register transport or PLC. I2C is still required for register accesses. Experimental pressure-only shadow writes 0x08–0x27 after verified backup, ROM, host verification and explicit confirmation. No MTP burn or charge pump initialization. Rev.3 pp.36–37 contain conflicting coefficient descriptions (fixed point tables vs IEEE754 DSP diagram; POR value 1 also ambiguous). The UI requires explicit candidate encoding selection; none is validated. Real hardware test and manufacturer golden values are required before production. Use cold start to restore permanent contents after incomplete transfer. Prototype access sequence itself needs testing, including whether manufacturer initialization is necessary. Firmware v3 requires flashing again.

## v0.6.0 — Adapter support

ESP32-C3 and Pro Micro share protocol v4 with INFO identity. MAX40109 EV Kit external bus connection is selectable with wiring confirmation. Original MAX32666FTHR USB and MAX1454EVSYS native driver remain open. [Protocol and wiring](firmware/PROTOCOL.md). Flash firmware v4. No real hardware validation.

## v0.7.0 — Lab diagnostic expansion

I2C discovery, bounded fresh pressure read, experimental 1-Wire register comparison, two-endpoint PGA recommendation with clipping and headroom checks, MTP status/rest-count and clipping/diagnostic decode, manual cold-start comparison, manual DMM output verification CSV. Protocol v5 for both adapters. OEM host USB, PLC electrical hardware, MAX1454, permanent MTP burn, full calibrated temperature transfer and production qualification remain open. All test features require a lab sensor and safe wiring.

DSP candidate expanded: polynomial up to third order, optional calibrated temperature codes and recalculated pressure surface with quantized temperature input, quantization residuals, experimental shadow transfer of all 40 calibration halfwords, dry-run MTP programming plan with count/status/lock checks. Raw-code convention and encoding remain unverified on actual silicon. No persistent burn.

### Labor-Testprotokoll

Siehe [TEST_RELEASE.md](TEST_RELEASE.md) mit 15 konkreten Prüfungen und Ausschlusskriterien. Der Offset-Trim-Rechner nutzt typische Gewichte aus Tabelle 31 und symmetrische p/n-Codes; er ist keine automatische Rückkopplungsregelung.
