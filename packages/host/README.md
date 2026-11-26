# Local original-board services

The pinned vendor-specific local services remain responsible for physical protocol and SDK calls. Studio now retains the TI USB2ANY Python host and Renesas DLL reference tools, and serves shared public JavaScript/CSS at `/packages/core/` and `/packages/ui/` when launching the native Melexis, NOVOSENSE or TI loopback host from a complete Studio checkout. No SDK binary is included. Start the original host per its module documentation; it still requires the documented installed SDK or serial device. This is a software integration change, not hardware validation.
