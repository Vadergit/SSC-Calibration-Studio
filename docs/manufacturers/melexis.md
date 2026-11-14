# Melexis — SSC support

[← Manufacturer overview](../../README.md)

**Status:** Planned — no SSC driver has been marked complete in the universal application.

## Supported device families

- [ ] **Melexis platform complete** (evaluate shared PTC-04 programmer ecosystem, device-specific interfaces)
  - [ ] **MLX90328** — resistive bridge pressure sensor; analog output, single-wire programming; [Product / datasheet](https://www.melexis.com/en/product/mlx90328/automotive-pressure-sensor-interface-analog-output)
  - [ ] **MLX90329** — resistive bridge pressure sensor; SENT output; [Product / datasheet](https://www.melexis.com/en/product/MLX90329/Automotive-Pressure-Sensor-Interface-SENT-Output)

## Implementation checklist

- [ ] Confirm supported device variants, supply voltages, wiring and communication interface.
- [ ] Implement and test transport using both the original manufacturer calibration/evaluation board (where available) and an affordable USB-connected microcontroller bridge; track support for each hardware option.
- [ ] Read device identification, configuration and raw measurement data where supported.
- [ ] Implement settings write, calibration and nonvolatile programming where supported.
- [ ] Validate the calibration with reference measurements and verify stored values.
- [ ] Test digital logging, diagnostics and export using the common web UI.
- [ ] Document tested hardware and limitations; then tick the individual SSC and family checkboxes.

These checkboxes describe the work to do for **Melexis**. An SSC is only marked complete after the applicable workflow works on real hardware.
