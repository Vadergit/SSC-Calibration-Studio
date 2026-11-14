# Universal microcontroller firmware and hardware

[← Project overview](../README.md) · [← Development roadmap](development-roadmap.md)

## Goal

Develop **one reusable, open-source microcontroller firmware** that acts as a universal USB-to-SSC interface. It should be portable across suitable Arduino-compatible boards, ESP32 variants and other small microcontrollers, rather than being tied to one manufacturer's evaluation board.

The **web application** owns the user interface, SSC selection, calibration workflow, calculations, configuration profiles and logging/exports. The **microcontroller firmware** provides electrical communication, protocol transport, reliable timing, acquisition and error reporting. Where strict device timing requires local actions, those actions run inside firmware. The microcontroller is not intended to duplicate the full calibration application.

The ambition is to cover **all interfaces required by the supported SSCs**, not to claim every microcontroller can implement every protocol simultaneously or without extra circuitry.

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

**Hardware selection remains open.** The initial reference board should be cheap, widely available and suitable for timing-critical one-wire protocols. Additional targets can be added without redesigning the web interface.

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
  ├─ Common UI, logging and calibration workflow
  ├─ Manufacturer / chip profiles and high-level commands
  └─ USB (initially Web Serial + USB CDC when supported)
       │
       ▼
Universal microcontroller firmware
  ├─ Versioned USB command API and device capabilities
  ├─ I²C / SPI / UART modules
  ├─ One-wire / OWI / SWI / ZACwire timing engines
  ├─ Optional SENT / LIN / PWM capture modules
  └─ GPIO, voltage control and measurement peripherals
       │
       ▼
Selected SSC and sensor
```

The browser must not generate timing-critical bus edges directly. Firmware should execute time-critical operations, timestamp samples when needed and buffer data before sending it to the application. The web app should remain independent of the particular board and reveal only features supported by that firmware/board.

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

A user can choose a supported microcontroller, connect it through USB, select an SSC inside the web application and use the **same web workflow** to communicate, calibrate and log data. Hardware-specific pin and protocol limitations are shown in the UI rather than requiring a separate application for every board.
