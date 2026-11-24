# Studio architecture — v0.2.0

One website and browser tab, no iframe. The first integration is a same-origin local page under modules/elmos. It deliberately preserves the original classic-script/DOM architecture rather than pretending it is already an ES-module calibration engine. The Studio transfers adapter, protocol and task. The local header starts the original task and calls the existing guided USB API only on a user click. Return is blocked while USB or a protected/unfinished operation is active. Existing safeguards remain upstream; no new NVM commands are added. SPI still requires expert settings. The two DIY boards are distinguished by the original BRIDGE_INFO capabilities before sensor access.

## Version management
The Elmos source is pinned to fbd88d422821151b22a440421133a66fb9983c03 (v0.7.172). The local snapshot contains its runtime, documentation and firmware files; no changes to the standalone repo. Rebuild with node scripts/build-elmos.mjs after changing the reviewed source revision; integration patch fails if its anchors change. Test before committing a refreshed snapshot. No automatic import from upstream main. Because GitHub Pages project sites share an origin, existing Elmos browser storage/permissions may be shared with the standalone app; do not run both on the same port simultaneously. No storage migration performed.

## Component boundaries
- packages/core: common selection contract, module version validation and reference error functions. Future common UI, reports and graphs must migrate with regression and hardware parity tests. Existing Elmos views still use their own implementations.
- src/modules: versioned registry and supported adapter/protocol/task matrix. Device-specific code remains independent.
- packages/bridge: shared read-only handshake parser and future firmware interface; existing Elmos firmware remains pinned with the Elmos module, not yet universal across vendors.
- packages/renesas: standalone-development scaffold, no driver or hardware claim.
- modules/elmos: distributable local copy of the original app plus a minimal Studio adapter.

## Separate repositories
Planned: SSC-Calibration-Core, SSC-Universal-Bridge, Renesas-Calibration-Web-App. The packages are arranged to permit independent development and later extraction; repository creation is not required for building Studio today. Device modules use explicit releases, not moving branches.

## Release gates
Run node tests/model.test.mjs, node tests/core.test.mjs, node tests/bridge.test.mjs and node tests/integration.test.mjs, plus upstream regression suite and real hardware tests. Browser/USB/NVM parity must be verified on each adapter before production use. Original board firmware is not changed. Unsupported SSCs remain planning entries. No native Renesas commands yet.
