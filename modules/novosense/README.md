# NOVOSENSE SSC Calibration Web App · v0.5.0

**Labortestkandidat NSA2860X. Keine Produktionsfreigabe.**

Geführte und klassische Oberfläche nach ELMOS-Master, Offline-Druck-/Temperaturregression inkl. TK0-3-Punkte, Ausgangsplanung, Referenzmessung, Live-Graph, Logging, Brückenrechner, Archiv, Exporte.

## Hardwarestatus
- ESP32-C3 / ATmega32U4: gemeinsame Firmware NOVO-I2C-5, I²C. Lesepfade NSA2300, NSA2302, NSA2860, NSA2860X. NSA2860X zusätzlich AFE-RAM und explizite Koeffizienten-/Alarm-/Clamp-Änderungen mit Readback sowie kontrollierter EEPROM-Testablauf. Nur entbehrliche Prüfmuster.
- Original NSX2860_EVM: experimentelle Versionsdiagnose und Registerlesepfad über lokalen Dienst. CAL32: Versionsdiagnose. NSA2302-EVM: Hostprotokoll offen.
- Weitere Modelle offline. Native Kalibrierberechnung, alle Adapter und weitere Hardwarefunktionen noch nicht vollständig implementiert.

## Dokumentation
- [Labor-Testplan](docs/LAB-TEST.md)
- [Adapterkonzept](docs/ADAPTERS.md)
- [Protokoll](docs/PROTOCOL.md)
- [Hardwarestatus](docs/HARDWARE.md)
- [Technische Quellen](docs.html)
- [UI-Master](docs/UI-MASTER.md)

Softwaretests und Firmware-Compilergebnisse stehen in GitHub Actions. Keine physische Hardwarevalidierung. Die ursprüngliche lineare Offline-App ist unter linear.html verfügbar.
