# v0.6.1 – Laboratory test candidate (not production)
## Test sequence per adapter / model
1. Use a spare SSC, current-limited supply, verified voltage and pinout; ESP32 GPIO4/5/6/10 or Pro Micro D2/3/4/7.
2. Flash v3.1 firmware where applicable; connect Chrome/Edge; verify board identity. Original SSC-CB no DIY firmware.
3. Select correct model and address; confirm power cycle; enter CM; compare two EEPROM reads with original vendor software; export backup.
4. Test RAM read where supported. For 31050/31150 only, change one known calibration word 00–07 in volatile RAM, read back; optionally select known AFE gain and verify masked CFGAFE, power cycle and verify original EEPROM unchanged. Do not test factory trims or arbitrary addresses.
5. Test ADC acquisition and logging; compare raw codes with vendor software, verify signed format and pressure/temperature inputs separately. 31010 requires unity gains already set.
6. Test normal operation with external instruments, compare independent pressure points. Save logs and issue with adapter/model/firmware.
## Known blockers
3154/3240/3281 no native drivers. 31014/15 native raw missing. Native AFE/temperature/DSP calculations, output/diagnostics registers, complete EEPROM decoding/restore/commit and vendor reference validation missing. 31010 original-board expert gain/offset write remains experimental and separate. No production release. No physical hardware tested. CI compile/browser tests do not verify real bus timing.
