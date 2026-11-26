"""Local read-only bridge for explicitly mapped Melexis PSF COM methods.
No vendor protocol or COM member names are assumed. Run only on a test bench.
"""
import argparse, json, math, os, statistics, sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
MODELS=('mlx90328','mlx90329')
PARAM_NAMES=('O0','O1','O2','O3','G0','G1','G2','G3','L0','L1','Tpress Select','BRIDGE_SEL','CG','CO','PFLT','SSF')
def finite(x):
    if isinstance(x,bool) or not isinstance(x,(int,float)) or not math.isfinite(x): raise ValueError('Expected finite SDK number')
    return x
def bytes_result(v):
    if not isinstance(v,(bytes,bytearray,list,tuple)) or not 0<len(v)<=65536 or any(type(x)!=int or not 0<=x<=255 for x in v): raise ValueError('SDK must return a byte array (not words)')
    return list(v)
class Mock:
    mode='simulation'
    def __init__(self): self.i=0
    def identity(self,model): return 'SIMULATION-'+model
    def capabilities(self,model): return ['sample','eeprom','ram']
    def sample(self,model):
        self.i+=1
        return {'identity':'SIMULATION-'+model,'raw':5000+self.i%7,'temperature':25.0,'adcT':1234,'dsp':None}
    def memory(self,model,space):
        return {'identity':'SIMULATION-'+model,'bytes':list(range(64 if space=='eeprom' else 16)),'parameters':{}}
class COM:
    mode='sdk-unvalidated'
    def __init__(self,profile):
        if sys.platform!='win32': raise RuntimeError('Melexis COM SDK requires Windows')
        import win32com.client
        self.client=win32com.client
        self.profiles=profile['models']
        self.objects={}
    def spec(self,model):
        if model not in self.profiles: raise ValueError('No SDK profile for '+model)
        p=self.profiles[model]
        if not p.get('progid') or not p.get('identity') or not p.get('model_read') or not p.get('model_expected'): raise ValueError('Profile requires ProgID, actual identity and model readback')
        return p
    def call(self,model,spec):
        p=self.spec(model)
        if model not in self.objects:
            self.objects[model]=self.client.Dispatch(p['progid'])
        if not isinstance(spec,dict) or not isinstance(spec.get('member'),str) or spec['member'].startswith('_'): raise ValueError('Invalid configured SDK member')
        obj=self.objects[model]
        member=getattr(obj,spec['member'])
        if spec.get('property',False):
            if spec.get('args'): raise ValueError('Property cannot have args')
            return member
        return member(*spec.get('args',[]))
    def identity(self,model):
        p=self.spec(model)
        if str(self.call(model,p['model_read']))!=str(p['model_expected']): raise ValueError('Actual chip model does not match profile')
        ident=self.call(model,p['identity'])
        if ident is None or isinstance(ident,bool) or not str(ident).strip(): raise ValueError('No chip identity')
        return str(ident)
    def capabilities(self,model):
        p=self.spec(model)
        self.identity(model)
        return [key for key in ('sample','eeprom','ram') if p.get(key)]
    def sample(self,model):
        p=self.spec(model); before=self.identity(model)
        out={key:finite(self.call(model,spec)) for key,spec in p['sample'].items() if key in ('raw','temperature','adcT','dsp')}
        if 'raw' not in out: raise ValueError('SDK profile needs pressure raw reading')
        if before!=self.identity(model): raise ValueError('Sensor changed during read')
        return {'identity':before,**out}
    def memory(self,model,space):
        p=self.spec(model); before=self.identity(model)
        result=bytes_result(self.call(model,p[space]))
        expected=p.get(space+'_length')
        if type(expected)!=int or expected!=len(result): raise ValueError('Memory length does not match validated profile')
        params={}
        if space=='eeprom':
            for name,spec in p.get('parameters',{}).items():
                if name in PARAM_NAMES: params[name]=finite(self.call(model,spec))
        if before!=self.identity(model): raise ValueError('Sensor changed during read')
        return {'identity':before,'bytes':result,'parameters':params}
def dispatch(backend,op,data):
    model=data.get('model')
    if model not in MODELS: raise ValueError('Unknown model')
    if op=='info': return {'model':model,'mode':backend.mode,'capabilities':backend.capabilities(model),'identity':backend.identity(model)}
    if op=='sample':
        count=data.get('count')
        if type(count)!=int or not 1<=count<=100: raise ValueError('Samples must be 1–100')
        rows=[backend.sample(model) for _ in range(count)]
        ident=rows[0].get('identity')
        if not ident or any(row.get('identity')!=ident for row in rows): raise ValueError('Sensor changed during sample batch')
        return {'model':model,'identity':ident,'mode':backend.mode,'samples':count,**{key:statistics.mean([finite(row[key]) for row in rows]) for key in ('raw','temperature','adcT','dsp') if all(row.get(key) is not None for row in rows)}}
    if op in ('eeprom','ram'): return {'model':model,'mode':backend.mode,**backend.memory(model,op)}
    raise ValueError('Operation not permitted; read-only bridge')
def handler_for(backend,port):
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self,*a,**kw): super().__init__(*a,directory=str(ROOT),**kw)
        def do_GET(self):
            if self.path.split('?')[0].startswith('/api/'): self.send_error(405); return
            # Only the published web assets, no local profiles or SDK files.
            path=self.path.split('?')[0]
            if not (path=='/' or path.startswith('/master/') or path.startswith('/docs/') or path.startswith('/firmware/') or path in ('/index.html','/style.css','/app.mjs','/afe.mjs','/catalog.mjs','/calibration.mjs','/temperature.mjs','/session.mjs','/host-client.mjs','/serial-adapter.mjs','/offline-tools.mjs','/firmware.html')) or '..' in path or '%' in path or '\\' in path: self.send_error(404);return
            super().do_GET()
        def do_POST(self):
            try:
                hosts={f'127.0.0.1:{port}',f'localhost:{port}'}
                if self.headers.get('Host') not in hosts or self.headers.get('Origin') not in {'http://'+x for x in hosts}: raise ValueError('Local same-origin requests only')
                if self.headers.get('Content-Type','').split(';')[0]!='application/json': raise ValueError('Expected JSON')
                size=int(self.headers.get('Content-Length',0))
                if not 0<size<=4096: raise ValueError('Invalid request size')
                if not self.path.startswith('/api/'): raise ValueError('Unknown path')
                data=json.loads(self.rfile.read(size))
                if not isinstance(data,dict): raise ValueError('Invalid request')
                out={'ok':True,**dispatch(backend,self.path[5:],data)};code=200
            except Exception as e: out={'ok':False,'error':str(e)};code=400
            raw=json.dumps(out,allow_nan=False).encode()
            self.send_response(code);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
    return Handler
def main():
    parser=argparse.ArgumentParser();g=parser.add_mutually_exclusive_group(required=True);g.add_argument('--simulate',action='store_true');g.add_argument('--profile',type=Path);parser.add_argument('--port',type=int,default=8765);args=parser.parse_args()
    backend=Mock() if args.simulate else COM(json.loads(args.profile.read_text(encoding='utf-8')))
    print('Mode:',backend.mode,'http://127.0.0.1:'+str(args.port),flush=True)
    HTTPServer(('127.0.0.1',args.port),handler_for(backend,args.port)).serve_forever()
if __name__=='__main__': main()
