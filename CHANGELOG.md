# Changelog

## v0.4.0 — Project overview and related tools
- Explain SSC calibration, motivation, target users, available workflows and long-term goals on the start page.
- Add project roadmap and links to the standalone Elmos application and SensorBridge Emulator, with explicit prototype and hardware-validation status.
- Keep direct, static manufacturer navigation and the existing calibrator unchanged.

## v0.3.1 — Static launcher fix
- Render the complete manufacturer catalog and direct Elmos link into index.html at build time. No browser ES-module loader is required for navigation.
- Native HTML details for planned SSC lists; optional standalone classic script for theme switching.
- Generate from the existing registry and test the committed HTML for parity. Elmos module and firmware unchanged.

## v0.3.0 — Direct calibrator launcher
- Only manufacturer / SSC selection on the Studio start page. Elmos opens directly in the same tab; multi-model manufacturers show their SSC list.
- Adapter, protocol and task selection remain inside the calibrator. No hardware access or selection parameters from the launcher.
- Planned models cannot open an unimplemented calibrator. Existing local module and firmware unchanged.

## v0.2.0 — Local Elmos integration and package boundaries
- Elmos v0.7.172 pinned and delivered locally; same-tab launch, transfer of task and adapter/protocol choices.
- Explicit connection and safe return, board identification check, no automatic initial USB connection.
- Core selection/measurement package, bridge contract and Renesas development scaffold.
- Original Elmos repository untouched; remaining shared UI extraction and hardware validation open.

## v0.1.0 — Studio foundation
- Shared browser-based manufacturer, device, adapter, protocol and task selection.
- Light/dark theme and explicit standalone handoff for Elmos.
- Planning catalog for other SSCs; unsupported hardware operations remain unavailable.
- Initial architecture and selection regression tests.
- No changes to the standalone Elmos repository or firmware.
