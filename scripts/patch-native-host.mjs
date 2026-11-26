// Preserve native SDK hosts and serve only the public common runtime assets.
import {replaceOnce} from './patch-elmos.mjs';
const specs=[
  [
    "ti",
    "tools/usb2any_bridge.py",
    "ROOT = pathlib.Path(__file__).resolve().parents[1]",
    "        if self.path=='/api/usb2any/session':",
    "        if serve_shared(self, ROOT, self.path): return\n"
  ],
  [
    "melexis",
    "host/server.py",
    "ROOT=Path(__file__).resolve().parents[1]",
    "            if self.path.split('?')[0].startswith('/api/'):",
    "            if serve_shared(self, ROOT, self.path): return\n"
  ],
  [
    "novosense",
    "native/evm_service.py",
    "ROOT = Path(__file__).resolve().parent.parent",
    "            name=urlsplit(self.path).path.lstrip(\"/\") or \"index.html\"",
    "            if serve_shared(self, ROOT, self.path): return\n"
  ]
];
const imports="\nimport sys\nsys.path.insert(0, str(ROOT.parent.parent / 'packages' / 'host'))\nfrom studio_assets import serve_shared\n";
export function patchNativeHost(id,path,content){
 const s=specs.find(x=>x[0]===id&&x[1]===path);if(!s)return content;
 return replaceOnce(replaceOnce(content,s[2],s[2]+imports),s[3],s[4]+s[3]);
}
