/* Generic PWM one-wire lab bridge. No vendor-specific opcodes or OTP programming.
 ESP32-C3 or ATmega32U4 Pro Micro. ESP32 GPIO4/GPIO5; Pro Micro D4/D5.
 Signal via appropriate bidirectional level translator; external sensor load-switch ENABLE. No VPP source.
 Never connect GPIO directly to 5V. External pull-up/level translation as required.
 The MEM operation performs one explicitly configured read sequence and powers off.
 Timing and parity must be validated against the actual device before connecting.
*/
#include <Arduino.h>
#include <stdio.h>
#include <string.h>
#if defined(ARDUINO_ARCH_ESP32)
static const char BOARD[]="ESP32-C3";
#elif defined(__AVR_ATmega32U4__)
#include <avr/io.h>
#include <avr/interrupt.h>
static const char BOARD[]="PRO-MICRO";
#else
#error Select ESP32-C3 or ATmega32U4 Pro Micro
#endif
static const int SO=4,EN=5;
#if defined(__AVR_ATmega32U4__)
static volatile uint8_t *soDDR,*soPORT,*soPIN;
static uint8_t soMask;
static inline void driveLow(){*soPORT &= ~soMask; *soDDR |= soMask;}
static inline void releaseLine(){*soDDR &= ~soMask; *soPORT &= ~soMask;}
static inline bool lineHigh(){return (*soPIN & soMask)!=0;}
static inline uint16_t ticks(){return TCNT1;}
static void initSignal(){const uint8_t port=digitalPinToPort(SO);soDDR=portModeRegister(port);soPORT=portOutputRegister(port);soPIN=portInputRegister(port);soMask=digitalPinToBitMask(SO);releaseLine();TCCR1A=0;TCCR1B=_BV(CS11);TCNT1=0;}
#else
static inline void driveLow(){digitalWrite(SO,LOW);}
static inline void releaseLine(){digitalWrite(SO,HIGH);}
static inline bool lineHigh(){return digitalRead(SO)!=LOW;}
static void initSignal(){pinMode(SO,INPUT);}
#endif
struct Config{unsigned baud,odd,z,s,o,gap;};
static void off(){pinMode(SO,INPUT);digitalWrite(EN,LOW);}
static bool waitLevel(int level,uint32_t us){uint32_t start=micros();while(lineHigh()!=(level!=LOW)){if((uint32_t)(micros()-start)>=us)return false;}return true;}
static void pulse(unsigned duty,unsigned period){unsigned low=period*duty/100;
#if defined(__AVR_ATmega32U4__)
 const uint16_t scale=F_CPU/8000000UL;const uint16_t total=period*scale,lt=low*scale;const uint16_t start=ticks();driveLow();while((uint16_t)(ticks()-start)<lt){}releaseLine();while((uint16_t)(ticks()-start)<total){}
#else
 driveLow();delayMicroseconds(low);releaseLine();delayMicroseconds(period-low);
#endif
}
static void send(const uint8_t *data,unsigned n,const Config& c){unsigned period=1000000/c.baud;
#if defined(ARDUINO_ARCH_ESP32)
 pinMode(SO,OUTPUT_OPEN_DRAIN);digitalWrite(SO,HIGH);
#else
 releaseLine();const uint8_t saved=SREG;cli();
#endif
 pulse(c.s,period);for(unsigned i=0;i<n;i++){unsigned parity=c.odd;for(int bit=7;bit>=0;bit--){unsigned b=(data[i]>>bit)&1;parity^=b;pulse(b?c.o:c.z,period);}pulse(parity?c.o:c.z,period);}
#if defined(__AVR_ATmega32U4__)
 releaseLine();SREG=saved;
#else
 pinMode(SO,INPUT);
#endif
}
static bool width(unsigned &w,uint32_t timeout){if(!waitLevel(LOW,timeout))return false; 
#if defined(__AVR_ATmega32U4__)
 const uint16_t t=ticks();const uint16_t scale=F_CPU/8000000UL;while(!lineHigh()){if((uint16_t)(ticks()-t)>=5000*scale)return false;}w=(uint16_t)(ticks()-t)/scale;
#else
 uint32_t t=micros();if(!waitLevel(HIGH,5000))return false;w=micros()-t;
#endif
 return true;}
