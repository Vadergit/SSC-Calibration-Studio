import assert from 'node:assert/strict';
import {parseElmosBridgeInfo} from '../packages/bridge/legacy-elmos.mjs';
const esp=parseElmosBridgeInfo('E70311-BRIDGE V1 CAPS=PLC_GPIO4_IO,POWER_GPIO_10,I2C_CRC,BRIDGE_GENERIC_RAM_V1,BRIDGE_USER_NVM_V1');
assert.equal(esp.board,'esp32');assert.deepEqual(esp.protocols,['onewire','i2c']);assert.equal(esp.userNvm,true);
const pro=parseElmosBridgeInfo('E70311-BRIDGE V1 CAPS=PLC_D4_IO,PRO_MICRO_NVM,BRIDGE_USER_NVM_V1');
assert.equal(pro.board,'promicro');assert.equal(pro.userNvm,false);
assert.throws(()=>parseElmosBridgeInfo('E70311-BRIDGE V1 CAPS=PLC_GPIO4_IO,POWER_GPIO_10,PLC_D4_IO,PRO_MICRO_NVM'));
assert.throws(()=>parseElmosBridgeInfo('unknown'));
console.log('Bridge handshake tests passed');
