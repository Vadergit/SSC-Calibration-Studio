# Development roadmap

[← Project overview](../README.md)

## Intended calibration workflow

1. Open the Studio and select the manufacturer or SSC; open its calibrator directly.
2. Inside the calibrator, select either a supported original manufacturer board or a DIY bridge, then the SSC communication protocol and task.
3. Establish communication in the selected module and read the current configuration and measurement data. Offline tasks may skip connection once supported.
4. Configure calibration points, perform measurements and calculate compensation coefficients.
5. Write the relevant settings and nonvolatile coefficients to the SSC, where supported.
6. Verify output accuracy and check diagnostics.
7. Log raw and corrected measurements, then export calibration results.

The Elmos E703.11 web application is the starting point for UI and workflow reuse. Specific device features vary, and the software must present only actions supported by the selected SSC.

## Current implementation

v0.5.2 provides direct manufacturer links to seven independent web apps. Elmos supports hardware communication; the other six currently offer simulation only. The local pinned Elmos module, reusable core helpers and bridge contract remain available. Shared calibration views, universal firmware and manufacturer-specific hardware drivers remain open. See [Studio architecture](studio-architecture.md).

## Software structure

- **Common web UI:** connection, device selection, configuration, calibration, diagnostics, charts and logging.
- **Device drivers:** manufacturer/model-specific register maps, commands and calibration algorithms.
- **Hardware adapters:** original manufacturer calibration/evaluation boards and open-source microcontroller bridges, presenting a consistent communication API to the web application.
- **Transport adapters:** I²C, SPI, one-wire/OWI/ZACwire, SENT/LIN where applicable and feasible, provided by the selected hardware.
- **Microcontroller bridge:** an affordable **alternative** to the original manufacturer boards, using interchangeable Arduino-compatible/ESP32/other firmware with native USB preference and timing-critical protocol modules; the web app remains responsible for calibration workflow and orchestration. See [universal firmware and hardware requirements](firmware-and-hardware.md).

## Shared development checklist

- [ ] Extract reusable web UI and workflow components from the Elmos prototype
- [ ] Define a common SSC driver API (identify, connect, read, write, calibrate, validate, log)
- [ ] Define a hardware-independent communication API between web application, original manufacturer boards and universal firmware.
- [ ] Identify original calibration/evaluation boards, their USB interfaces and supported SSC families.
- [ ] Build and test manufacturer-board adapters (Web Serial / WebUSB / WebHID or a separate local bridge where necessary).
- [ ] Define microcontroller-to-browser communication protocol (USB / Web Serial, where supported)
- [ ] Implement reusable I²C, SPI and one-wire/ZACwire transport adapters as required
- [ ] Develop and test universal microcontroller firmware for selected native-USB boards (see [firmware checklist](firmware-and-hardware.md#firmware-development-checklist))
- [ ] Add device profiles for register maps, output modes and calibration algorithms
- [ ] Add raw/corrected measurement logging and export
- [ ] Document wiring, voltage requirements, hardware safety and device-specific limitations
- [ ] Test each supported SSC with real hardware and separately record verified combinations of SSC and original board / universal bridge before marking support complete

## Verification criteria

Mark a device checkbox on its [manufacturer page](../README.md#manufacturers-and-planned-ssc-support) complete only after communication, reading, writing, calibration and logging have been validated on actual hardware to the extent supported by the device. Complete a group checkbox only after the checked models in that group have passed the required tests.
