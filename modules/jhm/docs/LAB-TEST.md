# Laborfreigabe v0.7.0-lab

**Nur Software-/Offline-Test und vorbereitende Adapterdiagnose. Keine Freigabe für Hardwarekalibrierung oder permanente Programmierung.**

1. Web-App öffnen, Modell wählen, Hell/Dunkel, acht Aufgaben prüfen. Synthetische 2P/1T und 2P/3T durchlaufen, getrennte Prüfpunkte erfassen, Toleranzdiagramm, CSV/JSON und Druck prüfen. Ausreisser eingeben und Fehlermeldung kontrollieren.
2. Unter Verbindung & Diagnose die Laborwerkzeuge testen: AFE-Kombinationen, Festkomma, CRC-8, Offline-Dump und Live-Aufzeichnung. Vorgabewerte sind synthetisch, keine Herstellerwerte. CRC-Rechner implementiert MSB-first CRC-8, keine bestätigte SSC-CRC.
3. DIY-Firmware pro Ziel kompilieren und USB-Handshake ohne SSC prüfen. Erst nach elektrischer Prüfung und bestätigten privaten Profilen mit Hardware verbinden. Pro Micro 8 kBd Limit. Separate I2C/PWM-Sketches.
4. Originalboard: nur passive Diagnose. Aktive Kommunikation benötigt PC-TX/RX-Protokoll, Boardrevision und USB-Schnittstelle. Nicht mit DIY-Firmware flashen. Keine OTP-Schreibsequenz mitschneiden oder ausführen.
5. Hardwarefreigabe pro Modell/Adapter erst nach bestätigtem Startup, Parität, Registerzuordnung, zwei übereinstimmenden Lesungen, verifiziertem RAM-Schreiben, physischer AFE/DSP-Validierung und unabhängigem Ausgangstest. Aktuell nicht erfüllt. Keine irreversible OTP-Funktion implementiert.

## Teststatus
Lokale mathematische Tests und Syntaxprüfungen sind keine Firmware-/Browser-/Hardwarevalidierung. Siehe Actions für CI-Ergebnisse.
