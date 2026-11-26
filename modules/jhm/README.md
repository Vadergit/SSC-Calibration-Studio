# Jiuhao SSC Calibration Web App

[Web-App öffnen](https://vadergit.github.io/Jiuhao-SSC-Calibration-Web-App/) · [SSC Calibration Studio](https://vadergit.github.io/SSC-Calibration-Studio/)

**v0.7.0-lab** übernimmt die Original-CSS-Dateien, Kopfzeile und Aufgabenauswahl aus dem Elmos-Master. Elf geführte Schritte, Presets, 2–5 Druckpunkte × 1–3 Referenztemperaturen, lineares Modell je Temperatur, unabhängige Prüfmatrix, Ausgangsziel, JSON/CSV/Druckbericht. Acht Aufgaben inklusive manueller Messreihen, Hysterese, Hex-Inspektor, Brückenrechner und lokalem Archiv.

Kalibrierberechnung ist weiterhin generisch. Neu: Web Serial, eigene I2C-Lesebridge für ESP32-C3 / Pro Micro (Quellcode), importierbare Benutzerprofile, Register-/OTP-/EEPROM-Dumps mit Vergleich, profilgesteuerte Live-Werte und Messwertübernahme. Keine validierte JHM-Registermap, keine Original-Eval-Board-Unterstützung, keine RAM-/OTP-/NVM-Programmierung oder Produktionsfreigabe. Siehe [Read-Bridge](docs/READ-BRIDGE.md). Klassisch ist eine kompakte alternative Darstellung, nicht die vollständige klassische Elmos-Ansicht. Siehe [UI-Master](docs/UI-MASTER.md) und [Hardwarefreigabe](docs/HARDWARE-RELEASE.md).

Lokal: `python3 -m http.server 8000 --bind 127.0.0.1`, danach http://127.0.0.1:8000/. Rechentests: `node --test tests/*.test.mjs`.

## PWM One-Wire (v0.7.0-lab)

Separate ESP32-C3 pulse bridge and local profile import, double memory read, bitfield decoder and digital output capture. [Anleitung](docs/PULSE-BRIDGE.md). No confirmed hardware transaction; private candidate profiles must be checked against source figures. No RAM/OTP writes, no JHM1130 driver.

## Adapter support

Shared PWM firmware source for ESP32-C3 and ATmega32U4 Pro Micro, platform-specific handshake; native-board passive COM diagnosis. See [Adapter architecture](docs/ADAPTERS.md). No validated native board driver or hardware release.

## Labor-Testversion

[Freigabe- und Testcheckliste](docs/LAB-TEST.md). Neue Offline-AFE-Planung, Festkomma/CRC-8, Dump-Decoder, Live-Aufzeichnung und Verifikationsdiagramm. Keine Hardwarefreigabe.
