"""NOVOSENSE original-board diagnostic transport. No permanent writes."""
import argparse
import json
import threading
import time
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
STATIC = {".html", ".css", ".js", ".mjs", ".json", ".md", ".ino", ".txt", ".svg", ".png", ".ico"}
def crc8(data):
    c = 0
    for b in data:
        c ^= b
        for _ in range(8):
            c = ((c << 1) ^ (7 if c & 128 else 0)) & 255
    return c

def frame(address, function, payload=b""):
    body = bytes((address, len(payload)+4, function)) + bytes(payload)
    return body + bytes((crc8(body),))

def response(raw, address, function, expected=None):
    if len(raw) < 5 or len(raw) != raw[1] or raw[0] != address or raw[2] != function:
        raise ValueError("Response address, length or function mismatch")
    if crc8(raw[:-1]) != raw[-1]:
        raise ValueError("CRC8 mismatch")
    if raw[3] != 0:
        raise ValueError("Board error 0x%02X" % raw[3])
    payload = raw[4:-1]
    if expected is not None and len(payload) != expected:
        raise ValueError("Unexpected payload size")
    return payload

def read_payload(reg, count, mode):
    if not (isinstance(reg,int) and isinstance(count,int) and 1<=count<=16 and
            ((reg==2 and count==1) or (reg>=6 and reg+count-1<=11) or
             (reg==0x30 and count==1) or (reg>=0xa1 and reg+count-1<=0xd9))):
        raise ValueError("Register range not allowed")
    if mode not in (0,1):
        raise ValueError("Output mode must be 0–5 V or 4–20 mA")
    # AN-12-0014 table, EVM function 0x17, experimental field interpretation.
    return bytes((reg,count,mode))

