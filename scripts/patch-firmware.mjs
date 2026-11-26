// Fix compiler compatibility without altering the pin assignment or command protocol.
import {replaceOnce} from './patch-elmos.mjs';
const rules={
  "ti": {
    "path": "firmware/esp32c3_pga300/esp32c3_pga300.ino",
    "replacements": [
      [
        "constexpr int TX=4,RX=5,ACT=6;",
        "constexpr int OWI_TX=4,OWI_RX=5,ACT=6;"
      ],
      [
        "owi.begin(RATE,SERIAL_8N1,RX,TX)",
        "owi.begin(RATE,SERIAL_8N1,OWI_RX,OWI_TX)"
      ]
    ]
  },
  "jhm": {
    "path": "firmware/pulse_bridge/pulse_bridge.ino",
    "replacements": [
      [
        "struct Config{unsigned baud,odd,z,s,o,gap;};",
        "struct Config{unsigned baud,odd,z,s,o,gap;};\n// Explicit declarations prevent Arduino's generated prototypes from preceding Config.\nstatic void send(const uint8_t *data,unsigned n,const Config& c);\nstatic bool recvByte(uint8_t &out,const Config& c,uint32_t timeout);\nstatic bool readBytes(uint8_t *data,unsigned n,const Config& c,uint32_t timeout);\nstatic bool valid(const Config& c);"
      ],
      [
        "unsigned start=micros();bool found=false;",
        "uint32_t start=micros();bool found=false;"
      ]
    ]
  }
};
export function patchFirmware(id,path,content){
 const rule=rules[id];if(!rule||rule.path!==path)return content;
 for(const [before,after] of rule.replacements)content=replaceOnce(content,before,after);
 return content;
}
