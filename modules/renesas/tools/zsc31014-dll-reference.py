"""Produce independent ZSC31014 reference vectors using an installed original DLL.
Run on Windows with matching Python and DLL architecture. Does not touch hardware.
No DLL is distributed by this repository. See ZSC31014 DLL technical note table 2.4.
"""
import argparse
import ctypes as C
import hashlib
import json
import os
from pathlib import Path

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("dll", type=Path, help="Original installed iLiteCalMath.dll")
    ap.add_argument("output", type=Path)
    args = ap.parse_args()
    if os.name != "nt":
        ap.error("Windows with matching Python/DLL architecture is required")
    dllpath = args.dll.resolve(strict=True)
    dll = C.WinDLL(str(dllpath))
    I, D, B = C.c_int32, C.c_double, C.c_bool
    PI, PD = C.POINTER(I), C.POINTER(D)
    def bind(name, suffix, restype, types):
        f = getattr(dll, name, None)
        if f is None:
            f = getattr(dll, "_" + name + "@" + str(suffix))
        f.argtypes, f.restype = types, restype
        return f
    percent = bind("ConvertFromPercent", 12, D, [D,B])
    degrees = bind("ConvertFromDegrees", 8, D, [D])
    calc = bind("CalculateCoefficients", 36, I, [PI,PI,I,I,I,PD,PD,PD,PD])
    solve = bind("SolveBridge", 32, D, [PI,I,D,D,I,I])
    configs = [
        ("linear",3,[(0,0),(1,0)]),
        ("tk0",11,[(0,0),(1,0),(0,1)]),
        ("tke",7,[(0,0),(1,0),(1,1)]),
        ("combined",15,[(0,0),(1,0),(0,1),(1,1)]),
        ("nonlinear",67,[(0,0),(1,0),(.5,0)]),
        ("quadraticOffset",31,[(0,0),(1,0),(0,1),(1,1),(0,2)]),
        ("quadraticGain",47,[(0,0),(1,0),(0,1),(1,1),(1,2)]),
        ("quadraticBoth",63,[(0,0),(1,0),(0,1),(1,1),(0,2),(1,2)]),
        ("full",127,[(0,0),(1,0),(0,1),(1,1),(0,2),(1,2),(.5,0)]),
    ]
    vectors = []
    for mode, mask, topology in configs:
        for sign in [-1,1]:
            rawp, targets, rawt, desiredt = [], [], [], []
            for p,t in topology:
                # Synthetic, deterministic signals; distinguish offset and gain drift.
                temp = [8,36,87][t]
                raw = 15+70*p+sign*(.35*t+.11*t*t+(.18*t+.07*t*t)*p)+sign*.5*p*(1-p)
                rawp.append(percent(raw, True))
                targets.append(percent(10+80*p, False))
                rawt.append(degrees(temp))
                desiredt.append(degrees([5,30,80][t]))
            n=len(topology)
            arr=lambda xs: (D*n)(*xs)
            offset=-6144
            coeff=(I*12)(offset,*([0]*11))
            neg=I(0)
            rc=calc(coeff,C.byref(neg),n,mask,0,arr(rawp),arr(targets),arr(rawt),arr(desiredt))
            pred=[solve(coeff,neg.value,b,t,0,offset) for b,t in zip(rawp,rawt)] if rc==0 else None
            vectors.append(dict(mode=mode,sign=sign,selection=mask,adcOffset=offset,rawBridge=rawp,target=targets,rawTemp=rawt,targetTemp=desiredt,returnCode=rc,coefficients=list(coeff),negativeFlags=neg.value,predicted=pred))
    args.output.write_text(json.dumps({"dllSha256":hashlib.sha256(dllpath.read_bytes()).hexdigest(),"vectors":vectors},indent=2),encoding="utf-8")
    print("Reference vectors:",len(vectors),"; successful:",sum(x["returnCode"]==0 for x in vectors))

if __name__ == "__main__":
    main()
