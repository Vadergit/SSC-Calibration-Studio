# SSC Calibration Studio

**SSC Calibration Studio** is an open-source project for a universal, manufacturer-independent, browser-based calibration, configuration, programming, and diagnostics platform for **Sensor Signal Conditioners (SSCs)**.

## Project vision

Build **one consistent web interface** to work with SSCs from multiple manufacturers instead of relying on separate proprietary PC software and evaluation boards for every chip.

- **Open and extensible:** Support more manufacturers, devices and calibration methods over time.
- **Low-cost hardware:** Use readily available Arduino-compatible microcontrollers as USB-to-SSC communication bridges wherever technically feasible.
- **Shared UI, modular drivers:** Separate device-specific registers, calibration algorithms and command sets from reusable transport layers (I²C, SPI, one-wire / ZACwire, etc.).
- **Calibration and diagnostics:** Read and configure the SSC, acquire raw and corrected measurement values, calculate calibration coefficients, program nonvolatile settings, and validate results where supported.
- **Logging:** Log measurements and diagnostic information over time. Prefer direct digital SSC readings where available to avoid adding errors from an external analog output/ADC measurement chain.
- **Precision:** External reference equipment (including a calibrated DMM where appropriate) can still be required for accurate physical calibration and independent validation.

## Starting point — Elmos E703.11

The existing [ELMOS E703.11 Calibration Web App](https://github.com/Vadergit/ELMOS-E703.11-Calibration-Web-App) is the reference implementation for the initial UI and calibration workflow. The goal is to adapt this implementation into a modular multi-SSC application, **not** to mark every feature as completed just because an Elmos-specific prototype exists.

## SSC support roadmap — grouped by shared hardware and communication

### How to read this roadmap

- **Platform group** = devices that use a common evaluation/communication board ecosystem.
- **Protocol subgroup** = devices that share an underlying communication interface and may reuse transport code.
- **Per-device checkbox** = completed only after connection, reading, writing, calibration and logging have been tested on real hardware and documented.
- **Group checkbox** = checked only when the common driver and **all listed devices in that group** have passed the above verification.
- A shared **evaluation communication board does not imply an identical chip command set**. Protocol, register maps and calibration procedures can still differ.

### Platform A — Elmos SSP3 / E703 series

Reference hardware ecosystem: [Elmos E703.11 product page](https://www.elmos.com/english/products/sensor-ics/sensor-signal-processor-ic/e70311.html). The E703.11 datasheet is listed by Elmos **on request**.

- [ ] **Elmos platform group complete** (all listed devices integrated and validated)
  - [ ] [E703.11](https://www.elmos.com/english/products/sensor-ics/sensor-signal-processor-ic/e70311.html) — I²C / SPI; **existing standalone web app available**, integration into universal platform pending. [Existing app](https://github.com/Vadergit/ELMOS-E703.11-Calibration-Web-App)

Additional Elmos devices may be added after their programming interfaces and hardware compatibility are verified.

### Platform B — IDT / Renesas modular SSC evaluation ecosystem

**Common communication hardware:** [Renesas SSC Communication Board (SSC-CB)](https://www.renesas.com/en/design-resources/boards-kits/ssc-cb). Renesas lists SSC-CB as a shared module in several SSC evaluation kits, including those for ZSC31014, ZSC31015, ZSC31050 and ZSC31150. **The aim of this project is to replace the proprietary communication board with a low-cost microcontroller, not to require the original board.** Individual chip boards, pinouts, voltage levels and command sets still need verification.

- [ ] **Renesas/IDT platform group complete** (all protocol subgroups below implemented and verified)

#### Group B1 — ZACwire / one-wire (OWI)

Shared transport concept: ZACwire one-wire; per-chip commands and memory layouts must be verified separately.

- [ ] **ZACwire subgroup complete**
  - [ ] **ZSC31010** — [Product](https://www.renesas.com/en/products/zsc31010) · [Datasheet](https://www.renesas.com/en/document/dst/zsc31010-datasheet)
  - [ ] **ZSC31015** — [Product](https://www.renesas.com/en/products/zsc31015) · [Datasheet](https://www.renesas.com/en/document/dst/zsc31015-datasheet) · [Evaluation kit](https://www.renesas.com/en/design-resources/boards-kits/zsc31015kit)

#### Group B2 — I²C / SPI digital interface

- [ ] **I²C/SPI subgroup complete**
  - [ ] **ZSC31014** — I²C configuration/calibration, I²C or SPI output. [Product](https://www.renesas.com/en/products/zsc31014) · [Datasheet](https://www.renesas.com/en/document/dst/zsc31014-datasheet) · [Evaluation kit](https://www.renesas.com/en/design-resources/boards-kits/zsc31014kit)

#### Group B3 — multi-interface SSCs (ZACwire + I²C, and SPI where supported)

These devices can share parts of the B1/B2 transport layers while retaining individual register and calibration drivers.

- [ ] **Multi-interface subgroup complete**
  - [ ] **ZSC31050** — ZACwire / I²C / SPI. [Product](https://www.renesas.com/en/products/zsc31050) · [Datasheet](https://www.renesas.com/en/document/dst/zsc31050-datasheet) · [Evaluation kit](https://www.renesas.com/en/design-resources/boards-kits/zsc31050kit)
  - [ ] **ZSC31150** — ZACwire / I²C. [Product](https://www.renesas.com/en/products/zsc31150) · [Datasheet](https://www.renesas.com/en/document/dst/zsc31150-datasheet) · [Evaluation kit](https://www.renesas.com/en/design-resources/boards-kits/zsc31150kit)

**Planned additions:** other widely used Renesas / IDT and third-party SSCs will be researched and added to a suitable verified platform and protocol group. The above is an initial candidate list, not a claim of implemented support or verified protocol-level compatibility.

## Shared development checklist

- [ ] Extract reusable web UI and workflow components from the Elmos prototype
- [ ] Define a common SSC driver API (identify, connect, read, write, calibrate, validate, log)
- [ ] Define microcontroller-to-browser communication protocol (USB / Web Serial, where supported)
- [ ] Implement reusable I²C, SPI and one-wire/ZACwire transport adapters as required
- [ ] Add device profiles for register maps, output modes and calibration algorithms
- [ ] Add raw/corrected measurement logging and export
- [ ] Document wiring, voltage requirements, hardware safety and device-specific limitations
- [ ] Test every supported SSC with real hardware before marking its checkbox complete

## Project status

**Early planning and architecture.** The Elmos-specific web application is the starting point. All SSC integration checkboxes remain open until validated in this universal project.