class Transport:
    def __init__(self, port, kind, address=0x80, mode=0):
        self.port_name=port
        self.kind=kind
        self.address=0xe1 if kind=="evm" else address
        self.mode=mode
        self.serial=None
        self.log=[]
        self.lock=threading.RLock()

    def record(self, direction, data):
        self.log.append({"time":time.time(),"direction":direction,"hex":bytes(data).hex(" ")})
        self.log=self.log[-2000:]

    def open(self):
        import serial
        if self.serial is not None:
            raise ValueError("Board port already open")
        try:
            self.serial=serial.Serial(self.port_name,250000,bytesize=8,
                parity=serial.PARITY_MARK if self.kind=="evm" else serial.PARITY_NONE,
                stopbits=1,timeout=.08,write_timeout=1,
                xonxoff=False,rtscts=False,dsrdtr=False)
            return self.version()
        except Exception:
            self.close()
            raise

    def close(self):
        p,self.serial=self.serial,None
        if p is not None:
            p.close()

    def exchange(self, function, payload=b"", expected=None, timeout=2):
        p=self.serial
        if p is None:
            raise ValueError("Board not connected")
        data=frame(self.address,function,payload)
        self.record("TX",data)
        try:
            p.reset_input_buffer()
            if self.kind=="evm":
                # Real MARK/SPACE, not 8N1 emulation. USB adapter/OS timing must be validated.
                p.parity="M"
                p.write(data[:1])
                p.flush()
                p.parity="S"
                p.write(data[1:])
                p.flush()
            else:
                p.write(data)
                p.flush()
            deadline=time.monotonic()+timeout
            raw=bytearray()
            while time.monotonic()<deadline:
                chunk=p.read(1)
                if not chunk:
                    continue
                if not raw and chunk[0]!=self.address:
                    self.record("RX_DISCARD",chunk)
                    continue
                raw.extend(chunk)
                if len(raw)==2 and raw[1]<4:
                    raise ValueError("Invalid frame length")
                if len(raw)>=2 and len(raw)==raw[1]:
                    self.record("RX",raw)
                    if bytes(raw)==data:
                        raw.clear()
                        continue
                    return response(raw,self.address,function,expected)
            self.record("RX_PARTIAL",raw)
            raise TimeoutError("Board response timeout; check parity, RS485 and adapter timing")
        except Exception:
            # Never blindly retry state-changing actions.
            raise

    def version(self):
        payload=self.exchange(1 if self.kind=="evm" else 0)
        if not payload:
            raise ValueError("Empty version reply")
        return {"board":self.kind,"address":self.address,"versionBytes":list(payload),"port":self.port_name,"mode":self.mode}

    def call(self, data):
        with self.lock:
            action=data.get("action")
            if action=="open":
                if data.get("board")!=self.kind:
                    raise ValueError("Select the same board as the local service")
                return self.open()
            if action=="close":
                self.close()
                return {"closed":True}
            if action=="version":
                return self.version()
            if action=="log":
                return {"log":self.log}
            if self.kind!="evm":
                raise ValueError("32CAL: version diagnostic only; channel/register commands not released")
            if action=="enter":
                if data.get("confirm")!="POWER_CYCLE_TEST_DUT":
                    raise ValueError("Explicit power-cycle confirmation required")
                reply=self.exchange(0x23,timeout=4)
                return {"reply":list(reply),"permanent":False}
            if action=="read":
                payload=read_payload(data.get("reg"),data.get("count"),self.mode)
                return {"bytes":list(self.exchange(0x17,payload,expected=data["count"]))}
            raise ValueError("Operation blocked")

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--serial",help="COM3 or /dev/ttyUSB0")
    parser.add_argument("--board",choices=("evm","cal32"),default="evm")
    parser.add_argument("--address",type=lambda x:int(x,0),default=0x80)
    parser.add_argument("--output",choices=("voltage","current"),default="voltage")
    parser.add_argument("--port",type=int,default=8765)
    parser.add_argument("--list",action="store_true")
    args=parser.parse_args()
    if args.list:
        from serial.tools.list_ports import comports
        for p in comports(): print(p.device,p.description)
        return
    if not args.serial or not 0x80<=args.address<=0xf0:
        parser.error("Specify --serial and valid MCU address")
    transport=Transport(args.serial,args.board,args.address,int(args.output=="current"))
    origin="http://127.0.0.1:%d"%args.port
    class Handler(BaseHTTPRequestHandler):
        def allowed_host(self):
            return self.headers.get("Host")==urlsplit(origin).netloc
        def send_json(self,status,value):
            data=json.dumps(value).encode()
            self.send_response(status)
            self.send_header("Content-Type","application/json")
            self.send_header("Cache-Control","no-store")
            self.send_header("X-Content-Type-Options","nosniff")
            self.end_headers()
            self.wfile.write(data)
        def do_GET(self):
            if not self.allowed_host():
                self.send_error(403);return
            name=urlsplit(self.path).path.lstrip("/") or "index.html"
            p=(ROOT/name).resolve()
            if ROOT not in p.parents or any(x.startswith(".") for x in Path(name).parts) or p.suffix not in STATIC or not p.is_file():
                self.send_error(404);return
            data=p.read_bytes()
            import mimetypes
            mime="text/javascript" if p.suffix==".mjs" else mimetypes.guess_type(p.name)[0] or "text/plain"
            self.send_response(200)
            self.send_header("Content-Type",mime)
            self.send_header("Cache-Control","no-store")
            self.send_header("X-Content-Type-Options","nosniff")
            self.end_headers()
            self.wfile.write(data)
        def do_POST(self):
            if not self.allowed_host() or self.path!="/api/adapter" or self.headers.get("Origin")!=origin or self.headers.get("Content-Type")!="application/json":
                self.send_error(403);return
            try:
                n=int(self.headers.get("Content-Length","0"))
                if not 0<n<=1024: raise ValueError("Request size")
                body=json.loads(self.rfile.read(n))
                result=transport.call(body)
                self.send_json(200,{"ok":True,"result":result})
            except Exception as e:
                self.send_json(400,{"ok":False,"error":str(e)})
    http=ThreadingHTTPServer(("127.0.0.1",args.port),Handler)
    print("Open",origin,"in Chrome/Edge. Close official GUI before connecting.")
    try:
        http.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        transport.close()
        http.server_close()
if __name__=="__main__":
    main()
