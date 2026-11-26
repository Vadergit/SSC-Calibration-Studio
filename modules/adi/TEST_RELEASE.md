# MAX40109 — Labor-Testfreigabe v0.7.0 (keine Produktionsfreigabe)

## Vorbedingungen
- Isolierter, entbehrlicher MAX40109-Prüfling; kein sicherheitsrelevanter Einsatz.
- ESP32-C3 oder Pro Micro mit passender Firmware v5 und passender I/O-Spannung. Original EV Kit über externe I2C-Testpunkte nach Herstellerhandbuch. Stock USB-Controller nicht unterstützt.
- Versorgung, Masse, Pull-ups, DQ-Pegel und Ausgangsbeschaltung vor Anschluss verifizieren. DQ nie aktiv herunterziehen, solange es fest auf VDD liegt.
- GitHub Actions: Host-/Browser-Tests und Firmware-Build für den tatsächlich verwendeten Adapter müssen auf dem zu testenden Commit grün sein.

## Testprotokoll
| ID | Test | Erwartung |
|---|---|---|
| T01 | HELLO / INFO, falscher Adapter | Richtige Firmware erkannt, falscher MCU abgelehnt |
| T02 | I2C SCAN / PROBE | Ein ACK auf isoliertem Bus; kein Identitätsnachweis |
| T03 | ROM, optional | Family 76h + gültiger CRC; DQ-Pfad zuvor bestätigt |
| T04 | 1-Wire / I2C Vergleich | Statische Register gleich, sonst 1-Wire nicht verwenden |
| T05 | RAM / MTP lesen | 23 dokumentierte Register, zweimal identische 69 Shadow-Wörter |
| T06 | MTP Status | Restzähler, Lock und ECC-Fehler dokumentieren |
| T07 | ADC pressure | Stabiler Referenzdruck, plausibler Verlauf, Data-Ready Verhalten mit Logikanalysator bestätigen |
| T08 | AFE | Unteren/oberen Referenzdruck erfassen, PGA-Vorschlag überprüfen, RAM-Änderung rücklesen, erneut messen |
| T09 | Offset | Trim nur bei Offset Enable; typische Werte, beide Gain-Stufen prüfen |
| T10 | Host-Kalibrierung | Unabhängige Punkte innerhalb Toleranz |
| T11 | DSP-Vorschau | Experimentelles Format mit Hersteller-Golden-Vectors bestätigen; Quantisierungsrest innerhalb Toleranz |
| T12 | Shadow | Nur auf entbehrlichem Sensor, Original sichern, UID und Rücklesung prüfen; unabhängige echte DSP-Nachmessung |
| T13 | Restore | Original-Shadow wiederherstellen, extern Kaltstart, erneut auslesen und vergleichen |
| T14 | DMM | Ausgang manuell messen, unabhängige Referenzpunkte prüfen, CSV exportieren |
| T15 | Fehlerfall | USB abziehen, Timeouts, Wiederverbindung, keine automatische Fortsetzung |

## Ausschlusskriterien
Nicht freigegeben: permanente MTP-Brennfunktion, unveränderte originale MAX32666FTHR-USB-Firmware, PLC-Hochvolt-Frontend, vollständiger 1-Wire-Schreibpfad, MAX1454-Hardware, automatische Offsetregelung, vollständige DMM-Automatisierung. Keine Produktionsfreigabe. Bei unbekanntem Zustand nach Schreibfehler externen Kaltstart und erneutes Backup durchführen.

## Testergebnis
Tester, Datum, Hardware-/Firmwareversion, Versorgung, Board-Revision, UID, Test-ID, Soll, Ist, Pass/Fail, Logdatei und offene Punkte dokumentieren. Vor Freigabe reale Messprotokolle sammeln.
