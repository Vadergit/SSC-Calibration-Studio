import unittest
from evm_service import crc8,frame,response,read_payload,Transport
class Protocol(unittest.TestCase):
    def test_vendor_vectors(self):
        self.assertEqual(frame(0xe1,1),bytes.fromhex("E10401F6"))
        self.assertEqual(frame(0xe1,0x23),bytes.fromhex("E1042318"))
        self.assertEqual(frame(0x80,0),bytes.fromhex("8004005F"))
        self.assertEqual(response(bytes.fromhex("E1060100087E"),0xe1,1),b"\x08")
    def test_rejects_crc_status_mismatch(self):
        with self.assertRaises(ValueError): response(bytes.fromhex("E10601000800"),0xe1,1)
        with self.assertRaises(ValueError): response(bytes.fromhex("E1060100087E"),0xe1,2)
        data=bytes.fromhex("E10501F0")
        with self.assertRaises(ValueError): response(data+bytes([crc8(data)]),0xe1,1)
    def test_allowlist(self):
        self.assertEqual(read_payload(0xa1,16,0),bytes([0xa1,16,0]))
        for r,n in [(0x30,2),(0x00,1),(0xd9,2),(0xa0,1)]:
            with self.assertRaises(ValueError):read_payload(r,n,0)
        with self.assertRaises(ValueError):Transport("test","cal32").call({"action":"read","reg":0xa1,"count":1})
        with self.assertRaises(ValueError):Transport("test","evm").call({"action":"enter"})
    def test_transport_mark_space(self):
        class Fake:
            parity=None
            def __init__(self): self.writes=[];self.rx=bytearray.fromhex("E1060100087E")
            def reset_input_buffer(self): pass
            def write(self,data): self.writes.append((self.parity,data))
            def flush(self): pass
            def read(self,n): b=self.rx[:n];del self.rx[:n];return b
        t=Transport("test","evm");t.serial=Fake()
        self.assertEqual(t.version()["versionBytes"],[8])
        self.assertEqual(t.serial.writes,[("M",b"\xe1"),("S",bytes.fromhex("0401F6"))])
if __name__=="__main__": unittest.main()
