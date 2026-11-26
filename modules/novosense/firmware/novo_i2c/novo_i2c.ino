// NOVOSENSE I2C bridge v5 – guarded laboratory RAM/EEPROM operations for NSA2860X only; no OTP/lock.
#include <Arduino.h>
#include <Wire.h>
#if defined(ARDUINO_ARCH_ESP32)
const int SDA_PIN=8, SCL_PIN=9;
#endif
char line[100]; size_t used=0; bool overflow=false;
bool allowed(uint8_t addr,uint8_t reg,int n){
 if(n<1||n>24)return false;
 int end=int(reg)+n-1;
 if(!((addr>=8&&addr<=119)||addr==127))return false;
 return (reg==1&&end==1)||(reg==2&&end==2)||(reg>=6&&end<=11)||(reg==0x30&&end==0x30)||(reg>=0xA0&&end<=0xD9);
}
bool readBytes(uint8_t addr,uint8_t reg,uint8_t *out,int n){
 Wire.beginTransmission(addr);Wire.write(reg);
 if(Wire.endTransmission(false)!=0)return false;
 if(Wire.requestFrom((uint8_t)addr,(uint8_t)n)!=(uint8_t)n){while(Wire.available())Wire.read();return false;}
 for(int i=0;i<n;i++){if(!Wire.available())return false;out[i]=Wire.read();}return true;
}
bool writeByte(uint8_t a,uint8_t r,uint8_t v){Wire.beginTransmission(a);Wire.write(r);Wire.write(v);return Wire.endTransmission()==0;}
void reply(unsigned long id,const char *status,const char *body){Serial.print(id);Serial.print(' ');Serial.print(status);Serial.print(' ');Serial.println(body);}
bool parseHex(const char *str,uint8_t *out,int n){if(strlen(str)!=size_t(n*2))return false;for(int i=0;i<n;i++){char x[3]={str[i*2],str[i*2+1],0};char *end;unsigned long v=strtoul(x,&end,16);if(end!=x+2||v>255)return false;out[i]=(uint8_t)v;}return true;}
bool sameBytes(const uint8_t *a,const uint8_t *b,int n){return memcmp(a,b,n)==0;}
bool patchAllowed(unsigned int r,int n,const uint8_t *old,const uint8_t *next){
 if(r==0xa1&&n==1)return ((old[0]^next[0])&0x8f)==0 && (!(next[0]&32)||(next[0]&64));
 return (r==0xa7&&n==2)||(r==0xa9&&n==16)||(r==0xb9&&n==7)||(r==0xce&&n==1);
}
bool ready2860(uint8_t a,bool unlocked){uint8_t part=0,status=0,mode=0;return readBytes(a,0xd9,&part,1)&&(part&127)==1&&(!unlocked||!(part&128))&&readBytes(a,2,&status,1)&&(status&2)&&!(status&0xfc)&&readBytes(a,0x30,&mode,1)&&mode==3;}
bool hashShadow(uint8_t a,uint32_t &hash){hash=2166136261UL;uint8_t bytes[16];for(int r=0xa1;r<=0xd9;){int n=min(16,0xda-r);if(!readBytes(a,(uint8_t)r,bytes,n))return false;for(int i=0;i<n;i++)hash=(hash^bytes[i])*16777619UL;r+=n;}return true;}
void handle(char *s){
 unsigned long id=0;char cmd[8]={0};unsigned int a=0,r=0;int n=0;char extra=0;
 if(sscanf(s,"%lu %7s",&id,cmd)!=2)return;
 if(!strcmp(cmd,"HELLO")){reply(id,"OK","NOVO-I2C-5");return;}
 if(!strcmp(cmd,"INFO")){
#if defined(ARDUINO_ARCH_ESP32) && defined(CONFIG_IDF_TARGET_ESP32C3)
 reply(id,"OK","ESP32-C3");
#elif defined(__AVR_ATmega32U4__)
 reply(id,"OK","ATmega32U4");
#else
 reply(id,"ERR","UNSUPPORTED_MCU");
#endif
 return; }
 if(!strcmp(cmd,"R")&&sscanf(s,"%lu %7s %x %x %d %c",&id,cmd,&a,&r,&n,&extra)==5&&a<=127&&r<=255&&allowed(a,r,n)){
  uint8_t data[24];if(!readBytes(a,r,data,n)){reply(id,"ERR","I2C_NACK_OR_SHORT");return;}
  char out[49];for(int i=0;i<n;i++)snprintf(out+i*2,3,"%02X",data[i]);reply(id,"OK",out);return;
 }
 // NSA2860X: compare original bytes, allow only gain/polarity/raw bits, no EEPROM program commands.
 unsigned int o0,o1,o2,v0,v1,v2;
 if(!strcmp(cmd,"A")&&sscanf(s,"%lu %7s %x %x %x %x %x %x %x %c",&id,cmd,&a,&o0,&o1,&o2,&v0,&v1,&v2,&extra)==9&&a==0x6d&&o0<256&&o1<256&&o2<256&&v0<256&&v1<256&&v2<256){
  uint8_t part=0,status=0,mode=0,old[3],after[3];
  if(!readBytes(a,0xd9,&part,1)||(part&127)!=1||!readBytes(a,2,&status,1)||!(status&2)||(status&0xfc)||!readBytes(a,0x30,&mode,1)||mode!=3||!readBytes(a,0xa4,old,3)||old[0]!=o0||old[1]!=o1||old[2]!=o2||(v0&15)!=(o0&15)||(v0>>4)>14||(v1&252)!=(o1&252)||(v2&254)!=(o2&254)){reply(id,"ERR","AFE_PRECONDITION");return;}
  bool ok=writeByte(a,0x30,0);
  if(ok)ok=writeByte(a,0xa4,v0)&&writeByte(a,0xa5,v1)&&writeByte(a,0xa6,v2)&&readBytes(a,0xa4,after,3)&&after[0]==v0&&after[1]==v1&&after[2]==v2;
  if(!ok){writeByte(a,0xa4,old[0]);writeByte(a,0xa5,old[1]);writeByte(a,0xa6,old[2]);}
  bool active=writeByte(a,0x30,3);
  if(!ok||!active){reply(id,"ERR","AFE_FAILED_RESTART_TEST_CHIP");return;}
  reply(id,"OK","AFE_RAM");return;
 }
 // Restricted laboratory RAM patch: only documented coefficient blocks, clamp and alarm bits.
 char oldHex[33]={0},newHex[33]={0};
 if(!strcmp(cmd,"W")&&sscanf(s,"%lu %7s %x %x %d %32s %32s %c",&id,cmd,&a,&r,&n,oldHex,newHex,&extra)==7&&a==0x6d&&n>=1&&n<=16){
  uint8_t old[16],next[16],actual[16];
  if(!parseHex(oldHex,old,n)||!parseHex(newHex,next,n)||!patchAllowed(r,n,old,next)||!ready2860(a,true)||!readBytes(a,r,actual,n)||!sameBytes(old,actual,n)){reply(id,"ERR","PATCH_PRECONDITION");return;}
  bool ok=writeByte(a,0x30,0);if(ok){for(int i=0;i<n&&ok;i++)ok=writeByte(a,r+i,next[i]);ok=ok&&readBytes(a,r,actual,n)&&sameBytes(next,actual,n);}
  if(!ok){for(int i=0;i<n;i++)writeByte(a,r+i,old[i]);}
  bool active=writeByte(a,0x30,3);
  if(!ok||!active){reply(id,"ERR","PATCH_FAILED_POWER_CYCLE_REQUIRED");return;}reply(id,"OK","RAM_PATCH_READBACK");return;
 }
 // EEPROM test commit: exact current shadow digest, unlocked, calibrated data mode, no retries.
 unsigned long expected=0;uint32_t observed=0;uint8_t cfg[2],prog=0;
 if(!strcmp(cmd,"P")&&sscanf(s,"%lu %7s %x %lx %c",&id,cmd,&a,&expected,&extra)==4&&a==0x6d){
  if(!ready2860(a,true)||!readBytes(a,0xa5,cfg,2)||(cfg[0]&1)||(cfg[1]&1)||!hashShadow(a,observed)||observed!=(uint32_t)expected){reply(id,"ERR","EEPROM_PRECONDITION");return;}
  if(!writeByte(a,0x30,0x33)||!writeByte(a,0x6a,0x1e)){reply(id,"ERR","EEPROM_STATE_UNKNOWN_DO_NOT_RETRY");return;}
  unsigned long start=millis();bool done=false;while(millis()-start<1600){delay(20);if(readBytes(a,0x6a,&prog,1)&&prog==0){done=true;break;}}
  if(!done){reply(id,"ERR","EEPROM_STATE_UNKNOWN_DO_NOT_RETRY");return;}
  reply(id,"OK","EEPROM_DONE_POWER_CYCLE_REQUIRED");return;
 }
 // Single conversion only. No OTP command or configuration writes.
 if(!strcmp(cmd,"M")&&sscanf(s,"%lu %7s %x %d %c",&id,cmd,&a,&n,&extra)==4&&(a==0x6c||a==0x6d)&&(n==0||n==1)){
  uint8_t sys=0,id1=0,id2=0,current=0;
  if(!readBytes(a,1,&id1,1)||!readBytes(a,0xA4,&id2,1)||id1!=id2||!readBytes(a,0xA5,&sys,1)||(sys&0x80)||!readBytes(a,0x30,&current,1)||(current&8)||((current&7)>2)){reply(id,"ERR","MEASUREMENT_MODE_BLOCKED");return;}
  Wire.beginTransmission((uint8_t)a);Wire.write((uint8_t)0x30);Wire.write((uint8_t)(8|n));if(Wire.endTransmission()!=0){reply(id,"ERR","I2C_NACK");return;}reply(id,"OK","STARTED");return;
 }
 reply(id,"ERR","COMMAND_BLOCKED");
}
void setup(){
 Serial.begin(115200);
#if defined(ARDUINO_ARCH_ESP32)
 Wire.begin(SDA_PIN,SCL_PIN,100000);Wire.setTimeOut(100);
#else
 Wire.begin();Wire.setClock(100000);
 #if defined(WIRE_HAS_TIMEOUT)
 Wire.setWireTimeout(100000,true);
 #endif
#endif
}
void loop(){while(Serial.available()){char c=Serial.read();if(c=='\r')continue;if(c=='\n'){if(!overflow){line[used]=0;handle(line);}used=0;overflow=false;}else if(used<sizeof(line)-1&&!overflow)line[used++]=c;else overflow=true;}}
