# Hardwarefreigabe – Jiuhao SSC

Designreferenz: [ELMOS E703.11](https://github.com/Vadergit/ELMOS-E703.11-Calibration-Web-App/blob/main/docs/GEFUEHRTER_ASSISTENT.md).
Dokumentationsquelle: [SSC-Bibliothek / JHM](https://github.com/Vadergit/ssc-bibliothek/tree/main/daten/SSC/JHM).
Die PDF-Dateien wurden über die GitHub-Schnittstelle nur als Git-LFS-Pointer geliefert. Keine Registerwerte aus Dateinamen ableiten.

## Voraussetzungen pro exaktem Chip und Revision
- Herstellerdatenblatt, Programming Guide, Registermap und EVB-Protokoll tatsächlich lesen.
- Versorgung, Pegel, Pinbelegung, Startfenster, Timing und Adapter-Firmware bestätigen.
- Identifikation und Nur-Lese-Transport mit echten Frames und Fehlerfällen testen.
- AFE-Gain, Offset, ADC-Format und Sättigungsgrenzen definieren und rücklesen.
- DSP-Gleichung, Festkommaformate, Rundung, Überlauf, Temperaturmodell anhand Herstellervorgaben und Referenzvektoren implementieren.
- RAM vor NVM, unabhängige Messmatrix, Originalbackup, Änderungsdiff, explizite Freigabe, Schreib-/Rücklesevergleich und Kaltstart.
- Keine Übernahme von Elmos-Registern oder Elmos-Befehlen.
- Kein Hardwarebetrieb freigegeben, bis jede Funktion am entbehrlichen Testchip nachgewiesen ist.

Bibliothek enthält zusätzlich JHM2000, JHM2031C, JHM1102P und JHM1130; Unterstützung und genaue Varianten erst nach Dokumentprüfung festlegen.
