# Testfreigabe 0.6.0-beta.1

**Nur Software-/Transport-Beta. Keine Freigabe für reale Sensorkalibrierung oder Serienprogrammierung.**

## Browser ohne Hardware
1. GitHub Pages in Chrome/Edge öffnen. Entwicklerkonsole auf Fehler prüfen.
2. Sensor neu abgleichen → Browser-Testsimulation → Adapter verbinden. Kopfstatus muss Simulation melden.
3. Messplan 2×1 bzw. 3×2 wählen; AFE nominal berechnen; jeden Rohwert erfassen. Simulation verwendet automatisch den nächsten Referenzpunkt.
4. Modell berechnen. Unabhängige Referenzen prüfen (manuelle Werte oder Simulation über Verbindung einstellen); gleiche Temperatur/Referenz in beide Richtungen erfassen; Hysterese prüfen.
5. MLX90328 Clamping/Filter, MLX90329 SENT-Entwurf prüfen. Keine Chipregister werden verändert.
6. EEPROM-Doppellesung und RAM-Rohdaten, JSON-Backup, Import und Vergleich; Werte sind künstlich.
7. Sitzung exportieren/importieren; Archiv, CSV/PDF, Theme und Ansichten prüfen.

## USB
GitHub Actions → Test Beta → Firmware-Artefakte (wenn Build erfolgreich). ESP32-C3 mit USB CDC, Pro Micro 8/16 MHz passend zum Board. Ausschliesslich USB anschliessen, **keinen Sensor**. Firmware 0.1.0 meldet adapter-only. Testbuilds sind separat und ausdrücklich als Simulation gekennzeichnet. Keine reale Chipfunktion erwarten.

## Originalboard
PTC-04 + PRESSURE01: Hersteller-Software zuerst verifizieren. Windows COM-Profil anhand installierter PSF und Dokumentation erstellen; SDK-Host starten; nur bestätigte Lesefunktionen testen. Keine Freigabe zum Schreiben.

## Noch blockiert
Melexis-Wire-Protokoll, Pegelschaltung und Startsequenz, Registermap/CRC, Festpunktformate, SDK-Aufrufzuordnungen, echte AFE-/DSP-/NVM-Programmierung und Kaltstart. Keine ELMOS-Befehle übernehmen. Herstellerunterlagen: [PTC-04](https://www.melexis.com/en/tech-info/programming-and-software-tools/ptc-04). MLX90328 Datenblatt Rev006, Tabellen 4/5: Offline-Clamping und PFLT. Hysterese ist Differenz der Mittelwerte je identischem Referenzdruck und Temperatur, bezogen auf FS.
