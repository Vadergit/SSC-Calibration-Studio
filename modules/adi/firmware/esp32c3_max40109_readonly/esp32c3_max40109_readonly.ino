#include <Arduino.h>
#include <Wire.h>
// ESP32-C3 SuperMini: SDA GPIO4, SCL GPIO5. External matched logic levels and pullups required.
// No sensor power switching, no configuration writes, no MTP commands.
constexpr uint8_t ADDRESS=0x4D;
char line[32]; uint8_t pos=0; bool overflow=false;
void setup(){Serial.begin(115200);Wire.begin(4,5,100000);}
void command(){
 if(!strcmp(line,"HELLO")){Serial.println("MAX40109-RO 1");return;}
 if(strlen(line)!=7||strncmp(line,"READ ",5)){Serial.println("ERR unsupported");return;}
 const char* reg=line+5;
 if(strcmp(reg,"06")&&strcmp(reg,"08")&&strcmp(reg,"0F")&&strcmp(reg,"11")){Serial.println("ERR register");return;}
 uint8_t address=strtoul(reg,nullptr,16);
 Wire.beginTransmission(ADDRESS);Wire.write(address);
 if(Wire.endTransmission(false)!=0){Serial.println("ERR I2C select");return;}
 if(Wire.requestFrom(ADDRESS,(uint8_t)2)!=2){Serial.println("ERR I2C read");return;}
 unsigned high=Wire.read(),low=Wire.read(); Serial.printf("OK %s %04X\n",reg,(high<<8)|low);
}
void loop(){while(Serial.available()){char c=Serial.read();if(c=='\r')continue;if(c=='\n'){line[pos]=0;if(overflow)Serial.println("ERR length");else command();pos=0;overflow=false;}else if(pos<sizeof(line)-1)line[pos++]=c;else overflow=true;}}
