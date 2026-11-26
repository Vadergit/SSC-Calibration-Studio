import sys, unittest, threading, urllib.request, urllib.error
from pathlib import Path
from http.server import HTTPServer
import importlib.util
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'packages'/'host'))
from studio_assets import resolve_shared

def load(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    mod=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

class SharedAssets(unittest.TestCase):
    def test_allowlist(self):
        root=ROOT/'modules'/'ti'
        self.assertEqual(resolve_shared(root,'/packages/core/calibration.mjs').name,'calibration.mjs')
        self.assertEqual(resolve_shared(root,'/packages/ui/styles/theme.css?v=1').name,'theme.css')
        self.assertIsNone(resolve_shared(root,'/api/usb2any/session'))
        for bad in ['/packages/','/packages/host/studio_assets.py','/packages/core/../host/studio_assets.py','/packages/ui/%2e%2e/core/calibration.mjs','/packages/ui/styles/','/packages/core/package.json']:
            with self.assertRaises(ValueError,msg=bad): resolve_shared(root,bad)
    def test_local_http(self):
        mlx=load('studio_mlx_host','modules/melexis/host/server.py')
        ti=load('studio_ti_host','modules/ti/tools/usb2any_bridge.py')
        for handler,host in [(mlx.handler_for(mlx.Mock(),8765),None),(ti.Handler,'127.0.0.1:8765')]:
            server=HTTPServer(('127.0.0.1',0),handler)
            thread=threading.Thread(target=server.serve_forever,daemon=True)
            thread.start()
            try:
                base='http://127.0.0.1:'+str(server.server_port)
                for path,mime in [('/packages/ui/settings.js','text/javascript'),('/packages/core/calibration.mjs','text/javascript'),('/packages/ui/styles/theme.css','text/css')]:
                    req=urllib.request.Request(base+path,headers={'Host':host} if host else {})
                    with urllib.request.urlopen(req,timeout=3) as response:
                        self.assertEqual(response.headers.get_content_type(),mime)
                        self.assertGreater(len(response.read()),50)
                req=urllib.request.Request(base+'/packages/host/studio_assets.py',headers={'Host':host} if host else {})
                with self.assertRaises(urllib.error.HTTPError) as ctx: urllib.request.urlopen(req,timeout=3)
                self.assertEqual(ctx.exception.code,404)
            finally:
                server.shutdown();server.server_close();thread.join()
if __name__=='__main__': unittest.main()
