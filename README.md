# SSC Calibration Studio

**Universal, open-source calibration software for Sensor Signal Conditioners (SSCs).**

The goal is a single browser-based application for configuring, calibrating, programming and logging **pressure-sensor SSCs from different manufacturers**, supporting **both original manufacturer calibration/evaluation boards** and affordable Arduino-/ESP32-compatible microcontrollers as communication interfaces.

The existing [Elmos E703.11 Calibration Web App](https://github.com/Vadergit/ELMOS-E703.11-Calibration-Web-App) is the starting point for the shared user interface and calibration workflow.

## Studio v0.5.6

[Open Studio](https://vadergit.github.io/SSC-Calibration-Studio/) · [Architecture and module integration](docs/studio-architecture.md) · [Changelog](CHANGELOG.md)

Every manufacturer card opens its independent public calibration web app directly in a new browser tab. Each card shows the app's declared version and latest Main commit timestamp, with relative age. A public GitHub API refresh runs on page load and every 15 minutes, with local caching and a committed fallback snapshot. These values describe source code, not confirmed Pages deployment or version release dates. Device, adapter and task selection take place within that app. Elmos opens the functional beta hardware calibrator, which has not yet been fully validated; the pinned local v0.7.172 reference remains available under Related projects. The six other manufacturer apps are under active development and are not ready for practical use. See [architecture](docs/studio-architecture.md).

## Related projects

- [Elmos E703.11 Calibration Web App](https://github.com/Vadergit/ELMOS-E703.11-Calibration-Web-App): independent reference calibrator, pinned local integration in Studio.
- [SensorBridge Emulator](https://github.com/Vadergit/SensorBridge-Emulator): programmable Wheatstone bridge emulator for repeatable sensor signal tests. [Web UI / demo](https://vadergit.github.io/SensorBridge-Emulator/). Currently a mathematical simulation; analogue hardware and accuracy not validated. Future Studio integration planned.

## Manufacturers and planned SSC support

Select a **manufacturer** to open its detailed SSC lists, communication groups, links to product information / datasheets and implementation checklists.

| Manufacturer | SSC models / families | Progress |
| --- | --- | --- |
| **[Elmos](docs/manufacturers/elmos.md)** | E703.11 | [Web app](https://vadergit.github.io/ELMOS-E703.11-Calibration-Web-App/) · functional beta, validation incomplete; pinned local reference retained |
| **[Renesas / IDT](docs/manufacturers/renesas-idt.md)** | ZSC31010, ZSC31014, ZSC31015, ZSC31050, ZSC31150, ZSSC3154, ZSSC3240, ZSSC3281 | Under development, not ready · [Simulation](https://vadergit.github.io/Renesas-IDT-SSC-Calibration-Web-App/) · [Repository](https://github.com/Vadergit/Renesas-IDT-SSC-Calibration-Web-App) |
| **[NOVOSENSE](docs/manufacturers/novosense.md)** | NSA2200, NSA2300, NSA2302, NSA2860(X), NSC2860X, NSA/NSC9260(X), NSC9262, NSC9264 | Under development, not ready · [Simulation](https://vadergit.github.io/NOVOSENSE-SSC-Calibration-Web-App/) · [Repository](https://github.com/Vadergit/NOVOSENSE-SSC-Calibration-Web-App) |
| **[Texas Instruments](docs/manufacturers/texas-instruments.md)** | PGA300, PGA302, PGA305, PGA309 | Under development, not ready · [Simulation](https://vadergit.github.io/Texas-Instruments-SSC-Calibration-Web-App/) · [Repository](https://github.com/Vadergit/Texas-Instruments-SSC-Calibration-Web-App) |
| **[Melexis](docs/manufacturers/melexis.md)** | MLX90328, MLX90329 | Under development, not ready · [Simulation](https://vadergit.github.io/Melexis-SSC-Calibration-Web-App/) · [Repository](https://github.com/Vadergit/Melexis-SSC-Calibration-Web-App) |
| **[Analog Devices / Maxim](docs/manufacturers/analog-devices.md)** | MAX1454 | Under development, not ready · [Simulation](https://vadergit.github.io/Analog-Devices-Maxim-SSC-Calibration-Web-App/) · [Repository](https://github.com/Vadergit/Analog-Devices-Maxim-SSC-Calibration-Web-App) |
| **[Jiuhao Microelectronics (JHM)](docs/manufacturers/jiuhao.md)** | JHM1101–1103, JHM1200/1203, JHM140X, JHM150X, JHM2102 | Under development, not ready · [Simulation](https://vadergit.github.io/Jiuhao-SSC-Calibration-Web-App/) · [Repository](https://github.com/Vadergit/Jiuhao-SSC-Calibration-Web-App) |

**Progress tracking:** The linked manufacturer pages contain checkboxes for each SSC and its related device/communication group. A chip or group is marked complete only after the relevant functions have been tested on hardware. Shared evaluation-board support does not automatically mean identical protocols or commands.

## Planned workflow

**Studio: select manufacturer / SSC → open calibrator. Calibrator: select adapter, communication and task → connect / calibrate / verify / log.**

The application will use **interchangeable hardware adapters** for original manufacturer boards and the open-source microcontroller firmware, plus device-specific drivers for register access, communication and calibration methods. Digital measurement readout is preferred where available; precision calibration may still require external reference measurements.

**[Full development roadmap and task checklist](docs/development-roadmap.md)** · **[Microcontroller firmware, native USB boards and communication protocols](docs/firmware-and-hardware.md)**

## Project status

**v0.5.6 — Compact technical project overview, related tools, direct manufacturer / SSC launcher and local Elmos module.** Shared UI extraction and hardware validation remain open. Serve the repository root as a static site; for GitHub Pages select main / root. The launcher is generated static HTML; navigation works without JavaScript. Regenerate with `node scripts/build-launcher.mjs` after modifying the catalog. Generate the styled documentation pages from the original Markdown with `node scripts/build-docs.mjs`. Run `node tests/docs.test.mjs`, `node tests/static-launcher.test.mjs`, `node tests/launcher.test.mjs`, `node tests/model.test.mjs`, `node tests/core.test.mjs`, `node tests/bridge.test.mjs`, and `node tests/integration.test.mjs`. Refresh the pinned Elmos package with `node scripts/build-elmos.mjs` only after reviewing the source revision.
