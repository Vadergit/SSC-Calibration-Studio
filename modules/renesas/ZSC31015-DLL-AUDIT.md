# ZSC31015 original files and reference audit
Uploaded DLL, header and evaluation ZIP match the LFS SHA-256s. DLL is PE32 x86,
MSVCR90/MSVCP90 dependency, dated 2009. Static export and disassembly review:
_CoefficientCount@0 returns 11; _CalculateCoefficients@32 uses percent and Celsius
input with internal conversion (unlike the newer LiteMathLib rev1.60 API);
_GetCorrectedBridge@24 performs internal conversion too. The old header exposes
the separate calc2pt, calc3pt, calc4pt, calc5pt routines. No Windows executable or DLL
was run here (x86 execution unsupported in local container).
A Windows 32-bit reference runner is provided, but has not been executed.
The preview module solves all nine documented point topologies using the datasheet
and internal Mathcad continuous model, quantizes register fields and returns a
command preview. Synthetic forward/inverse self-consistency tests are not independent
DLL verification. TSETL uses the documented upper-seven-bit relation; Mathcad text
has a different scale; resolve against DLL/hardware vectors before programming.
Negative digital gain, clipping/saturation and bit-exact internal rounding are not
implemented by this preview. No hardware writing is enabled. Manufacturer binary
files are not redistributed. Firmware and guided hardware workflow still pending.
