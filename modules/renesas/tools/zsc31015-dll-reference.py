"""Windows x86 reference runner for uploaded ZMDCalMathLib_dlite.dll (2009 build).
No hardware or EEPROM access. Do not substitute the newer LiteMathLib ABI: this DLL
internally converts percent and degrees. Run with 32-bit Python on Windows.
"""
import argparse, ctypes as C, hashlib, json, os
from pathlib import Path
EXPECTED = "d1aba6614a35aa781c12357a84f77d6f65d4fef2b86c94c77bb03b3de0144d58"
def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("dll",type=Path)
    p.add_argument("output",type=Path)
    a=p.parse_args()
    if os.name!="nt" or C.sizeof(C.c_void_p)!=4:
        p.error("Windows and 32-bit Python required")
    path=a.dll.resolve(strict=True)
    sha=hashlib.sha256(path.read_bytes()).hexdigest()
    if sha!=EXPECTED:
        p.error("Unexpected DLL build; ABI must be verified separately")
    dll=C.WinDLL(str(path))
    I,D=C.c_int32,C.c_double
    PI,PD=C.POINTER(I),C.POINTER(D)
    count=getattr(dll,"_CoefficientCount@0")
    count.argtypes=[];count.restype=I
    n=count()
    if n!=11:
        raise RuntimeError("Unexpected coefficient count")
    calc=getattr(dll,"_CalculateCoefficients@32")
    calc.argtypes=[PI,I,I,PD,PD,PD,PD,I];calc.restype=I
    solve=getattr(dll,"_GetCorrectedBridge@24")
    solve.argtypes=[PI,D,D,I];solve.restype=D
    modes=[
      ("linear",3,[(0,0),(1,0)]),
      ("tk0",35,[(0,0),(1,0),(0,1)]),
      ("tke",67,[(0,0),(1,0),(1,1)]),
      ("bridge",7,[(0,0),(.5,0),(1,0)]),
      ("combined",99,[(0,0),(1,0),(0,1),(1,1)]),
      ("tk0Bridge",39,[(0,0),(.5,0),(1,0),(0,1)]),
      ("combinedBridge",103,[(0,0),(.5,0),(1,0),(0,1),(1,1)]),
      ("quadraticOffset",115,[(0,0),(1,0),(0,1),(1,1),(0,2)]),
      ("quadraticGain",107,[(0,0),(1,0),(0,1),(1,1),(1,2)])]
    result=[]
    for mode,mask,top in modes:
        for sign in [-1,1]:
            pts=[dict(rawPercent=20+60*x+sign*(.15*t+.06*t*t+.12*t*x+.05*t*t*x+.3*x*(1-x)),targetPercent=10+80*x,rawC=[19,44,69][t],targetC=[25,55,85][t]) for x,t in top]
            arr=lambda k:(D*len(pts))(*(v[k] for v in pts))
            out=(I*n)()
            rc=calc(out,len(pts),mask,arr("rawPercent"),arr("targetPercent"),arr("rawC"),arr("targetC"),0x20)
            predictions=[solve(out,v["rawPercent"],v["rawC"],0x20) for v in pts] if rc==0 else []
            result.append(dict(mode=mode,mask=mask,sign=sign,points=pts,returnCode=rc,coefficients=list(out),predictedPercent=predictions))
    a.output.write_text(json.dumps(dict(sha256=sha,vectors=result),indent=2),encoding="utf-8")
if __name__=="__main__":main()
