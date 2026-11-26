# 0.7.0-lab

- Offline AFE planning, fixed-point and CRC-8 calculators; profile-based offline dump decode.
- Live recording for real I2C ADC and individual PWM output samples; source separation.
- Verification plot with tolerance and metrics in reports.
- Lab test checklist; no hardware programming release.

# 0.6.0-preview

- Shared PWM bridge source for ESP32-C3 and Pro Micro; platform handshake and adapter selection.
- Pro Micro direct I/O / Timer1 and conservative baud limit.
- Original board passive COM diagnosis and RX export, no native commands.
- All hardware validation remains pending.

# 0.5.0-preview

- Generic PWM One-Wire firmware and local manufacturer profile import.
- Memory byte/bitfield viewer, double read and digital packet decode.
- Unconfirmed startup and parity disable operations; no OTP writing.
- Private candidate profile stored separately; firmware and physical validation pending.

# 0.4.0-preview

- Web Serial und eigene I2C-Lesebridge (ESP32-C3 / Pro Micro, Quellcode).
- Benutzerprofil für Registerlesezugriffe, Identitätsvergleich, doppelte Speicherlesung, JSON-Dump und Diff.
- Profilgesteuerte Live-Werte und manuell bestätigte ADC_S-Übernahme.
- Keine bestätigten JHM-Registeradressen und kein Schreibpfad; keine Hardwarevalidierung.

# 0.3.0-preview

- Original Elmos master styles, header, eight task tiles and eleven-step guided navigation.
- Separate connection/settings panels, compact/classic-style toggle, preset cards.
- Manual bridge calculation, hex inspector, output scaling, alarm notes, logging, independent verification with hysteresis, local archive.
- No hardware access; all calculations are generic offline models.

# 0.2.0-preview

- Initial guided offline calibration and temperature matrix.
