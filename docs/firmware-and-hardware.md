# Supported hardware and universal microcontroller firmware

[← Project overview](../README.md) · [← Development roadmap](development-roadmap.md)

## Goal

Support **both original manufacturer calibration/evaluation boards and one reusable, open-source microcontroller firmware** as interchangeable interfaces between the web application and supported SSCs. The universal firmware should be portable across suitable Arduino-compatible boards, ESP32 variants and other small microcontrollers.

The **web application** owns the user interface, SSC selection, calibration workflow, calculations, configuration profiles and logging/exports. A **hardware-adapter layer** communicates either with an original manufacturer board or with the universal microcontroller firmware. The **microcontroller firmware** provides electrical communication, protocol transport, reliable timing, acquisition and error reporting. Where strict device timing requires local actions, those actions run inside firmware. The microcontroller is not intended to duplicate the full calibration application.

The ambition is to cover **all interfaces required by supported SSCs** through suitable hardware adapters, not to claim every board can implement every protocol or every original board is already compatible.

## Original manufacturer calibration / evaluation boards

**Original manufacturer boards are a first-class supported hardware target, not something users must replace.** Users who already own such a board should be able to connect it to the same web application and use the relevant calibration features after its adapter has been implemented and verified.

| Manufacturer | Original hardware candidate | Integration status |
| --- | --- | --- |
| Elmos | E703.11 / SSP3 evaluation and communication hardware (exact interface/version to confirm) | Planned; existing standalone Elmos web application is the reference |
| Renesas / IDT | SSC Communication Board (SSC-CB), with matching sensor-specific evaluation board | Planned; verify each supported chip family |
| TI, Melexis, NOVOSENSE, Jiuhao and ADI/Maxim | Manufacturer-specific evaluation/programming hardware, to be identified and validated | Research / planned |

Integrate original boards through their available host interfaces (for example USB CDC/serial, USB HID or vendor-specific USB). **Web Serial, WebUSB and WebHID are alternatives only where the browser and device permit access**; if a board requires proprietary drivers or cannot be accessed from a browser, investigate a separately installed local bridge/adapter. Do not assume that every vendor board can be driven directly by the browser. The project should not flash or overwrite the original board firmware as a prerequisite.

The hardware adapter should expose common operations (connect, identify, capabilities, read, write, execute, stream samples and report errors) and indicate which SSCs, voltages and commands a connected board supports. Keep **verification status per SSC + hardware adapter combination**, because working on one board does not prove support on every other board.

## Candidate microcontroller platforms

| Platform / example | Native USB | Notes / planned support |
| --- | --- | --- |
| RP2040 (e.g. Raspberry Pi Pico) | Yes | Good inexpensive reference platform; USB CDC, flexible GPIO and PIO for timing-sensitive transports |
| ESP32-S2 / ESP32-S3 | Yes | USB device support; candidates for native USB CDC and additional interfaces |
| ESP32-C3 | USB Serial/JTAG | Usable for serial communication, but USB capabilities differ from S2/S3; assess limitations |
| ATmega32U4 (Arduino Micro / Pro Micro / Leonardo) | Yes | Practical native-USB Arduino option; resource constraints may limit advanced features |
| Arduino boards using SAMD21 | Yes | Additional native-USB platform candidate |
| ATtiny and other low-resource MCUs | Model-dependent | **Do not assume native USB.** Many ATtiny parts require an external USB bridge; portable protocol code can still be used if resources and timing allow |
| Classic ESP32-WROOM / many Arduino Uno or Nano variants | Typically via USB-UART bridge | May still work as serial bridges, but do not meet the *native USB* preference by themselves |

**Initial DIY targets: ESP32-C3 SuperMini and Arduino Pro Micro.** Other platforms remain optional candidates; expand only when a protocol or electrical requirement warrants it. Board-specific firmware support and actual SSC compatibility still require validation.

## Interface and protocol roadmap

Protocol support is modular; an SSC-specific profile selects the correct physical interface, signalling, command sequence and calibration algorithm.

