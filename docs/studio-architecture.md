# Studio architecture — v0.1.0

## Workflow
Manufacturer → exact SSC → adapter → SSC protocol → task. The connection is opened only by an implemented module after explicit user interaction. Offline tasks must eventually be able to bypass physical connection. The current selection UI is operational but deliberately has no USB access.

## First integration: Elmos
Existing standalone app is the functional reference and remains untouched. Reviewed source: [main snapshot fbd88d4](https://github.com/Vadergit/ELMOS-E703.11-Calibration-Web-App/tree/fbd88d422821151b22a440421133a66fb9983c03), README identifies v0.7.172. The Studio launches the **live official standalone site**, not a pinned copy. Selection is not transferred; users repeat it there. No claims of hardware validation beyond that application's own documentation. Original SSP3: 1-Wire, I2C, SPI; current DIY reference: 1-Wire and I2C, not SPI. This is a declared feature matrix, not a hardware certification.

## Target architecture / migration contract (not yet implemented)
- Shared shell owns selection, theme, navigation, connection status, common task names, reports and reusable views. Device-specific controls are driven by capabilities, not forced into identical algorithms.
- A versioned SSC module should expose manifest (manufacturer, model, supported adapter/protocol pairs, tasks, firmware requirements, version, source revision), createSession(adapter), identify(), readConfiguration(), acquire(), planCalibration(), calculate(), stageRAM(), verify(), prepareNvmDiff(), programConfirmed(), disconnectSafely(). Only applicable operations are exposed; implementations may use different register maps and fitting models.
- Hardware adapter contract: discover/choose port, connect, capabilities, protocol transaction, optional power cycle, disconnect; serialise requests, distinguish sensor failure from USB loss, do not disconnect during protected writes. Use Web Serial / WebUSB / WebHID only where supported; vendor-specific local bridges may be needed.
- ESP32-C3 SuperMini and Pro Micro are the initial common DIY targets. Reuse the existing Elmos bridge concepts but keep vendor-specific timing and NVM protections separate. Elmos PLC is not ZACwire. Existing original board firmware must not be overwritten.
- Shared UI target: task chooser, guided 2/3-point and pressure-temperature calibration, AFE where available, live data, coefficients, verification, output, NVM diff/backup/readback, logging/archive, reports. Preserve optional expert controls, explanations and per-model limitations.
- Common records should include schema version, device and UID if available, module and firmware version, adapter/protocol, timestamp, reference and raw values with explicit units, calibration profile, validation and programming outcome. No fake hardware results.
- NVM safeguards belong to each tested device module. Require identity, backup, validated RAM/result, explicit write confirmation and readback as applicable; never assume universal register layout or unlock commands. No automatic persistent writes.

## Integration process
1. Develop and validate each standalone assistant independently; tag or record a known source commit and test matrix.
2. Add a manifest and adapter integration; migrate UI components incrementally, preserving existing algorithms and safety checks.
3. Run module contract tests, regressions and per-SSC/adapter/protocol hardware tests (including disconnect and NVM failure cases).
4. Only then enable native operations in Studio. Keep the previous working version available and document changes. Do not automatically import an untested main branch.
5. Next candidate: Renesas/IDT ZSC31015 or ZSC31050, then related models as their actual command sets permit.

## Current status
Selection and handoff only; no native driver, hardware access, firmware flashing, shared calibration engine or report implementation yet. All non-Elmos choices are planning entries. The UI cannot establish a real connection or program any sensor. Serve the repository root using GitHub Pages (main / root) or a local static HTTP server; run selection tests with `node tests/model.test.mjs`.
