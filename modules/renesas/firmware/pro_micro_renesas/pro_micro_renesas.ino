// Experimental read-only Renesas I2C bridge, ESP32-C3 Arduino.
// External active-high load switch on GPIO10. Use switched pull-ups / appropriate level shifting.
#include <Arduino.h>
#include <Wire.h>
#if defined(__AVR_ATmega32U4__)
constexpr int SDA_PIN=2,SCL_PIN=3,PWR_EN=7,ZAC_PIN=4;
const char *board="PRO_MICRO";
#elif defined(CONFIG_IDF_TARGET_ESP32C3)
constexpr int SDA_PIN=4,SCL_PIN=5,PWR_EN=10,ZAC_PIN=6;
const char *board="ESP32_C3";
#else
#error Select ESP32-C3 or ATmega32U4
#endif
bool beginWire(){
#if defined(__AVR_ATmega32U4__)
 Wire.begin();Wire.setClock(100000);Wire.setWireTimeout(20000,true);return true;
#else
 if(!Wire.begin(SDA_PIN,SCL_PIN,100000))return false;Wire.setTimeOut(20);return true;
#endif
}
// ZACwire read-only laboratory transport. Open drain: external switched pull-up.
bool zac=false,zacRaw=false,zacUnity=false;uint8_t zacSize=0;
void zacRelease(){pinMode(ZAC_PIN,INPUT);}
void zacLow(){digitalWrite(ZAC_PIN,LOW);pinMode(ZAC_PIN,OUTPUT);}
bool waitLevel(bool level,uint32_t timeout){uint32_t t=micros();while(bool(digitalRead(ZAC_PIN))!=level){if(uint32_t(micros()-t)>timeout)return false;}return true;}
void zacBit(uint8_t highPercent){zacLow();delayMicroseconds(100-highPercent);zacRelease();delayMicroseconds(highPercent);}
void zacByte(uint8_t v){uint8_t parity=0;for(int i=7;i>=0;i--){uint8_t b=(v>>i)&1;parity^=b;zacBit(b?75:25);}zacBit(parity?75:25);}
void zacSend(uint8_t cmd,uint8_t data){zacBit(50);zacByte(cmd);zacByte(data);zacRelease();}
bool zacReadByte(uint8_t &v,uint32_t timeout){if(!waitLevel(false,timeout))return false;uint32_t start=micros();if(!waitLevel(true,180))return false;uint32_t half=micros()-start;if(half<8||half>100)return false;v=0;uint8_t parity=0;for(uint8_t i=0;i<9;i++){if(!waitLevel(false,400))return false;start=micros();if(!waitLevel(true,260))return false;uint32_t low=micros()-start;if(low*4<half||low>half*2+12)return false;uint8_t bit=low<half;if(i<8){v=(v<<1)|bit;parity^=bit;}else if(bit!=parity)return false;}return true;}
bool zacRead(uint8_t *out,uint8_t count){for(uint8_t i=0;i<count;i++)if(!zacReadByte(out[i],i?500:150000))return false;return true;}
enum Model { NONE, M14, M50, M150 };
Model active=NONE; bool cm=false,powered=false; uint8_t address=0;
void ack(const String &s=""){Serial.print("<ACK>");if(s.length()){Serial.print(" ");Serial.print(s);}Serial.print("\r\n");}
void nack(const char *s){Serial.print("<NACK> ");Serial.print(s);Serial.print("\r\n");}
bool tx(uint8_t a,uint8_t c,int n=0,uint16_t data=0){Wire.beginTransmission(a);Wire.write(c);if(n==1)Wire.write(uint8_t(data));if(n==2){Wire.write(uint8_t(data>>8));Wire.write(uint8_t(data));}return Wire.endTransmission()==0;}
bool rx(uint8_t a,uint8_t *b,size_t n){if(Wire.requestFrom(a,uint8_t(n))!=n){while(Wire.available())Wire.read();return false;}for(size_t i=0;i<n;i++)b[i]=Wire.read();return true;}
String hex(const uint8_t *p,size_t n){const char *h="0123456789ABCDEF";String s;for(size_t i=0;i<n;i++){s+=h[p[i]>>4];s+=h[p[i]&15];}return s;}
void powerOff(){if(powered&&!zac)Wire.end();zacRelease();zac=false;zacRaw=false;zacUnity=false;zacSize=0;pinMode(SDA_PIN,INPUT);pinMode(SCL_PIN,INPUT);digitalWrite(PWR_EN,LOW);powered=false;cm=false;active=NONE;}
bool parseAddr(const String &s,uint8_t &a){if(s.length()!=2||!isxdigit(s[0])||!isxdigit(s[1]))return false;unsigned x=strtoul(s.c_str(),nullptr,16);if(x<8||x>120)return false;a=x;return true;}
bool checked150(uint8_t *b,uint8_t c){return b[3]==c&&uint8_t(b[0]+b[1]+b[2])==255;}
bool wordRead(uint8_t cmd,uint8_t *out){uint8_t b[4];if(!tx(address,cmd,active==M14?2:0))return false;delayMicroseconds(300);if(active==M14){if(!rx(address,b,3)||b[0]!=0x5a)return false;out[0]=b[1];out[1]=b[2];}else{if(!rx(address,b,active==M150?4:2))return false;if(active==M150&&!checked150(b,cmd))return false;out[0]=b[0];out[1]=b[1];}return true;}
bool rawWord(uint8_t cmd,uint8_t *out){uint8_t b[4];if(!tx(address,cmd))return false;delay(250);if(!rx(address,b,active==M150?4:2))return false;if(active==M150&&!checked150(b,cmd))return false;out[0]=b[0];out[1]=b[1];return true;}
void setup(){pinMode(PWR_EN,OUTPUT);digitalWrite(PWR_EN,LOW);zacRelease();Serial.begin(115200);Serial.setTimeout(200);}
void loop(){if(!Serial.available())return;String s=Serial.readStringUntil('\r');s.trim();if(s=="HELLO"){ack(String("RENESAS-SSC-3.1 ")+board);return;}if(s=="OFF"){powerOff();ack();return;}
 if(s=="ZCM10"||s=="ZCM15"){powerOff();delay(50);zac=true;zacSize=s=="ZCM10"?14:20;zacRelease();digitalWrite(PWR_EN,HIGH);powered=true;delayMicroseconds(650);zacSend(0x50,0x90);uint8_t b;if(!zacRead(&b,1)||b!=0xA5){powerOff();nack("ZAC_CM_ACK");return;}cm=true;ack("A5");return;}
 if(zac&&powered){
 if(s=="ZDUMP"&&cm){uint8_t b[20];zacUnity=false;zacSend(0,0);if(!zacRead(b,zacSize)||b[zacSize-1]!=0xA5){nack("ZAC_DUMP");return;}if(zacSize==14){uint16_t g=(b[10]>>5)|(uint16_t(b[11])<<3)|(uint16_t(b[12]&15)<<11);uint8_t t=(b[1]>>6)|((b[2]&63)<<2);zacUnity=g==0x800&&t==0x80&&(b[12]>>4)==(b[0]&15);}ack(hex(b,zacSize));return;}
 if(s=="ZRAWSTART"&&cm&&zacSize==14&&zacUnity){zacSend(0x40,0x10);cm=false;zacRaw=true;zacUnity=false;ack();return;}
 if(s=="ZRAW"&&zacRaw){uint8_t b[3];uint32_t started=micros(),highSince=micros();while(uint32_t(micros()-started)<300000){if(!digitalRead(ZAC_PIN))highSince=micros();else if(uint32_t(micros()-highSince)>400)break;}if(uint32_t(micros()-started)>=300000||!zacRead(b,3)||(b[0]&0xC0)){nack("ZAC_RAW_FRAME");return;}ack(hex(b,3));return;}
 if(s=="ZNOM"&&cm){zacSend(0x40,0x00);cm=false;zacRaw=false;zacUnity=false;ack();return;}
 nack("ZAC_MODE_OR_UNSUPPORTED");return;}
 if(s.startsWith("CM")&&s.length()==5){uint8_t a;char m=s[2];if(!parseAddr(s.substring(3),a)||(m!='A'&&m!='B'&&m!='C')||(m=='A'&&a==0x78)){nack("MODEL_ADDRESS");return;}powerOff();delay(50);if(!beginWire()){nack("WIRE_INIT");return;}digitalWrite(PWR_EN,HIGH);powered=true;active=m=='A'?M14:m=='B'?M50:M150;address=a;
 // First command after power-on must be START_CM on M14/M50.
 delayMicroseconds(active==M14?500:5000);
 uint8_t b[4];bool ok=false;
 if(active==M14){ok=tx(a,0xA0,2,0);delayMicroseconds(300);ok=ok&&rx(a,b,1)&&b[0]==0x5A;}
 if(active==M50){ok=tx(a,0x72);delayMicroseconds(300);ok=ok&&wordRead(0xCF,b)&&((b[0]!=0&&b[0]!=0xFF));}
 if(active==M150){ok=tx(a,0x72,1,0xD1);delayMicroseconds(300);ok=ok&&rx(a,b,4)&&checked150(b,0x72)&&b[0]==0xC3&&b[1]==0x72;}
 if(!ok){powerOff();nack("CM_RESPONSE");return;}cm=true;ack(active==M14?"5A":active==M50?"CM50":"C372");return;}
 if(!powered||active==NONE){nack("NOT_CONNECTED");return;}
 if(s=="DUMP"||s=="RAM"){bool ram=s=="RAM";if(!cm||(ram&&active==M14)){nack("MODE");return;}uint8_t count=active==M50?32:ram?15:20;uint8_t out[64];for(uint8_t i=0;i<count;i++){uint8_t cmd=active==M14?i:(ram?0x10:0x30)+i;if(!wordRead(cmd,out+2*i)){nack("WORD_READ");return;}}ack(hex(out,count*2));return;}
 if(s.startsWith("AFEG")&&s.length()==6){if(!cm||active==M14){nack("AFE_MODE");return;}if(!isxdigit(s[4])||!isxdigit(s[5])){nack("HEX");return;}uint8_t code=strtoul(s.substring(4).c_str(),nullptr,16);if(code>12){nack("GAIN_RANGE");return;}uint8_t a=active==M50?0x19:0x0b,shift=active==M50?0:6,b[2];if(!wordRead(0x10+a,b)){nack("AFE_READ");return;}uint16_t old=(uint16_t(b[0])<<8)|b[1],mask=uint16_t(15)<<shift,value=(old&~mask)|(uint16_t(code)<<shift);if(!tx(address,0x80+a,2,value)){nack("AFE_WRITE");return;}delay(2);if(!wordRead(0x10+a,b)||((uint16_t(b[0])<<8)|b[1])!=value){nack("AFE_VERIFY");return;}ack(hex(b,2));return;}
 if(s.startsWith("RAMW")&&s.length()==10){if(!cm||active==M14){nack("RAM_MODE");return;}for(int i=4;i<10;i++)if(!isxdigit(s[i])){nack("HEX");return;}uint8_t idx=strtoul(s.substring(4,6).c_str(),nullptr,16);uint16_t value=strtoul(s.substring(6).c_str(),nullptr,16);if(idx>7){nack("RAM_ADDRESS_DENIED");return;}if(!tx(address,0x80+idx,2,value)){nack("RAM_WRITE");return;}delay(2);uint8_t b[2];if(!wordRead(0x10+idx,b)||((uint16_t(b[0])<<8)|b[1])!=value){nack("RAM_VERIFY");return;}ack(hex(b,2));return;}
 if(s=="NOM"){if(!cm){nack("CM_REQUIRED");return;}bool ok=active==M14?tx(address,0x80,2):tx(address,active==M50?0x71:0x01);cm=false;if(!ok){nack("NOM");return;}delay(150);ack();return;}
 if(s=="DF"){if(cm||active!=M14){nack("MODE");return;}uint8_t b[4];if(!rx(address,b,4)){nack("DF");return;}if((b[0]>>6)==2){delay(150);if(!rx(address,b,4)){nack("DF");return;}}ack(hex(b,4));return;}
 if(s=="RAW"){if(!cm||active==M14){nack("MODE");return;}uint8_t out[4];if(!rawWord(0xD8,out)||!rawWord(0xD9,out+2)){nack("RAW");return;}ack(hex(out,4));return;}
 nack("UNKNOWN_COMMAND");
}
