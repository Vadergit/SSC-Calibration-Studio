# SSC Calibration Studio

**SSC Calibration Studio** is an open-source project for a universal, manufacturer-independent, browser-based calibration and configuration platform for **Sensor Signal Conditioners (SSCs)**.

## Project idea

The goal is to provide a single, consistent web interface for calibrating, configuring, programming and diagnosing SSC-based sensors across different chip families and manufacturers.

Key goals:

- **Manufacturer-independent:** Start with Elmos and expand support to other common SSCs, including devices from IDT/Renesas.
- **Affordable hardware:** Use readily available Arduino-compatible microcontrollers as communication interfaces wherever technically possible, without requiring a proprietary evaluation board.
- **Modular architecture:** Keep the common user interface separate from SSC-specific communication protocols, registers and calibration procedures.
- **Measurement and logging:** Record calibration data, raw values and diagnostic information. Where supported by the SSC, prefer direct digital readout to reduce errors introduced by external analogue measurement and conversion chains.
- **Accessible and extensible:** Make the project publicly available and easy to extend with support for additional SSCs.

Depending on the accuracy required, an external reference instrument may still be necessary for calibration or validation.

## Starting point: Elmos E703.11

The existing [ELMOS E703.11 Calibration Web App](https://github.com/Vadergit/ELMOS-E703.11-Calibration-Web-App) serves as the initial reference and starting point for this universal project.

## Project status

**Early concept / planning.** The detailed architecture, feature list and supported SSC models will be defined as the project evolves.
