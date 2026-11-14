# Texas Instruments — SSC support

[← Manufacturer overview](../../README.md)

**Status:** Planned — no SSC driver has been marked complete in the universal application.

## Supported device families

Official manufacturer pages include datasheet downloads. Grouping into reusable calibration-driver families is **to be determined by communication and calibration protocol**, rather than assuming all TI devices work with the same evaluation board.

- [ ] **TI platform complete**
  - [ ] **PGA309** — programmable bridge conditioner; one-wire programming, external EEPROM; [Product and datasheet](https://www.ti.com/product/PGA309)
  - [ ] **PGA300** — integrated pressure transmitter conditioner; 4–20 mA; [Product and datasheet](https://www.ti.com/product/PGA300)
  - [ ] **PGA302** — pressure/bridge conditioner; I²C and one-wire over supply line; [Product and datasheet](https://www.ti.com/product/PGA302)
  - [ ] **PGA305** — pressure sensor signal conditioner and transmitter; I²C / OWI; [Product and datasheet](https://www.ti.com/product/PGA305)

## Implementation checklist

- [ ] Confirm supported device variants, supply voltages, wiring and communication interface.
- [ ] Implement and test transport using an affordable USB-connected microcontroller.
- [ ] Read device identification, configuration and raw measurement data where supported.
- [ ] Implement settings write, calibration and nonvolatile programming where supported.
- [ ] Validate the calibration with reference measurements and verify stored values.
- [ ] Test digital logging, diagnostics and export using the common web UI.
- [ ] Document tested hardware and limitations; then tick the individual SSC and family checkboxes.

These checkboxes describe the work to do for **Texas Instruments**. An SSC is only marked complete after the applicable workflow works on real hardware.
