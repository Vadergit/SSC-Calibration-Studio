/*
 * JHM generic I2C READ bridge, protocol v1. NOT a validated JHM programmer.
 * ESP32-C3: compile with USB CDC on boot; SDA GPIO4, SCL GPIO5.
 * Pro Micro: hardware Wire SDA/SCL. Check board voltage and level shifting.
 * No sensor power control, automatic scan, arbitrary write or OTP pulse.
 * A prefix is optional and is transmitted immediately before repeated START.
 * Only use prefixes documented as non-mutating register selectors.
 */
#include <Arduino.h>
#include <Wire.h>
#include <stdlib.h>
#include <string.h>
static char line[96]; static size_t used=0; static bool overflowed=false;
static void err(unsigned long id,const char* code){Serial.print("ERR ");Serial.print(id);Serial.print(' ');Serial.println(code);}
static bool num(const char* s,int base,unsigned long &out){if(!s||!*s)return false;for(const char* p=s;*p;p++){if(!((*p>='0'&&*p<='9')||(base==16&&((*p>='A'&&*p<='F')||(*p>='a'&&*p<='f')))))return false;}char* e;out=strtoul(s,&e,base);return *e==0;}
static void process(char* cmd){
 if(strcmp(cmd,"HELLO")==0){Serial.println("JHM-BRIDGE 1 I2C-READ");return;}
 char* op=strtok(cmd," ");char* sid=strtok(NULL," ");char* sa=strtok(NULL," ");char* prefix=strtok(NULL," ");char* sl=strtok(NULL," ");unsigned long id=0,addr=0,len=0;
 if(!num(sid,10,id)||id==0||!op||strcmp(op,"READ")||!num(sa,16,addr)||addr<8||addr>119||!prefix||!num(sl,10,len)||len<1||len>32||strtok(NULL," ")){err(id,"BAD_COMMAND");return;}
 uint8_t bytes[2];size_t count=0;
 if(strcmp(prefix,"-")){size_t size=strlen(prefix);if(size!=2&&size!=4){err(id,"BAD_PREFIX");return;}for(size_t i=0;i<size;i+=2){char h[3]={prefix[i],prefix[i+1],0};unsigned long b;if(!num(h,16,b)){err(id,"BAD_PREFIX");return;}bytes[count++]=(uint8_t)b;}}
 if(count){Wire.beginTransmission((uint8_t)addr);Wire.write(bytes,count);if(Wire.endTransmission(false)!=0){err(id,"I2C_SELECTOR");return;}}
 size_t got=Wire.requestFrom((uint8_t)addr,(uint8_t)len);
 if(got!=len){while(Wire.available())Wire.read();err(id,"SHORT_READ");return;}
 uint8_t data[32];for(size_t i=0;i<len;i++){int v=Wire.read();if(v<0){err(id,"SHORT_READ");return;}data[i]=(uint8_t)v;}
 Serial.print("OK ");Serial.print(id);Serial.print(' ');for(size_t i=0;i<len;i++){if(data[i]<16)Serial.print('0');Serial.print(data[i],HEX);}Serial.println();
}
void setup(){Serial.begin(115200);
#if defined(ARDUINO_ARCH_ESP32)
 Wire.begin(4,5,100000);Wire.setTimeOut(100);
#else
 Wire.begin();Wire.setClock(100000);
 #if defined(WIRE_HAS_TIMEOUT)
 Wire.setWireTimeout(100000,true);
 #endif
#endif
}
void loop(){while(Serial.available()){char c=(char)Serial.read();if(c=='\r')continue;if(c=='\n'){if(overflowed)err(0,"TOO_LONG");else{line[used]=0;process(line);}used=0;overflowed=false;}else if(used<sizeof(line)-1&&!overflowed)line[used++]=c;else overflowed=true;}}