| Interface | Planned role | Notes |
| --- | --- | --- |
| I²C | Read/write registers, settings and digital measurements | Configurable addressing and bus speed |
| SPI | Read/write registers and digital measurement streams | Modes, clock speeds and chip-select handling |
| One-wire / OWI / SWI | Vendor-specific single-wire programming and data | **Not one universal protocol**; timing and framing vary |
| ZACwire | Renesas/IDT communication and programming where applicable | Separate timing-aware transport module |
| UART / asynchronous serial | Device-specific communications | Baud rate and framing configurable |
| SENT | Read digital sensor output where applicable | Receiving/decoding may need hardware-timed capture |
| LIN | Communicate with supported SSCs where applicable | Requires the proper LIN physical-layer transceiver |
| PWM / frequency output | Read/diagnose output signals where applicable | Timer or capture hardware as required |
| Analog voltage / current | Optional independent output validation | Requires suitable external ADC, DMM or measurement front end, not just digital SSC communication |

## Proposed communication architecture

```text
Web application (browser)
  ├─ Common UI, logging, calibration and SSC profiles
  └─ Common hardware adapter API
       ├─ Original manufacturer board adapter
       │    └─ Manufacturer board over supported USB interface
       │         (or local bridge if required)
       │
       └─ Universal USB bridge adapter
            └─ Arduino / ESP32 / RP2040 firmware
                 ├─ I²C / SPI / UART transport
                 ├─ OWI / SWI / ZACwire timing engines
                 └─ Optional SENT / LIN / measurement modules
       │
       ▼
Selected SSC and sensor
```

The browser must not generate timing-critical bus edges directly. Firmware should execute time-critical operations, timestamp samples when needed and buffer data before sending it to the application. The web app should remain independent of the particular board and reveal only features supported by the selected **original manufacturer board or universal firmware**.

## Original board integration checklist

- [ ] Inventory the original calibration/evaluation board models and firmware revisions to support per manufacturer.
- [ ] Identify available host USB interfaces, drivers, pinouts, voltage requirements and supported SSC families.
- [ ] Define a consistent hardware-adapter API with identification, capabilities and error handling.
- [ ] Build an adapter for the existing Elmos evaluation hardware.
- [ ] Build an adapter for the Renesas / IDT SSC-CB and verify supported family variants.
- [ ] Evaluate other manufacturer board adapters as device families are added.
- [ ] Verify read, write, configuration, calibration and data logging with actual SSCs on original hardware.
- [ ] Show confirmed SSC × board compatibility and limitations in the web application.
- [ ] Keep existing manufacturer board firmware unchanged unless a separate supported update path is explicitly required.

## Firmware development checklist

- [ ] Select and document one inexpensive **native-USB reference board**.
- [ ] Define a **board-independent firmware architecture** with hardware abstraction and optional protocol modules.
- [ ] Implement USB CDC connection with device identification, firmware version and capabilities reporting.
- [ ] Define a stable host-to-firmware command protocol with clear request/response IDs, errors and timeouts.
- [ ] Implement configurable GPIO / pin mapping and safe bus initialisation.
- [ ] Implement I²C transport and verify read/write with a supported SSC.
- [ ] Implement SPI transport and verify read/write with a supported SSC.
- [ ] Implement generic UART and any required asynchronous communication modes.
- [ ] Implement timing-sensitive one-wire interfaces individually (OWI, SWI, ZACwire as required).
- [ ] Add SENT and LIN modules if required by the chosen SSCs and supported by hardware.
- [ ] Add data acquisition with timestamps, buffering and streaming to the browser.
- [ ] Provide robust disconnection, timeout, short-circuit/error indication and recovery behaviour.
- [ ] Document power supply, logic voltage limits, level shifting, bus pull-ups and external transceivers.
- [ ] Reuse the same web application with more than one supported microcontroller.
- [ ] Test protocol implementations against real devices; document supported protocol/board combinations.
- [ ] Consider firmware flashing/updating from the host as a later enhancement.

## Target outcome

A user can connect **either a supported original manufacturer calibration board or a supported universal microcontroller bridge**, choose an SSC, select its adapter and protocol in the web application and use the **same web workflow** to communicate, calibrate and log data. Board-specific capabilities and limitations are shown in the UI, without needing a separate calibration application for every hardware platform.