static bool recvByte(uint8_t &out,const Config& c,uint32_t timeout){unsigned period=1000000/c.baud,w=0;unsigned start=micros();bool found=false;while((uint32_t)(micros()-start)<timeout){uint32_t elapsed=micros()-start;if(elapsed>=timeout||!width(w,timeout-elapsed))return false;unsigned d=(uint32_t)w*100/period;if(d>(c.z+c.s)/2&&d<(c.s+c.o)/2){found=true;break;}}if(!found)return false;unsigned parity=c.odd;out=0;for(int i=0;i<9;i++){if(!width(w,period*3+100))return false;unsigned d=(uint32_t)w*100/period;bool b;if(d>=c.z-10&&d<=(c.z+c.s)/2)b=false;else if(d>=(c.s+c.o)/2&&d<=c.o+10)b=true;else return false;if(i<8){out=(out<<1)|b;parity^=b;}else if(b!=parity)return false;}return true;}
static bool readBytes(uint8_t *data,unsigned n,const Config& c,uint32_t timeout){uint32_t start=micros();for(unsigned i=0;i<n;i++){if((uint32_t)(micros()-start)>1000000||!recvByte(data[i],c,timeout))return false;}return true;}
static void result(const uint8_t *data,unsigned n){Serial.print("OK ");for(unsigned i=0;i<n;i++){if(data[i]<16)Serial.print('0');Serial.print(data[i],HEX);}Serial.println();}
static bool valid(const Config& c){return c.baud>=1000&&c.baud<=
#if defined(__AVR_ATmega32U4__)
 8000
#else
 40000
#endif
 &&c.odd<=1&&c.z>=10&&c.z<c.s&&c.s<c.o&&c.o<=90&&c.gap<=500;}
static void err(const char*s){Serial.print("ERR ");Serial.println(s);}
static void process(char* line){
 if(!strcmp(line,"HELLO")){Serial.print("PULSE-BRIDGE 2 ");Serial.println(BOARD);return;}
 Config c;unsigned n=0,offMs=0,delayUs=0,enter=0,rd=0,ack=0;char extra=0;uint8_t buf[65];
 if(sscanf(line,"CAP %u %u %u %u %u %u %u %c",&c.baud,&c.odd,&c.z,&c.s,&c.o,&c.gap,&n,&extra)==7&&valid(c)&&n>=2&&n<=4){pinMode(SO,INPUT);digitalWrite(EN,HIGH);delay(20);if(readBytes(buf,n,c,200000))result(buf,n);else err("CAPTURE_TIMEOUT_OR_PARITY");off();return;}
 if(sscanf(line,"MEM %u %u %u %u %u %u %u %u %x %x %x %u %c",&c.baud,&c.odd,&c.z,&c.s,&c.o,&c.gap,&offMs,&delayUs,&enter,&rd,&ack,&n,&extra)==12&&valid(c)&&offMs>=50&&offMs<=1000&&delayUs<=5000&&enter<=65535&&rd<=65535&&ack<=255&&n>=1&&n<=64){
  off();delay(offMs);digitalWrite(EN,HIGH);delayMicroseconds(delayUs);uint8_t e[2]={(uint8_t)(enter>>8),(uint8_t)enter};send(e,2,c);uint8_t a;if(!recvByte(a,c,200000)||a!=ack){off();err("ENTER_ACK");return;}delayMicroseconds(c.gap);uint8_t q[2]={(uint8_t)(rd>>8),(uint8_t)rd};send(q,2,c);if(!recvByte(a,c,200000)||a!=ack||!readBytes(buf,n,c,200000)){off();err("READ_ACK_OR_PARITY");return;}off();result(buf,n);return;}
 err("BAD_COMMAND");
}
static char line[160];static unsigned pos=0;static bool overflow=false;
void setup(){digitalWrite(EN,LOW);pinMode(EN,OUTPUT);off();initSignal();Serial.begin(115200);}
void loop(){while(Serial.available()){char c=Serial.read();if(c=='\r')continue;if(c=='\n'){if(overflow)err("LINE_TOO_LONG");else{line[pos]=0;process(line);}pos=0;overflow=false;}else if(pos<sizeof(line)-1&&!overflow)line[pos++]=c;else overflow=true;}}
