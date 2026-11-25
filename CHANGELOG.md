# Changelog

## v0.5.6 — App version and change timestamps
- Show declared web-app version, latest Main commit date and relative age on every manufacturer tile.
- Refresh public source metadata on page load and every 15 minutes; retain known values on errors and label fallback status. No release or deployment date inferred.
- Preserve status, links, favicon and independent calibration apps.

## v0.5.5 — Explicit development status
- Elmos tile marked functional beta with incomplete validation; all six other tiles marked under development and not ready for use.
- Update the project overview and status descriptions; preserve new-tab navigation and favicon.
- No changes to individual calibrators or firmware.

## v0.5.4 — SSC favicon
- Add a dedicated integrated-circuit/signal icon in SVG and 32 px PNG format; explicitly reference it on Studio and documentation pages to avoid inheriting the account-level favicon.
- No changes to calibration apps or navigation.

## v0.5.3 — New-tab launcher
- All seven manufacturer cards open their web app in a new browser tab using native links with noopener and noreferrer. The Studio remains open.
- Documentation navigation and calibration apps unchanged.

## v0.5.2 — Direct manufacturer web apps
- All seven manufacturer cards link directly to their independent calibration web apps; model selection takes place inside the target app.
- Keep simulation status explicit for six new apps and retain the pinned local Elmos reference separately.
- Update documentation and route checks; calibration and firmware unchanged.

## v0.5.1 — Technical documentation pages
- Format project documentation, architecture, roadmap, hardware/firmware and manufacturer references as static HTML with shared Studio styling, navigation, section links, tables and checklists.
- Preserve Markdown source documents and their original language. Generate with `node scripts/build-docs.mjs`.
- No calibration or firmware changes.

## v0.5.0 — Engineering interface
- Consolidate the landing page design system, typography, layout and status treatment. Add a technical block diagram, consistent module cards and responsive light/dark styling.
- Preserve technical copy, direct SSC navigation and static rendering; no calibration or firmware changes.

## v0.4.2 — Technical visual refinement
- Add a conceptual signal-chain diagram, local SVG icons, compact technical cards and status accents.
- Keep technical descriptions, direct SSC navigation and removed jump links unchanged. Responsive light/dark styling; no new browser dependencies.
- No changes to calibration modules or firmware.

## v0.4.1 — Technical project overview
- Remove redundant introduction jump links and closing call-to-action.
- Use compact technical descriptions, function lists and project status; retain direct SSC navigation and related project links.
- No changes to calibration modules or firmware.

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
