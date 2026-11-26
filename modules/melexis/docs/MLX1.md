# MLX1 — USB-Hostprotokoll v1

Gemeinsames Transportprotokoll für ESP32-C3 SuperMini und ATmega32U4 Pro Micro. Dieses Protokoll ist **nicht** das proprietäre Melexis-One-Wire-Protokoll. 115200 Baud, 8N1, USB CDC, ASCII-Anfrage und JSON-Zeile als Antwort. Keine externe Chipspannung oder GPIO-Ausgabe in der Firmware 0.1.0.

Anfrage: `MLX1 <id> <OP> <model> <count>\n` (id 1..2147483647, model mlx90328/29 ausgeschrieben als mlx90328 oder mlx90329, count 1..100). OP: INFO, SAMPLE, EEPROM, RAM. Antwort muss protocol=MLX1, id, board, model und ok enthalten. INFO meldet Firmware, chipDetected, mode, identity, capabilities. Standardfirmware: adapter-only, chipDetected=false, identity=null, capabilities=[]. Alle Chipoperationen werden abgelehnt. Keine Schreibbefehle definiert.

Optional beim Kompilieren MLX_TEST_SIMULATION auf 1 setzen (vor dem #ifndef im Sketch oder Build-Flag). Dann liefert die Firmware explizit markierte Testwerte und Bytearrays, keine Sensorwerte. SAMPLE liefert samples, raw, temperature, adcT, mode, identity. EEPROM/RAM liefern bytes, parameters, mode, identity. Simulation niemals zur Hardwarefreigabe verwenden.

## Flashen
- ESP32-C3: Arduino ESP32 Core; Board ESP32C3 Dev Module; USB CDC On Boot aktivieren.
- Pro Micro: Arduino-kompatibles ATmega32U4-Board; tatsächliche Takt-/Spannungsvariante wählen.
- Chrome/Edge Desktop, GitHub Pages öffnen, Adapter auswählen und USB-Port freigeben. INFO muss passendes Board zurückmelden.
- Beide Sketches enthalten den gleichen Protokollcode, keine ELMOS-Registerbefehle. Quellcode, keine geprüften Firmware-Binaries.

## Noch erforderlich
Für reale Melexis-Chipkommunikation: nachgewiesene Pegel-/Versorgungsschaltung und Programmiermodus, Bit-/Frameformat, Timing, Adressen, CRC, Speichergrenzen und Schreibfreigabe; beide Modelle getrennt validieren. MLX90328 wird über OUT programmiert; MLX90329 SENT ist ein Ausgangsformat, nicht automatisch der EEPROM-Programmierkanal. Kein GPIO direkt an Sensorversorgung oder Ausgang. PTC-04 + PRESSURE01 ist der dokumentierte Originalweg und verwendet den separaten Windows-SDK-Host. Siehe COMMUNICATION.md.
