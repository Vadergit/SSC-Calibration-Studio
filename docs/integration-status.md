# Studio integration status — 2026-11-26

## Implemented in Studio
- Seven pinned manufacturer snapshots, with 38 model selections matching the native catalogs. The launcher retains new-tab navigation. It is not yet a single shared application shell.
- Shared linear reference fit for five manufacturers; shared reference-error utilities; 42 stylesheet aliases backed by central files, with two intentionally distinct base revisions; common settings interaction and shared theme preference.
- Native host tools restored. The TI, Melexis and NOVOSENSE loopback services can load the public shared runtime assets; no vendor DLLs or private profiles are redistributed.
- Automated Studio build, browser settings/launcher checks, host HTTP tests, selected native manufacturer regression suites and separate firmware compile matrix for ESP32-C3 and both Pro Micro clock rates.

## Remaining software work before hardware-only testing
- Move native task navigation, header, AFE, plots, calibration workflow, output, NVM, verification, archives, reports and localization into shared components; preserve SSC-specific encoders and command sequences.
- Full common adapter transport, firmware installers and TX/RX export; original board access still depends on native services or documented protocols.
- Melexis DIY firmware currently diagnoses the USB adapter; real MLX90328/29 wire driver and native coefficient encoding are still missing. Original PTC-04 requires the SDK profile.
- NOVOSENSE: NSA2860X has an experimental RAM/EEPROM path; other models and original-board write paths are incomplete.
- TI: PGA300 experimental OWI and original USB2ANY service; other PGA models and verified coefficient programming remain incomplete.
- ADI: MAX40109 experimental RAM/Shadow path; permanent memory and MAX1454 implementation incomplete.
- Jiuhao: profile-based read-only I2C and passive original-board diagnostics; confirmed native register maps, write sequences and native compensation algorithms still required.
- Renesas: ZSC31014 beta, other models incomplete; DLL comparison and coefficient formats still require independent reference verification.
- Elmos: pinned beta; first integrated native regression run showed 202 passed and 10 failed. Several failures were static stylesheet and workflow-path assertions; the exact no-argument restoreCalibrationDisplayProfile assertion already fails on the unchanged pinned source. The SSP3 startup and combined-calibration safety assertions also require review. CI compares the untouched source baseline and integrated code. Do not weaken hardware safeguards or claim readiness.
- The private SSC library inventory contains 17,365 tree entries, including 771 DLL files, but inventory access is not a full analysis. Windows SDK binaries and reference DLL execution need an appropriate Windows environment and original binaries; missing or undocumented protocols must not be fabricated.

Physical hardware tests have not been performed. Software release gates remain open independently of hardware validation.
