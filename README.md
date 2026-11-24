# SSC Calibration Studio

**Universal, open-source calibration software for Sensor Signal Conditioners (SSCs).**

The goal is a single browser-based application for configuring, calibrating, programming and logging **pressure-sensor SSCs from different manufacturers**, supporting **both original manufacturer calibration/evaluation boards** and affordable Arduino-/ESP32-compatible microcontrollers as communication interfaces.

The existing [Elmos E703.11 Calibration Web App](https://github.com/Vadergit/ELMOS-E703.11-Calibration-Web-App) is the starting point for the shared user interface and calibration workflow.

## Studio v0.2.0

[Open Studio (once GitHub Pages is enabled)](https://vadergit.github.io/SSC-Calibration-Studio/) · [Architecture and module integration](docs/studio-architecture.md) · [Changelog](CHANGELOG.md)

The first web UI is available in the repository. Choose manufacturer → SSC → adapter → protocol → task. Elmos v0.7.172 is delivered as a pinned local module in the same tab, with adapter, protocol and task transferred. Other SSCs are planning entries. The existing guarded Elmos engine handles USB/NVM only after user action. See [architecture](docs/studio-architecture.md).

## Manufacturers and planned SSC support

Select a **manufacturer** to open its detailed SSC lists, communication groups, links to product information / datasheets and implementation checklists.

| Manufacturer | SSC models / families | Progress |
| --- | --- | --- |
| **[Elmos](docs/manufacturers/elmos.md)** | E703.11 | Existing standalone app; universal integration open |
| **[Renesas / IDT](docs/manufacturers/renesas-idt.md)** | ZSC31010, ZSC31014, ZSC31015, ZSC31050, ZSC31150, ZSSC3154, ZSSC3240, ZSSC3281 | Planned |
| **[NOVOSENSE](docs/manufacturers/novosense.md)** | NSA2200, NSA2300, NSA2302, NSA2860(X), NSC2860X, NSA/NSC9260(X), NSC9262, NSC9264 | Planned |
| **[Texas Instruments](docs/manufacturers/texas-instruments.md)** | PGA300, PGA302, PGA305, PGA309 | Planned |
| **[Melexis](docs/manufacturers/melexis.md)** | MLX90328, MLX90329 | Planned |
| **[Analog Devices / Maxim](docs/manufacturers/analog-devices.md)** | MAX1454 | Planned |
| **[Jiuhao Microelectronics (JHM)](docs/manufacturers/jiuhao.md)** | JHM1101–1103, JHM1200/1203, JHM140X, JHM150X, JHM2102 | Planned |

**Progress tracking:** The linked manufacturer pages contain checkboxes for each SSC and its related device/communication group. A chip or group is marked complete only after the relevant functions have been tested on hardware. Shared evaluation-board support does not automatically mean identical protocols or commands.

## Planned workflow

**Select manufacturer → SSC → programming adapter → communication protocol → task → connect → read / calibrate / program / verify / log**

The application will use **interchangeable hardware adapters** for original manufacturer boards and the open-source microcontroller firmware, plus device-specific drivers for register access, communication and calibration methods. Digital measurement readout is preferred where available; precision calibration may still require external reference measurements.

**[Full development roadmap and task checklist](docs/development-roadmap.md)** · **[Microcontroller firmware, native USB boards and communication protocols](docs/firmware-and-hardware.md)**

## Project status

**v0.2.0 — Local Elmos integration and modular packages.** Shared UI extraction and hardware validation remain open. Serve the repository root as a static site; for GitHub Pages select main / root. Run `node tests/model.test.mjs`, `node tests/core.test.mjs`, and `node tests/integration.test.mjs`. Refresh the pinned Elmos package with `node scripts/build-elmos.mjs` only after reviewing the source revision.
