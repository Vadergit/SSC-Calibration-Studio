# DIY protocol v3
USB CDC 115200, ASCII, CR command, CRLF response with ACK/NACK. One outstanding command. HELLO identifies RENESAS-SSC-3 ESP32_C3 or PRO_MICRO. CMA28 / CMB78 / CMC78 enter command mode for ZSC31014 / ZSC31050 / ZSC31150. DUMP reads EEPROM, RAM reads volatile memory (50/150), RAW reads D8/D9 ADC words, NOM requests normal operation, DF reads 31014 output, OFF removes supply. No arbitrary writes. No automatic retries. Both sketches are identical portable sources. Original board uses separate native terminal commands. Hardware qualification pending.

ZCM10 / ZCM15: power cycle and ZACwire command mode, expected A5. ZDUMP: 14/20 bytes incl. A5 and per-byte parity. ZRAWSTART: 31010 only after unity-gain dump; ZRAW: three bytes; ZNOM: request normal operation. No permanent write commands on DIY. Timings require physical tests.

RAMWaaVVVV: laboratory volatile RAM write, address aa restricted to 00–07 for 31050/31150. Response is the read-back 16-bit word. No NVM write. Browser requires saved backup and explicit consent.

Protocol identity updated to RENESAS-SSC-3.1. AFEGcc changes only the model-specific volatile gain bitfield (code 00–0C) and returns the read-back word. Requires lab consent and prior backup in browser. No EEPROM changes.
