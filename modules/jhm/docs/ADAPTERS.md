# Adapter architecture (v0.6.0-preview)

| Adapter | PC transport | Chip transport | Status |
|---|---|---|---|
| ESP32-C3 SuperMini | USB Serial | generic PWM / I2C (separate sketches) | source, untested |
| Arduino Pro Micro ATmega32U4 | USB Serial | generic PWM / I2C (separate sketches) | source, untested |
| Original Jiuhao boards | COM diagnosis if exposed by USB | manufacturer board protocol | passive RX only, no read/write driver |

The DIY pulse sketch is shared. ESP32-C3 uses GPIO4 SO / GPIO5 load switch enable. Pro Micro uses D4 SO / D5 load switch enable and Timer1 (prescaler 8), direct port I/O and open-drain emulation. 8 kBd maximum on Pro Micro pending oscilloscope validation; 32 kBd is explicitly rejected. Use external pull-up, correct voltage translation, sensor supply/load switch, common ground. Never apply programming voltage. On startup use external pull-down on EN for power-off state. Do not use this pinout as a substitute for the actual sensor wiring diagram. The I2C sketch is separate (ESP GPIO4 SDA/GPIO5 SCL; Pro Micro hardware Wire pins). Firmware HELLO returns PULSE-BRIDGE 2 plus the platform; select matching adapter in browser.

## Original board

Do not flash the original board. For a board exposing COM, close manufacturer software, disconnect sensor/programming voltage, choose actual baud rate, open passive receive diagnosis; USB VID/PID (when reported by Web Serial), timestamps and bytes are exported as JSON. Opening a COM port can toggle control lines; even passive diagnosis is not electrically risk-free. No commands sent. This is not a protocol decoder, cannot capture another program's TX/RX or test chip communication. For active driver development capture both host TX and board RX with an appropriate serial monitor, USB capture or manufacturer SDK; include board model/revision, USB VID/PID, settings, and a successful version query and read-only transaction. Do not capture or replay OTP writes. If the interface is HID or proprietary USB rather than COM, Web Serial is not suitable.

## Validation

No compiled binaries or physical tests in this change. Before enabling hardware: compile both targets, verify handshake, waveform and turn-around, start window and ACK/parity; validate each model profile and compare two reads against official software. Validate native board driver separately. No permanent writes implemented.

## Shared DIY host protocol

USB 115200, newline-delimited ASCII. PWM: `HELLO` → `PULSE-BRIDGE 2 ESP32-C3` or `PULSE-BRIDGE 2 PRO-MICRO`; `CAP baud parity low0 start low1 gap count`; `MEM baud parity low0 start low1 gap offMs startDelay enter read ack count`. Responses `OK HEX` or `ERR code`. Only local reviewed profiles may be used; MEM contains explicit device-specific commands and is not intrinsically safe with an incorrect profile. I2C: `HELLO` → `JHM-BRIDGE 1 I2C-READ`; `READ id addressHex prefixHex count`, responses `OK id HEX` or `ERR id code`. Separate firmware images; not the manufacturer's protocol.
