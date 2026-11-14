# Analog Devices / Maxim — SSC support

[← Manufacturer overview](../../README.md)

**Status:** Planned — no SSC driver has been marked complete in the universal application.

## Supported device families

- [ ] **ADI/Maxim platform complete**
  - [ ] **MAX1454** — programmable precision sensor signal conditioner for automotive bridge sensors; single-pin programming; [Product / datasheet](https://www.analog.com/en/products/max1454.html)

Additional older MAX1452/MAX1455 devices are research candidates only; review their lifecycle and documentation before adding them to the active implementation roadmap.

## Implementation checklist

- [ ] Confirm supported device variants, supply voltages, wiring and communication interface.
- [ ] Implement and test transport using both the original manufacturer calibration/evaluation board (where available) and an affordable USB-connected microcontroller bridge; track support for each hardware option.
- [ ] Read device identification, configuration and raw measurement data where supported.
- [ ] Implement settings write, calibration and nonvolatile programming where supported.
- [ ] Validate the calibration with reference measurements and verify stored values.
- [ ] Test digital logging, diagnostics and export using the common web UI.
- [ ] Document tested hardware and limitations; then tick the individual SSC and family checkboxes.

These checkboxes describe the work to do for **Analog Devices / Maxim**. An SSC is only marked complete after the applicable workflow works on real hardware.
