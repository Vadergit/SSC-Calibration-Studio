# Elmos — SSC support

[← Manufacturer overview](../../README.md)

**Status:** Planned — no SSC driver has been marked complete in the universal application.

## Supported device families

Reference hardware ecosystem: [Elmos E703.11 product page](https://www.elmos.com/english/products/sensor-ics/sensor-signal-processor-ic/e70311.html). The E703.11 datasheet is listed by Elmos **on request**.

- [ ] **Elmos platform group complete** (all listed devices integrated and validated)
  - [ ] [E703.11](https://www.elmos.com/english/products/sensor-ics/sensor-signal-processor-ic/e70311.html) — I²C / SPI; **existing standalone web app available**, integration into universal platform pending. [Existing app](https://github.com/Vadergit/ELMOS-E703.11-Calibration-Web-App)

Additional Elmos devices may be added after their programming interfaces and hardware compatibility are verified.

## Implementation checklist

- [ ] Confirm supported device variants, supply voltages, wiring and communication interface.
- [ ] Implement and test transport using both the original manufacturer calibration/evaluation board (where available) and an affordable USB-connected microcontroller bridge; track support for each hardware option.
- [ ] Read device identification, configuration and raw measurement data where supported.
- [ ] Implement settings write, calibration and nonvolatile programming where supported.
- [ ] Validate the calibration with reference measurements and verify stored values.
- [ ] Test digital logging, diagnostics and export using the common web UI.
- [ ] Document tested hardware and limitations; then tick the individual SSC and family checkboxes.

These checkboxes describe the work to do for **Elmos**. An SSC is only marked complete after the applicable workflow works on real hardware.
