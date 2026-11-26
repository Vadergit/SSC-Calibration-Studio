# Hardware-Freigabepfad

Herstellerquellen: [MLX90328 Rev.006](https://www.melexis.com/en/documents/documentation/datasheets/datasheet-mlx90328), [MLX90329 Rev.002](https://www.melexis.com/en/documents/documentation/datasheets/datasheet-mlx90329), [PTC-04 / MPT Developer Reference](https://www.melexis.com/en/tech-info/programming-and-software-tools/ptc-04).

AFE: Tabellen 6 (90328) / 7 (90329) und Abschnitt 11. Nominalmodell berechnet alle 32 Gain-Stufen und den 7-Bit-Betrag mit Polarität des Coarse-Offset-DACs. Das Gain-Ergebnis verwendet den Betrag; ADC-Endpunkte sind eine Modellkonvention, keine bestätigte Chip-Polarität. Keine Zwischenstufen- oder Common-Mode-Sättigungsprüfung. Die Datenblattangaben ersetzen keine reale Messung.

## Fehlende Schnittstellendetails
PTC-04 mit PRESSURE01 und modellgeeignetem PSF/MPT ist der erste Hardwarepfad. Benötigt werden die tatsächlichen API-Aufrufe, Einheiten und Fehlercodes; insbesondere Chipidentifikation, Raw-ADC, RAM-Parameter, EEPROM-Lesen, Schutz-/Prüfsummen, Programmierzyklus. Ein nativer Host-Adapter ist erforderlich, falls die Herstellerbibliothek nur als Windows-DLL verfügbar ist. Die App stellt gegenwärtig keine COM-Verbindung her. Der DIY-Pfad erfordert eine verifizierte Pegel-/Versorgungsumschaltung, Strombegrenzung und Protokollbeschreibung. Keine direkte Verbindung mit einem ESP32-GPIO.

## Freigabekriterien
1. Read-only Chipidentifikation und Messwerte gegen Herstellerprogramm prüfen.
2. Vollständiges Original-EEPROM sichern, Chipbindung und Schutzbereiche prüfen.
3. Modellabhängige Koeffizienten/Festpunktformate gegen Herstellerergebnis validieren.
4. RAM-Schreiben und Rücklesen, unabhängige reale Druck-/Temperaturmessung.
5. Explizite EEPROM-Freigabe mit Diff; Rücklesen und Kaltstart auf Testchip.
6. Fehlerfälle (Verbindungsabbruch, Spannungsfehler, falsches Modell) testen.

Bis alle Kriterien erfüllt sind: Offline-Modus, keine Hardwareprogrammierung, keine Produktionsfreigabe.
