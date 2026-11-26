# Original workbook audit (ZSC31014)
The supplied originals were parsed statically. No VBA or executable was run.

- Coefficient Calculation rev 1.2: SHA-256 ecc4feffb490bf771929e472ac865a5137cb3bd73b7d919cf11ff6e5a6974473. Matches the library LFS object. Sheet Coeff_Calc B16:B26 / D18:D25 holds cached register results, G5:I11 holds inputs. Sheet1 VBA calls external iLiteCalMath.dll for ConvertFromPercent, ConvertFromDegrees, CalculateCoefficients, SolveBridge and SolveTemp. No native coefficient algorithm is embedded in the workbook. The file expects the DLL in its own directory.
- AFE Configuration rev 1.10: SHA-256 dad17fe67cef0564991f92c4d98146daf402189c1bce3b933a785a9e2acd40eb. Worksheet ZSC31014_Bridge E11:E19, verified cached values.
- External Temperature Measurement rev 1.0: SHA-256 71e31e82162a975aaa03e02de780b98ab119fbd9bd302427e821db9e2ed34206. Worksheet External_Temp_Adjustment H9:H25, verified cached values. Reference function covers nominal resistances (not tolerance sweep).

The new reference module provides nominal AFE and external temperature calculations and an independent continuous bridge model/fit. Its normalized coefficients are **not EEPROM register codes**. Tests against saved workbook inputs verify the continuous fit only; cached register words are retained separately. They do not establish fixed-point equivalence. No new EEPROM write permissions or hardware calibration modes are enabled.

Remaining dependency: original iLiteCalMath.dll, normally supplied with ZSC31014 Evaluation Software v1.489, or the manufacturer's Detailed Equations for ZSC31014 Math technical note. Obtain independent forward and inverse reference vectors for all modes and quantization boundaries before enabling EEPROM programming. The native wizard, all adapters, and temperature verification still require integration and hardware validation.
