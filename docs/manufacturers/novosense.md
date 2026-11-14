# NOVOSENSE — SSC support

[← Manufacturer overview](../../README.md)

**Status:** Planned — no SSC driver has been marked complete in the universal application.

## Supported device families

Official references: [NOVOSENSE pressure SSC product selection guide (2025)](https://www.novosns.com/Public/Uploads/uploadfile3/files/20250427/NOVOSENSE_Product_Selection_Guide_EN_202504.pdf). All devices below are **pressure-sensor-relevant SSC candidates**, not yet implemented. Common transport code may be reused, but command compatibility and evaluation-board grouping must be verified on a per-family basis.

- [ ] **NOVOSENSE platform complete**
  - [ ] **C1 — Piezoresistive / Wheatstone bridge, digital and analog outputs**
    - [ ] **NSA2200** — I²C / SPI; OTP; low-cost digital-output bridge conditioner. [Manufacturer catalogue](https://www.novosns.com/Public/Uploads/uploadfile3/files/20250427/NOVOSENSE_Product_Selection_Guide_EN_202504.pdf)
    - [ ] **NSA2300** — I²C / SPI / OWI; OTP; analog and digital outputs. [Manufacturer catalogue](https://www.novosns.com/Public/Uploads/uploadfile3/files/20250427/NOVOSENSE_Product_Selection_Guide_EN_202504.pdf)
    - [ ] **NSA2302** — I²C / SPI / OWI; rewritable EEPROM; analog and digital outputs. [Manufacturer catalogue](https://www.novosns.com/Public/Uploads/uploadfile3/files/20250427/NOVOSENSE_Product_Selection_Guide_EN_202504.pdf)
  - [ ] **C2 — Industrial pressure transmitters**
    - [ ] **NSA2860 / NSA2860X** — resistive bridge; I²C / SPI / OWI; 4–20 mA and voltage outputs. [NSA2860X datasheet](https://www.novosns.com/Public/Uploads/uploadfile/files/20240115/NSA2860X_Datasheet_Rev1.4_EN-843.pdf)
    - [ ] **NSC2860X** — capacitive pressure sensor interface; industrial transmitter. [Manufacturer catalogue](https://www.novosns.com/Public/Uploads/uploadfile3/files/20250427/NOVOSENSE_Product_Selection_Guide_EN_202504.pdf)
  - [ ] **C3 — Automotive analog pressure SSCs**
    - [ ] **NSA9260 / NSA9260X** — resistive bridge; analog output / OWI. [Manufacturer catalogue](https://www.novosns.com/Public/Uploads/uploadfile3/files/20250427/NOVOSENSE_Product_Selection_Guide_EN_202504.pdf)
    - [ ] **NSC9260 / NSC9260X** — capacitive pressure input; analog output / OWI. [NSC9260X datasheet](https://www.novosns.com/Public/Uploads/uploadfile/files/20231228/NSC9260X_Datasheet_EN_1.3.pdf)
  - [ ] **C4 — Automotive digital-output pressure SSCs**
    - [ ] **NSC9262** — capacitive pressure input; LIN interface. [Manufacturer catalogue](https://www.novosns.com/Public/Uploads/uploadfile3/files/20250427/NOVOSENSE_Product_Selection_Guide_EN_202504.pdf)
    - [ ] **NSC9264** — capacitive pressure input; SENT interface. [Manufacturer catalogue](https://www.novosns.com/Public/Uploads/uploadfile3/files/20250427/NOVOSENSE_Product_Selection_Guide_EN_202504.pdf)

## Implementation checklist

- [ ] Confirm supported device variants, supply voltages, wiring and communication interface.
- [ ] Implement and test transport using both the original manufacturer calibration/evaluation board (where available) and an affordable USB-connected microcontroller bridge; track support for each hardware option.
- [ ] Read device identification, configuration and raw measurement data where supported.
- [ ] Implement settings write, calibration and nonvolatile programming where supported.
- [ ] Validate the calibration with reference measurements and verify stored values.
- [ ] Test digital logging, diagnostics and export using the common web UI.
- [ ] Document tested hardware and limitations; then tick the individual SSC and family checkboxes.

These checkboxes describe the work to do for **NOVOSENSE**. An SSC is only marked complete after the applicable workflow works on real hardware.
