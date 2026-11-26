# Kommunikation · v0.4.0

## Tatsächlicher Implementierungsstand
Die Web-App besitzt einen lokalen HTTP-Lesepfad und einen Windows-COM-Adapter für installierte, **explizit zugeordnete** Melexis-PSF-Funktionen. Das HTTP-Protokoll ist unser eigenes, nicht das Melexis-Wire-Protokoll. Die PTC-04-/PRESSURE01-Anbindung ist nicht hardwarevalidiert. Der Testmodus liefert ausschliesslich Simulation. Kein EEPROM-/RAM-Schreiben. Kein DIY-Firmwaretreiber ohne nachgewiesenes Wire-Protokoll.

Hersteller: [PTC-04, PSF und MPT Developer Reference](https://www.melexis.com/en/tech-info/programming-and-software-tools/ptc-04). Die öffentliche Seite stellt Windows-COM-/PSF-Software bereit. Das modellabhängige API-Handbuch sowie Adressen und Datenformate müssen aus der tatsächlich installierten MLX90328/MLX90329 (ggf. MLX90330)-Software gewonnen werden. Keine API-Namen geraten.

## Lokaler Test
Repository ZIP herunterladen und entpacken. Python 3 installieren. Im Projektordner:
```
python host/server.py --simulate
```
http://127.0.0.1:8765/ öffnen; Verbindung → PTC-04 lokaler SDK-Adapter → verbinden. EEPROM zweimal lesen, RAM lesen, Live-Werte und Messpunktaufnahme testen. Die Simulation ist gekennzeichnet und kein Chipbefund. GitHub Pages kann den lokalen SDK-Host nicht direkt bedienen; die vom Host ausgelieferte Oberfläche ist identisch.

## PTC-04
1. Windows, PTC-04 mit PRESSURE01, passende Melexis-Software und FTDI-Treiber installieren. Mit der Herstellersoftware den entbehrlichen Testchip verifizieren.
2. `powershell -NoProfile -File host/discover.ps1` ausführen. JSON-Liste der installierten COM-Komponenten sichern.
3. Mit OleView bzw. der SDK-Dokumentation die tatsächlichen Methoden, Argumente, Rückgabewerte, nötige Initialisierung und Bitbreite prüfen. Die Bridge unterstützt einfache COM-Aufrufe/Properties mit festen Argumenten und direkten Rückgabewerten; komplexe Initialisierung oder ByRef-Aufrufe benötigen einen spezifischen Adapter. Der generische Host sendet keine unbekannten Initialisierungsbefehle.
4. `python -m pip install pywin32` (Python-Bitness passend zur SDK-Bitness). Das Profil anhand der **tatsächlichen** Methoden ausfüllen; siehe `host/profile.example.json`. Nur nachweislich lesende Operationen eintragen. Chipidentität und Chipmodell müssen echte Rücklesewerte sein, nicht Konstanten. EEPROM-/RAM-Länge muss bestätigt sein. Bytearray-Formate, Endianness und ADC-Einheiten prüfen. Herstellerprogramm vor dem Bridge-Zugriff schliessen, falls exklusiver Zugriff erforderlich.
5. `python host/server.py --profile C:\\Pfad\\melexis-profile.json`. Profil ausserhalb des öffentlichen Repo halten. Lokal im Browser verbinden. Hersteller- und Bridge-Ergebnisse am Prüfplatz vergleichen.
6. Bei SDK-Fehlern oder inkompatibler Schnittstelle bricht der Host ab. Keine automatische Spannungsumschaltung oder Programmierung.

## Was die App tatsächlich unterstützt
- Modell-/Identitätsprüfung im konfigurierten SDK-Pfad, Live-Abfrage, Mittelwertbildung 1–100 Samples.
- EEPROM-Abbild zweimal lesen und vergleichen, Backup mit Identität, BIN und JSON; RAM-Rohdaten; Parameterwerte nur wenn SDK explizit gemappt.
- Referenz-Messpunktaufnahme, unabhängiger Prüfrohwert, Logging; die vorhandene Modellrechnung ist weiterhin kein Chip-Festpunktformat.
- Keine bestätigte EEPROM-CRC, Adresskarte, Schutzbereiche, Koeffizientenquantisierung oder sichere Schreibsequenz. NVM/RAM-Schreiben bleibt gesperrt.

## Für die echte Fertigstellung benötigt
Modellspezifische PSF-API-Dokumentation (inkl. Init und Rückgabeformat), Typbibliothek bzw. COM-Discovery, echte Beispiel-EEPROM-Dumps, vollständige Registerbeschreibung und Programmier-/Schutzsequenzen; anschliessend Test mit PTC-04 und realem Sensor.

## v0.4.1
Adapterantworten sind an Modell, Identität und Betriebsmodus gebunden. EEPROM-Abbilder können byteweise verglichen werden; das Kommunikationsprotokoll ist exportierbar. Der AFE-Rechner berücksichtigt die nominelle negative ADC-Steigung und kann Spanne/Nullpunkt aus zwei Referenzmessungen zurückrechnen (Datenblatt Abschnitt 11). Keine Chip-Programmierung.

## v0.5.0: drei Adapter
ESP32-C3 und Pro Micro verwenden direkt Web Serial über das gemeinsame [MLX1](MLX1.md)-USB-Protokoll. Firmware-Quellen unter firmware/. Standardfirmware erkennt ausschliesslich USB, kein SSC-Treiber. Expliziter Testbuild für Simulation. PTC-04 mit PRESSURE01 bleibt als Originaladapter über lokalen Windows-SDK-Host auswählbar; das konkrete PSF-Profil ist noch erforderlich.
