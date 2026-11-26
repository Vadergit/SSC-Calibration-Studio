# MAX40109 adapter protocol v4

Identical portable source for ESP32-C3 and ATmega32U4 Pro Micro (3.3 V/8 MHz or 5 V/16 MHz; select actual version). USB CDC nominal 115200 8N1, ASCII lines terminated by LF, CR ignored; one request at a time.

| Command | Successful reply |
|---|---|
| HELLO | MAX40109-RO 4 |
| INFO | OK INFO ESP32C3 4 I2C,ROM,RAM,MTP,SHADOW or OK INFO PROMICRO 4 I2C,ROM,RAM,MTP,SHADOW |
| PROBE 4D | OK PROBE 4D |
| READ 06 | OK 06 1234 |
| PATCH 04 003F 0006 | OK PATCH 04 0006 |
| DUMP | OK DUMP followed by 69 four-digit words |
| ROM | OK ROM followed by 16 hex digits |
| SHADOW 08 1234 | OK SHADOW 08 1234 |

ERR + message on failure. PATCH volatile register write with readback; SHADOW experimental pressure words only. No permanent MTP burn, full 1-Wire register transport or PLC. ROM is single-drop and needs DQ path. I2C variant only.

## Original MAX40109 EV Kit with external adapter

[Official EVSYS guide Rev.2](https://www.analog.com/media/en/technical-documentation/user-guides/max40109evsys.pdf), table 1 pp.3–4. EVSYS consists of EV Kit + MAX32666FTHR. Power off, remove J3/J7 shunts, connect external adapter to SDA/DIN, SCL/SCLK, DGND. For DQ access remove J12 and use suitable external pull-up and level translator. J12 2–3 is I2C-only setting; never drive DQ low against a hard high connection. Do not connect two bus masters. Verify isolator supply and ground connections for board revision, follow manufacturer power and output-mode instructions. No power switching. Do not power VDDHV via GPIO.

| Signal | ESP32-C3 | Pro Micro | EV Kit |
|---|---|---|---|
| SDA | GPIO4 | D2 | SDA/DIN |
| SCL | GPIO5 | D3 | SCL/SCLK |
| DQ optional | GPIO6 | D4 | DQ (J12 removed) |
| GND | GND | GND | DGND |

Verify pull-up voltage and use suitable bidirectional level shifting; ESP32-C3 and 3.3 V Pro Micro are not 5 V tolerant. AVR internal pull-ups may be enabled by Wire; use translator if voltages differ. Stock MAX32666FTHR USB protocol not documented in the available guide; no native OEM USB driver. MAX1454EVSYS is a different interface and remains unsupported. External mode does not require replacing OEM firmware. Hardware validation pending.

In the web app, explicitly confirm the DQ pull-up and removal of the fixed-high connection before ROM commands or experimental DSP operations that use ROM identity. This confirmation is not an electrical test.

## Protocol v5

HELLO returns MAX40109-RO 5; INFO includes protocol 5 (same capabilities string). SCAN returns OK SCAN with zero or more 7-bit I2C addresses, isolated bus only. FRESH clears pressure-ready flag 0x0100, waits bounded time for new flag, reads ADC_P; hardware verification required. OWREAD aa uses ROM match and read function 0x33, length minus one; experimental standard slots, compare with I2C before reliance. No full 1-Wire write path. DQ wiring confirmation mandatory. Neither ADC freshness nor timing is validated on hardware.

Protocol v5 also permits SHADOW 00–27h (all 20 coefficient words as 40 halfwords). Configuration, scratchpad, lock and address words remain protected. The DSP candidate uses signed raw-code input convention; alternative formats explicitly selectable. Permanent burn is only planned, no execution command. MTP count, status and protected-range checks are mandatory for the preview.
