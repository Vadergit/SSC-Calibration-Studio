# Renesas / IDT SSC Calibration Web App

[Web-App](https://vadergit.github.io/Renesas-IDT-SSC-Calibration-Web-App/?model=zsc31010) · [SSC Calibration Studio](https://vadergit.github.io/SSC-Calibration-Studio/)

## v0.3.0 – Master-aligned Offline-Arbeitsplatz

Die Oberfläche übernimmt die Basisstile und die Schrittstruktur des ELMOS E703.11 Masters (v0.7.173), ohne ELMOS-Registerbefehle zu verwenden. Unterstützt werden acht Modellprofile mit öffentlichen Herstellerlinks, geführte Aufgabenauswahl, klassische und kompakte Ansicht, Hell/Dunkel, manuelle und synthetische Messpunkte, lineare/quadratische/temperaturabhängige Offline-Regression, unabhängige Nachmessung, Ausgangsskalierung, idealisierter Brückenrechner, Rohdaten-Viewer, Logging, JSON/CSV und druckbarer Bericht sowie lokales Archiv. USB Web Serial öffnet den gewählten Port und zeigt passiv empfangene Bytes; es gibt keinen Nachweis einer SSC-Verbindung.

## Grenzen und Freigabe

Alle acht Modelle sind **offline**, nicht hardwarefreigegeben. Die Koeffizienten sind allgemeine mathematische Modelle, keine Renesas-DLL- oder Registerkoeffizienten. Keine AFE-, RAM-, EEPROM-/NVM-, Alarm- oder Ausgangsregister werden geschrieben. Es gibt keine Adapter-Firmware in diesem Stand. Die private SSC-Bibliothek enthält wichtige Originalunterlagen, deren Git-LFS-Inhalte über den aktuellen Zugriff nicht verfügbar waren. Keine privaten Dateien in dieses öffentliche Repository kopieren. Vor Freigabe je Modell: Datenblattrevision/Errata, elektrisches Interface und Startup-Sequenz, Adaptertreiber, Rohwertformat, Registerlayout, Kalibrierformel und Quantisierung, Backup/Readback, Hardwaretest mit Referenzsoftware, unabhängige Verifikation und kontrollierte permanente Programmierung. ZACwire und OWI sind nicht pauschal austauschbar.

## Lokal starten und prüfen

`python3 -m http.server 8000 --bind 127.0.0.1` und http://127.0.0.1:8000 öffnen. `node --test tests/calibration.test.mjs` testet die Offline-Mathematik. Die öffentlichen Herstellerquellen sind in catalog.mjs verlinkt. USB-Diagnose erfordert Web Serial (Chrome/Edge).

### ZSC31010: gerätespezifischer Offline-Viewer

Die 14-Byte-Lesereihenfolge, der A5-Abschluss, das Offset-Duplikat sowie Gain-, Offset-, Temperatur-, AFE- und Ausgangsfelder werden gemäss öffentlichem ZSC31010-Datenblatt vom 20.01.2016 (Tabellen 3.6, 3.8–3.12) dekodiert. Der Viewer prüft nicht die ursprünglichen Signal-Paritätsbits und schreibt nichts. Das Beispiel nutzt die Fabrikwerte ab KW48/2008 mit Platzhaltern für individuelle Trims. Keine Aussage über die Gültigkeit eines physischen EEPROMs allein anhand des Dumps.

## Master UI v0.3.0

Uses original Elmos v0.7.173 inline styles, guided.css, interface.css, theme.css and settings-refresh.css. Guided shell mirrors the eleven-stage flow and eight task cards. Shared offline controls are moved between guided and classic workspaces without duplicated IDs. Calibration planning supports quick, TK0, TK0+TKE and custom grids; temperature models are linear offline fits (not native SSC coefficients). No Elmos executable protocol code is included. Hardware operations remain disabled.

Guided measurements have a per-point selector and explicit manual capture; the classic table shares the same data. Automated browser smoke test is configured in GitHub Actions.

## v0.4.0 · Experimental hardware read path

See [HARDWARE.md](HARDWARE.md). SSC-CB ZACwire ZSC31010/15 and ESP32-C3 I2C ZSC31014 read paths are implemented, pending physical tests. All permanent programming remains disabled. Other model drivers remain outstanding.

Experimental ZSC31010 manual Gain_B / Offset_B write path added: explicit local backup, preview, typed confirmation, fresh double-read and complete post-write verification. No hardware validation; never use with production units. Automatic/native coefficient calculation remains unavailable.

## v0.5.0 · Additional experimental I²C drivers
ZSC31050 / ZSC31150 read-only RAM and EEPROM, D8/D9 ADC acquisition with sample averaging and guided point capture. ZSC31014 updated DF status handling. Firmware v2 required. No automatic native calibration or hardware qualification.

ZSC31010: experimental Raw Mode with pre-existing unity gains only; 2-point idealized native-code candidate calculator (no automatic application). Hardware-captured values carry raw-word provenance in JSON reports.

## v0.6.0
Original SSC-CB, ESP32-C3 and Pro Micro separately selectable; common DIY I²C protocol v3 with exact board identity. Original board I²C candidate driver. DIY read-only ZACwire candidate added; physical qualification pending. See HARDWARE.md and ADAPTER-PROTOCOL.md.

## v0.6.1 · Laboratory test candidate
Fixed Pro Micro FQBN, added bounded volatile RAM coefficient writes with readback, hardware ADC logging, backup comparison and cold-start EEPROM comparison. See [TEST-RELEASE.md](TEST-RELEASE.md) for scope and test checklist. Not a production calibration release.

## v0.6.2 · USB startup hotfix
Initialize hardware logging state before selectModel() invokes clearResult()/stopLog(). Regression test clicks USB selection on all three adapters with a mocked Web Serial chooser and checks cancellation and recovery. Also install the Arduino AVR core dependency for SparkFun builds. Real board tests still pending.

## v0.6.3 · Native SSC-CB version recognition
Real V4.12k banner without ACK prefix accepted only for the original board's version command; native legacy Latin-1/Windows-1252 decoding. All other commands still require ACK/NACK; no permissive writes. Added stream-fragment and browser connection regression tests. Real sensor communication still requires testing.

## v0.6.4 · SSC-CB ZSC31014 diagnostics
Separate read-only normal-operation I2C probe, based on Renesas evaluation kit manual Fig. 7.1 (`irt28001`), visible command progress and downloadable timestamped diagnosis. USB detection is explicitly distinguished from chip CM/EEPROM read. No new EEPROM writes. Native responses except the version banner still require ACK/NACK; real sensor response pending.

## v0.6.5 – ZSC31014 laboratory workflow on original SSC-CB
Native EEPROM map, fresh NOM measurements, bridge unity setup, AFE mask, two-point linear bridge gain/offset calculation, explicit EEPROM plan/program/Start_NOM signature update/cold re-read, same-session original bridge restore and CSV test logging. Preserves factory temperature calibration, IDs, locks, trims. Only original board for this new workflow. Experimental; verify on hardware before use. Does not implement native higher-order/TK0/TKE or all other models. Sources: datasheet rev 1.64 tables 2.4,3.6–3.9 and evaluation kit manual Fig 7.1, section 5.

Original backup can also be imported from JSON after reconnection, checked against protected configuration and IDs before a limited restore plan. Test logging stops after the in-flight transaction, not during it. Original-board 31014 writing remains an explicitly confirmed laboratory operation.

## v0.7.2 · Elmos master UI alignment
UI baseline: Elmos v0.7.176 (1239b7641115e037ddd9df59ff8b682ba036b35e). Original base, EEPROM overview and bridge CSS imported. Inline EEPROM detail rows, expert bitfields, formula dialogs and native ZSC31014 calibration workspace separated from connection. Logging metadata and local archive, native output verification. Actual sensor algorithms and hardware commands are Renesas-specific; no Elmos programming sequence reused. Native temperature calibration, full logging/verification feature parity and remaining model support are not complete. Hardware validation and visual comparison still required.

## v0.7.4 · Master detail parity and automatic reconnect
Master baseline 0.7.176. Original expand control, EEPROM detail styles, grouped tables and formula dialog DOM/classes; per-result substitutions and a Renesas formula guide. Original-board automatic reconnect uses only a previously successful USB identity, matching selected SSC and a single authorized port. Explicit disconnect clears the record. DIY consent unchanged. No automatic calibration or EEPROM write. First fresh output attempted before reporting live. No physical hardware verification in CI.

## v0.7.5 · Guided ZSC31014 calibration
Six native stages with master sidebar and controls, verified backup gate, AFE live 60 s graph, two-point capture with graph and table, native coefficient preview and planned EEPROM change table, separate verification stage. The ADC graph is labelled Unity only when the current EEPROM configuration confirms unity; otherwise digital output. Native temperature calibration remains unavailable. Existing EEPROM guard, double readback and manual confirmation retained. Mocked serial regression covers the full linear workflow; not a real device test.

## v0.7.6 · Guided backup navigation
Removed redundant global wizard action row. The sensor preparation step exports the immutable original snapshot directly, not a later EEPROM read whose signature can differ. Current EEPROM viewer export stays separate. Next is still gated by original backup and unlocked EEPROM. Regression uses a changed simulated signature and verifies the original backup download and advancement.

## v0.7.7 · Streamlined programming
Removed redundant checkboxes and typed confirmation from guided ZSC31014 and expert ZSC31010 EEPROM programming; the explicit program button acts as the authorization. Original backup gate, validated change plan, connected state, lock/protected-register checks, serialized writes and readback remain. Volatile RAM operations no longer require a separate download or checkbox, but require a connected SSC and initial verified read. No automatic permanent writes.

## v0.7.8 · Direct AFE adjustment
Entering frontend from sensor preparation automatically activates Unity on backed-up ZSC31014. Committed gain, offset and polarity changes apply directly with serialized EEPROM changes, signature update, readback and resumed real ADC display. No separate proposal/program step for AFE. Unchanged words are skipped; inputs locked only during actual transaction, and graph history resets when the AFE configuration changes. Signature-only changes between reads are tolerated; all other stale words still abort. Final calibration still uses explicit EEPROM program action. Hardware timing not yet verified.

## v0.7.9 · Reference-point ADC span
Guided ZSC31014 point capture now displays signed live ADC difference from the captured lower point, and the fixed captured pressure span (absolute and signed difference, ADC-window percentage). Live changes do not alter saved point span. No hardware commands changed.

## v0.7.10 · Simplified guided calibration
Automatically calculates native coefficients upon entering the save step; normal view shows calculated curve, status and explicit Save calibration action. Register change table and coefficient details are expert-only. Backup/restore and automatic write verification unchanged. No automatic final EEPROM write.

## v0.7.11 · Guided verification and return dialog
Pressure-only verification planner, editable pressure sequence/cycles, step navigation, measured value and deviation graph, CSV and local archive; target scaling inherited from native calibration when entered from its final step. Home navigation asks before abandoning an active task, stops recording between serial requests and archives verification partial results. No automatic reset, NVM write or USB disconnect on leaving. Temperature verification, dedicated hysteresis analysis and PDF report are not yet implemented.

Return confirmation also covers switching views. Completed native calibration is archived on entry to verification; aborted verification and test recordings retain acquired data. Unity output is not treated as calibrated pressure during verification. No extra EEPROM writes on navigation.

## v0.7.12 · USB startup regression fix
Removed obsolete toVerify binding and restored offline verificationExport control in its own panel. Missing DOM nodes previously stopped app startup before Web Serial listeners were installed. Added static check for literal DOM and event bindings plus chooser and known-port checks on all three adapters; startup browser errors are now logged immediately. No firmware or SSC protocol changes.

## v0.7.23 – schnellere ZSC31014-Live-Anzeige

Separate persistente Live-Intervallwahl (50/100/200/350/500/1000 ms, Standard 100 ms). Die tatsächliche Polling-Rate berücksichtigt das im bestätigten EEPROM eingestellte Update_Rate-Feld (Datenblatt Tabellen 3.2/3.3; konservative 1-MHz-Grenzen). Live-Abfragen lesen nur einmal; Status 2 wird nicht als neuer Wert angezeigt und blockiert keine AFE-Änderung mehr mit Wiederholungsschleifen. Explizite Messpunktaufnahmen behalten die strenge Frischeprüfung. EEPROM-Schreibfolge, Backup, vollständige Vorprüfung und doppelte Rücklesung bleiben unverändert. Die tatsächliche USB/SSC-Rate und AFE-Übernahmedauer sind am Prüfplatz zu messen.

## v0.7.24 – Kalibrierarchiv

Filter und Suche, Protokoll-Detailansicht, Messkurven, CSV/JSON, druckbares PDF sowie gesamtes Archiv sichern und JSON importieren. Bestehende Browserdaten bleiben unverändert; keine pauschale Offline-Beschriftung und kein automatisches Löschen älterer Datensätze. Bei fehlender Herkunft oder fehlenden Prüfdaten wird dies ausdrücklich angezeigt. Neue native Kalibrierprotokolle enthalten Adapter und verfügbare EEPROM-Abbilder. Kein direkter Ordnerzugriff, keine Fotoablage und kein gemeinsames herstellerübergreifendes Archiv in diesem Stand.
