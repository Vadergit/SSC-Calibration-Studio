#include <Arduino.h>
#include <string.h>
#include <stdlib.h>
// Default firmware is USB diagnostics only. No sensor pins are driven.
// Define MLX_TEST_SIMULATION=1 only for explicit software tests.
#ifndef MLX_TEST_SIMULATION
#define MLX_TEST_SIMULATION 0
#endif
#if defined(ARDUINO_ARCH_ESP32)
#define BOARD_NAME "esp32"
#elif defined(__AVR_ATmega32U4__)
#define BOARD_NAME "pro-micro"
#else
#error Unsupported board
#endif
static char line[96];static uint8_t used=0;static bool overflowed=false;
static void prefix(long id,const char* model,bool ok){
 Serial.print(F("{\"protocol\":\"MLX1\",\"id\":"));Serial.print(id);
 Serial.print(F(",\"board\":\""));Serial.print(BOARD_NAME);Serial.print(F("\",\"model\":\""));Serial.print(model);
 Serial.print(F("\",\"ok\":"));Serial.print(ok?F("true"):F("false"));
}
static void fail(long id,const char* model,const __FlashStringHelper* error){
 prefix(id,model,false);Serial.print(F(",\"error\":\""));Serial.print(error);Serial.println(F("\"}"));
}
static void simIdentity(const char* model){Serial.print(F(",\"mode\":\"simulation\",\"identity\":\"SIMULATION-"));Serial.print(model);Serial.print(F("\""));}
static void process(){
 char* tag=strtok(line," ");char* idText=strtok(NULL," ");char* op=strtok(NULL," ");char* model=strtok(NULL," ");char* countText=strtok(NULL," ");
 if(!tag||strcmp(tag,"MLX1")||!idText||!op||!model||!countText||strtok(NULL," "))return;
 char* end;long id=strtol(idText,&end,10);if(*end||id<=0)return;long count=strtol(countText,&end,10);
 if(*end||count<1||count>100)return;
 if(strcmp(model,"mlx90328")&&strcmp(model,"mlx90329"))return;
 if(!strcmp(op,"INFO")){
  prefix(id,model,true);Serial.print(F(",\"firmware\":\"0.1.0\",\"chipDetected\":false"));
#if MLX_TEST_SIMULATION
  simIdentity(model);Serial.println(F(",\"capabilities\":[\"sample\",\"eeprom\",\"ram\"]}"));
#else
  Serial.println(F(",\"mode\":\"adapter-only\",\"identity\":null,\"capabilities\":[],\"driver\":\"not-implemented\"}"));
#endif
  return;
 }
#if MLX_TEST_SIMULATION
 if(!strcmp(op,"SAMPLE")){prefix(id,model,true);simIdentity(model);Serial.print(F(",\"samples\":"));Serial.print(count);Serial.println(F(",\"raw\":5000,\"temperature\":25,\"adcT\":1234}"));return;}
 if(!strcmp(op,"EEPROM")||!strcmp(op,"RAM")){prefix(id,model,true);simIdentity(model);Serial.print(F(",\"bytes\":["));uint8_t n=!strcmp(op,"EEPROM")?64:16;for(uint8_t i=0;i<n;i++){if(i)Serial.print(',');Serial.print(i);}Serial.println(F("],\"parameters\":{}}"));return;}
#endif
 fail(id,model,F("CHIP_DRIVER_NOT_IMPLEMENTED"));
}
void setup(){Serial.begin(115200);}
void loop(){while(Serial.available()){int ch=Serial.read();if(ch=='\r')continue;if(ch=='\n'){if(!overflowed&&used){line[used]=0;process();}used=0;overflowed=false;}else if(!overflowed){if(used<sizeof(line)-1)line[used++]=(char)ch;else overflowed=true;}}}
