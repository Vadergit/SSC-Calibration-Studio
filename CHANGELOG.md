# Changelog

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
