# Shared Studio UI v0.1.0

Settings interaction controller and canonical ELMOS stylesheet components. Integrated modules use local versioned copies, never live remote JavaScript. The original standalone repositories are not modified. Current migration scope: settings, shared style links, pinned source integration. Remaining common components: guided state machine, connection shell, charts, verification, archive and reports. Hardware and firmware remain chip-specific. Browser storage uses the GitHub Pages origin; only connect one instance to a physical device at once. No hardware release status is changed by this migration.

Shared CSS aliases are generated only when source styles are byte-identical. Two incompatible base revisions remain separate intentionally. The central direct SSC selector mirrors all six native catalogs; Elmos remains the reference module.
