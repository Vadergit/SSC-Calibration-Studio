# Renesas / IDT — SSC support

[← Manufacturer overview](../../README.md)

**Status:** Planned — no SSC driver has been marked complete in the universal application.

## Supported device families

**Common communication hardware:** [Renesas SSC Communication Board (SSC-CB)](https://www.renesas.com/en/design-resources/boards-kits/ssc-cb). Renesas lists SSC-CB as a shared module in several SSC evaluation kits, including those for ZSC31014, ZSC31015, ZSC31050 and ZSC31150. **The goal is to support the original SSC-CB alongside an affordable microcontroller alternative, with the same web interface.** Individual chip boards, pinouts, voltage levels and command sets still need verification.

- [ ] **Renesas/IDT platform group complete** (all protocol subgroups below implemented and verified)

### Group B1 — ZACwire / one-wire (OWI)

Shared transport concept: ZACwire one-wire; per-chip commands and memory layouts must be verified separately.

- [ ] **ZACwire subgroup complete**
  - [ ] **ZSC31010** — [Product](https://www.renesas.com/en/products/zsc31010) · [Datasheet](https://www.renesas.com/en/document/dst/zsc31010-datasheet)
  - [ ] **ZSC31015** — [Product](https://www.renesas.com/en/products/zsc31015) · [Datasheet](https://www.renesas.com/en/document/dst/zsc31015-datasheet) · [Evaluation kit](https://www.renesas.com/en/design-resources/boards-kits/zsc31015kit)

### Group B2 — I²C / SPI digital interface

- [ ] **I²C/SPI subgroup complete**
  - [ ] **ZSC31014** — I²C configuration/calibration, I²C or SPI output. [Product](https://www.renesas.com/en/products/zsc31014) · [Datasheet](https://www.renesas.com/en/document/dst/zsc31014-datasheet) · [Evaluation kit](https://www.renesas.com/en/design-resources/boards-kits/zsc31014kit)

### Group B3 — multi-interface SSCs (ZACwire + I²C, and SPI where supported)

These devices can share parts of the B1/B2 transport layers while retaining individual register and calibration drivers.

- [ ] **Multi-interface subgroup complete**
  - [ ] **ZSC31050** — ZACwire / I²C / SPI. [Product](https://www.renesas.com/en/products/zsc31050) · [Datasheet](https://www.renesas.com/en/document/dst/zsc31050-datasheet) · [Evaluation kit](https://www.renesas.com/en/design-resources/boards-kits/zsc31050kit)
  - [ ] **ZSC31150** — ZACwire / I²C. [Product](https://www.renesas.com/en/products/zsc31150) · [Datasheet](https://www.renesas.com/en/document/dst/zsc31150-datasheet) · [Evaluation kit](https://www.renesas.com/en/design-resources/boards-kits/zsc31150kit)

**Planned additions:** other widely used Renesas / IDT and third-party SSCs will be researched and added to a suitable verified platform and protocol group. The above is an initial candidate list, not a claim of implemented support or verified protocol-level compatibility.

## Additional pressure SSC candidates

These parts are suitable for bridge/pressure measurement but **are not yet confirmed to share the programming commands of Platform B**. Group further by actual communication-board hardware and device protocol after validation.

- [ ] **ZSSC3154** — resistive bridge automotive SSC; [Product / datasheet](https://www.renesas.com/en/products/zssc3154)
- [ ] **ZSSC3240** — 24-bit SSC; [Calibration guide](https://www.renesas.com/en/document/mat/zssc3240-calibration-guide?language=en)
- [ ] **ZSSC3281** — dual-channel 24-bit SSC for differential pressure, flow and level sensing; [Product / datasheet](https://www.renesas.com/en/products/zssc3281)

## Implementation checklist

- [ ] Confirm supported device variants, supply voltages, wiring and communication interface.
- [ ] Implement and test transport using both the original manufacturer calibration/evaluation board (where available) and an affordable USB-connected microcontroller bridge; track support for each hardware option.
- [ ] Read device identification, configuration and raw measurement data where supported.
- [ ] Implement settings write, calibration and nonvolatile programming where supported.
- [ ] Validate the calibration with reference measurements and verify stored values.
- [ ] Test digital logging, diagnostics and export using the common web UI.
- [ ] Document tested hardware and limitations; then tick the individual SSC and family checkboxes.

These checkboxes describe the work to do for **Renesas / IDT**. An SSC is only marked complete after the applicable workflow works on real hardware.
