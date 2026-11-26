export const catalog=[{id:'adi',name:'Analog Devices / Maxim',models:[
{id:'max40109',name:'MAX40109',description:'Digitaler Druck- und Temperatur-DSP · I²C / 1-Wire / PLC · MTP',datasheet:'https://www.analog.com/media/en/technical-documentation/data-sheets/max40109.pdf',readOnly:true},
{id:'max1454',name:'MAX1454',description:'Analoger Signalpfad · DAC-Korrektur · serielle Programmierung / Flash',datasheet:'https://www.analog.com/media/en/technical-documentation/data-sheets/max1454.pdf',readOnly:false}
]}];
export const pga=[5,10,15,20,24,40,60,72,90,108,126,144,160,180,200,252,540,1080,1440,2520];
export const registers=[[0x06,'Druck roh'],[0x08,'Temperatur roh'],[0x0f,'Druck korrigiert'],[0x11,'Temperatur korrigiert']];
