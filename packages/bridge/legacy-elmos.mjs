// Read-only host-side description of the current Elmos firmware handshake.
// Not a generic hardware driver; no serial or sensor operation is executed.
export function parseElmosBridgeInfo(response){
 const match=String(response).match(/E70311-BRIDGE\s+V1\s+CAPS=([A-Z0-9_,]+)/);
 if(!match)throw Error('Unsupported Elmos bridge handshake');
 const capabilities=new Set(match[1].split(','));
 const pro=capabilities.has('PLC_D4_IO')&&capabilities.has('PRO_MICRO_NVM');
 const esp=capabilities.has('PLC_GPIO4_IO')&&capabilities.has('POWER_GPIO_10');
 if(pro===esp)throw Error('Ambiguous or unsupported DIY board');
 const genericRam=capabilities.has('BRIDGE_GENERIC_RAM_V1');
 return {board:pro?'promicro':'esp32',protocols:capabilities.has('I2C_CRC')?['onewire','i2c']:['onewire'],genericRam,userNvm:genericRam&&capabilities.has('BRIDGE_USER_NVM_V1'),capabilities:[...capabilities]};
}
