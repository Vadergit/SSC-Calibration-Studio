# ZSC31014 extended calibration: source audit and release gate

Sources reviewed in Vadergit/ssc-bibliothek, extracted text of:
- `daten/SSC/31014/01_Dokumentation/IDT_ZSC31014_DST_20160120.pdf`, sections 3.6–3.8.
- `daten/SSC/31014/01_Dokumentation/IDT_ZSC31014-Tech-Note-Cal-Sequence-DLL-Descrip-110314_TBR_20160426.pdf`, rev 1.41, sections 2.1–2.3 and 3.
- Renesas ZSC31014 Evaluation Kit Description, Figure 6.1, public manual.

Implemented foundation in zsc31014-calibration-plan.mjs: manufacturer point topology, separate sign/magnitude register codec, raw temperature validation with 11-bit output uncertainty. Tests cover topology, range and preservation of unrelated bits. No changes to the live wizard or EEPROM write permissions.

Outstanding release gate:
1. Obtain actual IDT coefficient calculation spreadsheet v1.2 (Git LFS object, 168448 bytes, sha256 ecc4feffb490bf771929e472ac865a5137cb3bd73b7d919cf11ff6e5a6974473) and/or matching DLL and detailed calibration math note. Current connector returns LFS pointer, not binary. Datasheet gives general equation and sign mapping, not full fixed-point weights for thermal and SOT terms.
2. Implement and validate native solver and bit-exact forward evaluation against multiple independent manufacturer fixtures, including sign, extremes, nonlinear curves, and quantization.
3. Add hardware raw temperature collection with explicit unity temperature registers and restore original factory temperature coefficients when calibrating bridge only. The present 11-bit output in normal operation must not be silently treated as raw ADC.
4. Extend allowed write masks for Config_1 and TSETL only with verified native targets; include backup/restore, unchanged configuration protection, readback and real-device verification.
5. Connect the documented plans to guided UI, add temperature acquisition and verification, test all supported adapters, and only then enable extended modes. No claim of production readiness.

The 2-point path remains unchanged. No inferred thermal coefficient scaling is authorized by this change.
