# SSC Calibration Core
Version 1 contract and selection helpers; reference-error calculation is available for future shared verification views. The pinned Elmos engine still owns its tested calibration, graph, archive and report functions. Move shared features here only with parity tests. This package is self-contained and can be moved to a separate repository without changing its API.

The generic linear reference fit is shared by ADI, JHM, Melexis, NOVOSENSE and TI. This is mathematical fitting only, not a device-specific DSP or NVM coefficient encoder. The packaging step checks the pinned original implementation for exact parity before replacing it with a re-export.
