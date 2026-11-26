# SSC Calibration Studio UI contract

Reference: ELMOS-E703.11-Calibration-Web-App, commit 5e9f6d821b2899c7c153e4742257152407cf69a0.
The master currently owns the expected user interaction. Chip-specific register and transport code is not part of this contract.

## Implemented and tested in Renesas
- Settings: toggle via gear; inside clicks do not close; outside click closes in capture phase and preserves the target click; Escape closes and returns focus; aria-expanded follows visibility.
- Shared controller: ui-settings.mjs, no dependency on SSC model or serial communication.
- Browser regression checks in tests/browser-smoke.mjs.

## Recommended migration (not implemented yet)
1. Extract versioned common shell, CSS tokens and layout, settings, guided wizard/navigation, connection panel, charts, verification, archive and dialogs into a shared UI package. ELMOS remains the behavioural reference; do not copy hardware register logic.
2. Give each manufacturer a capabilities/adapter interface describing real device modes, limits, readings, calibration and persistence operations.
3. Run the same Playwright interaction contract against every app, with mocked hardware. Cover outside clicks, Escape, navigation/abort, responsive layout, light/dark, plan selection, live graph, validation, verification and archive.
4. Add screenshot comparisons at fixed viewports and version-pinned shared dependencies. Migrate incrementally, retaining hardware regression tests for each chip.
