#include <Arduino.h>
#include <Wire.h>
// MAX40109 Rev.3. Isolated I2C bus; external level matching, DQ high.
// No permanent programming or charge pump activation.
#if defined(ARDUINO_ARCH_ESP32)
constexpr uint8_t DQ=6;
#define BOARD_ID "ESP32C3"
#elif defined(__AVR_ATmega32U4__)
constexpr uint8_t DQ=4;
#define BOARD_ID "PROMICRO"
#else
#error Unsupported MCU
#endif
void printHex(uint16_t n,uint8_t digits){for(int i=digits-1;i>=0;--i){uint8_t d=(n>>(4*i))&15;Serial.write((uint8_t)(d<10?'0'+d:'A'+d-10));}}

uint8_t client=0x4d; char line[96]; size_t pos=0; bool overflow=false;
struct Reg{uint8_t a,n;uint16_t mask;};
const Reg regs[]={{0,2,0x600f},{2,2,0},{4,1,63},{5,1,7},{6,2,0},{8,2,0},{10,1,15},{11,2,1023},{13,1,7},{14,1,15},{15,2,0},{17,2,0},{19,1,31},{20,1,7},{21,1,3},{26,2,65535},{28,1,1},{30,1,15},{162,1,0},{163,1,0},{164,1,0},{167,2,0},{169,2,0}};
const Reg* lookup(unsigned a);
const Reg* lookup(unsigned a){for(const auto &r:regs)if(r.a==a)return &r;return nullptr;}
bool rd(uint8_t a,uint8_t n,uint16_t &v){Wire.beginTransmission(client);Wire.write(a);if(Wire.endTransmission(false))return false;if(Wire.requestFrom(client,n)!=n)return false;v=Wire.read();if(n==2)v=(v<<8)|Wire.read();return true;}
bool wr(uint8_t a,uint8_t n,uint16_t v){Wire.beginTransmission(client);Wire.write(a);if(n==2)Wire.write(uint8_t(v>>8));Wire.write(uint8_t(v));return Wire.endTransmission()==0;}
void error(const char* e){Serial.print("ERR ");Serial.println(e);}
bool dump(uint16_t *d){uint16_t c,ctrl;if(!rd(0,2,c)||(c&0x8000)||!rd(0xa2,1,ctrl)||ctrl!=0)return false;if(!wr(0xa2,1,0x10))return false;bool ok=true;for(uint8_t i=0;i<69;i++){if(!wr(0xa4,1,i)||!rd(0xa7,2,d[i])){ok=false;break;}}if(!wr(0xa2,1,0))ok=false;return ok;}
bool parseHex(const char* p,unsigned n,unsigned &v){v=0;for(unsigned i=0;i<n;i++){char c=p[i];unsigned d=c>='0'&&c<='9'?c-'0':c>='A'&&c<='F'?c-'A'+10:99;if(d>15)return false;v=v*16+d;}return true;}
void dqLow(){digitalWrite(DQ,LOW);pinMode(DQ,OUTPUT);}
void dqRelease(){pinMode(DQ,INPUT);}
bool owReset(){dqRelease();delayMicroseconds(5);if(!digitalRead(DQ))return false;dqLow();delayMicroseconds(500);dqRelease();delayMicroseconds(70);bool presence=!digitalRead(DQ);delayMicroseconds(430);return presence&&digitalRead(DQ);}
void owWriteBit(bool bit){dqLow();delayMicroseconds(bit?5:65);dqRelease();delayMicroseconds(bit?65:5);}
bool owReadBit(){dqLow();delayMicroseconds(3);dqRelease();delayMicroseconds(10);bool bit=digitalRead(DQ);delayMicroseconds(57);return bit;}
void owWrite(uint8_t b){for(int i=0;i<8;i++)owWriteBit((b>>i)&1);}
uint8_t owRead(){uint8_t b=0;for(int i=0;i<8;i++)if(owReadBit())b|=1<<i;return b;}
uint8_t crc8(const uint8_t *b,size_t n){uint8_t c=0;while(n--){uint8_t x=*b++;for(int i=0;i<8;i++){bool z=(c^x)&1;c>>=1;if(z)c^=0x8c;x>>=1;}}return c;}
bool readRom(uint8_t *b){if(!owReset())return false;owWrite(0x33);for(int i=0;i<8;i++)b[i]=owRead();return b[0]==0x76&&crc8(b,8)==0;}
// Rev.3 p.49: match ROM, READ 33h, address, length-1, data bytes.
// Experimental transport: standard LSB-first slots; field framing/byte order must be checked on hardware.
bool owRegRead(uint8_t a,uint8_t n,uint16_t &v){uint8_t uid[8];if(!readRom(uid)||!owReset())return false;owWrite(0x55);for(auto b:uid)owWrite(b);owWrite(0x33);owWrite(a);owWrite(n-1);v=owRead();if(n==2)v=(v<<8)|owRead();return true;}
bool freshPressure(uint16_t &v){uint16_t status;if(!rd(2,2,status))return false;if(!wr(2,2,0x0100))return false;uint32_t start=millis();do{if(!rd(2,2,status))return false;if(status&0x0100)return rd(6,2,v);delay(2);}while(millis()-start<1800);return false;}
bool shadowWrite(uint8_t a,uint16_t value,uint16_t &actual){uint16_t c,ctrl;if(a>39||!rd(0,2,c)||(c&0x8000)||!rd(0xa2,1,ctrl)||ctrl!=0)return false;if(!wr(0xa2,1,0x10))return false;bool ok=wr(0xa4,1,a)&&wr(0xa5,2,value)&&rd(0xa7,2,actual)&&actual==value;if(!wr(0xa2,1,0))ok=false;return ok;}
void command(){unsigned a,m,v;uint16_t old,actual;
 if(!strcmp(line,"HELLO")){Serial.println(F("MAX40109-RO 5"));return;}
 if(!strcmp(line,"INFO")){Serial.println(F("OK INFO " BOARD_ID " 5 I2C,ROM,RAM,MTP,SHADOW"));return;}
 if(!strcmp(line,"SCAN")){Serial.print(F("OK SCAN"));for(uint8_t addr=8;addr<120;addr++){Wire.beginTransmission(addr);if(!Wire.endTransmission()){Serial.write(32);printHex(addr,2);}}Serial.println();return;}
 if(!strcmp(line,"FRESH")){if(!freshPressure(actual)){error("fresh pressure timeout");return;}Serial.print(F("OK FRESH "));printHex(actual,4);Serial.println();return;}
 if(strlen(line)==9&&!strncmp(line,"OWREAD ",7)&&parseHex(line+7,2,a)){auto r=lookup(a);if(!r||!owRegRead(a,r->n,actual)){error("1-Wire register read");return;}Serial.print(F("OK OWREAD "));printHex(a,2);Serial.write(32);printHex(actual,4);Serial.println();return;}
 if(strlen(line)==8&&!strncmp(line,"PROBE ",6)&&parseHex(line+6,2,a)&&a>=8&&a<=119){client=a;if(!rd(0,2,old)){error("I2C no response");return;}Serial.print(F("OK PROBE "));printHex(a,2);Serial.println();return;}
 if(strlen(line)==7&&!strncmp(line,"READ ",5)&&parseHex(line+5,2,a)){auto r=lookup(a);if(!r||!rd(a,r->n,old)){error("read");return;}Serial.print(F("OK "));printHex(a,2);Serial.write(32);printHex(old,4);Serial.println();return;}
 if(!strcmp(line,"ROM")){uint8_t b[8];if(!readRom(b)){error("ROM presence/family/CRC");return;}Serial.print("OK ROM ");for(auto v:b)printHex(v,2);Serial.println();return;}
 if(strlen(line)==14&&!strncmp(line,"SHADOW ",7)&&line[9]==' '&&parseHex(line+7,2,a)&&parseHex(line+10,4,v)){if(!shadowWrite(a,v,actual)){error("shadow write/readback; power cycle required if uncertain");return;}Serial.print(F("OK SHADOW "));printHex(a,2);Serial.write(32);printHex(actual,4);Serial.println();return;}
 if(!strcmp(line,"DUMP")){uint16_t d[69];if(!dump(d)){error("MTP read; check mode/configuration");return;}Serial.print("OK DUMP");for(auto w:d){Serial.write(32);printHex(w,4);}Serial.println();return;}
 if(strlen(line)==18&&!strncmp(line,"PATCH ",6)&&line[8]==' '&&line[13]==' '&&parseHex(line+6,2,a)&&parseHex(line+9,4,m)&&parseHex(line+14,4,v)){auto r=lookup(a);if(!r||!m||(m&~r->mask)||(v&~m)||!rd(a,r->n,old)){error("mask or read");return;}uint16_t target=(old&~m)|v;if((a==0&&(target&0x6000)==0x6000)||(a==4&&(target&63)>19)||(a==30&&(target&15)==1)){error("reserved setting");return;}if(!wr(a,r->n,target)||!rd(a,r->n,actual)||actual!=target){error("RAM write/readback; state uncertain");return;}Serial.print(F("OK PATCH "));printHex(a,2);Serial.write(32);printHex(actual,4);Serial.println();return;}
 error("unsupported");}
void setup(){Serial.begin(115200);dqRelease();
#if defined(ARDUINO_ARCH_ESP32)
 Wire.begin(4,5,100000);Wire.setTimeOut(100);
#else
 Wire.begin();Wire.setClock(100000);Wire.setWireTimeout(100000,true);
#endif
}
void loop(){while(Serial.available()){char c=Serial.read();if(c=='\r')continue;if(c=='\n'){line[pos]=0;if(overflow)error("length");else command();pos=0;overflow=false;}else if(pos<sizeof(line)-1)line[pos++]=c;else overflow=true;}}
