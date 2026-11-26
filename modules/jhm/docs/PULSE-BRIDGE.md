# Pulse-width One-Wire bridge

Experimental ESP32-C3 / ATmega32U4 Pro Micro firmware: [sketch](../firmware/pulse_bridge/pulse_bridge.ino). USB CDC on boot, 115200 baud. GPIO4 (ESP32) / D4 (Pro Micro) signal via suitable bidirectional level shifter and external pull-up; GPIO5 / D5 active-high enable of external sensor supply switch. Never connect 5 V directly to GPIO. The bridge does not provide programming voltage. Keep VPP disconnected. Check idle level, discharge time, power rise, startup window and pulse timing with an oscilloscope.

The UI imports local manufacturer profiles. Manufacturer-specific commands, timing and register tables are not bundled in the public repository. The private SSC library has candidate profiles. They are not released hardware drivers. In particular, a missing enterCommand disables memory reads; parity, frame layout and startup sequence require validation. Digital capture does not prove a raw ADC reading. Both operations turn off the external supply afterwards. No live streaming or RAM writes in this driver. OTP programming is intentionally absent.

The generic I2C bridge remains separate. The pulse adapter is not the official EVB and is not compatible with every One-Wire protocol. No physical test or firmware compilation has been performed.

Firmware v2 identifies platform via HELLO. Pro Micro limited to 8 kBd pending scope validation. See [adapter details](ADAPTERS.md).
