# Proposed bridge contract (not firmware yet)
- Identify board and firmware, protocol capabilities, electrical voltage and optional VDD control.
- Versioned request/response IDs, bounded timeouts, explicit protocol selection, read and scoped RAM write, acquisition and diagnostic errors.
- Separate physical transports: Elmos PLC, I2C, SPI, ZACwire; not interchangeable.
- Device-specific nonvolatile write authorisation and protected regions. Never provide an unrestricted universal NVM command. Disconnect, timeout and protocol change revoke authorisation.
- Existing Elmos BRIDGE_INFO protocol remains supported through its original driver. Renesas transport is not implemented or hardware-tested.
